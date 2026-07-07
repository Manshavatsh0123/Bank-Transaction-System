const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// POST /api/auth/register
router.post("/register",authController.userRegisterController);

// POST /api/auth/login
router.post("/login",authController.userloginController);

// POST /api/auth/logout
router.post("/logout",authController.userlogoutController);


module.exports = router;