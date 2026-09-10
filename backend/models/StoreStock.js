const mongoose = require("mongoose");

// Referenced on both sides (storeId, productId): stock rows are large in
// aggregate, queried independently of both parents ("what's low at store X",
// "which stores carry product Y"), and updated on their own every time an
// order is picked - embedding either parent would mean rewriting a whole
// store or product document for a single quantity change.
const storeStockSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DarkStore",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderPoint: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
  },
  { timestamps: true }
);

// One stock row per (store, product) pair - enforced at the DB level so a
// race between two staff updates cannot create duplicate stock rows.
storeStockSchema.index({ storeId: 1, productId: 1 }, { unique: true });
storeStockSchema.index({ productId: 1 });

module.exports = mongoose.model("StoreStock", storeStockSchema);
