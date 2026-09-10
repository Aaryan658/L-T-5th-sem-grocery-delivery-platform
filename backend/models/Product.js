const mongoose = require("mongoose");

// Master catalog. Deliberately store-agnostic - per-store quantity lives in
// StoreStock (referenced), because the same product is shared across many
// stores and its stock is updated far more often than its catalog details.
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      trim: true,
      default: "pc",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model("Product", productSchema);
