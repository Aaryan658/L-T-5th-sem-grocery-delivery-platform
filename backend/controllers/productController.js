const Product = require("../models/Product");
const { success, error } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Module 3 - Product Catalog (the master list; per-store quantity lives in
// stockController.js / StoreStock).

// POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  return success(res, 201, "Product created successfully", product);
});

// GET /api/products?category=&search=
const listProducts = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

  const products = await Product.find(filter).sort({ name: 1 });
  return success(res, 200, "Products fetched successfully", products);
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return error(res, 404, "Product not found", "NOT_FOUND");
  return success(res, 200, "Product fetched successfully", product);
});

// PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return error(res, 404, "Product not found", "NOT_FOUND");
  return success(res, 200, "Product updated successfully", product);
});

// DELETE /api/products/:id (admin, soft delete)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return error(res, 404, "Product not found", "NOT_FOUND");
  return success(res, 200, "Product deactivated successfully", product);
});

module.exports = { createProduct, listProducts, getProduct, updateProduct, deleteProduct };
