const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  category: Joi.string().trim().min(1).max(60).required(),
  unit: Joi.string().trim().max(20).default("pc"),
  price: Joi.number().min(0).required(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120),
  category: Joi.string().trim().min(1).max(60),
  unit: Joi.string().trim().max(20),
  price: Joi.number().min(0),
  isActive: Joi.boolean(),
}).min(1);

const upsertStockSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(0).required(),
  reorderPoint: Joi.number().integer().min(0).default(10),
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().min(0),
  reorderPoint: Joi.number().integer().min(0),
}).min(1);

module.exports = { createProductSchema, updateProductSchema, upsertStockSchema, updateStockSchema };
