// 📄 Path: src/routes/trainerBooking.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const bookingController = require('../controllers/trainerBookingController');

router.use(auth);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getMyBookings);
router.get('/mine', bookingController.getMyBookings);
router.post('/:id/verify-payment', bookingController.verifyPayment);
router.post('/:id/respond', bookingController.respondToBooking);
router.post('/:id/reschedule', bookingController.rescheduleBooking);
router.post('/:id/complete', bookingController.completeBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
