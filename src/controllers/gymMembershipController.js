// 📄 Path: src/controllers/gymMembershipController.js
const mongoose = require('mongoose');
const Gym = require('../models/Gym');
const GymMembership = require('../models/GymMembership');
const GymVisit = require('../models/GymVisit');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const { getKolkataDate, getKolkataWeekday, getKolkataTimeString } = require('../utils/kolkataTime');

/**
 * Generate a unique 6-digit member code
 */
async function generateUniqueMemberCode() {
    for (let attempts = 0; attempts < 10; attempts++) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await GymMembership.findOne({ memberCode: code });
        if (!existing) return code;
    }
    return Date.now().toString().slice(-6);
}

/**
 * Helper to update expired/upcoming statuses dynamically based on current time
 */
async function autoUpdateMembershipStatuses(query) {
    const now = new Date();
    // Auto-expire active memberships whose end date has passed
    await GymMembership.updateMany(
        { ...query, status: "active", endDate: { $lt: now } },
        { $set: { status: "expired" } }
    );
    // Auto-activate upcoming memberships whose start date has arrived
    await GymMembership.updateMany(
        { ...query, status: "upcoming", startDate: { $lte: now }, endDate: { $gt: now } },
        { $set: { status: "active" } }
    );
}

/**
 * POST /api/gym-memberships
 * Purchase/subscribe to a gym membership plan
 */
exports.createMembership = async (req, res) => {
    try {
        const userId = req.user.id;
        const { gymId, planId, startDate } = req.body;

        if (!gymId || !planId) {
            return res.status(400).json({
                success: false,
                message: "gymId and planId are required"
            });
        }

        const gym = await Gym.findById(gymId);
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        if (gym.status !== "approved") {
            return res.status(400).json({ success: false, message: "Cannot purchase membership for unapproved gym" });
        }

        // Find the requested plan in normalized plans
        const availablePlans = gym.getNormalizedPlans();
        const selectedPlan = availablePlans.find(p => (p.id === planId || p._id?.toString() === planId));

        if (!selectedPlan || selectedPlan.isActive === false) {
            return res.status(400).json({
                success: false,
                message: "Selected plan is invalid or currently inactive"
            });
        }

        const now = new Date();
        // Prevent overlapping active or upcoming memberships at the same gym
        await autoUpdateMembershipStatuses({ userId, gymId });
        const existingMembership = await GymMembership.findOne({
            userId,
            gymId,
            status: { $in: ["active", "upcoming"] },
            endDate: { $gt: now }
        });

        if (existingMembership) {
            return res.status(400).json({
                success: false,
                message: `You already have an active/upcoming membership at this gym until ${existingMembership.endDate.toISOString().split('T')[0]}. Please extend your existing membership or wait until it expires.`
            });
        }

        // Calculate start and end dates in Asia/Kolkata context
        let start = startDate ? new Date(startDate) : new Date();
        if (isNaN(start.getTime())) {
            start = new Date();
        }

        let end;
        if (selectedPlan.type === "day_pass" || selectedPlan.durationDays === 1) {
            // Day pass ends at the end of start day
            end = new Date(start);
            end.setHours(23, 59, 59, 999);
        } else {
            end = new Date(start.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000);
        }

        const memberCode = await generateUniqueMemberCode();
        const paymentsEnabled = process.env.PAYMENTS_ENABLED === "true";
        const settings = await Settings.getSettings();
        const commissionRate = settings.commissionPercent || 15;
        const platformFee = Number(((selectedPlan.price * commissionRate) / 100).toFixed(2));
        const partnerAmount = Number((selectedPlan.price - platformFee).toFixed(2));

        if (!paymentsEnabled) {
            // Instant confirmation in development / test mode
            const initialStatus = now >= start ? "active" : "upcoming";
            const membershipObjectId = new mongoose.Types.ObjectId();
            const devOrderId = `order_dev_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            const payment = await Payment.create({
                userId,
                referenceType: "GymMembership",
                membershipId: membershipObjectId,
                orderId: devOrderId,
                paymentId: `pay_skipped_${Date.now()}`,
                amount: selectedPlan.price,
                currency: "INR",
                platformFee,
                partnerAmount,
                status: "skipped_dev",
                rawResponse: { note: "Payment skipped in dev mode (PAYMENTS_ENABLED=false)" }
            });

            const membership = await GymMembership.create({
                _id: membershipObjectId,
                userId,
                gymId: gym._id,
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                planType: selectedPlan.type,
                durationDays: selectedPlan.durationDays,
                price: selectedPlan.price,
                startDate: start,
                endDate: end,
                status: initialStatus,
                memberCode,
                maxFreezeDays: selectedPlan.maxFreezeDays || 0,
                paymentId: payment._id,
                paymentStatus: "skipped_dev"
            });

            // Notification to user
            await Notification.create({
                userId,
                title: "Membership Confirmed 🎉",
                message: `Your ${selectedPlan.name} at ${gym.name} is confirmed! Member code: ${memberCode}`,
                type: "gym_membership_confirmed",
                data: { membershipId: membership._id, gymId: gym._id, memberCode }
            });

            return res.status(201).json({
                success: true,
                message: "Membership confirmed successfully (payments disabled in dev)",
                membership: {
                    ...membership.toObject(),
                    qrCode: `FITSYNC-MEMBER:${memberCode}`
                },
                payment: {
                    id: payment._id,
                    amount: payment.amount,
                    status: payment.status,
                    platformFee: payment.platformFee,
                    partnerAmount: payment.partnerAmount
                }
            });
        } else {
            // Live Razorpay payment order generation
            // Server signature check flow
            const membership = await GymMembership.create({
                userId,
                gymId: gym._id,
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                planType: selectedPlan.type,
                durationDays: selectedPlan.durationDays,
                price: selectedPlan.price,
                startDate: start,
                endDate: end,
                status: "pending_payment",
                memberCode,
                maxFreezeDays: selectedPlan.maxFreezeDays || 0,
                paymentStatus: "pending"
            });

            return res.status(201).json({
                success: true,
                message: "Membership initiated. Please complete payment to activate.",
                membership: {
                    ...membership.toObject(),
                    qrCode: `FITSYNC-MEMBER:${memberCode}`
                },
                paymentRequired: true,
                amount: selectedPlan.price
            });
        }
    } catch (error) {
        console.error("❌ Error creating membership:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to create membership" });
    }
};

/**
 * GET /api/gym-memberships/mine (and /my)
 * List user's memberships grouped by active, upcoming, past
 */
exports.getMyMemberships = async (req, res) => {
    try {
        const userId = req.user.id;
        await autoUpdateMembershipStatuses({ userId });

        const memberships = await GymMembership.find({ userId })
            .populate('gymId', 'name address city photos phone amenities location')
            .sort({ createdAt: -1 })
            .lean();

        const active = [];
        const upcoming = [];
        const past = [];

        memberships.forEach(m => {
            const formatted = {
                ...m,
                qrCode: `FITSYNC-MEMBER:${m.memberCode}`,
                gym: m.gymId
            };
            if (m.status === "active") active.push(formatted);
            else if (m.status === "upcoming") upcoming.push(formatted);
            else past.push(formatted);
        });

        return res.status(200).json({
            success: true,
            count: memberships.length,
            memberships: memberships.map(m => ({ ...m, qrCode: `FITSYNC-MEMBER:${m.memberCode}`, gym: m.gymId })),
            active,
            upcoming,
            past
        });
    } catch (error) {
        console.error("❌ Error fetching user memberships:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch memberships" });
    }
};

/**
 * GET /api/gym-memberships/:id
 * Single membership details with QR/memberCode & check-in history
 */
exports.getMembershipById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid membership ID" });
        }

        await autoUpdateMembershipStatuses({ _id: id });
        const membership = await GymMembership.findById(id)
            .populate('gymId', 'name address city photos phone openingHours amenities')
            .lean();

        if (!membership) {
            return res.status(404).json({ success: false, message: "Membership not found" });
        }

        const isOwner = membership.userId.toString() === userId.toString();
        const isGymOwner = membership.gymId?.ownerId?.toString() === userId.toString();
        const isAdmin = roles.includes("admin");

        if (!isOwner && !isGymOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Fetch check-in visits
        const visits = await GymVisit.find({ membershipId: id }).sort({ checkInTime: -1 }).lean();

        return res.status(200).json({
            success: true,
            membership: {
                ...membership,
                qrCode: `FITSYNC-MEMBER:${membership.memberCode}`,
                visitsCount: visits.length,
                visits
            }
        });
    } catch (error) {
        console.error("❌ Error fetching membership details:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/gym-memberships/:id/cancel
 * Cancel membership with refund calculation from Settings
 */
exports.cancelMembership = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason = "" } = req.body;

        const membership = await GymMembership.findById(id);
        if (!membership) {
            return res.status(404).json({ success: false, message: "Membership not found" });
        }

        if (membership.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You can only cancel your own membership" });
        }

        if (membership.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Membership is already cancelled" });
        }
        if (membership.status === "expired") {
            return res.status(400).json({ success: false, message: "Cannot cancel an expired membership" });
        }

        const now = new Date();
        let refundAmount = 0;

        if (now < membership.startDate) {
            // Full refund before start date
            refundAmount = membership.price;
        } else {
            // Pro-rated refund for unused days
            const daysUsed = Math.ceil((now.getTime() - membership.startDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUsed < membership.durationDays) {
                const unusedRatio = (membership.durationDays - daysUsed) / membership.durationDays;
                refundAmount = Number((membership.price * unusedRatio * 0.9).toFixed(2)); // 10% platform fee deduction on cancellation
            }
        }

        membership.status = "cancelled";
        membership.cancelledAt = now;
        membership.refundAmount = refundAmount;
        membership.cancellationReason = reason.trim();
        await membership.save();

        return res.status(200).json({
            success: true,
            message: `Membership cancelled. Refund amount: ₹${refundAmount}`,
            refundAmount,
            status: membership.status
        });
    } catch (error) {
        console.error("❌ Error cancelling membership:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/gym-memberships/:id/freeze
 * Freeze membership once, up to maxFreezeDays, extends endDate
 */
exports.freezeMembership = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const freezeDays = Number(req.body.freezeDays || req.body.days || 7);

        const membership = await GymMembership.findById(id);
        if (!membership) {
            return res.status(404).json({ success: false, message: "Membership not found" });
        }

        if (membership.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        if (membership.status !== "active") {
            return res.status(400).json({ success: false, message: `Only active memberships can be frozen (current: ${membership.status})` });
        }

        if (membership.isFrozen) {
            return res.status(400).json({ success: false, message: "Membership is already frozen" });
        }

        if (membership.freezeCount >= 1) {
            return res.status(400).json({ success: false, message: "Membership can only be frozen once" });
        }

        if (!membership.maxFreezeDays || membership.maxFreezeDays <= 0) {
            return res.status(400).json({ success: false, message: "This plan does not support membership freezing" });
        }

        if (freezeDays < 1 || freezeDays > membership.maxFreezeDays) {
            return res.status(400).json({
                success: false,
                message: `Freeze days must be between 1 and ${membership.maxFreezeDays} days for this plan`
            });
        }

        const now = new Date();
        const extendedEndDate = new Date(membership.endDate.getTime() + freezeDays * 24 * 60 * 60 * 1000);

        membership.isFrozen = true;
        membership.freezeCount += 1;
        membership.frozenDays = freezeDays;
        membership.frozenAt = now;
        membership.endDate = extendedEndDate;
        await membership.save();

        return res.status(200).json({
            success: true,
            message: `Membership frozen for ${freezeDays} days. New expiration date: ${extendedEndDate.toISOString().split('T')[0]}`,
            membership
        });
    } catch (error) {
        console.error("❌ Error freezing membership:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/gym-memberships/:id/unfreeze
 * Unfreeze membership early
 */
exports.unfreezeMembership = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const membership = await GymMembership.findById(id);
        if (!membership) {
            return res.status(404).json({ success: false, message: "Membership not found" });
        }

        if (membership.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        if (!membership.isFrozen) {
            return res.status(400).json({ success: false, message: "Membership is not frozen" });
        }

        membership.isFrozen = false;
        await membership.save();

        return res.status(200).json({
            success: true,
            message: "Membership unfrozen successfully",
            membership
        });
    } catch (error) {
        console.error("❌ Error unfreezing membership:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
