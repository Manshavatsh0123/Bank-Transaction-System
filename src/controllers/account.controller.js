const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
    try {
        const user = req.user;

        // Check if account already exists
        const existingAccount = await accountModel.findOne({
            user: user._id,
        });

        if (existingAccount) {
            return res.status(409).json({
                message: "Account already exists",
            });
        }

        const account = await accountModel.create({
            user: user._id,
        });

        return res.status(201).json({
            message: "Account created successfully",
            account,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}

async function getUserAccountController(req, res) {
    try {
        const accounts = await accountModel.find({
            user: req.user._id,
        });

        return res.status(200).json({
            success: true,
            accounts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user accounts",
            error: error.message,
        });
    }
}

async function getAccountBalanceController(req, res) {
    try {
        const { accountId } = req.params;

        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id,
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found!",
            });
        }

        const balance = await account.getBalance();

        return res.status(200).json({
            success: true,
            accountId: account._id,
            balance,
            currency: account.currency,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch account balance",
            error: error.message,
        });
    }
}

module.exports = {
    createAccountController,
    getUserAccountController,
    getAccountBalanceController
};
