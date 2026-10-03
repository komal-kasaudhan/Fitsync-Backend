// 📄 Path: src/controllers/adminGymController.js
const Gym = require('../models/Gym');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');

/**
 * GET /api/admin/gyms/pending
 * List all gyms pending approval
 */
exports.getPendingGyms = async (req, res) => {
    try {
        const gyms = await Gym.find({ status: "pending" })
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: gyms.length,
            gyms: gyms.map(gym => ({
                _id: gym._id,
                name: gym.name,
                description: gym.description || "",
                address: gym.address,
                city: gym.city,
                pincode: gym.pincode,
                location: gym.location,
                phone: gym.phone || "",
                photos: gym.photos || [],
                amenities: gym.amenities || [],
                openingHours: gym.openingHours || [],
                sessionTypes: gym.sessionTypes || [],
                capacityPerSlot: Number(gym.capacityPerSlot || 20),
                status: gym.status,
                owner: gym.ownerId ? {
                    id: gym.ownerId._id,
                    name: gym.ownerId.name,
                    email: gym.ownerId.email
                } : null,
                createdAt: gym.createdAt
            }))
        });
    } catch (error) {
        console.error("❌ Error fetching pending gyms:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/admin/gyms
 * List all gyms with optional status filter
 */
exports.getAllGyms = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const gyms = await Gym.find(filter)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: gyms.length,
            gyms: gyms.map(gym => ({
                _id: gym._id,
                name: gym.name,
                city: gym.city,
                address: gym.address,
                status: gym.status,
                ratingAvg: Number(gym.ratingAvg || 0),
                ratingCount: Number(gym.ratingCount || 0),
                owner: gym.ownerId ? { name: gym.ownerId.name, email: gym.ownerId.email } : null,
                createdAt: gym.createdAt
            }))
        });
    } catch (error) {
        console.error("❌ Error fetching all gyms:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/admin/gyms/:id/status
 * Update gym status: approved | rejected | suspended (with reason)
 */
exports.updateGymStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason = "" } = req.body;

        const validStatuses = ["approved", "rejected", "suspended", "pending"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(", ")}`
            });
        }

        const gym = await Gym.findById(id);
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        gym.status = status;
        if (status === "rejected" || status === "suspended") {
            gym.rejectionReason = rejectionReason.trim();
        } else if (status === "approved") {
            gym.rejectionReason = "";
        }

        await gym.save();

        // Notify gym owner
        if (gym.ownerId) {
            const statusTitles = {
                approved: "Gym Approved! 🎉",
                rejected: "Gym Application Update ⚠️",
                suspended: "Gym Account Suspended 🛑"
            };

            const statusMessages = {
                approved: `Congratulations! Your gym "${gym.name}" has been approved and is now live on FitSync.`,
                rejected: `Your gym application for "${gym.name}" was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
                suspended: `Your gym "${gym.name}" has been suspended.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`
            };

            await Notification.create({
                userId: gym.ownerId,
                title: statusTitles[status] || "Gym Status Updated",
                message: statusMessages[status] || `Your gym status is now ${status}.`,
                type: `gym_${status}`,
                data: { gymId: gym._id, status, rejectionReason }
            });
        }

        return res.status(200).json({
            success: true,
            message: `Gym ${status} successfully`,
            gym: {
                _id: gym._id,
                name: gym.name,
                status: gym.status,
                rejectionReason: gym.rejectionReason,
                updatedAt: gym.updatedAt
            }
        });
    } catch (error) {
        console.error("❌ Error updating gym status:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/admin/settings
 * Fetch platform commission and refund settings
 */
exports.getPlatformSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        return res.status(200).json({
            success: true,
            settings: {
                commissionPercent: Number(settings.commissionPercent),
                refundRules: {
                    fullRefundHours: Number(settings.refundRules.fullRefundHours),
                    partialRefundHours: Number(settings.refundRules.partialRefundHours),
                    partialRefundPercent: Number(settings.refundRules.partialRefundPercent),
                    noRefundHours: Number(settings.refundRules.noRefundHours)
                },
                updatedAt: settings.updatedAt
            }
        });
    } catch (error) {
        console.error("❌ Error fetching settings:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/admin/settings
 * Update platform commission and refund settings
 */
exports.updatePlatformSettings = async (req, res) => {
    try {
        const { commissionPercent, refundRules } = req.body;
        const settings = await Settings.getSettings();

        if (commissionPercent !== undefined) {
            const commNum = Number(commissionPercent);
            if (isNaN(commNum) || commNum < 0 || commNum > 100) {
                return res.status(400).json({ success: false, message: "commissionPercent must be a number between 0 and 100" });
            }
            settings.commissionPercent = commNum;
        }

        if (refundRules && typeof refundRules === 'object') {
            if (refundRules.fullRefundHours !== undefined) {
                settings.refundRules.fullRefundHours = Number(refundRules.fullRefundHours);
            }
            if (refundRules.partialRefundHours !== undefined) {
                settings.refundRules.partialRefundHours = Number(refundRules.partialRefundHours);
            }
            if (refundRules.partialRefundPercent !== undefined) {
                settings.refundRules.partialRefundPercent = Number(refundRules.partialRefundPercent);
            }
            if (refundRules.noRefundHours !== undefined) {
                settings.refundRules.noRefundHours = Number(refundRules.noRefundHours);
            }
        }

        await settings.save();

        return res.status(200).json({
            success: true,
            message: "Platform settings updated successfully",
            settings: {
                commissionPercent: Number(settings.commissionPercent),
                refundRules: settings.refundRules
            }
        });
    } catch (error) {
        console.error("❌ Error updating settings:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
