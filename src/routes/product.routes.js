// 📄 Path: src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const productController = require('../controllers/productController');

// All routes require auth
router.use(auth);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/:id/reviews', productController.createProductReview);

module.exports = router;
