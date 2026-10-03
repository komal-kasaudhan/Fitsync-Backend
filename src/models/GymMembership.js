// 📄 Path: src/models/GymMembership.js
const mongoose = require('mongoose');

const gymMembershipSchema = new mongoose.Schema({
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
    planId: {
        type: String,
        required: true
    },
    planName: {
        type: String,
        required: true
    },
    planType: {
        type: String,
        enum: ["day_pass", "weekly", "monthly", "quarterly", "half_yearly", "yearly", "custom"],
        required: true
    },
    durationDays: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["pending_payment", "active", "upcoming", "expired", "cancelled"],
        default: "pending_payment",
        index: true
    },
    memberCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    isFrozen: {
        type: Boolean,
        default: false
    },
    freezeCount: {
        type: Number,
        default: 0
    },
    frozenDays: {
        type: Number,
        default: 0
    },
    frozenAt: {
        type: Date,
        default: null
    },
    maxFreezeDays: {
        type: Number,
        default: 0
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    },
    paymentStatus: {
        type: String,
        default: "pending"
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    refundAmount: {
        type: Number,
        default: 0
    },
    cancellationReason: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Compound index to help query active memberships per user and gym
gymMembershipSchema.index({ userId: 1, gymId: 1, status: 1 });
gymMembershipSchema.index({ gymId: 1, endDate: 1, status: 1 });

const GymMembership = mongoose.model('GymMembership', gymMembershipSchema);
module.exports = GymMembership;
