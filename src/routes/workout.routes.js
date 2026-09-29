

const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');
router.post('/preferences', workoutController.savePreferencesAndQueueGeneration);

module.exports = router;