// 📄 Path: src/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notificationController');

router.use(auth);

// Get notifications for current user
router.get('/', notificationController.getMyNotifications);

// Mark single notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
