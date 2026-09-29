// 📄 Path: src/services/mealService.js
const MealLog = require('../models/MealLog');
const Food = require('../models/Food');
const ApiError = require('../utils/apiError');
const nutritionCalculationService = require('./nutritionCalculationService');

class MealService {
  
  calculateItemNutrition(foodDoc, quantity) {
    const factor = quantity;
    const nutrition = foodDoc.nutritionPerServing || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    return {
      calories: Math.round((nutrition.calories || 0) * factor),
      protein: Math.round((nutrition.protein || 0) * factor * 10) / 10,
      carbs: Math.round((nutrition.carbs || 0) * factor * 10) / 10,
      fat: Math.round((nutrition.fat || 0) * factor * 10) / 10,
      fiber: Math.round((nutrition.fiber || 0) * factor * 10) / 10
    };
  }

  _recalculateMealTotals(mealLog) {
    mealLog.totalMealNutrition = mealLog.items.reduce(
      (acc, curr) => ({
        calories: acc.calories + (curr.calculatedNutrition?.calories || 0),
        protein: Math.round(((acc.protein || 0) + (curr.calculatedNutrition?.protein || 0)) * 10) / 10,
        carbs: Math.round(((acc.carbs || 0) + (curr.calculatedNutrition?.carbs || 0)) * 10) / 10,
        fat: Math.round(((acc.fat || 0) + (curr.calculatedNutrition?.fat || 0)) * 10) / 10,
        fiber: Math.round(((acc.fiber || 0) + (curr.calculatedNutrition?.fiber || 0)) * 10) / 10
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }

  async addMealItem(userId, { date, mealType, foodId, quantity, unit }) {
    const food = await Food.findById(foodId);
    if (!food) {
      throw new ApiError(404, 'Food item not found in database');
    }

    const calculatedNutrition = this.calculateItemNutrition(food, quantity);

    const mealItemData = {
      foodId: food._id,
      foodName: food.name,
      quantity,
      unit: unit || food.servingType || 'serving',
      calculatedNutrition
    };

    let mealLog = await MealLog.findOne({ userId, date, mealType });

    if (!mealLog) {
      mealLog = new MealLog({
        userId,
        date,
        mealType,
        items: [mealItemData]
      });
    } else {
      const existingIndex = mealLog.items.findIndex(
        item => item.foodId && item.foodId.toString() === foodId.toString()
      );

      if (existingIndex > -1) {
        mealLog.items[existingIndex].quantity += quantity;
        mealLog.items[existingIndex].calculatedNutrition = this.calculateItemNutrition(
          food,
          mealLog.items[existingIndex].quantity
        );
      } else {
        mealLog.items.push(mealItemData);
      }
    }

    this._recalculateMealTotals(mealLog);
    await mealLog.save();
    await nutritionCalculationService.syncDailyNutrition(userId, date);

    return mealLog;
  }

  async deleteMealItem(userId, { date, mealType, itemId, foodId }) {
    const query = { userId, date };
    if (mealType) query.mealType = mealType;

    let mealLog = await MealLog.findOne(query);
    if (!mealLog) {
      throw new ApiError(404, 'Meal log not found');
    }

    const initialLength = mealLog.items.length;
    mealLog.items = mealLog.items.filter(item => {
      if (itemId && item._id && item._id.toString() === itemId.toString()) return false;
      if (foodId && item.foodId && item.foodId.toString() === foodId.toString()) return false;
      return true;
    });

    if (mealLog.items.length === initialLength) {
      throw new ApiError(404, 'Meal item not found in log');
    }

    this._recalculateMealTotals(mealLog);
    await mealLog.save();
    await nutritionCalculationService.syncDailyNutrition(userId, date);

    return mealLog;
  }

  async updateMealQuantity(userId, { date, mealType, itemId, foodId, quantity }) {
    const query = { userId, date };
    if (mealType) query.mealType = mealType;

    let mealLog = await MealLog.findOne(query);
    if (!mealLog) {
      throw new ApiError(404, 'Meal log not found');
    }

    const item = mealLog.items.find(it => {
      if (itemId && it._id && it._id.toString() === itemId.toString()) return true;
      if (foodId && it.foodId && it.foodId.toString() === foodId.toString()) return true;
      return false;
    });

    if (!item) {
      throw new ApiError(404, 'Meal item not found in log');
    }

    const food = await Food.findById(item.foodId);
    if (!food) {
      throw new ApiError(404, 'Associated food item not found in database');
    }

    item.quantity = quantity;
    item.calculatedNutrition = this.calculateItemNutrition(food, quantity);

    this._recalculateMealTotals(mealLog);
    await mealLog.save();
    await nutritionCalculationService.syncDailyNutrition(userId, date);

    return mealLog;
  }
}

module.exports = new MealService();