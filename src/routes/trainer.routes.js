// 📄 Path: src/routes/trainer.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const trainerController = require('../controllers/trainerController');
const bookingController = require('../controllers/trainerBookingController');

// Public discovery (needs auth per prompt: "All routes need JWT auth except health")
router.use(auth);

router.get('/nearby', trainerController.getNearbyTrainers);
router.get('/mine', trainerController.getMyTrainerProfile);
router.get('/', trainerController.getTrainers);
router.post('/', trainerController.createTrainerProfile);

router.get('/:id', trainerController.getTrainerById);
router.put('/:id', trainerController.updateTrainerProfile);
router.get('/:id/slots', trainerController.getTrainerSlots);

// Reviews
router.post('/:id/reviews', bookingController.createTrainerReview);

module.exports = router;
