// 📄 Path: src/routes/equipment.routes.js
const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const auth = require('../middleware/auth.middleware');

// Master equipment list: GET /api/equipment/master
router.get('/master', auth, equipmentController.getMasterEquipment);

// User equipment fallback routes: GET /api/equipment, PUT /api/equipment
router.get('/', auth, equipmentController.getUserEquipment);
router.put('/', auth, equipmentController.updateUserEquipment);

module.exports = router;
