// 📄 Path: src/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    referenceType: {
        type: String,
        enum: ["GymBooking", "TrainerBooking", "Order", "GymMembership"],
        default: "GymBooking",
        index: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    membershipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GymMembership',
        index: true
    },
    marketplaceOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        index: true
    },
    orderId: {
        type: String,
        required: true,
        index: true
    },
    paymentId: {
        type: String,
        default: "",
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: "INR"
    },
    status: {
        type: String,
        enum: ["created", "captured", "failed", "refunded", "skipped_dev"],
        default: "created",
        index: true
    },
    platformFee: {
        type: Number,
        default: 0
    },
    partnerAmount: {
        type: Number,
        default: 0
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    refundId: {
        type: String,
        default: ""
    },
    rawResponse: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
