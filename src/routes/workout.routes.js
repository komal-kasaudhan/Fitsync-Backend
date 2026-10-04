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
router.get('/day/:dayIndex', auth, workoutController.getDayWorkout);
router.get('/today', auth, workoutController.getTodayWorkout);

// Session completion, feedback & skip adaptation
router.post('/session/complete', auth, workoutController.completeSession);
router.post('/session/feedback', auth, workoutController.saveSessionFeedback);
router.post('/session/skip', auth, workoutController.skipSession);

// Exercise manual image update
router.put('/exercises/:id/image', auth, workoutController.updateExerciseImage);

// Workout Preferences
router.post('/preferences', auth, workoutController.saveWorkoutPreferences);
router.put('/preferences', auth, workoutController.saveWorkoutPreferences);
router.get('/preferences', auth, workoutController.getWorkoutPreferences);


// FEATURE F: Workout Stats & Weight logging
router.get('/stats', auth, workoutController.getWorkoutStats);
router.post('/weight', auth, workoutController.logWeight);

// Backward-compatibility aliases
router.post('/generate', auth, workoutController.generateWorkoutPlan);
router.get('/', auth, workoutController.getCurrentPlan);

module.exports = router;