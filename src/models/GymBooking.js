// 📄 Path: src/models/GymBooking.js
const mongoose = require('mongoose');

const gymBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
        index: true
    },
    sessionType: {
        type: String,
        enum: ["dayPass", "weekly", "monthly"],
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true,
        index: true
    },
    slot: {
        type: String, // e.g. "06:00-07:00"
        default: ""
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    checkInCode: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    status: {
        type: String,
        enum: ["pending_payment", "confirmed", "attended", "cancelled", "expired"],
        default: "pending_payment",
        index: true
    },
    attendedAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
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
    }
}, {
    timestamps: true
});

// Compound index for slot capacity queries
gymBookingSchema.index({ gymId: 1, date: 1, slot: 1, status: 1 });

const GymBooking = mongoose.model('GymBooking', gymBookingSchema);
module.exports = GymBooking;
