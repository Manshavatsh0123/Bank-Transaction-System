const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

/**
 * -POST /api/accounts
 * -Create a new accounts
 * -Protected Routes
 */
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)

/**
 * - GET /api/accounts/
 * Get all accounts of the logged-in users
 * Protected Routes
 */
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountController)

module.exports = router;