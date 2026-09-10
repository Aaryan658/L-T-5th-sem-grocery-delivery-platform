const Order = require("../models/Order");
const DarkStore = require("../models/DarkStore");
const Product = require("../models/Product");
const StoreStock = require("../models/StoreStock");
const DeliveryPartner = require("../models/DeliveryPartner");
const { success, error } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, ORDER_STATUS_FLOW } = require("../config/constants");
const { isValidSlot } = require("../utils/slots");

// Shared helper: only the customer who placed the order, the staff of the
// fulfilling store, the assigned delivery partner, or an admin may view/act
// on an order (module 13 - Role-Based Access Control, applied at record level
// rather than just at the route level).
const canAccessOrder = (order, user) => {
  if (user.role === "admin") return true;
  if (user.role === "customer") return order.customerId.toString() === user._id.toString();
  if (user.role === "storeStaff") return user.storeId && order.storeId.toString() === user.storeId.toString();
  if (user.role === "deliveryPartner") {
    return order.deliveryPartnerId && order.deliveryPartnerId.toString() === user._id.toString();
  }
  return false;
};

const pushStatus = (order, status, userId, note) => {
  order.status = status;
  order.statusHistory.push({ status, at: new Date(), by: userId, note });
};

// Module 4 - Order Placement with Nearest-Store Check.
// POST /api/orders
const placeOrder = asyncHandler(async (req, res) => {
  const { pincode, items, deliveryAddress, deliverySlot } = req.body;

  if (deliverySlot && !isValidSlot(deliverySlot)) {
    return error(res, 400, "Selected delivery slot is not available", "INVALID_SLOT");
  }

  const store = await DarkStore.findOne({ isActive: true, serviceablePincodes: pincode });
  if (!store) {
    return error(res, 404, "No dark-store currently serves this pincode", "NO_STORE_IN_RANGE");
  }

  // Validate stock for every requested item at the resolved store before
  // committing anything - a partially fulfillable order is rejected outright
  // rather than silently placed with missing items.
  const productIds = items.map((i) => i.productId);
  const [products, stockRows] = await Promise.all([
    Product.find({ _id: { $in: productIds }, isActive: true }),
    StoreStock.find({ storeId: store._id, productId: { $in: productIds } }),
  ]);

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  const stockMap = new Map(stockRows.map((s) => [s.productId.toString(), s]));

  const orderItems = [];
  for (const requested of items) {
    const product = productMap.get(requested.productId);
    if (!product) {
      return error(res, 400, "Product " + requested.productId + " is not available", "PRODUCT_NOT_FOUND");
    }
    const stock = stockMap.get(requested.productId);
    if (!stock || stock.quantity < requested.quantity) {
      const available = stock ? stock.quantity : 0;
      return error(
        res,
        409,
        product.name + " is out of stock at " + store.name + " (requested " + requested.quantity + ", available " + available + ")",
        "OUT_OF_STOCK"
      );
    }
    const subtotal = product.price * requested.quantity;
    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: requested.quantity,
      subtotal,
    });
  }

  const itemsTotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const deliveryFee = itemsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const totalAmount = itemsTotal + deliveryFee;

  // Decrement stock for every item. In production this would run inside a
  // MongoDB transaction; documented as a known limitation in the README since
  // a single-node dev setup may not have a replica set available.
  await Promise.all(
    orderItems.map((item) =>
      StoreStock.updateOne({ storeId: store._id, productId: item.productId }, { $inc: { quantity: -item.quantity } })
    )
  );

  const order = new Order({
    customerId: req.user._id,
    storeId: store._id,
    items: orderItems,
    deliveryAddress,
    deliverySlot: deliverySlot || null,
    pricing: { itemsTotal, deliveryFee, totalAmount },
    status: "placed",
  });
  pushStatus(order, "placed", req.user._id, "Order placed by customer");
  await order.save();

  return success(res, 201, "Order placed successfully", order);
});

// Module 8 - Real-Time Order Status for Customer (also used by staff/admin).
// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 404, "Order not found", "NOT_FOUND");
  if (!canAccessOrder(order, req.user)) {
    return error(res, 403, "You do not have permission to view this order", "FORBIDDEN");
  }
  return success(res, 200, "Order fetched successfully", order);
});

// Module 11 - Customer Order History.
// GET /api/orders/my
const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
  return success(res, 200, "Order history fetched successfully", orders);
});

// GET /api/stores/:storeId/orders?status= (store staff picking/packing queue)
const listStoreOrders = asyncHandler(async (req, res) => {
  const filter = { storeId: req.params.storeId };
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter).sort({ createdAt: 1 });
  return success(res, 200, "Store orders fetched successfully", orders);
});

// Shared status-transition guard used by pick/pack/assign/updateStatus below.
const assertTransition = (order, nextStatus) => {
  const allowed = ORDER_STATUS_FLOW[order.status] || [];
  if (!allowed.includes(nextStatus)) {
    const err = new Error("Cannot move order from \"" + order.status + "\" to \"" + nextStatus + "\"");
    err.statusCode = 409;
    err.errorCode = "INVALID_TRANSITION";
    throw err;
  }
};

// Module 5 - Order Picking & Packing Workflow.
// PUT /api/orders/:id/pick
const pickOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 404, "Order not found", "NOT_FOUND");
  if (!canAccessOrder(order, req.user)) return error(res, 403, "Forbidden", "FORBIDDEN");

  assertTransition(order, "picking");
  pushStatus(order, "picking", req.user._id, "Store staff started picking items");
  await order.save();
  return success(res, 200, "Order moved to picking", order);
});

// PUT /api/orders/:id/pack
const packOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 404, "Order not found", "NOT_FOUND");
  if (!canAccessOrder(order, req.user)) return error(res, 403, "Forbidden", "FORBIDDEN");

  assertTransition(order, "packed");
  order.packedAt = new Date();
  pushStatus(order, "packed", req.user._id, "Order packed and ready for dispatch");
  await order.save();
  return success(res, 200, "Order packed successfully", order);
});

// Module 6 - Delivery Partner Assignment.
// PUT /api/orders/:id/assign  { deliveryPartnerId }
const assignPartner = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 404, "Order not found", "NOT_FOUND");
  if (!canAccessOrder(order, req.user)) return error(res, 403, "Forbidden", "FORBIDDEN");

  assertTransition(order, "assigned");

  const { deliveryPartnerId } = req.body;
  const partner = await DeliveryPartner.findOne({ userId: deliveryPartnerId });
  if (!partner) return error(res, 404, "Delivery partner not found", "NOT_FOUND");
  if (!partner.isAvailable) {
    return error(res, 409, "This delivery partner is not available right now", "PARTNER_UNAVAILABLE");
  }

  order.deliveryPartnerId = deliveryPartnerId;
  pushStatus(order, "assigned", req.user._id, "Delivery partner assigned");
  await order.save();

  partner.isAvailable = false;
  partner.currentStoreId = order.storeId;
  await partner.save();

  return success(res, 200, "Delivery partner assigned successfully", order);
});

// Module 7 - Delivery Status Tracking.
// PUT /api/orders/:id/status  { status, note }
const updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 404, "Order not found", "NOT_FOUND");
  if (!canAccessOrder(order, req.user)) return error(res, 403, "Forbidden", "FORBIDDEN");

  const { status, note } = req.body;
  assertTransition(order, status);

  pushStatus(order, status, req.user._id, note);
  if (status === "delivered" || status === "failed") {
    order.deliveredAt = new Date();
    await DeliveryPartner.updateOne({ userId: order.deliveryPartnerId }, { $set: { isAvailable: true } });
  }
  await order.save();

  return success(res, 200, "Status updated successfully", { status: order.status, order });
});

// Module 11 - Reorder: re-validates current stock/price rather than blindly
// replaying the old snapshot, since prices and availability may have changed.
// POST /api/orders/:id/reorder
const reorder = asyncHandler(async (req, res) => {
  const original = await Order.findById(req.params.id);
  if (!original) return error(res, 404, "Order not found", "NOT_FOUND");
  if (original.customerId.toString() !== req.user._id.toString()) {
    return error(res, 403, "You can only reorder your own past orders", "FORBIDDEN");
  }

  req.body = {
    pincode: original.deliveryAddress.pincode,
    items: original.items.map((i) => ({ productId: i.productId.toString(), quantity: i.quantity })),
    deliveryAddress: original.deliveryAddress,
  };
  return placeOrder(req, res);
});

module.exports = {
  placeOrder,
  getOrder,
  myOrders,
  listStoreOrders,
  pickOrder,
  packOrder,
  assignPartner,
  updateStatus,
  reorder,
};
