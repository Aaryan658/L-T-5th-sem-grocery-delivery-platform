const Joi = require("joi");

const createStoreSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  area: Joi.string().trim().min(2).max(100).required(),
  serviceablePincodes: Joi.array().items(Joi.string().trim().pattern(/^\d{4,10}$/)).min(1).required(),
  location: Joi.object({
    line1: Joi.string().trim().allow("", null),
    city: Joi.string().trim().allow("", null),
  }).optional(),
});

const updateStoreSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  area: Joi.string().trim().min(2).max(100),
  serviceablePincodes: Joi.array().items(Joi.string().trim().pattern(/^\d{4,10}$/)),
  location: Joi.object({
    line1: Joi.string().trim().allow("", null),
    city: Joi.string().trim().allow("", null),
  }),
  isActive: Joi.boolean(),
}).min(1);

module.exports = { createStoreSchema, updateStoreSchema };
