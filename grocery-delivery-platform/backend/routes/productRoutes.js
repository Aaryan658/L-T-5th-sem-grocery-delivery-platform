const express = require("express");
const {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const protect = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { createProductSchema, updateProductSchema } = require("../validators/productValidators");

const router = express.Router();

// Module 3 - Product Catalog. Browsing is open to any signed-in role; only
// admin may change the master catalog.
router.get("/", protect, listProducts);
router.get("/:id", protect, getProduct);
router.post("/", protect, authorize("admin"), validate(createProductSchema), createProduct);
router.put("/:id", protect, authorize("admin"), validate(updateProductSchema), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
