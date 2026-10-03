// 📄 Path: src/routes/gym.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/gymUpload.middleware');
const gymController = require('../controllers/gymController');
const reviewController = require('../controllers/reviewController');

// All gym routes require JWT authentication
router.use(auth);

// Search & discovery (MUST be placed before parameterized /:id routes)
router.get('/nearby', gymController.getNearbyGyms);
router.get('/mine', gymController.getMyGyms);
router.get('/my', gymController.getMyGyms);

// Image upload (Multer, max 5MB, JPG/PNG/WebP, saves to /public/uploads, returns full URL)
router.post('/upload', upload.single('photo'), gymController.uploadGymPhoto);

// Register a new gym (status starts as 'pending', promotes user to 'gym_owner')
router.post('/', gymController.createGym);

// Single gym details & slots
router.get('/:id', gymController.getGymById);
router.put('/:id', gymController.updateGym);
router.get('/:id/slots', gymController.getGymSlots);

// Gym Owner / Admin operations
router.get('/:id/bookings', gymController.getGymBookingsForOwner);
router.post('/:id/check-in', gymController.checkInBooking);
router.get('/:id/earnings', gymController.getGymEarnings);

// Reviews (only users with attended bookings can submit)
router.post('/:id/reviews', reviewController.createGymReview);
router.get('/:id/reviews', reviewController.getGymReviews);

module.exports = router;
