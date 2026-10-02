// 📄 Path: src/routes/nutritionRoutes.js
const express = require('express');
const router = express.Router();

const foodController = require('../controllers/foodController');
const mealController = require('../controllers/mealController');
const nutritionController = require('../controllers/nutritionController');
const recommendationController = require('../controllers/recommendationController');
const waterController = require('../controllers/waterController');
const targetController = require('../controllers/targetController');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');

// FEATURE A: Protein-focused daily recommendations
router.get('/recommendations', auth, recommendationController.getRecommendations);
router.post('/recommendations/:id/add', auth, recommendationController.addRecommendationToLog);

// FEATURE B: Weekly calorie bar graph
router.get('/weekly', auth, nutritionController.getWeeklyNutrition);

// FEATURE C: Dynamic AI nutrition insight
router.get('/insight', auth, nutritionController.getDynamicInsight);
router.get('/ai/insight', auth, nutritionController.getDynamicInsight); // Alias for backward compatibility

// Food Routes
router.get('/foods/search', auth, foodController.searchFoods);
router.get('/foods/:id', auth, foodController.getFoodDetails);

// Meal Routes
router.post('/meals/add', auth, mealController.addMeal);
router.delete('/meals/delete', auth, mealController.deleteMealItem);
router.put('/meals/update', auth, mealController.updateMealQuantity);

// Nutrition Dashboard & Water
router.get('/today', auth, nutritionController.getTodayNutrition);
router.post('/water/add', auth, waterController.addWater);

// Targets & Validation
router.post('/targets/setup', auth, targetController.setupTargets);
router.get('/targets', auth, targetController.getTargets);

// AI Vision Scan & AI Coach (for Android Retrofit client)
router.post('/scan', auth, uploadImage, aiController.scanFoodImage);
router.post('/ai/ask', auth, aiController.askAiCoach);

module.exports = router;