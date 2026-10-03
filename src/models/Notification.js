// 📄 Path: src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["booking_confirmed", "booking_cancelled", "checkin", "gym_approved", "gym_rejected", "gym_suspended", "general"],
        default: "general"
    },
    data: {
        type: Object,
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
