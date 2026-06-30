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

module.exports = {
    createAccountController,
};
