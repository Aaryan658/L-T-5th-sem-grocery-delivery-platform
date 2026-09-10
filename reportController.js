const Order = require("../models/Order");
const { success } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Module 12 - Store & Delivery Performance Reports (admin only).
// GET /api/admin/reports/performance
//
// For each store: order volume, average pick time (placed -> packed), and
// average delivery time (assigned -> delivered), computed straight from the
// timestamps already stored on each order - no separate reporting table
// needed for a dataset this size.
const getPerformanceReport = asyncHandler(async (req, res) => {
  const rows = await Order.aggregate([
    {
      $addFields: {
        assignedAt: {
          $first: {
            $filter: {
              input: "$statusHistory",
              as: "event",
              cond: { $eq: ["$$event.status", "assigned"] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$storeId",
        orderVolume: { $sum: 1 },
        deliveredCount: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
        failedCount: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
        },
        avgPickTimeMs: {
          $avg: {
            $cond: [
              { $and: ["$packedAt", "$createdAt"] },
              { $subtract: ["$packedAt", "$createdAt"] },
              null,
            ],
          },
        },
        avgDeliveryTimeMs: {
          $avg: {
            $cond: [
              { $and: ["$deliveredAt", "$assignedAt.at"] },
              { $subtract: ["$deliveredAt", "$assignedAt.at"] },
              null,
            ],
          },
        },
        revenue: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$pricing.totalAmount", 0] },
        },
      },
    },
    {
      $lookup: {
        from: "darkstores",
        localField: "_id",
        foreignField: "_id",
        as: "store",
      },
    },
    { $unwind: { path: "$store", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        storeId: "$_id",
        storeName: "$store.name",
        orderVolume: 1,
        deliveredCount: 1,
        failedCount: 1,
        revenue: 1,
        avgPickTimeMinutes: { $round: [{ $divide: ["$avgPickTimeMs", 60000] }, 1] },
        avgDeliveryTimeMinutes: { $round: [{ $divide: ["$avgDeliveryTimeMs", 60000] }, 1] },
      },
    },
    { $sort: { orderVolume: -1 } },
  ]);

  return success(res, 200, "Performance report generated successfully", rows);
});

module.exports = { getPerformanceReport };
