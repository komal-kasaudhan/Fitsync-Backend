// 📄 Path: src/controllers/adminController.js
const mongoose = require('mongoose');
const Gym = require('../models/Gym');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const User = require('../models/user.model');
const Report = require('../models/Report');
const GymBooking = require('../models/GymBooking');
const Payment = require('../models/Payment');

/**
 * GET /api/admin/me
 * Return admin profile
 */
exports.getAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').lean();
        return res.status(200).json({
            success: true,
            admin: user
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/admin/stats
 * Platform overview stats
 */
exports.getPlatformStats = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const gymsCount = await Gym.countDocuments();
        const pendingGymsCount = await Gym.countDocuments({ status: "pending" });
        const approvedGymsCount = await Gym.countDocuments({ status: "approved" });

        // Trainers stats (if model registered)
        let trainersCount = 0;
        let pendingTrainersCount = 0;
        if (mongoose.models.TrainerProfile) {
            trainersCount = await mongoose.models.TrainerProfile.countDocuments();
            pendingTrainersCount = await mongoose.models.TrainerProfile.countDocuments({ status: "pending" });
        }

        // Sellers & Products stats (if models registered)
        let sellersCount = 0;
        let pendingSellersCount = 0;
        if (mongoose.models.Seller) {
            sellersCount = await mongoose.models.Seller.countDocuments();
            pendingSellersCount = await mongoose.models.Seller.countDocuments({ status: "pending" });
        }

        let productsCount = 0;
        let pendingProductsCount = 0;
        if (mongoose.models.Product) {
            productsCount = await mongoose.models.Product.countDocuments();
            pendingProductsCount = await mongoose.models.Product.countDocuments({ status: "pending" });
        }

        let ordersCount = 0;
        if (mongoose.models.Order) {
            ordersCount = await mongoose.models.Order.countDocuments();
        }

        const gymBookingsCount = await GymBooking.countDocuments();
        let trainerBookingsCount = 0;
        if (mongoose.models.TrainerBooking) {
            trainerBookingsCount = await mongoose.models.TrainerBooking.countDocuments();
        }

        const pendingReportsCount = await Report.countDocuments({ status: "pending" });

        // Financial totals from captured/completed payments
        const paymentStats = await Payment.aggregate([
            { $match: { status: { $in: ["captured", "skipped_dev"] } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    totalPlatformFee: { $sum: "$platformFee" },
                    totalPartnerAmount: { $sum: "$partnerAmount" }
                }
            }
        ]);

        const fin = paymentStats[0] || { totalRevenue: 0, totalPlatformFee: 0, totalPartnerAmount: 0 };

        return res.status(200).json({
            success: true,
            stats: {
                usersCount: Number(usersCount),
                gyms: {
                    total: Number(gymsCount),
                    pending: Number(pendingGymsCount),
                    approved: Number(approvedGymsCount)
                },
                trainers: {
                    total: Number(trainersCount),
                    pending: Number(pendingTrainersCount)
                },
                marketplace: {
                    sellers: Number(sellersCount),
                    pendingSellers: Number(pendingSellersCount),
                    products: Number(productsCount),
                    pendingProducts: Number(pendingProductsCount),
                    orders: Number(ordersCount)
                },
                bookings: {
                    gymBookings: Number(gymBookingsCount),
                    trainerBookings: Number(trainerBookingsCount)
                },
                reports: {
                    pending: Number(pendingReportsCount)
                },
                revenue: {
                    totalRevenue: Number(fin.totalRevenue.toFixed(2)),
                    totalPlatformFee: Number(fin.totalPlatformFee.toFixed(2)),
                    totalPartnerAmount: Number(fin.totalPartnerAmount.toFixed(2))
                }
            }
        });
    } catch (error) {
        console.error("❌ Error fetching platform stats:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Generic Resource status update (approve, reject, suspend)
 */
async function updateResourceStatus(modelName, id, status, reason, res) {
    const validStatuses = ["approved", "rejected", "suspended", "pending"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Status must be one of: ${validStatuses.join(", ")}`
        });
    }

    if ((status === "rejected" || status === "suspended") && (!reason || !reason.trim())) {
        return res.status(400).json({
            success: false,
            message: `Rejection or suspension reason is required when status is '${status}'`
        });
    }

    const Model = mongoose.model(modelName);
    const doc = await Model.findById(id);
    if (!doc) {
        return res.status(404).json({ success: false, message: `${modelName} with ID ${id} not found` });
    }

    doc.status = status;
    doc.rejectionReason = (status === "rejected" || status === "suspended") ? reason.trim() : "";
    await doc.save();

    // Notify the target user/owner
    const ownerId = doc.ownerId || doc.userId || doc.sellerId;
    if (ownerId) {
        const itemTitle = doc.name || doc.title || modelName;
        await Notification.create({
            userId: ownerId,
            title: `${modelName} ${status === 'approved' ? 'Approved 🎉' : status === 'rejected' ? 'Rejected ⚠️' : 'Suspended 🛑'}`,
            message: `Your ${modelName.toLowerCase()} "${itemTitle}" status was updated to ${status}.${doc.rejectionReason ? ` Reason: ${doc.rejectionReason}` : ""}`,
            type: `listing_${status}`,
            data: { model: modelName, id: doc._id, status, reason: doc.rejectionReason }
        });
    }

    return res.status(200).json({
        success: true,
        message: `${modelName} status updated to ${status}`,
        item: {
            id: doc._id,
            status: doc.status,
            rejectionReason: doc.rejectionReason,
            updatedAt: doc.updatedAt
        }
    });
}

// ---------------- Gym Admin Operations ----------------
exports.getGyms = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const total = await Gym.countDocuments(filter);
        const gyms = await Gym.find(filter)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            count: gyms.length,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            gyms: gyms.map(g => ({
                _id: g._id,
                name: g.name,
                city: g.city,
                address: g.address,
                status: g.status,
                rejectionReason: g.rejectionReason || "",
                ratingAvg: Number(g.ratingAvg || 0),
                ratingCount: Number(g.ratingCount || 0),
                owner: g.ownerId ? { id: g.ownerId._id, name: g.ownerId.name, email: g.ownerId.email } : null,
                createdAt: g.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGymStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason = "", rejectionReason = "" } = req.body;
        return await updateResourceStatus("Gym", id, status, reason || rejectionReason, res);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Trainer Admin Operations ----------------
exports.getTrainers = async (req, res) => {
    try {
        if (!mongoose.models.TrainerProfile) {
            return res.status(200).json({ success: true, count: 0, total: 0, page: 1, totalPages: 1, trainers: [] });
        }
        const TrainerProfile = mongoose.model('TrainerProfile');
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const total = await TrainerProfile.countDocuments(filter);
        const trainers = await TrainerProfile.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            count: trainers.length,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            trainers: trainers.map(t => ({
                _id: t._id,
                name: t.userId ? t.userId.name : "Trainer",
                email: t.userId ? t.userId.email : "",
                type: t.type,
                mode: t.mode,
                city: t.city,
                experienceYears: Number(t.experienceYears || 0),
                status: t.status,
                rejectionReason: t.rejectionReason || "",
                ratingAvg: Number(t.ratingAvg || 0),
                createdAt: t.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTrainerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason = "", rejectionReason = "" } = req.body;
        return await updateResourceStatus("TrainerProfile", id, status, reason || rejectionReason, res);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Seller Admin Operations ----------------
exports.getSellers = async (req, res) => {
    try {
        if (!mongoose.models.Seller) {
            return res.status(200).json({ success: true, count: 0, total: 0, page: 1, totalPages: 1, sellers: [] });
        }
        const Seller = mongoose.model('Seller');
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const total = await Seller.countDocuments(filter);
        const sellers = await Seller.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            count: sellers.length,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            sellers: sellers.map(s => ({
                _id: s._id,
                businessName: s.businessName,
                gstin: s.gstin || "",
                fssai: s.fssai || "",
                status: s.status,
                rejectionReason: s.rejectionReason || "",
                user: s.userId ? { name: s.userId.name, email: s.userId.email } : null,
                createdAt: s.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSellerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason = "", rejectionReason = "" } = req.body;
        return await updateResourceStatus("Seller", id, status, reason || rejectionReason, res);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Product Admin Operations ----------------
exports.getProducts = async (req, res) => {
    try {
        if (!mongoose.models.Product) {
            return res.status(200).json({ success: true, count: 0, total: 0, page: 1, totalPages: 1, products: [] });
        }
        const Product = mongoose.model('Product');
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('sellerId', 'businessName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            count: products.length,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            products: products.map(p => ({
                _id: p._id,
                title: p.title,
                category: p.category,
                price: Number(p.price || 0),
                stock: Number(p.stock || 0),
                status: p.status,
                flaggedForAdminReview: Boolean(p.flaggedForAdminReview),
                flagReason: p.flagReason || "",
                rejectionReason: p.rejectionReason || "",
                seller: p.sellerId ? { id: p.sellerId._id, businessName: p.sellerId.businessName } : null,
                createdAt: p.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason = "", rejectionReason = "" } = req.body;
        return await updateResourceStatus("Product", id, status, reason || rejectionReason, res);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Reports Admin Operations ----------------
exports.getReports = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const total = await Report.countDocuments(filter);
        const reports = await Report.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            count: reports.length,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            reports: reports.map(r => ({
                _id: r._id,
                targetType: r.targetType,
                targetId: r.targetId,
                reason: r.reason,
                details: r.details || "",
                status: r.status,
                adminNotes: r.adminNotes || "",
                reporter: r.userId ? { id: r.userId._id, name: r.userId.name, email: r.userId.email } : null,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes = "" } = req.body;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        if (status) report.status = status;
        if (adminNotes) report.adminNotes = adminNotes;
        await report.save();

        return res.status(200).json({
            success: true,
            message: "Report updated successfully",
            report
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------- Platform Settings ----------------
exports.getPlatformSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        return res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePlatformSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        const {
            commissionPercent,
            trainerCommissionPercent,
            categoryCommissions,
            featuredPrices,
            refundRules
        } = req.body;

        if (commissionPercent !== undefined) settings.commissionPercent = Number(commissionPercent);
        if (trainerCommissionPercent !== undefined) settings.trainerCommissionPercent = Number(trainerCommissionPercent);
        if (categoryCommissions) settings.categoryCommissions = { ...settings.categoryCommissions, ...categoryCommissions };
        if (featuredPrices) settings.featuredPrices = { ...settings.featuredPrices, ...featuredPrices };
        if (refundRules) settings.refundRules = { ...settings.refundRules, ...refundRules };

        await settings.save();

        return res.status(200).json({
            success: true,
            message: "Platform settings updated successfully",
            settings
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
