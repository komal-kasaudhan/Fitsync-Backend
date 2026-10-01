const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');
const auth = require('../middleware/auth.middleware');

router.post('/preferences', auth, workoutController.savePreferencesAndQueueGeneration);
router.post('/generate', auth, workoutController.savePreferencesAndQueueGeneration);
router.get('/plan', auth, workoutController.getWorkoutPlan);
router.get('/', auth, workoutController.getWorkoutPlan);

module.exports = router;