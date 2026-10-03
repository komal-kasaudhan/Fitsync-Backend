// 📄 Path: src/routes/seller.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const sellerController = require('../controllers/sellerController');

router.use(auth);

// Registration & Profile
router.post('/register', sellerController.registerSeller);
router.get('/profile', sellerController.getSellerProfile);
router.put('/profile', sellerController.updateSellerProfile);

// Products CRUD (requires seller role)
router.get('/products', requireRole('seller', 'admin'), sellerController.getMyProducts);
router.post('/products', requireRole('seller', 'admin'), sellerController.createProduct);
router.put('/products/:id', requireRole('seller', 'admin'), sellerController.updateProduct);
router.delete('/products/:id', requireRole('seller', 'admin'), sellerController.deleteProduct);

// Orders Fulfillment (requires seller role)
router.get('/orders', requireRole('seller', 'admin'), sellerController.getSellerOrders);
router.put('/orders/:id/status', requireRole('seller', 'admin'), sellerController.updateOrderStatus);

// Payout Summary
router.get('/payout-summary', requireRole('seller', 'admin'), sellerController.getSellerPayoutSummary);

module.exports = router;
