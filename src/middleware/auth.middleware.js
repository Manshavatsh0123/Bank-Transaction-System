const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const blacklistModel = require("../models/blackList.models");

/**
 * Authentication Middleware
 */
async function authMiddleware(req, res, next) {
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing",
        });
    }

    try {
        const blacklistedToken = await blacklistModel.findOne({ token });

        if (blacklistedToken) {
            return res.status(401).json({
                message: "Token has been blacklisted. Please login again.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}

/**
 * System User Middleware
 */
async function systemMiddleware(req, res, next) {
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access, token is missing",
        });
    }

    try {
        const blacklistedToken = await blacklistModel.findOne({ token });

        if (blacklistedToken) {
            return res.status(401).json({
                message: "Token has been blacklisted. Please login again.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel
            .findById(decoded.userId)
            .select("+systemUser");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, not a system user",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            error: error.message,
        });
    }
}

module.exports = {
    authMiddleware,
    systemMiddleware,
};