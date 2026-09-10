const mongoose = require("mongoose");

// Addresses are EMBEDDED: they are always read together with the user (order
// placement needs them inline) and are small, rarely-updated sub-documents
// that never need to be queried on their own.
const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    line1: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    pincode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "storeStaff", "deliveryPartner", "admin"],
      default: "customer",
    },
    // Only meaningful for storeStaff - scopes which dark-store's orders and
    // stock they may act on.
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarkStore",
      default: null,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, storeId: 1 });

module.exports = mongoose.model("User", userSchema);
