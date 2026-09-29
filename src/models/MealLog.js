const mongoose = require('mongoose');

const MealItemSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0.1 },
  unit: { type: String, required: true },
  calculatedNutrition: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 }
  }
});

const MealLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String, 
      required: true,
      index: true
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: true
    },
    items: [MealItemSchema],
    totalMealNutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

MealLogSchema.index({ userId: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MealLog', MealLogSchema);