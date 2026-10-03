// 📄 Path: src/routes/cart.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const productController = require('../controllers/productController');

router.use(auth);

router.get('/', productController.getCart);
router.post('/items', productController.addToCart);
router.delete('/items/:productId', productController.removeFromCart);
router.delete('/', productController.clearCart);

module.exports = router;
