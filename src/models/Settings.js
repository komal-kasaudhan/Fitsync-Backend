// 📄 Path: src/models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: "platform_settings"
    },
    commissionPercent: {
        type: Number,
        default: 15,
        min: 0,
        max: 100
    },
    trainerCommissionPercent: {
        type: Number,
        default: 15,
        min: 0,
        max: 100
    },
    categoryCommissions: {
        supplements: { type: Number, default: 10 },
        nutrition_food: { type: Number, default: 8 },
        gym_wear: { type: Number, default: 12 },
        accessories: { type: Number, default: 12 },
        equipment: { type: Number, default: 7 },
        bottles_shakers: { type: Number, default: 10 }
    },
    featuredPrices: {
        gymFeaturedPrice: { type: Number, default: 1999 },
        trainerFeaturedPrice: { type: Number, default: 1499 },
        productFeaturedPrice: { type: Number, default: 999 }
    },
    refundRules: {
        fullRefundHours: {
            type: Number,
            default: 12 // >= 12h before slot: 100%
        },
        partialRefundHours: {
            type: Number,
            default: 2  // between 2h and 12h before slot: 50%
        },
        partialRefundPercent: {
            type: Number,
            default: 50
        },
        noRefundHours: {
            type: Number,
            default: 2  // < 2h before slot: 0%
        },
        marketplaceReturnDays: {
            type: Number,
            default: 7
        }
    }
}, {
    timestamps: true
});

// Helper to fetch or create active settings document
settingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne({ key: "platform_settings" });
    if (!settings) {
        settings = await this.create({
            key: "platform_settings",
            commissionPercent: 15,
            trainerCommissionPercent: 15,
            categoryCommissions: {
                supplements: 10,
                nutrition_food: 8,
                gym_wear: 12,
                accessories: 12,
                equipment: 7,
                bottles_shakers: 10
            },
            featuredPrices: {
                gymFeaturedPrice: 1999,
                trainerFeaturedPrice: 1499,
                productFeaturedPrice: 999
            },
            refundRules: {
                fullRefundHours: 12,
                partialRefundHours: 2,
                partialRefundPercent: 50,
                noRefundHours: 2,
                marketplaceReturnDays: 7
            }
        });
    }
    return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
