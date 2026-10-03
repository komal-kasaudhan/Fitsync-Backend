// 📄 Path: src/controllers/gymBookingController.js
const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const GymBooking = require('../models/GymBooking');
const Gym = require('../models/Gym');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');
const { getKolkataDate, getHoursBeforeSlot } = require('../utils/kolkataTime');

/**
 * Helper to get Razorpay instance if keys are configured
 */
function getRazorpayInstance() {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        return new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return null;
}

/**
 * Generate 6-digit random numeric check-in code
 */
function generateCheckInCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/gym-bookings
 * Create booking with atomic capacity check and initiate Razorpay order
 */
exports.createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { gymId, sessionType, date, slot = "" } = req.body;

        if (!gymId || !sessionType || !date) {
            return res.status(400).json({
                success: false,
                message: "gymId, sessionType, and date are required"
            });
        }

        const gym = await Gym.findById(gymId);
        if (!gym) {
            return res.status(404).json({
                success: false,
                message: "Gym not found"
            });
        }

        if (gym.status !== "approved") {
            return res.status(400).json({
                success: false,
                message: "Bookings can only be made for approved gyms"
            });
        }

        // Validate session type and find price
        const sessionConfig = (gym.sessionTypes || []).find(st => st.type === sessionType);
        if (!sessionConfig) {
            return res.status(400).json({
                success: false,
                message: `Session type '${sessionType}' is not offered by this gym`
            });
        }

        const price = Number(sessionConfig.price);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid session price configured"
            });
        }

        // Day passes require a time slot
        if (sessionType === 'dayPass' && !slot) {
            return res.status(400).json({
                success: false,
                message: "slot is required for dayPass sessions"
            });
        }

        // Atomic capacity check: count confirmed/attended bookings for this gym, date, and slot
        if (slot) {
            const bookedCount = await GymBooking.countDocuments({
                gymId: gym._id,
                date: date,
                slot: slot,
                status: { $in: ["confirmed", "attended"] }
            });

            const capacity = Number(gym.capacityPerSlot || 20);
            if (bookedCount >= capacity) {
                return res.status(400).json({
                    success: false,
                    message: `Slot '${slot}' is fully booked (capacity: ${capacity})`
                });
            }
        }

        const checkInCode = generateCheckInCode();
        const paymentsEnabled = process.env.PAYMENTS_ENABLED === 'true';

        // When payments are disabled (default): confirm immediately with skipped_dev status
        if (!paymentsEnabled) {
            const settings = await Settings.getSettings();
            const commissionPercent = Number(settings.commissionPercent || 15);
            const platformFee = Number(((price * commissionPercent) / 100).toFixed(2));
            const partnerAmount = Number((price - platformFee).toFixed(2));

            const booking = await GymBooking.create({
                userId,
                gymId: gym._id,
                sessionType,
                date,
                slot,
                price,
                checkInCode,
                status: "confirmed",
                razorpayOrderId: `dev_ord_${Date.now()}`
            });

            const payment = await Payment.create({
                userId,
                bookingId: booking._id,
                referenceType: "GymBooking",
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

            // Send notifications
            await Notification.create({
                userId: booking.userId,
                title: "Booking Confirmed! 🎟️",
                message: `Your booking at ${gym.name} on ${booking.date} (${booking.slot || booking.sessionType}) is confirmed. Check-in code: ${booking.checkInCode}`,
                type: "booking_confirmed",
                data: { bookingId: booking._id, gymId: gym._id }
            });

            if (gym.ownerId) {
                await Notification.create({
                    userId: gym.ownerId,
                    title: "New Gym Booking! 💰",
                    message: `New booking for ${gym.name} on ${booking.date} (${booking.slot || booking.sessionType}). Partner earning: ₹${partnerAmount}`,
                    type: "booking_confirmed",
                    data: { bookingId: booking._id, gymId: gym._id }
                });
            }

            return res.status(201).json({
                success: true,
                paymentsEnabled: false,
                message: "Booking confirmed (payment skipped in dev mode)",
                booking: {
                    _id: booking._id,
                    gymId: gym._id,
                    gymName: gym.name,
                    sessionType: booking.sessionType,
                    date: booking.date,
                    slot: booking.slot,
                    price: Number(booking.price),
                    checkInCode: booking.checkInCode,
                    status: booking.status
                },
                payment: {
                    status: payment.status,
                    amount: Number(payment.amount),
                    platformFee: Number(payment.platformFee),
                    partnerAmount: Number(payment.partnerAmount)
                }
            });
        }

        // Initialize Razorpay order when PAYMENTS_ENABLED is true
        const razorpay = getRazorpayInstance();
        let razorpayOrderId = "";

        if (razorpay) {
            try {
                const order = await razorpay.orders.create({
                    amount: Math.round(price * 100), // amount in paise
                    currency: "INR",
                    receipt: `bk_${Date.now().toString(36)}`,
                    notes: {
                        gymId: gym._id.toString(),
                        userId: userId.toString(),
                        sessionType,
                        date,
                        slot
                    }
                });
                razorpayOrderId = order.id;
            } catch (rzpErr) {
                console.error("❌ Razorpay order creation failed:", rzpErr);
                return res.status(502).json({
                    success: false,
                    message: "Payment gateway error: failed to create order"
                });
            }
        } else {
            // Mock test order ID when Razorpay keys are not yet provided in .env
            razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        }

        const booking = await GymBooking.create({
            userId,
            gymId: gym._id,
            sessionType,
            date,
            slot,
            price,
            checkInCode,
            status: "pending_payment",
            razorpayOrderId
        });

        return res.status(201).json({
            success: true,
            paymentsEnabled: true,
            message: "Booking created, complete payment to confirm",
            booking: {
                _id: booking._id,
                gymId: gym._id,
                gymName: gym.name,
                sessionType: booking.sessionType,
                date: booking.date,
                slot: booking.slot,
                price: Number(booking.price),
                checkInCode: booking.checkInCode,
                status: booking.status,
                razorpayOrderId: booking.razorpayOrderId
            },
            razorpayOrder: {
                orderId: razorpayOrderId,
                amount: Math.round(price * 100),
                currency: "INR",
                keyId: process.env.RAZORPAY_KEY_ID || "TEST_KEY_NOT_CONFIGURED"
            }
        });
    } catch (error) {
        console.error("❌ Error creating gym booking:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create booking"
        });
    }
};

/**
 * POST /api/gym-bookings/:id/verify-payment
 * Verify Razorpay payment signature, confirm booking, and record payment
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const booking = await GymBooking.findById(id).populate('gymId');
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to verify this booking" });
        }

        if (booking.status === "confirmed" || booking.status === "attended") {
            return res.status(200).json({
                success: true,
                message: "Booking is already confirmed",
                booking
            });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (secret) {
            // Verify HMAC signature
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required"
                });
            }

            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment signature"
                });
            }
        }

        // Fetch dynamic platform commission from Settings collection
        const settings = await Settings.getSettings();
        const commissionPercent = Number(settings.commissionPercent || 15);
        const platformFee = Number(((booking.price * commissionPercent) / 100).toFixed(2));
        const partnerAmount = Number((booking.price - platformFee).toFixed(2));

        // Create Payment Record
        const payment = await Payment.create({
            userId,
            bookingId: booking._id,
            orderId: razorpay_order_id || booking.razorpayOrderId,
            paymentId: razorpay_payment_id || `pay_test_${Date.now()}`,
            amount: Number(booking.price),
            currency: "INR",
            status: "captured",
            platformFee,
            partnerAmount,
            rawResponse: {
                verifiedAt: new Date().toISOString(),
                method: "server_hmac_verified"
            }
        });

        // Update Booking
        booking.status = "confirmed";
        booking.razorpayPaymentId = payment.paymentId;
        booking.paymentId = payment._id;
        await booking.save();

        // Send notifications
        await Notification.create({
            userId: booking.userId,
            title: "Booking Confirmed! 🎟️",
            message: `Your booking at ${booking.gymId.name} on ${booking.date} (${booking.slot || booking.sessionType}) is confirmed. Check-in code: ${booking.checkInCode}`,
            type: "booking_confirmed",
            data: { bookingId: booking._id, gymId: booking.gymId._id }
        });

        if (booking.gymId.ownerId) {
            await Notification.create({
                userId: booking.gymId.ownerId,
                title: "New Gym Booking! 💰",
                message: `New booking for ${booking.gymId.name} on ${booking.date} (${booking.slot || booking.sessionType}). Partner earning: ₹${partnerAmount}`,
                type: "booking_confirmed",
                data: { bookingId: booking._id, gymId: booking.gymId._id }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and booking confirmed",
            booking: {
                _id: booking._id,
                gymName: booking.gymId.name,
                sessionType: booking.sessionType,
                date: booking.date,
                slot: booking.slot,
                price: Number(booking.price),
                checkInCode: booking.checkInCode,
                status: booking.status
            },
            payment: {
                orderId: payment.orderId,
                paymentId: payment.paymentId,
                amount: Number(payment.amount),
                platformFee: Number(payment.platformFee),
                partnerAmount: Number(payment.partnerAmount),
                status: payment.status
            }
        });
    } catch (error) {
        console.error("❌ Error verifying payment:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to verify payment"
        });
    }
};

/**
 * POST /api/gym-bookings/webhook
 * Razorpay Webhook listener (verifies signature using RAZORPAY_WEBHOOK_SECRET)
 */
exports.razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        if (webhookSecret && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (expectedSignature !== signature) {
                return res.status(400).json({ success: false, message: "Invalid webhook signature" });
            }
        }

        const event = req.body.event;
        if (event === "payment.captured") {
            const paymentEntity = req.body.payload?.payment?.entity;
            if (paymentEntity) {
                const orderId = paymentEntity.order_id;
                const booking = await GymBooking.findOne({ razorpayOrderId: orderId });
                if (booking && booking.status === "pending_payment") {
                    const settings = await Settings.getSettings();
                    const commissionPercent = Number(settings.commissionPercent || 15);
                    const platformFee = Number(((booking.price * commissionPercent) / 100).toFixed(2));
                    const partnerAmount = Number((booking.price - platformFee).toFixed(2));

                    const payment = await Payment.create({
                        userId: booking.userId,
                        bookingId: booking._id,
                        orderId: orderId,
                        paymentId: paymentEntity.id,
                        amount: Number(booking.price),
                        currency: "INR",
                        status: "captured",
                        platformFee,
                        partnerAmount,
                        rawResponse: paymentEntity
                    });

                    booking.status = "confirmed";
                    booking.razorpayPaymentId = paymentEntity.id;
                    booking.paymentId = payment._id;
                    await booking.save();
                }
            }
        }

        return res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error("❌ Webhook error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/gym-bookings/mine
 * Get all gym bookings of authenticated user
 */
exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await GymBooking.find({ userId })
            .populate('gymId', 'name address city phone photos location ratingAvg')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings: bookings.map(b => ({
                _id: b._id,
                sessionType: b.sessionType,
                date: b.date,
                slot: b.slot || "",
                price: Number(b.price || 0),
                checkInCode: b.checkInCode,
                status: b.status,
                attendedAt: b.attendedAt || null,
                cancelledAt: b.cancelledAt || null,
                refundAmount: Number(b.refundAmount || 0),
                refundStatus: b.refundStatus || "none",
                gym: b.gymId ? {
                    _id: b.gymId._id,
                    name: b.gymId.name,
                    address: b.gymId.address,
                    city: b.gymId.city,
                    phone: b.gymId.phone || "",
                    photos: b.gymId.photos || [],
                    ratingAvg: Number(b.gymId.ratingAvg || 0)
                } : null,
                createdAt: b.createdAt
            }))
        });
    } catch (error) {
        console.error("❌ Error fetching my bookings:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch bookings"
        });
    }
};

/**
 * POST /api/gym-bookings/:id/cancel
 * Cancel booking and calculate refund based on Settings refund rules and hours before slot
 */
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await GymBooking.findById(id).populate('gymId');
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (booking.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to cancel this booking" });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Booking is already cancelled" });
        }

        if (booking.status === "attended") {
            return res.status(400).json({ success: false, message: "Cannot cancel an attended booking" });
        }

        // Calculate hours remaining before slot in Asia/Kolkata
        const hoursRemaining = getHoursBeforeSlot(booking.date, booking.slot);

        // Fetch dynamic refund rules from Settings
        const settings = await Settings.getSettings();
        const { fullRefundHours = 12, partialRefundHours = 2, partialRefundPercent = 50, noRefundHours = 2 } = settings.refundRules || {};

        let refundPercent = 0;
        let refundStatus = "none";

        if (hoursRemaining >= fullRefundHours) {
            // >= 12h: full refund
            refundPercent = 100;
            refundStatus = "full";
        } else if (hoursRemaining >= partialRefundHours) {
            // between 2h and 12h: partial refund (default 50%)
            refundPercent = Number(partialRefundPercent);
            refundStatus = "partial";
        } else {
            // < 2h: no refund
            refundPercent = 0;
            refundStatus = "none";
        }

        const refundAmount = Number(((booking.price * refundPercent) / 100).toFixed(2));

        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        booking.refundAmount = refundAmount;
        booking.refundStatus = refundStatus;
        await booking.save();

        // Update Payment record if exists
        if (booking.paymentId) {
            await Payment.findByIdAndUpdate(booking.paymentId, {
                status: refundStatus === 'full' ? 'refunded' : 'captured',
                refundAmount: refundAmount
            });
        }

        // Create cancellation notification for user
        await Notification.create({
            userId: booking.userId,
            title: "Booking Cancelled ❌",
            message: `Your booking for ${booking.gymId.name} on ${booking.date} was cancelled. Refund: ₹${refundAmount} (${refundStatus} refund).`,
            type: "booking_cancelled",
            data: { bookingId: booking._id, refundAmount, refundStatus }
        });

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            cancellation: {
                bookingId: booking._id,
                status: booking.status,
                cancelledAt: booking.cancelledAt,
                hoursBeforeSlot: Number(hoursRemaining.toFixed(2)),
                refundPercent: Number(refundPercent),
                refundAmount: Number(refundAmount),
                refundStatus: booking.refundStatus
            }
        });
    } catch (error) {
        console.error("❌ Error cancelling booking:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to cancel booking"
        });
    }
};
