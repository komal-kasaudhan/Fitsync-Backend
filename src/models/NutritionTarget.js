const mongoose = require('mongoose');

const nutritionTargetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            unique: true,
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            index: true
        },
        bmr: {
            type: Number,
            default: 0
        },
        tdee: {
            type: Number,
            default: 0
        },
        targetCalories: {
            type: Number,
            required: true,
            default: 2000
        },
        targetProtein: {
            type: Number,
            required: true,
            default: 100
        },
        targetCarbs: {
            type: Number,
            required: true,
            default: 250
        },
        targetFat: {
            type: Number,
            required: true,
            default: 65
        },
        targetWaterMl: {
            type: Number,
            default: 3000
        },
        targetWaterLiters: {
            type: Number,
            default: 3.0
        },
        goalType: {
            type: String,
            default: 'MAINTAIN'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('NutritionTarget', nutritionTargetSchema);
