const express = require("express");
const {
  placeOrder,
  getOrder,
  myOrders,
  pickOrder,
  packOrder,
  assignPartner,
  updateStatus,
  reorder,
} = require("../controllers/orderController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { createOrderSchema, assignPartnerSchema, updateStatusSchema } = require("../validators/orderValidators");

const router = express.Router();

// Module 4 - Order Placement with Nearest-Store Check (customer only).
router.post("/", protect, authorize("customer"), validate(createOrderSchema), placeOrder);

// Module 11 - Customer Order History & Reorder.
router.get("/my", protect, authorize("customer"), myOrders);
router.post("/:id/reorder", protect, authorize("customer"), reorder);

// Module 8 - Real-Time Order Status (access-checked inside the controller so
// each role only ever sees orders it is actually party to).
router.get("/:id", protect, getOrder);

// Module 5 - Order Picking & Packing Workflow (store staff).
router.put("/:id/pick", protect, authorize("storeStaff", "admin"), pickOrder);
router.put("/:id/pack", protect, authorize("storeStaff", "admin"), packOrder);

// Module 6 - Delivery Partner Assignment (store staff/admin dispatch a
// packed order to an available partner).
router.put("/:id/assign", protect, authorize("storeStaff", "admin"), validate(assignPartnerSchema), assignPartner);

// Module 7 - Delivery Status Tracking (the assigned delivery partner).
router.put("/:id/status", protect, authorize("deliveryPartner", "admin"), validate(updateStatusSchema), updateStatus);

module.exports = router;
