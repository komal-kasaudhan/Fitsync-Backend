const express = require('express');
const router = express.Router();

const foodController = require('../controllers/foodController');
const mealController = require('../controllers/mealController');
const nutritionController = require('../controllers/nutritionController');
const waterController = require('../controllers/waterController');
const targetController = require('../controllers/targetController');
const auth = require('../middleware/auth.middleware');

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

module.exports = router;