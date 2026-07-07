const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, "Token is required to blacklist"],
            unique: true,
            trim: true,
        },
        blacklistedAt: {
            type: Date,
            default: Date.now,
            immutable: true,
        },
    },
    {
        timestamps: true,
    }
);

// Automatically delete blacklisted tokens after 24 hours
blacklistSchema.index(
    { blacklistedAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 3 }
);

const blacklistModel = mongoose.model("Blacklist", blacklistSchema);

module.exports = blacklistModel;