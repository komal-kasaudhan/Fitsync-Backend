const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        category: {
            type: String,
            required: true,
            index: true
        },
        subCategory: {
            type: String,
            trim: true
        },
        servingType: {
            type: String,
            required: true
        },
        servingSize: {
            type: String,
            required: true
        },
        servingWeight: {
            type: Number,
            required: true,
            default: 100
        },
        nutritionPerServing: {
            calories: { type: Number, required: true },
            protein: { type: Number, required: true },
            carbs: { type: Number, required: true },
            fat: { type: Number, required: true },
            fiber: { type: Number, default: 0 },
            sugar: { type: Number, default: 0 },
            sodium: { type: Number, default: 0 },
            potassium: { type: Number, default: 0 }
        },
        dietType: {
            type: String,
            enum: ['Veg', 'NonVeg', 'Eggitarian', 'Vegan'],
            default: 'Veg'
        },
        mealTypes: [{
            type: String,
            enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
        }],
        aliases: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        verified: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    { timestamps: true }
);

FoodSchema.index({ name: 'text', aliases: 'text', category: 'text' });

module.exports = mongoose.model('Food', FoodSchema);