const { error } = require("../utils/apiResponse");

// Module 13 - Role-Based Access Control.
// Usage: router.post('/stores', protect, authorize('admin'), createStore)
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return error(res, 403, "You do not have permission to perform this action", "FORBIDDEN");
  }
  next();
};

module.exports = authorize;
