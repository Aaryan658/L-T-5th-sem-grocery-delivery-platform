const express = require("express");
const {
  createStore,
  listStores,
  getStore,
  updateStore,
  deleteStore,
  findNearestStore,
} = require("../controllers/storeController");
const { upsertStock, listStock, updateStock, getReplenishmentAlerts } = require("../controllers/stockController");
const { listStoreOrders } = require("../controllers/orderController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { createStoreSchema, updateStoreSchema } = require("../validators/storeValidators");
const { upsertStockSchema, updateStockSchema } = require("../validators/productValidators");

const router = express.Router();

// Module 2 - Dark-Store Management (admin only for writes; browsing is open
// to any authenticated user so customers can resolve their nearest store).
router.get("/nearest", protect, findNearestStore);
router.get("/", protect, listStores);
router.get("/:id", protect, getStore);
router.post("/", protect, authorize("admin"), validate(createStoreSchema), createStore);
router.put("/:id", protect, authorize("admin"), validate(updateStoreSchema), updateStore);
router.delete("/:id", protect, authorize("admin"), deleteStore);

// Module 3 - Store-Wise Stock (admin + the staff of that store).
router.get("/:storeId/stock", protect, authorize("admin", "storeStaff"), listStock);
router.post("/:storeId/stock", protect, authorize("admin", "storeStaff"), validate(upsertStockSchema), upsertStock);
router.put(
  "/:storeId/stock/:productId",
  protect,
  authorize("admin", "storeStaff"),
  validate(updateStockSchema),
  updateStock
);

// Module 9 - Stock Replenishment Alerts.
router.get("/:storeId/stock/alerts", protect, authorize("admin", "storeStaff"), getReplenishmentAlerts);

// Module 5 - store staff picking/packing queue.
router.get("/:storeId/orders", protect, authorize("admin", "storeStaff"), listStoreOrders);

module.exports = router;
