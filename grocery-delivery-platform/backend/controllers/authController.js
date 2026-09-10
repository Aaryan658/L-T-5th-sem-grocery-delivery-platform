const User = require("../models/User");
const DeliveryPartner = require("../models/DeliveryPartner");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");
const { success, error } = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

// Module 1 - User Registration & Authentication.
// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, storeId } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return error(res, 409, "An account with this email already exists", "DUPLICATE_EMAIL");
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    role,
    storeId: role === "storeStaff" ? storeId : null,
  });

  // A delivery partner gets their operational profile created alongside the
  // account so /api/delivery-partners/available can find them immediately.
  if (role === "deliveryPartner") {
    await DeliveryPartner.create({ userId: user._id });
  }

  const token = generateToken({ id: user._id, role: user.role });
  return success(res, 201, "Registered successfully", {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !user.isActive) {
    return error(res, 400, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return error(res, 400, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  const token = generateToken({ id: user._id, role: user.role });
  return success(res, 200, "Login successful", {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return success(res, 200, "Current user", { user: req.user });
});

module.exports = { register, login, getMe };
