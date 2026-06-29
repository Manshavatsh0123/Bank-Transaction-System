const jwt = require("jsonwebtoken");
const userModels = require("../models/user.model");
const emailService = require("../services/email.services");

// Register Controller
async function userRegisterController(req, res) {
    try {
        const { email, name, password } = req.body;

        const isExists = await userModels.findOne({ email });

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with this email",
                status: "failed"
            });
        }

        const user = await userModels.create({
            email,
            name,
            password
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.cookie("token", token, {
            httpOnly: true
        });

        // Send email first
        await emailService.sendRegisterEmail(user.email, user.name);

        return res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "failed"
        });
    }
}

// Login Controller
async function userloginController(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModels
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Email or password is invalid!"
            });
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Email or password is invalid!"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = { userRegisterController, userloginController };