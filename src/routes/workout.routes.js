// 📄 Path: src/routes/workout.routes.js
const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');
const auth = require('../middleware/auth.middleware');

// FEATURE D: Exercise library
router.get('/exercises', auth, workoutController.getExercises);

// FEATURE E & G: Workout Plan Engine
router.post('/plan/generate', auth, workoutController.generateWorkoutPlan);
router.post('/plan/regenerate', auth, workoutController.generateWorkoutPlan);
router.get('/plan/current', auth, workoutController.getCurrentPlan);
router.get('/plan', auth, workoutController.getCurrentPlan);
router.get('/today', auth, workoutController.getTodayWorkout);

// Session completion & skip adaptation
router.post('/session/complete', auth, workoutController.completeSession);
router.post('/session/skip', auth, workoutController.skipSession);

// FEATURE F: Workout Stats & Weight logging
router.get('/stats', auth, workoutController.getWorkoutStats);
router.post('/weight', auth, workoutController.logWeight);

// Backward-compatibility aliases
router.post('/generate', auth, workoutController.generateWorkoutPlan);
router.get('/', auth, workoutController.getCurrentPlan);

module.exports = router;