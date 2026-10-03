// 📄 Path: src/models/TrainerBooking.js
const mongoose = require('mongoose');

const trainerBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    trainerProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainerProfile',
        required: true,
        index: true
    },
    trainerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true,
        index: true
    },
    slot: {
        type: String, // e.g. "08:00-09:00"
        required: true
    },
    mode: {
        type: String,
        enum: ["online", "offline"],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    meetingLink: {
        type: String,
        default: ""
    },
    offlineAddress: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending_payment", "confirmed", "completed", "cancelled", "declined"],
        default: "pending_payment",
        index: true
    },
    trainerDecision: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "accepted" // defaults to accepted unless explicitly declined
    },
    declineReason: {
        type: String,
        default: ""
    },
    rescheduledCount: {
        type: Number,
        default: 0,
        max: 1
    },
    checkInCode: {
        type: String,
        required: true,
        index: true
    },
    razorpayOrderId: {
        type: String,
        default: ""
    },
    razorpayPaymentId: {
        type: String,
        default: ""
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    refundStatus: {
        type: String,
        enum: ["none", "partial", "full"],
        default: "none"
    },
    completedAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Atomic slot uniqueness: prevent double-booking for the same trainer, date and active slot
trainerBookingSchema.index({ trainerProfileId: 1, date: 1, slot: 1, status: 1 });

const TrainerBooking = mongoose.model('TrainerBooking', trainerBookingSchema);
module.exports = TrainerBooking;
