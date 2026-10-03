const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        roles: {
            type: [String],
            enum: ["user", "seller", "gym_owner", "trainer", "admin"],
            default: ["user"]
        },
        onboardingCompleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const user = mongoose.model("user", userSchema);
module.exports = user;