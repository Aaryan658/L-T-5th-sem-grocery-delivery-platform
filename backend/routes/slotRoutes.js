const express = require("express");
const protect = require("../middleware/auth");
const { getAvailableSlots } = require("../utils/slots");
const { success } = require("../utils/apiResponse");

const router = express.Router();

// Module 10 - Delivery Time Slot Selection. Any signed-in user (typically a
// customer at checkout) can browse the bookable windows.
router.get("/", protect, (req, res) => success(res, 200, "Available delivery slots", getAvailableSlots()));

module.exports = router;
