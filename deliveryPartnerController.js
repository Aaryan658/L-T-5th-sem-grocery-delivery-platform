const DeliveryPartner = require("../models/DeliveryPartner");
const { success, error } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Module 6 - Delivery Partner Assignment support endpoints.

// GET /api/delivery-partners/available?storeId=
const listAvailablePartners = asyncHandler(async (req, res) => {
  const filter = { isAvailable: true };
  if (req.query.storeId) filter.currentStoreId = req.query.storeId;

  const partners = await DeliveryPartner.find(filter).populate("userId", "name phone");
  return success(res, 200, "Available delivery partners fetched successfully", partners);
});

// PUT /api/delivery-partners/me/availability  { isAvailable, currentStoreId }
const updateMyAvailability = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOneAndUpdate(
    { userId: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!partner) return error(res, 404, "Delivery partner profile not found", "NOT_FOUND");
  return success(res, 200, "Availability updated successfully", partner);
});

// GET /api/delivery-partners/me
const getMyProfile = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findOne({ userId: req.user._id });
  if (!partner) return error(res, 404, "Delivery partner profile not found", "NOT_FOUND");
  return success(res, 200, "Delivery partner profile fetched successfully", partner);
});

module.exports = { listAvailablePartners, updateMyAvailability, getMyProfile };
