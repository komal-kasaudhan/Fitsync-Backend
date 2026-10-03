// 📄 Path: src/models/Product.js
const mongoose = require('mongoose');
const { getInitialPartnerStatus } = require('../utils/partnerUtils');

const variantSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "Size" or "Flavor"
    options: { type: [String], required: true } // e.g. ["M", "L", "XL"] or ["Chocolate", "Vanilla"]
}, { _id: false });

const productSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["supplements", "nutrition_food", "gym_wear", "accessories", "equipment", "bottles_shakers"],
        required: true,
        index: true
    },
    brand: {
        type: String,
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    mrp: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 1
    },
    variants: {
        type: [variantSchema],
        default: []
    },
    images: {
        type: [String],
        default: []
    },
    ingredients: {
        type: [String],
        default: []
    },
    nutritionFacts: {
        type: Object,
        default: {}
    },
    expiryDate: {
        type: String, // YYYY-MM-DD for food / supplements
        default: ""
    },
    tags: {
        type: [String],
        default: []
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
    flaggedForAdminReview: {
        type: Boolean,
        default: false,
        index: true
    },
    flagReason: {
        type: String,
        default: ""
    },
    ratingAvg: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    soldCount: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

productSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
