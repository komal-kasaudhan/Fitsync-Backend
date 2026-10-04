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
            required: false
        },
        photoUrl: {
            type: String,
            default: ""
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
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