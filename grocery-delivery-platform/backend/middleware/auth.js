const { verifyToken } = require("../utils/jwt");
const { error } = require("../utils/apiResponse");
const User = require("../models/User");

// Module 1 / 13 - reads the Bearer token, verifies it, and attaches the live
// user document to req.user so downstream authorize() checks and controllers
// always see up-to-date role/isActive data (not just whatever was true when
// the token was issued).
const protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return error(res, 401, "Authentication required", "NO_TOKEN");
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return error(res, 401, "Invalid or expired session", "INVALID_TOKEN");
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 401, "Invalid or expired token", "INVALID_TOKEN");
  }
};

module.exports = protect;
