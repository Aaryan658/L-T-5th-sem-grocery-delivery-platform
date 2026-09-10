const Joi = require("joi");

const itemSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
});

const createOrderSchema = Joi.object({
  pincode: Joi.string().trim().pattern(/^\d{4,10}$/).required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  deliveryAddress: Joi.object({
    line1: Joi.string().trim().required(),
    area: Joi.string().trim().allow("", null),
    pincode: Joi.string().trim().pattern(/^\d{4,10}$/).required(),
  }).required(),
  deliverySlot: Joi.object({
    date: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
  }).optional(),
});

const assignPartnerSchema = Joi.object({
  deliveryPartnerId: Joi.string().hex().length(24).required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid("out-for-delivery", "delivered", "failed").required(),
  note: Joi.string().trim().max(200).allow("", null),
});

module.exports = { createOrderSchema, assignPartnerSchema, updateStatusSchema };
