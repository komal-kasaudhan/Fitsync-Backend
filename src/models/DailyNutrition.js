const mongoose = require('mongoose');

const loggedMealSchema = new mongoose.Schema({
    foodId: { type: String, required: true },
    foodName: { type: String, required: true },
    mealType: { type: String, enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
    servingType: { type: String, default: 'Servings' },
    quantity: { type: Number, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    loggedAt: { type: Date, default: Date.now }
});

const consumedSchema = new mongoose.Schema({
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    waterMl: { type: Number, default: 0 }
}, { _id: false });

const dailyNutritionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', index: true },
    date: { type: String, required: true, index: true },
    targetCalories: { type: Number, default: 2200 },
    targetProtein: { type: Number, default: 120 },
    targetCarbs: { type: Number, default: 260 },
    targetFat: { type: Number, default: 70 },
    targetWater: { type: Number, default: 3000 },
    targetWaterMl: { type: Number, default: 3000 },
    targetWaterLiters: { type: Number, default: 3.0 },
    consumedCalories: { type: Number, default: 0 },
    consumedProtein: { type: Number, default: 0 },
    consumedCarbs: { type: Number, default: 0 },
    consumedFat: { type: Number, default: 0 },
    consumedWater: { type: Number, default: 0 },
    consumed: { type: consumedSchema, default: () => ({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, waterMl: 0 }) },
    loggedMeals: [loggedMealSchema]
}, { timestamps: true, strict: false });

dailyNutritionSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyNutrition', dailyNutritionSchema);