const { DELIVERY_SLOT_WINDOWS } = require("../config/constants");

// Module 10 - Delivery Time Slot Selection.
// Generates the bookable windows for today and tomorrow. Kept deliberately
// simple (no persistence, no per-slot capacity) since the spec only asks
// customers to optionally pick a preferred window.
const getAvailableSlots = () => {
  const days = [0, 1].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });

  const slots = [];
  days.forEach((date) => {
    DELIVERY_SLOT_WINDOWS.forEach((window) => {
      slots.push({ date, ...window });
    });
  });
  return slots;
};

const isValidSlot = (slot) => {
  if (!slot || !slot.date || !slot.startTime || !slot.endTime) return false;
  return getAvailableSlots().some(
    (s) => s.date === slot.date && s.startTime === slot.startTime && s.endTime === slot.endTime
  );
};

module.exports = { getAvailableSlots, isValidSlot };
