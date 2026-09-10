const DarkStore = require("../models/DarkStore");
const { success, error } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Module 2 - Dark-Store Management (admin only).

// POST /api/stores
const createStore = asyncHandler(async (req, res) => {
  const existing = await DarkStore.findOne({ name: req.body.name });
  if (existing) {
    return error(res, 409, "A store with this name already exists", "DUPLICATE_STORE");
  }
  const store = await DarkStore.create(req.body);
  return success(res, 201, "Store created successfully", store);
});

// GET /api/stores
const listStores = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.active === "true") filter.isActive = true;
  const stores = await DarkStore.find(filter).sort({ name: 1 });
  return success(res, 200, "Stores fetched successfully", stores);
});

// GET /api/stores/:id
const getStore = asyncHandler(async (req, res) => {
  const store = await DarkStore.findById(req.params.id);
  if (!store) return error(res, 404, "Store not found", "NOT_FOUND");
  return success(res, 200, "Store fetched successfully", store);
});

// PUT /api/stores/:id
const updateStore = asyncHandler(async (req, res) => {
  const store = await DarkStore.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!store) return error(res, 404, "Store not found", "NOT_FOUND");
  return success(res, 200, "Store updated successfully", store);
});

// DELETE /api/stores/:id (soft delete - keeps historical orders/stock intact)
const deleteStore = asyncHandler(async (req, res) => {
  const store = await DarkStore.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!store) return error(res, 404, "Store not found", "NOT_FOUND");
  return success(res, 200, "Store deactivated successfully", store);
});

// Module 4 - nearest-store check, reused at order placement time.
// GET /api/stores/nearest?pincode=560001
const findNearestStore = asyncHandler(async (req, res) => {
  const { pincode } = req.query;
  if (!pincode) return error(res, 400, "pincode query parameter is required", "VALIDATION_ERROR");

  const store = await DarkStore.findOne({ isActive: true, serviceablePincodes: pincode });
  if (!store) {
    return error(res, 404, "No dark-store currently serves this pincode", "NO_STORE_IN_RANGE");
  }
  return success(res, 200, "Nearest store found", store);
});

module.exports = { createStore, listStores, getStore, updateStore, deleteStore, findNearestStore };
