// 📄 Path: src/controllers/notificationController.js
const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * List notifications for the authenticated user
 */
exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount: Number(unreadCount),
            notifications: notifications.map(n => ({
                _id: n._id,
                title: n.title,
                message: n.message,
                type: n.type,
                data: n.data || {},
                isRead: Boolean(n.isRead),
                createdAt: n.createdAt
            }))
        });
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch notifications"
        });
    }
};

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("❌ Error marking notification read:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for current user
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("❌ Error marking all notifications read:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
