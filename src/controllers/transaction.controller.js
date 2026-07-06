const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.services");
const mongoose = require("mongoose");

async function createTransaction(req, res) {
    const session = await mongoose.startSession();

    try {

        // ============================
        // 1. Validate Request
        // ============================
        const {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey
        } = req.body;

        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "fromAccount, toAccount, amount and idempotencyKey are required"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than zero"
            });
        }

        if (fromAccount === toAccount) {
            return res.status(400).json({
                message: "Cannot transfer money to the same account"
            });
        }

        // ============================
        // 2. Validate Idempotency Key
        // ============================
        const existingTransaction = await transactionModel.findOne({
            idempotencyKey
        });

        if (existingTransaction) {

            if (existingTransaction.status === "COMPLETED") {
                return res.status(200).json({
                    message: "Transaction already processed",
                    transaction: existingTransaction
                });
            }

            if (existingTransaction.status === "PENDING") {
                return res.status(200).json({
                    message: "Transaction is still processing"
                });
            }

            if (existingTransaction.status === "FAILED") {
                return res.status(400).json({
                    message: "Previous transaction failed"
                });
            }

            if (existingTransaction.status === "REVERSED") {
                return res.status(400).json({
                    message: "Transaction has been reversed"
                });
            }
        }

        // ============================
        // 3. Fetch Accounts
        // ============================
        const senderAccount = await accountModel.findById(fromAccount).populate("user");

        const receiverAccount = await accountModel.findById(toAccount).populate("user");

        if (!senderAccount || !receiverAccount) {
            return res.status(404).json({
                message: "Invalid sender or receiver account"
            });
        }

        // ============================
        // 4. Authorization
        // ============================
        if (!senderAccount.user._id.equals(req.user._id)) {
            return res.status(403).json({
                message: "You are not authorized to perform this transaction"
            });
        }

        // ============================
        // 5. Check Account Status
        // ============================
        if (
            senderAccount.status !== "ACTIVE" ||
            receiverAccount.status !== "ACTIVE"
        ) {
            return res.status(400).json({
                message: "One or both accounts are inactive"
            });
        }

        // ============================
        // 6. Check Balance
        // ============================
        const balance = await senderAccount.getBalance();

        if (balance < amount) {
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        // ============================
        // 7. Start Database Transaction
        // ============================
        session.startTransaction();

        const [transaction] = await transactionModel.create(
            [{
                fromAccount,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
            }],
            { session }
        );

        // ============================
        // 8. Create Ledger Entries
        // ============================

        await ledgerModel.create(
            [{
                account: fromAccount,
                amount,
                transaction: transaction._id,
                type: "DEBIT"
            }],
            { session }
        );

        await ledgerModel.create(
            [{
                account: toAccount,
                amount,
                transaction: transaction._id,
                type: "CREDIT"
            }],
            { session }
        );

        // ============================
        // 9. Complete Transaction
        // ============================
        transaction.status = "COMPLETED";

        await transaction.save({ session });

        // ============================
        // 10. Commit
        // ============================
        await session.commitTransaction();

        // ============================
        // Send Email
        // ============================
        await emailService.sendTransactionEmail(
            senderAccount.user.email,
            senderAccount.user.name,
            amount,
            receiverAccount.user.name
        );

        return res.status(201).json({
            success: true,
            message: "Transaction completed successfully",
            transaction
        });

    } catch (error) {

        await session.abortTransaction();

        return res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {

        session.endSession();

    }
}

async function createInitialFundsTransaction(req, res) {
    const session = await mongoose.startSession();

    try {
        const { toAccount, amount, idempotencyKey } = req.body;

        // Validate request body
        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "toAccount, amount and idempotencyKey are required",
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0",
            });
        }

        // Check duplicate transaction
        const existingTransaction = await transactionModel.findOne({
            idempotencyKey,
        });

        if (existingTransaction) {
            return res.status(409).json({
                message: "Transaction already exists",
            });
        }

        // Receiver account
        const toUserAccount = await accountModel.findById(toAccount);

        if (!toUserAccount) {
            return res.status(404).json({
                message: "Receiver account not found",
            });
        }

        // Sender account (system user's account)
        const fromUserAccount = await accountModel.findOne({
            user: req.user._id,
            status: "ACTIVE",
        });

        if (!fromUserAccount) {
            return res.status(404).json({
                message: "Sender account not found",
            });
        }

        let transaction;

        await session.withTransaction(async () => {
            // Create transaction
            [transaction] = await transactionModel.create(
                [
                    {
                        fromAccount: fromUserAccount._id,
                        toAccount: toUserAccount._id,
                        amount,
                        idempotencyKey,
                        status: "PENDING",
                    },
                ],
                {
                    session,
                    ordered: true,
                }
            );

            // Create ledger entries
            await ledgerModel.insertMany(
                [
                    {
                        account: fromUserAccount._id,
                        amount,
                        transaction: transaction._id,
                        type: "DEBIT",
                    },
                    {
                        account: toUserAccount._id,
                        amount,
                        transaction: transaction._id,
                        type: "CREDIT",
                    },
                ],
                { session }
            );

            // Mark transaction completed
            transaction.status = "COMPLETED";
            await transaction.save({ session });
        });

        return res.status(201).json({
            success: true,
            message: "Initial funds transferred successfully",
            transaction,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Transaction failed",
            error: error.message,
        });
    } finally {
        await session.endSession();
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
};