const StoreStock = require("../models/StoreStock");
const DarkStore = require("../models/DarkStore");
const Product = require("../models/Product");
const { success, error } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Module 3 - Product Catalog & Store-Wise Stock (admin/storeStaff).

// POST /api/stores/:storeId/stock  { productId, quantity, reorderPoint }
const upsertStock = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { productId, quantity, reorderPoint } = req.body;

  const [store, product] = await Promise.all([DarkStore.findById(storeId), Product.findById(productId)]);
  if (!store) return error(res, 404, "Store not found", "NOT_FOUND");
  if (!product) return error(res, 404, "Product not found", "NOT_FOUND");

  const stock = await StoreStock.findOneAndUpdate(
    { storeId, productId },
    { $set: { quantity, reorderPoint } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
  return success(res, 201, "Stock saved successfully", stock);
});

// GET /api/stores/:storeId/stock
const listStock = asyncHandler(async (req, res) => {
  const stock = await StoreStock.find({ storeId: req.params.storeId }).populate("productId", "name category price unit");
  return success(res, 200, "Stock fetched successfully", stock);
});

// PUT /api/stores/:storeId/stock/:productId
const updateStock = asyncHandler(async (req, res) => {
  const { storeId, productId } = req.params;
  const stock = await StoreStock.findOneAndUpdate(
    { storeId, productId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!stock) return error(res, 404, "Stock record not found for this store/product", "NOT_FOUND");
  return success(res, 200, "Stock updated successfully", stock);
});

// Module 9 - Stock Replenishment Alerts.
// GET /api/stores/:storeId/stock/alerts
const getReplenishmentAlerts = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const lowStock = await StoreStock.find({ storeId })
    .populate("productId", "name category unit")
    .then((rows) => rows.filter((row) => row.quantity <= row.reorderPoint));

  return success(res, 200, "Replenishment alerts fetched successfully", lowStock);
});

module.exports = { upsertStock, listStock, updateStock, getReplenishmentAlerts };
