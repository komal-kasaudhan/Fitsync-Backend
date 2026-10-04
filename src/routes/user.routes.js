// 📄 Path: src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const workoutController = require('../controllers/workout.controller');
const auth = require('../middleware/auth.middleware');

// FEATURE G: User equipment management
router.get('/equipment', auth, equipmentController.getUserEquipment);
router.put('/equipment', auth, equipmentController.updateUserEquipment);

// Workout preferences
router.get('/preferences', auth, workoutController.getWorkoutPreferences);
router.post('/preferences', auth, workoutController.saveWorkoutPreferences);
router.put('/preferences', auth, workoutController.saveWorkoutPreferences);
router.get('/workout-preferences', auth, workoutController.getWorkoutPreferences);
router.post('/workout-preferences', auth, workoutController.saveWorkoutPreferences);
router.put('/workout-preferences', auth, workoutController.saveWorkoutPreferences);

module.exports = router;
