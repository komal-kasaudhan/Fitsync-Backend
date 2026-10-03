// 📄 Path: src/routes/address.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const productController = require('../controllers/productController');

router.use(auth);

router.get('/', productController.getAddresses);
router.post('/', productController.addAddress);

module.exports = router;
