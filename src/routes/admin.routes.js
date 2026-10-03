// 📄 Path: src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const adminController = require('../controllers/adminController');

// All admin routes require JWT authentication and 'admin' role
router.use(auth);
router.use(requireRole('admin'));

// Admin Profile & System Stats
router.get('/me', adminController.getAdminProfile);
router.get('/stats', adminController.getPlatformStats);

// Gyms management
router.get('/gyms', adminController.getGyms);
router.get('/gyms/pending', (req, res, next) => { req.query.status = "pending"; next(); }, adminController.getGyms);
router.put('/gyms/:id/status', adminController.updateGymStatus);
router.put('/gyms/:id/approve', (req, res, next) => { req.body.status = "approved"; next(); }, adminController.updateGymStatus);
router.put('/gyms/:id/reject', (req, res, next) => { req.body.status = "rejected"; next(); }, adminController.updateGymStatus);
router.put('/gyms/:id/suspend', (req, res, next) => { req.body.status = "suspended"; next(); }, adminController.updateGymStatus);

// Trainers management
router.get('/trainers', adminController.getTrainers);
router.put('/trainers/:id/status', adminController.updateTrainerStatus);
router.put('/trainers/:id/approve', (req, res, next) => { req.body.status = "approved"; next(); }, adminController.updateTrainerStatus);
router.put('/trainers/:id/reject', (req, res, next) => { req.body.status = "rejected"; next(); }, adminController.updateTrainerStatus);
router.put('/trainers/:id/suspend', (req, res, next) => { req.body.status = "suspended"; next(); }, adminController.updateTrainerStatus);

// Sellers management
router.get('/sellers', adminController.getSellers);
router.put('/sellers/:id/status', adminController.updateSellerStatus);
router.put('/sellers/:id/approve', (req, res, next) => { req.body.status = "approved"; next(); }, adminController.updateSellerStatus);
router.put('/sellers/:id/reject', (req, res, next) => { req.body.status = "rejected"; next(); }, adminController.updateSellerStatus);
router.put('/sellers/:id/suspend', (req, res, next) => { req.body.status = "suspended"; next(); }, adminController.updateSellerStatus);

// Products management
router.get('/products', adminController.getProducts);
router.put('/products/:id/status', adminController.updateProductStatus);
router.put('/products/:id/approve', (req, res, next) => { req.body.status = "approved"; next(); }, adminController.updateProductStatus);
router.put('/products/:id/reject', (req, res, next) => { req.body.status = "rejected"; next(); }, adminController.updateProductStatus);
router.put('/products/:id/suspend', (req, res, next) => { req.body.status = "suspended"; next(); }, adminController.updateProductStatus);

// Reports management
router.get('/reports', adminController.getReports);
router.put('/reports/:id', adminController.updateReport);

// Platform Settings
router.get('/settings', adminController.getPlatformSettings);
router.put('/settings', adminController.updatePlatformSettings);

// Exercise Management (preserved)
router.put('/exercises/:id/image', async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ success: false, message: "imageUrl is required" });

        const updated = await Exercise.findOneAndUpdate(
            { $or: [{ id: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
            { $set: { imageUrl } },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: `Exercise ${id} not found` });

        return res.status(200).json({
            success: true,
            message: `Image updated for exercise ${updated.id || updated.name}`,
            exercise: { id: updated.id, name: updated.name, imageUrl: updated.imageUrl }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
