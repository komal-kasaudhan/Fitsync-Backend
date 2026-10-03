// 📄 Path: src/controllers/gymController.js
const mongoose = require('mongoose');
const Gym = require('../models/Gym');
const GymBooking = require('../models/GymBooking');
const User = require('../models/user.model');
const Payment = require('../models/Payment');
const { getKolkataDate, getKolkataWeekday, getKolkataTimeString } = require('../utils/kolkataTime');
const { getInitialPartnerStatus } = require('../utils/partnerUtils');

/**
 * POST /api/gyms
 * Register a new gym (starts as 'pending')
 * Automatically adds 'gym_owner' role to user if not already present
 */
exports.createGym = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            description = "",
            address,
            city,
            pincode,
            location,
            latitude,
            longitude,
            phone = "",
            photos = [],
            amenities = [],
            openingHours = [],
            sessionTypes = [],
            capacityPerSlot = 20
        } = req.body;

        if (!name || !address || !city || !pincode) {
            return res.status(400).json({
                success: false,
                message: "name, address, city, and pincode are required"
            });
        }

        // Parse coordinates [longitude, latitude]
        let coordinates;
        if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
            coordinates = [Number(location.coordinates[0]), Number(location.coordinates[1])];
        } else if (latitude !== undefined && longitude !== undefined) {
            coordinates = [Number(longitude), Number(latitude)];
        } else {
            return res.status(400).json({
                success: false,
                message: "Valid location coordinates [longitude, latitude] or latitude and longitude are required"
            });
        }

        const [lng, lat] = coordinates;
        if (isNaN(lng) || isNaN(lat) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                message: "Coordinates out of bounds: latitude must be between -90 and 90, longitude between -180 and 180"
            });
        }

        const gym = await Gym.create({
            ownerId: userId,
            name: name.trim(),
            description: description.trim(),
            address: address.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
            location: {
                type: "Point",
                coordinates: [lng, lat]
            },
            phone: phone.trim(),
            photos: Array.isArray(photos) ? photos : [],
            amenities: Array.isArray(amenities) ? amenities : [],
            openingHours: Array.isArray(openingHours) ? openingHours : [],
            sessionTypes: Array.isArray(sessionTypes) ? sessionTypes : [],
            capacityPerSlot: Number(capacityPerSlot) || 20,
            status: getInitialPartnerStatus()
        });

        // Promote user to include gym_owner role if not already present
        await User.findByIdAndUpdate(userId, {
            $addToSet: { roles: "gym_owner" }
        });

        return res.status(201).json({
            success: true,
            message: "Gym submitted successfully and is pending admin approval",
            gym
        });
    } catch (error) {
        console.error("❌ Error creating gym:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create gym"
        });
    }
};

/**
 * PUT /api/gyms/:id
 * Update gym details (Owner or Admin)
 */
exports.updateGym = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const gym = await Gym.findById(id);
        if (!gym) {
            return res.status(404).json({
                success: false,
                message: "Gym not found"
            });
        }

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: only the gym owner or an admin can update this gym"
            });
        }

        const updatableFields = [
            'name', 'description', 'address', 'city', 'pincode',
            'phone', 'photos', 'amenities', 'openingHours',
            'sessionTypes', 'capacityPerSlot'
        ];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                gym[field] = req.body[field];
            }
        });

        // Handle coordinates update if supplied
        if (req.body.location && Array.isArray(req.body.location.coordinates)) {
            const [lng, lat] = req.body.location.coordinates;
            gym.location = { type: "Point", coordinates: [Number(lng), Number(lat)] };
        } else if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
            gym.location = {
                type: "Point",
                coordinates: [Number(req.body.longitude), Number(req.body.latitude)]
            };
        }

        await gym.save();

        return res.status(200).json({
            success: true,
            message: "Gym updated successfully",
            gym
        });
    } catch (error) {
        console.error("❌ Error updating gym:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update gym"
        });
    }
};

/**
 * GET /api/gyms/mine
 * Get all gyms owned by the authenticated user
 */
exports.getMyGyms = async (req, res) => {
    try {
        const userId = req.user.id;
        const gyms = await Gym.find({ ownerId: userId }).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
            success: true,
            count: gyms.length,
            gyms: gyms.map(gym => ({
                ...gym,
                photos: gym.photos || [],
                amenities: gym.amenities || [],
                openingHours: gym.openingHours || [],
                sessionTypes: gym.sessionTypes || [],
                status: gym.status,
                rejectionReason: gym.rejectionReason || "",
                ratingAvg: Number(gym.ratingAvg || 0),
                ratingCount: Number(gym.ratingCount || 0)
            }))
        });
    } catch (error) {
        console.error("❌ Error getting my gyms:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch gyms"
        });
    }
};

/**
 * GET /api/gyms/nearby
 * Search gyms near coordinates with $geoNear
 * Query params: lat, lng, radiusKm (default 5, max 25), amenities, maxPrice, openNow, sort, page, limit
 */
exports.getNearbyGyms = async (req, res) => {
    try {
        const {
            lat,
            lng,
            radiusKm = 5,
            amenities,
            maxPrice,
            openNow,
            sort = "distance",
            page = 1,
            limit = 10
        } = req.query;

        if (lat === undefined || lng === undefined) {
            return res.status(400).json({
                success: false,
                message: "Valid latitude and longitude query parameters are required"
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Coordinates out of bounds: latitude must be between -90 and 90, longitude between -180 and 180"
            });
        }

        // Clamp radius between 0.1 and 25 km
        const radiusNum = Math.min(Math.max(parseFloat(radiusKm) || 5, 0.1), 25);
        const maxDistanceMeters = radiusNum * 1000;

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(Math.min(parseInt(limit) || 10, 50), 1);
        const skip = (pageNum - 1) * limitNum;

        // Base match query: ONLY approved gyms appear publicly
        const geoNearQuery = { status: "approved" };

        if (amenities) {
            const amenitiesList = amenities.split(',').map(a => a.trim().toLowerCase()).filter(Boolean);
            if (amenitiesList.length > 0) {
                geoNearQuery.amenities = { $all: amenitiesList };
            }
        }

        if (maxPrice) {
            const maxPriceNum = parseFloat(maxPrice);
            if (!isNaN(maxPriceNum)) {
                geoNearQuery["sessionTypes.price"] = { $lte: maxPriceNum };
            }
        }

        const pipeline = [
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    distanceField: "distanceMeters",
                    maxDistance: maxDistanceMeters,
                    spherical: true,
                    query: geoNearQuery
                }
            },
            {
                $addFields: {
                    distanceKm: {
                        $round: [{ $divide: ["$distanceMeters", 1000] }, 2]
                    }
                }
            }
        ];

        // Sort options (Featured gyms boosted at the top)
        if (sort === "rating") {
            pipeline.push({ $sort: { isFeatured: -1, ratingAvg: -1, ratingCount: -1, distanceKm: 1 } });
        } else if (sort === "price") {
            pipeline.push({
                $addFields: {
                    minPrice: { $min: "$sessionTypes.price" }
                }
            });
            pipeline.push({ $sort: { isFeatured: -1, minPrice: 1, distanceKm: 1 } });
        } else {
            // Default: distance ascending, with featured boosted
            pipeline.push({ $sort: { isFeatured: -1, distanceKm: 1 } });
        }

        // Execute pipeline for matching gyms
        let results = await Gym.aggregate(pipeline);

        // Filter openNow in Asia/Kolkata if requested
        if (openNow === 'true' || openNow === '1') {
            const currentDay = getKolkataWeekday();
            const currentTime = getKolkataTimeString();

            results = results.filter(gym => {
                if (!Array.isArray(gym.openingHours) || gym.openingHours.length === 0) return true;
                const todayHours = gym.openingHours.find(h => h.day === currentDay);
                if (!todayHours || todayHours.isClosed) return false;
                return currentTime >= todayHours.open && currentTime <= todayHours.close;
            });
        }

        const total = results.length;
        const totalPages = Math.ceil(total / limitNum) || 1;
        const pagedResults = results.slice(skip, skip + limitNum);

        const cleanGyms = pagedResults.map(gym => ({
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
            ratingAvg: Number(gym.ratingAvg || 0),
            ratingCount: Number(gym.ratingCount || 0),
            isFeatured: Boolean(gym.isFeatured),
            distanceKm: Number(gym.distanceKm !== undefined ? gym.distanceKm : 0)
        }));

        return res.status(200).json({
            success: true,
            count: cleanGyms.length,
            total,
            page: pageNum,
            totalPages,
            radiusKm: radiusNum,
            gyms: cleanGyms
        });
    } catch (error) {
        console.error("❌ Error searching nearby gyms:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to search nearby gyms"
        });
    }
};

/**
 * GET /api/gyms/:id
 * Get single gym details
 */
exports.getGymById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gym ID format"
            });
        }

        const gym = await Gym.findById(id).lean();
        if (!gym) {
            return res.status(404).json({
                success: false,
                message: "Gym not found"
            });
        }

        // If not approved, only owner or admin can view
        if (gym.status !== "approved") {
            const isOwner = gym.ownerId.toString() === userId.toString();
            const isAdmin = roles.includes('admin');
            if (!isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "This gym is not currently public"
                });
            }
        }

        return res.status(200).json({
            success: true,
            gym: {
                ...gym,
                photos: gym.photos || [],
                amenities: gym.amenities || [],
                openingHours: gym.openingHours || [],
                sessionTypes: gym.sessionTypes || [],
                ratingAvg: Number(gym.ratingAvg || 0),
                ratingCount: Number(gym.ratingCount || 0),
                capacityPerSlot: Number(gym.capacityPerSlot || 20)
            }
        });
    } catch (error) {
        console.error("❌ Error fetching gym details:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch gym"
        });
    }
};

/**
 * GET /api/gyms/:id/slots?date=YYYY-MM-DD
 * Get available time slots for a specific date
 */
exports.getGymSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const date = req.query.date || getKolkataDate();

        const gym = await Gym.findById(id).lean();
        if (!gym) {
            return res.status(404).json({
                success: false,
                message: "Gym not found"
            });
        }

        // Determine weekday for requested date
        const targetDate = new Date(`${date}T00:00:00+05:30`);
        const weekday = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long'
        }).format(targetDate);

        // Find gym opening hours for this day
        const dayHours = (gym.openingHours || []).find(h => h.day === weekday);

        if (!dayHours || dayHours.isClosed) {
            return res.status(200).json({
                success: true,
                date,
                day: weekday,
                isClosed: true,
                message: `Gym is closed on ${weekday}`,
                slots: []
            });
        }

        const openTime = dayHours.open || "06:00";
        const closeTime = dayHours.close || "22:00";

        const startHour = parseInt(openTime.split(':')[0], 10);
        const endHour = parseInt(closeTime.split(':')[0], 10);

        // Generate 1-hour slots
        const slotRanges = [];
        for (let h = startHour; h < endHour; h++) {
            const sStart = `${String(h).padStart(2, '0')}:00`;
            const sEnd = `${String(h + 1).padStart(2, '0')}:00`;
            slotRanges.push(`${sStart}-${sEnd}`);
        }

        // Fetch booked counts for each slot on this date
        const bookings = await GymBooking.aggregate([
            {
                $match: {
                    gymId: new mongoose.Types.ObjectId(id),
                    date: date,
                    status: { $in: ["confirmed", "attended"] }
                }
            },
            {
                $group: {
                    _id: "$slot",
                    count: { $sum: 1 }
                }
            }
        ]);

        const bookingMap = {};
        bookings.forEach(b => {
            if (b._id) bookingMap[b._id] = b.count;
        });

        const todayKolkata = getKolkataDate();
        const currentTimeKolkata = getKolkataTimeString();
        const capacity = Number(gym.capacityPerSlot || 20);

        const slots = slotRanges.map(slotStr => {
            const booked = bookingMap[slotStr] || 0;
            const available = Math.max(0, capacity - booked);
            const slotStart = slotStr.split('-')[0];

            let isPast = false;
            if (date < todayKolkata) {
                isPast = true;
            } else if (date === todayKolkata && currentTimeKolkata >= slotStart) {
                isPast = true;
            }

            return {
                slot: slotStr,
                capacity: capacity,
                booked: Number(booked),
                available: Number(available),
                isAvailable: available > 0 && !isPast,
                isPast: isPast
            };
        });

        return res.status(200).json({
            success: true,
            date,
            day: weekday,
            isClosed: false,
            capacityPerSlot: capacity,
            slots
        });
    } catch (error) {
        console.error("❌ Error fetching gym slots:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch slots"
        });
    }
};

/**
 * Image upload handler: returns full URL
 */
exports.uploadGymPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided"
            });
        }

        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.get('host');
        const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            url: fullUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error("❌ Error uploading photo:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to upload image"
        });
    }
};

/**
 * GET /api/gyms/:id/bookings
 * Owner/Admin: List bookings for this gym
 */
exports.getGymBookingsForOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const gym = await Gym.findById(id);
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized to access this gym's bookings" });
        }

        const filter = { gymId: id };
        if (req.query.date) filter.date = req.query.date;
        if (req.query.status) filter.status = req.query.status;

        const bookings = await GymBooking.find(filter)
            .populate('userId', 'name email')
            .sort({ date: -1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings: bookings.map(b => ({
                ...b,
                price: Number(b.price || 0),
                refundAmount: Number(b.refundAmount || 0)
            }))
        });
    } catch (error) {
        console.error("❌ Error fetching owner gym bookings:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/gyms/:id/check-in
 * Owner/Admin: Verify 6-digit check-in code and mark booking attended
 */
exports.checkInBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];
        const { checkInCode } = req.body;

        if (!checkInCode) {
            return res.status(400).json({ success: false, message: "6-digit checkInCode is required" });
        }

        const gym = await Gym.findById(id);
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized: only the gym owner can check in visitors" });
        }

        const booking = await GymBooking.findOne({
            gymId: id,
            checkInCode: checkInCode.trim(),
            status: "confirmed"
        }).populate('userId', 'name email');

        if (!booking) {
            return res.status(400).json({
                success: false,
                message: "Invalid check-in code or booking is not in confirmed state"
            });
        }

        booking.status = "attended";
        booking.attendedAt = new Date();
        await booking.save();

        // Create notification for the user
        const Notification = require('../models/Notification');
        await Notification.create({
            userId: booking.userId._id,
            title: "Check-in Successful! 🏋️",
            message: `Your check-in at ${gym.name} was verified successfully. Have a great workout! You can now write a review.`,
            type: "checkin",
            data: { gymId: gym._id, bookingId: booking._id }
        });

        return res.status(200).json({
            success: true,
            message: "Check-in successful! Session marked as attended.",
            booking: {
                _id: booking._id,
                userName: booking.userId.name,
                userEmail: booking.userId.email,
                sessionType: booking.sessionType,
                date: booking.date,
                slot: booking.slot,
                status: booking.status,
                attendedAt: booking.attendedAt
            }
        });
    } catch (error) {
        console.error("❌ Error verifying check-in:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/gyms/:id/earnings
 * Owner/Admin: Get earnings summary for a gym
 */
exports.getGymEarnings = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const gym = await Gym.findById(id);
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized to access this gym's earnings" });
        }

        const totalBookings = await GymBooking.countDocuments({ gymId: id });
        const confirmedBookings = await GymBooking.countDocuments({ gymId: id, status: "confirmed" });
        const attendedBookings = await GymBooking.countDocuments({ gymId: id, status: "attended" });
        const cancelledBookings = await GymBooking.countDocuments({ gymId: id, status: "cancelled" });

        // Aggregate payments for this gym's bookings
        const gymBookings = await GymBooking.find({
            gymId: id,
            status: { $in: ["confirmed", "attended"] }
        }).select('_id');

        const bookingIds = gymBookings.map(b => b._id);

        const paymentStats = await Payment.aggregate([
            {
                $match: {
                    bookingId: { $in: bookingIds },
                    status: "captured"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    totalPartnerEarnings: { $sum: "$partnerAmount" },
                    totalPlatformFee: { $sum: "$platformFee" }
                }
            }
        ]);

        const stats = paymentStats[0] || {
            totalRevenue: 0,
            totalPartnerEarnings: 0,
            totalPlatformFee: 0
        };

        const recentPayments = await Payment.find({
            bookingId: { $in: bookingIds },
            status: "captured"
        })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return res.status(200).json({
            success: true,
            gym: {
                id: gym._id,
                name: gym.name
            },
            summary: {
                totalBookings: Number(totalBookings),
                confirmedBookings: Number(confirmedBookings),
                attendedBookings: Number(attendedBookings),
                cancelledBookings: Number(cancelledBookings),
                totalRevenue: Number(stats.totalRevenue.toFixed(2)),
                totalPartnerEarnings: Number(stats.totalPartnerEarnings.toFixed(2)),
                totalPlatformFee: Number(stats.totalPlatformFee.toFixed(2))
            },
            recentTransactions: recentPayments.map(p => ({
                id: p._id,
                orderId: p.orderId,
                paymentId: p.paymentId,
                user: p.userId ? { name: p.userId.name, email: p.userId.email } : null,
                amount: Number(p.amount),
                partnerAmount: Number(p.partnerAmount),
                platformFee: Number(p.platformFee),
                createdAt: p.createdAt
            }))
        });
    } catch (error) {
        console.error("❌ Error getting gym earnings:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
