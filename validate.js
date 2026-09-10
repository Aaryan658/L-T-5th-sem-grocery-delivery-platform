const { error } = require("../utils/apiResponse");

// Wraps a Joi schema into Express middleware so every route validates its
// request body before any business logic runs (non-functional requirement).
const validate = (schema) => (req, res, next) => {
  const { error: validationError, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (validationError) {
    const message = validationError.details.map((d) => d.message).join(", ");
    return error(res, 400, message, "VALIDATION_ERROR");
  }

  req.body = value;
  next();
};

module.exports = validate;
