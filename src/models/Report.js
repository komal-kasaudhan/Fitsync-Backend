// 📄 Path: src/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    targetType: {
        type: String,
        enum: ["Gym", "TrainerProfile", "Product", "Review"],
        required: true,
        index: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    details: {
        type: String,
        default: "",
        trim: true
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "dismissed"],
        default: "pending",
        index: true
    },
    adminNotes: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
