const Joi = require("joi");

// tlds: { allow: false } - Joi's default .email() checks the domain's TLD
// against a public suffix list, which rejects RFC 2606 reserved testing
// domains like .test/.example/.localhost (used by seed.js and the Postman
// collection). Disabling the TLD check keeps normal email-shape validation
// without that false rejection.
const emailSchema = Joi.string().trim().email({ tlds: { allow: false } });

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: emailSchema.required(),
  password: Joi.string().min(6).max(72).required(),
  phone: Joi.string().trim().max(20).allow("", null),
  role: Joi.string().valid("customer", "storeStaff", "deliveryPartner", "admin").default("customer"),
  storeId: Joi.string().hex().length(24).when("role", {
    is: "storeStaff",
    then: Joi.required(),
    otherwise: Joi.optional().allow(null, ""),
  }),
});

const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
