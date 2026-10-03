// 📄 Path: src/controllers/trainerBookingController.js
const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const TrainerBooking = require('../models/TrainerBooking');
const TrainerProfile = require('../models/TrainerProfile');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const { getKolkataDate, getHoursBeforeSlot } = require('../utils/kolkataTime');

function generateCheckInCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateJitsiMeetingLink() {
    const randomSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).substring(7)}`;
    return `https://meet.jit.si/fitsync-${randomSuffix}`;
}

/**
 * POST /api/trainer-bookings
 * Book a session with atomic slot locking
 */
exports.createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            trainerId,
            date,
            slot,
            slotStart,
            durationMin = 60,
            packageId,
            notes = "",
            mode = "online",
            offlineAddress = ""
        } = req.body;

        let bookingDate = date;
        let bookingSlot = slot;
        let parsedSlotStart = null;

        if (slotStart) {
            const d = new Date(slotStart);
            if (!isNaN(d.getTime())) {
                parsedSlotStart = d;
                if (!bookingDate) {
                    bookingDate = d.toISOString().split('T')[0];
                }
                if (!bookingSlot) {
                    const startH = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
                    const endD = new Date(d.getTime() + (Number(durationMin) || 60) * 60 * 1000);
                    const endH = endD.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
                    bookingSlot = `${startH}-${endH}`;
                }
            }
        }

        if (!trainerId || !bookingDate || !bookingSlot) {
            return res.status(400).json({ success: false, message: "trainerId, and either (date + slot) or slotStart are required" });
        }

        const trainer = await TrainerProfile.findById(trainerId);
        if (!trainer) {
            return res.status(404).json({ success: false, message: "Trainer profile not found" });
        }

        if (trainer.status !== "approved") {
            return res.status(400).json({ success: false, message: "Cannot book unapproved trainer" });
        }

        if (trainer.userId.toString() === userId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot book a session with yourself" });
        }

        // Validate mode
        if (mode === "offline" && trainer.mode === "online") {
            return res.status(400).json({ success: false, message: "This trainer only offers online sessions" });
        }
        if (mode === "online" && trainer.mode === "offline") {
            return res.status(400).json({ success: false, message: "This trainer only offers offline sessions" });
        }

        // Check if booking via package
        let price;
        if (packageId && Array.isArray(trainer.pricing?.packages)) {
            const pkg = trainer.pricing.packages.find(p => p.name === packageId || p.id === packageId);
            price = pkg ? pkg.price : (mode === "offline" ? Number(trainer.pricing?.sessionOffline || trainer.pricing?.offline || 800) : Number(trainer.pricing?.sessionOnline || trainer.pricing?.online || 500));
        } else {
            price = mode === "offline" ? Number(trainer.pricing?.sessionOffline || trainer.pricing?.offline || 800) : Number(trainer.pricing?.sessionOnline || trainer.pricing?.online || 500);
        }

        // Atomic slot lock check
        const existingBooking = await TrainerBooking.findOne({
            trainerProfileId: trainer._id,
            date: bookingDate,
            slot: bookingSlot,
            status: { $in: ["confirmed", "completed"] }
        });

        if (existingBooking) {
            return res.status(409).json({
                success: false,
                message: `Slot '${bookingSlot}' on ${bookingDate} is already booked. Please choose another time.`
            });
        }

        const checkInCode = generateCheckInCode();
        const meetingLink = mode === "online" ? generateJitsiMeetingLink() : "";
        const paymentsEnabled = process.env.PAYMENTS_ENABLED === 'true';

        // When payments disabled (default dev mode)
        if (!paymentsEnabled) {
            const settings = await Settings.getSettings();
            const commission = Number(settings.trainerCommissionPercent || 15);
            const platformFee = Number(((price * commission) / 100).toFixed(2));
            const partnerAmount = Number((price - platformFee).toFixed(2));

            const booking = await TrainerBooking.create({
                userId,
                trainerProfileId: trainer._id,
                trainerUserId: trainer.userId,
                date: bookingDate,
                slot: bookingSlot,
                slotStart: parsedSlotStart,
                durationMin: Number(durationMin) || 60,
                packageId: packageId || null,
                notes: notes.trim(),
                mode,
                price,
                meetingLink,
                offlineAddress: mode === "offline" ? (offlineAddress || trainer.city || "Client Address") : "",
                status: "confirmed",
                trainerDecision: "accepted",
                checkInCode,
                razorpayOrderId: `dev_ord_${Date.now()}`
            });

            const payment = await Payment.create({
                userId,
                bookingId: booking._id,
                referenceType: "TrainerBooking",
                orderId: booking.razorpayOrderId,
                paymentId: `dev_pay_${Date.now()}`,
                amount: price,
                currency: "INR",
                status: "skipped_dev",
                platformFee,
                partnerAmount,
                rawResponse: { mode: "skipped_dev", reason: "PAYMENTS_ENABLED is false" }
            });

            booking.paymentId = payment._id;
            await booking.save();

            // Notify user & trainer
            await Notification.create({
                userId,
                title: "Session Booked! 🗓️",
                message: `Your ${mode} session with ${trainer.type} on ${date} (${slot}) is confirmed.${mode === 'online' ? ` Meeting Link: ${meetingLink}` : ""}`,
                type: "booking_confirmed",
                data: { bookingId: booking._id, mode, meetingLink }
            });

            await Notification.create({
                userId: trainer.userId,
                title: "New Session Booking! 🏃",
                message: `New ${mode} session booked for ${date} (${slot}). Partner amount: ₹${partnerAmount}`,
                type: "booking_confirmed",
                data: { bookingId: booking._id }
            });

            return res.status(201).json({
                success: true,
                paymentsEnabled: false,
                message: "Session booked and confirmed",
                booking
            });
        }

        // Live Razorpay test mode
        let razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            try {
                const razorpay = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET
                });
                const order = await razorpay.orders.create({
                    amount: Math.round(price * 100),
                    currency: "INR",
                    receipt: `tbk_${Date.now().toString(36)}`,
                    notes: { trainerId: trainer._id.toString(), userId, date, slot, mode }
                });
                razorpayOrderId = order.id;
            } catch (err) {
                console.error("Razorpay error:", err);
            }
        }

        const booking = await TrainerBooking.create({
            userId,
            trainerProfileId: trainer._id,
            trainerUserId: trainer.userId,
            date,
            slot,
            mode,
            price,
            meetingLink,
            offlineAddress: mode === "offline" ? (offlineAddress || trainer.city || "") : "",
            status: "pending_payment",
            checkInCode,
            razorpayOrderId
        });

        return res.status(201).json({
            success: true,
            paymentsEnabled: true,
            message: "Booking initiated, proceed to payment",
            booking,
            razorpayOrder: {
                orderId: razorpayOrderId,
                amount: Math.round(price * 100),
                currency: "INR",
                keyId: process.env.RAZORPAY_KEY_ID || "TEST_KEY"
            }
        });
    } catch (error) {
        console.error("❌ Error booking trainer session:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/trainer-bookings/:id/verify-payment
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const booking = await TrainerBooking.findById(id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (secret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
            const expectedSig = crypto
                .createHmac('sha256', secret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

            if (expectedSig !== razorpay_signature) {
                return res.status(400).json({ success: false, message: "Invalid payment signature" });
            }
        }

        const settings = await Settings.getSettings();
        const commission = Number(settings.trainerCommissionPercent || 15);
        const platformFee = Number(((booking.price * commission) / 100).toFixed(2));
        const partnerAmount = Number((booking.price - platformFee).toFixed(2));

        const payment = await Payment.create({
            userId,
            bookingId: booking._id,
            referenceType: "TrainerBooking",
            orderId: razorpay_order_id || booking.razorpayOrderId,
            paymentId: razorpay_payment_id || `pay_test_${Date.now()}`,
            amount: booking.price,
            currency: "INR",
            status: "captured",
            platformFee,
            partnerAmount
        });

        booking.status = "confirmed";
        booking.paymentId = payment._id;
        booking.razorpayPaymentId = payment.paymentId;
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified, session confirmed",
            booking,
            payment
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/trainer-bookings/mine?as=user|trainer
 */
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const asRole = req.query.as === "trainer" ? "trainer" : "user";

        const filter = asRole === "trainer" ? { trainerUserId: userId } : { userId };

        const bookings = await TrainerBooking.find(filter)
            .populate('trainerProfileId', 'type specialties city photos')
            .populate('trainerUserId', 'name email')
            .populate('userId', 'name email')
            .sort({ date: -1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: bookings.length,
            as: asRole,
            bookings: bookings.map(b => ({
                _id: b._id,
                date: b.date,
                slot: b.slot,
                mode: b.mode,
                price: Number(b.price || 0),
                status: b.status,
                trainerDecision: b.trainerDecision,
                meetingLink: b.meetingLink || "",
                offlineAddress: b.offlineAddress || "",
                checkInCode: b.checkInCode,
                rescheduledCount: Number(b.rescheduledCount || 0),
                client: b.userId ? { name: b.userId.name, email: b.userId.email } : null,
                trainer: b.trainerUserId ? { name: b.trainerUserId.name, email: b.trainerUserId.email } : null,
                createdAt: b.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/trainer-bookings/:id/respond
 * Trainer accepts or declines booking
 */
exports.respondToBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { action, reason = "" } = req.body;

        if (!["accept", "decline"].includes(action)) {
            return res.status(400).json({ success: false, message: "action must be 'accept' or 'decline'" });
        }

        const booking = await TrainerBooking.findById(id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.trainerUserId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to respond to this booking" });
        }

        if (action === "accept") {
            booking.trainerDecision = "accepted";
            await booking.save();

            await Notification.create({
                userId: booking.userId,
                title: "Booking Accepted! ✅",
                message: `Your session on ${booking.date} (${booking.slot}) was accepted by the trainer.`,
                type: "booking_confirmed",
                data: { bookingId: booking._id }
            });

            return res.status(200).json({ success: true, message: "Booking accepted", booking });
        } else {
            // Decline & refund
            booking.trainerDecision = "declined";
            booking.status = "declined";
            booking.declineReason = reason.trim() || "Trainer is unavailable";
            booking.refundAmount = booking.price;
            booking.refundStatus = "full";
            await booking.save();

            if (booking.paymentId) {
                await Payment.findByIdAndUpdate(booking.paymentId, { status: "refunded", refundAmount: booking.price });
            }

            await Notification.create({
                userId: booking.userId,
                title: "Session Declined ⚠️",
                message: `Your booking on ${booking.date} was declined by the trainer. Full refund of ₹${booking.price} initiated.`,
                type: "booking_cancelled",
                data: { bookingId: booking._id, refundAmount: booking.price }
            });

            return res.status(200).json({
                success: true,
                message: "Booking declined and refund processed",
                booking
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/trainer-bookings/:id/reschedule
 * Reschedule once
 */
exports.rescheduleBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { newDate, newSlot } = req.body;

        if (!newDate || !newSlot) {
            return res.status(400).json({ success: false, message: "newDate and newSlot are required" });
        }

        const booking = await TrainerBooking.findById(id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to reschedule this booking" });
        }

        if (booking.status !== "confirmed") {
            return res.status(400).json({ success: false, message: "Only confirmed bookings can be rescheduled" });
        }

        if (booking.rescheduledCount >= 1) {
            return res.status(400).json({ success: false, message: "This session has already been rescheduled once. Further rescheduling is not permitted." });
        }

        // Check slot availability
        const slotConflict = await TrainerBooking.findOne({
            trainerProfileId: booking.trainerProfileId,
            date: newDate,
            slot: newSlot,
            status: { $in: ["confirmed", "completed"] },
            _id: { $ne: booking._id }
        });

        if (slotConflict) {
            return res.status(409).json({ success: false, message: "Requested new slot is already booked" });
        }

        booking.date = newDate;
        booking.slot = newSlot;
        booking.rescheduledCount = (booking.rescheduledCount || 0) + 1;
        await booking.save();

        await Notification.create({
            userId: booking.trainerUserId,
            title: "Session Rescheduled 🔄",
            message: `A client rescheduled their session to ${newDate} (${newSlot}).`,
            type: "general",
            data: { bookingId: booking._id, newDate, newSlot }
        });

        return res.status(200).json({
            success: true,
            message: "Session rescheduled successfully",
            booking
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/trainer-bookings/:id/complete
 * Mark session completed (allows user to review)
 */
exports.completeBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const booking = await TrainerBooking.findById(id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const isTrainer = booking.trainerUserId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isTrainer && !isAdmin) {
            return res.status(403).json({ success: false, message: "Only the trainer or admin can complete a session" });
        }

        booking.status = "completed";
        booking.completedAt = new Date();
        await booking.save();

        await Notification.create({
            userId: booking.userId,
            title: "Session Completed! 🎉",
            message: `Your training session on ${booking.date} is complete! Please take a moment to leave a review.`,
            type: "checkin",
            data: { bookingId: booking._id, trainerProfileId: booking.trainerProfileId }
        });

        return res.status(200).json({
            success: true,
            message: "Session marked as completed. Review is now enabled for the client.",
            booking
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/trainer-bookings/:id/cancel
 * Cancel with dynamic refund rules
 */
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await TrainerBooking.findById(id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to cancel this booking" });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Booking is already cancelled" });
        }

        if (booking.status === "completed") {
            return res.status(400).json({ success: false, message: "Cannot cancel a completed session" });
        }

        const hoursRemaining = getHoursBeforeSlot(booking.date, booking.slot);
        const settings = await Settings.getSettings();
        const { fullRefundHours = 12, partialRefundHours = 2, partialRefundPercent = 50 } = settings.refundRules || {};

        let refundPercent = 0;
        let refundStatus = "none";

        if (hoursRemaining >= fullRefundHours) {
            refundPercent = 100;
            refundStatus = "full";
        } else if (hoursRemaining >= partialRefundHours) {
            refundPercent = partialRefundPercent;
            refundStatus = "partial";
        }

        const refundAmount = Number(((booking.price * refundPercent) / 100).toFixed(2));

        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        booking.refundAmount = refundAmount;
        booking.refundStatus = refundStatus;
        await booking.save();

        if (booking.paymentId) {
            await Payment.findByIdAndUpdate(booking.paymentId, {
                status: refundStatus === 'full' ? 'refunded' : 'captured',
                refundAmount
            });
        }

        await Notification.create({
            userId: booking.userId,
            title: "Session Cancelled",
            message: `Your training session on ${booking.date} was cancelled. Refund: ₹${refundAmount} (${refundStatus}).`,
            type: "booking_cancelled",
            data: { bookingId: booking._id, refundAmount }
        });

        return res.status(200).json({
            success: true,
            message: "Session cancelled successfully",
            cancellation: {
                bookingId: booking._id,
                hoursBeforeSlot: Number(hoursRemaining.toFixed(2)),
                refundPercent: Number(refundPercent),
                refundAmount: Number(refundAmount),
                refundStatus
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/trainers/:id/reviews
 * Review trainer (enforces completed session requirement)
 */
exports.createTrainerReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, comment = "" } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "rating must be between 1 and 5" });
        }

        const trainer = await TrainerProfile.findById(id);
        if (!trainer) return res.status(404).json({ success: false, message: "Trainer not found" });

        // Enforce completed booking requirement
        const completedBooking = await TrainerBooking.findOne({
            trainerProfileId: id,
            userId: userId,
            status: "completed"
        });

        if (!completedBooking) {
            return res.status(403).json({
                success: false,
                message: "Only clients with a completed session with this trainer can submit a review"
            });
        }

        let review = await Review.findOne({
            targetType: "TrainerProfile",
            targetId: id,
            userId,
            bookingId: completedBooking._id
        });

        if (review) {
            review.rating = Number(rating);
            review.comment = comment.trim();
            await review.save();
        } else {
            review = await Review.create({
                targetType: "TrainerProfile",
                targetId: id,
                userId,
                bookingId: completedBooking._id,
                rating: Number(rating),
                comment: comment.trim()
            });
        }

        const refreshed = await TrainerProfile.findById(id).select('ratingAvg ratingCount');

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review,
            trainerRating: {
                ratingAvg: Number(refreshed.ratingAvg || 0),
                ratingCount: Number(refreshed.ratingCount || 0)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
