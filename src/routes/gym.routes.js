// 📄 Path: src/routes/gym.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
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

// Enquiries (User can submit without booking; Owner can view)
router.post('/:id/enquiry', gymController.createEnquiry);
router.get('/:id/enquiries', gymController.getEnquiriesForOwner);

// Gym Owner / Admin member management
router.get('/:id/members', gymController.getGymMembers);
router.get('/:id/members/expiring-soon', gymController.getMembersExpiringSoon);

// Check-in (supports both memberCode and session booking checkInCode)
router.post('/:id/check-in', gymController.checkInBooking);

// Earnings
router.get('/:id/earnings', gymController.getGymEarnings);
router.get('/:id/earnings-by-plan', gymController.getEarningsByPlan);
router.get('/:id/bookings', gymController.getGymBookingsForOwner);

// Reviews (only users with attended bookings/memberships can submit)
router.post('/:id/reviews', reviewController.createGymReview);
router.get('/:id/reviews', reviewController.getGymReviews);

module.exports = router;
