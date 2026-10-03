// 📄 Path: src/routes/gymMembership.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const gymMembershipController = require('../controllers/gymMembershipController');

// All gym membership endpoints require authentication
router.use(auth);

// Purchase membership
router.post('/', gymMembershipController.createMembership);

// List user's memberships
router.get('/mine', gymMembershipController.getMyMemberships);
router.get('/my', gymMembershipController.getMyMemberships);

// Get single membership details
router.get('/:id', gymMembershipController.getMembershipById);

// Cancel membership
router.post('/:id/cancel', gymMembershipController.cancelMembership);

// Freeze / unfreeze membership
router.post('/:id/freeze', gymMembershipController.freezeMembership);
router.post('/:id/unfreeze', gymMembershipController.unfreezeMembership);

module.exports = router;
