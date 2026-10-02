// 📄 Path: src/models/Recipe.js
const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            index: true
        },
        description: {
            type: String,
            default: ""
        },
        imageUrl: {
            type: String,
            default: ""
        },
        calories: {
            type: Number,
            required: true
        },
        protein: {
            type: Number,
            required: true,
            index: true
        },
        carbs: {
            type: Number,
            required: true
        },
        fat: {
            type: Number,
            required: true
        },
        fiber: {
            type: Number,
            default: 0
        },
        servingSize: {
            type: String,
            required: true,
            default: "1 serving"
        },
        mealType: {
            type: String,
            enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'],
            required: true,
            index: true
        },
        prepTimeMin: {
            type: Number,
            default: 15
        },
        dietType: {
            type: String,
            enum: ['Veg', 'NonVeg', 'Eggitarian', 'Vegan', 'veg', 'non-veg', 'vegan', 'eggetarian'],
            default: 'Veg',
            index: true
        },
        allergies: [{
            type: String,
            lowercase: true,
            trim: true
        }],
        ingredients: [{
            type: String,
            required: true
        }],
        steps: [{
            type: String,
            required: true
        }],
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food'
        },
        seasons: [{
            type: String,
            enum: ['summer', 'monsoon', 'post_monsoon', 'winter', 'spring', 'all'],
            default: 'all'
        }],
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }]
    },
    { timestamps: true }
);

RecipeSchema.index({ dietType: 1, protein: -1 });
RecipeSchema.index({ seasons: 1 });
RecipeSchema.index({ tags: 1 });

module.exports = mongoose.model('Recipe', RecipeSchema);
