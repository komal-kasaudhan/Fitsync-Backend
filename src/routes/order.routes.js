// 📄 Path: src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const productController = require('../controllers/productController');

router.use(auth);

router.post('/', productController.createOrder);
router.get('/', productController.getMyOrders);
router.get('/mine', productController.getMyOrders);
router.post('/:id/cancel', productController.cancelOrder);
router.post('/:id/return', productController.returnOrder);

module.exports = router;
