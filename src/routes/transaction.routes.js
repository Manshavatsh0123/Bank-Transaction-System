const express = require("express");
const {
    authMiddleware,
    systemMiddleware,
} = require("../middleware/auth.middleware");

const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

/**
 * POST /api/transactions
 * Create a new transaction
 */
router.post(
    "/",
    authMiddleware,
    transactionController.createTransaction
);

/**
 * POST /api/transactions/system/initial-funds
 * Create initial funds transaction by system users
 */
router.post(
    "/system/initial-funds",
    systemMiddleware,
    transactionController.createInitialFundsTransaction
);

module.exports = router;