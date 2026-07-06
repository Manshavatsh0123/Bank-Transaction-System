const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must be associated with a source account"],
      index: true,
    },

    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must be associated with a destination account"],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
        message:
          "Status can only be PENDING, COMPLETED, FAILED, or REVERSED",
      },
      default: "PENDING",
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Transaction amount must be greater than 0"],
    },

    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const transactionModel = mongoose.model(
  "Transaction",
  transactionSchema
);

module.exports = transactionModel;