const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Ledger must be associated with an account"],
      index: true,
      immutable: true,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required for creating a ledger entry"],
      immutable: true,
    },

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Ledger must be associated with a transaction"],
      index: true,
      immutable: true,
    },

    type: {
      type: String,
      enum: {
        values: ["CREDIT", "DEBIT"],
        message: "Type can only be CREDIT or DEBIT",
      },
      required: [true, "Transaction type is required"],
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent modification after creation
function preventLedgerModification(next) {
  if (!this.isNew) {
    return next(new Error("Ledger entries are immutable and cannot be modified."));
  }
  next();
}

ledgerSchema.pre("save", preventLedgerModification);

// Block all update operations
function blockOperation(next) {
  next(new Error("Ledger entries cannot be updated or deleted."));
}

ledgerSchema.pre("updateOne", blockOperation);
ledgerSchema.pre("updateMany", blockOperation);
ledgerSchema.pre("findOneAndUpdate", blockOperation);
ledgerSchema.pre("replaceOne", blockOperation);
ledgerSchema.pre("findOneAndReplace", blockOperation);

// Block all delete operations
ledgerSchema.pre("deleteOne", blockOperation);
ledgerSchema.pre("deleteMany", blockOperation);
ledgerSchema.pre("findOneAndDelete", blockOperation);
ledgerSchema.pre("findByIdAndDelete", blockOperation);

// For older Mongoose versions
ledgerSchema.pre("remove", blockOperation);

const ledgerModel = mongoose.model("Ledger", ledgerSchema);

module.exports = ledgerModel;