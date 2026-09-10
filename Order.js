const mongoose = require("mongoose");

// Line items are EMBEDDED: they are always read together with the order,
// their price/name must be frozen as a snapshot of the moment the order was
// placed (so a later catalog price change never rewrites past invoices), and
// they are never queried independently of their parent order.
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Embedded for the same reason as line items - a single delivery slot chosen
// at checkout, never queried on its own.
const deliverySlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    itemsTotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Embedded audit trail - drives module 8 (Real-Time Order Status for
// Customer). Small, append-only, always read together with the order.
const statusEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Referenced: customers, stores and delivery partners are shared across
    // many orders and are updated independently of any single order.
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarkStore",
      required: true,
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    deliveryAddress: {
      line1: { type: String, required: true, trim: true },
      area: { type: String, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    deliverySlot: {
      type: deliverySlotSchema,
      default: null,
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["placed", "picking", "packed", "assigned", "out-for-delivery", "delivered", "failed", "cancelled"],
      default: "placed",
    },
    statusHistory: {
      type: [statusEventSchema],
      default: [],
    },
    packedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Drives the customer order history / reorder screen (module 11).
orderSchema.index({ customerId: 1, createdAt: -1 });
// Drives the store picking queue and store performance report (modules 5, 12).
orderSchema.index({ storeId: 1, status: 1, createdAt: -1 });
// Drives "my active deliveries" for a delivery partner (modules 6, 7).
orderSchema.index({ deliveryPartnerId: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);
