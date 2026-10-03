// 📄 Path: src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: { type: String, default: "" },
    image: { type: String, default: "" },
    category: { type: String, default: "accessories" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
        index: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    items: {
        type: [orderItemSchema],
        required: true
    },
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    platformFee: {
        type: Number,
        default: 0
    },
    partnerAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending_payment", "placed", "packed", "shipped", "delivered", "cancelled", "returned"],
        default: "placed",
        index: true
    },
    tracking: {
        courierName: { type: String, default: "" },
        trackingId: { type: String, default: "" },
        shippedAt: { type: Date },
        deliveredAt: { type: Date }
    },
    cancelledAt: {
        type: Date
    },
    returnedAt: {
        type: Date
    },
    returnReason: {
        type: String,
        default: ""
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

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
