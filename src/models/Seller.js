// 📄 Path: src/models/Seller.js
const mongoose = require('mongoose');
const { getInitialPartnerStatus } = require('../utils/partnerUtils');

const pickupAddressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }
}, { _id: false });

const sellerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true,
        index: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    gstin: {
        type: String,
        default: "",
        trim: true
    },
    fssai: {
        type: String, // REQUIRED for food & supplement sellers
        default: "",
        trim: true
    },
    pickupAddress: {
        type: pickupAddressSchema,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "suspended"],
        default: getInitialPartnerStatus,
        index: true
    },
    rejectionReason: {
        type: String,
        default: ""
    },
    payoutLedgerNote: {
        type: String,
        default: "Recorded ledger mode in dev/test (no raw bank credentials stored; Razorpay Route ready)"
    },
    ratingAvg: {
        type: Number,
        default: 0
    },
    totalSales: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;
