const express = require("express");
const {
  listAvailablePartners,
  updateMyAvailability,
  getMyProfile,
} = require("../controllers/deliveryPartnerController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.get("/available", protect, authorize("storeStaff", "admin"), listAvailablePartners);
router.get("/me", protect, authorize("deliveryPartner"), getMyProfile);
router.put("/me/availability", protect, authorize("deliveryPartner"), updateMyAvailability);

module.exports = router;
