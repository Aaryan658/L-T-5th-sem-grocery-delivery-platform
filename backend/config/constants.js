// Central place for every business constant used by order pricing, delivery
// slots, and stock alerts, so tuning a number never means touching logic.

// Module 4 - Order Placement. Flat delivery fee; free above the threshold.
const DELIVERY_FEE = 30;
const FREE_DELIVERY_THRESHOLD = 499;

// Module 10 - Delivery Time Slot Selection. Slots are generated for "today"
// and "tomorrow" in these fixed two-hour windows.
const DELIVERY_SLOT_WINDOWS = [
  { startTime: "09:00", endTime: "11:00" },
  { startTime: "11:00", endTime: "13:00" },
  { startTime: "13:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "17:00" },
  { startTime: "17:00", endTime: "19:00" },
  { startTime: "19:00", endTime: "21:00" },
];

// Module 9 - Stock Replenishment Alerts. Used only when a stock row does not
// specify its own reorderPoint.
const DEFAULT_REORDER_POINT = 10;

// Module 7 - Delivery Status Tracking. Defines every legal transition so the
// controller can reject an out-of-order status update instead of trusting the
// caller blindly.
const ORDER_STATUS_FLOW = {
  placed: ["picking", "cancelled"],
  picking: ["packed", "cancelled"],
  packed: ["assigned", "cancelled"],
  assigned: ["out-for-delivery", "cancelled"],
  "out-for-delivery": ["delivered", "failed"],
  delivered: [],
  failed: [],
  cancelled: [],
};

module.exports = {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  DELIVERY_SLOT_WINDOWS,
  DEFAULT_REORDER_POINT,
  ORDER_STATUS_FLOW,
};
