// 📄 Path: src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const auth = require('../middleware/auth.middleware');

// FEATURE G: User equipment management
router.get('/equipment', auth, equipmentController.getUserEquipment);
router.put('/equipment', auth, equipmentController.updateUserEquipment);

module.exports = router;
