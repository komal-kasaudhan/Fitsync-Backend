// 📄 Path: src/routes/gymBooking.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const bookingController = require('../controllers/gymBookingController');

// Webhook endpoint (verified via Razorpay webhook signature header)
router.post('/webhook', express.raw({ type: 'application/json' }), bookingController.razorpayWebhook);

// Authenticated booking endpoints
router.use(auth);

// Create session booking (atomic capacity check, 6-digit code, Razorpay order)
router.post('/', bookingController.createBooking);

// List user's bookings
router.get('/', bookingController.getMyBookings);
router.get('/my', bookingController.getMyBookings);
router.get('/mine', bookingController.getMyBookings);

// Verify Razorpay payment signature and confirm booking
router.post('/:id/verify-payment', bookingController.verifyPayment);

// Cancel booking (refund by hours before slot from Settings)
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
