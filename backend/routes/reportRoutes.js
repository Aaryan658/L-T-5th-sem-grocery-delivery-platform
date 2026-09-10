const express = require("express");
const { getPerformanceReport } = require("../controllers/reportController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

// Module 12 - Store & Delivery Performance Reports (admin only).
router.get("/reports/performance", protect, authorize("admin"), getPerformanceReport);

module.exports = router;
