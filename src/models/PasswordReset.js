// 📄 Path: src/models/PasswordReset.js
const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        ip: {
            type: String,
            default: ""
        },
        otpHash: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        attempts: {
            type: Number,
            default: 0
        },
        maxAttempts: {
            type: Number,
            default: 5
        },
        resetTokenHash: {
            type: String,
            default: null
        },
        resetTokenExpiresAt: {
            type: Date,
            default: null
        },
        used: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// TTL index to automatically remove old records after 2 hours
passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

module.exports = mongoose.model("PasswordReset", passwordResetSchema);
