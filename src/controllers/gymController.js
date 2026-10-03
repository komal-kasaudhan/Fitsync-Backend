// 📄 Path: src/controllers/gymController.js
const mongoose = require('mongoose');
const Gym = require('../models/Gym');
const GymBooking = require('../models/GymBooking');
const GymMembership = require('../models/GymMembership');
const GymVisit = require('../models/GymVisit');
const GymEnquiry = require('../models/GymEnquiry');
const User = require('../models/user.model');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { getKolkataDate, getKolkataWeekday, getKolkataTimeString } = require('../utils/kolkataTime');
const { getInitialPartnerStatus } = require('../utils/partnerUtils');
const { validateOpeningHours, validatePlans, calculateStartingPrice, timeToMinutes } = require('../utils/gymValidators');

/**
 * Helper to format gym document with startingPrice and startingPlanType
 */
function formatGymResponse(gym) {
    const rawPlans = (Array.isArray(gym.plans) && gym.plans.length > 0) ? gym.plans : [];
    let plans = rawPlans;
    if (plans.length === 0 && Array.isArray(gym.sessionTypes) && gym.sessionTypes.length > 0) {
        plans = gym.sessionTypes.map((st, i) => ({
            id: `legacy_${st.type || i}`,
            name: st.name || (st.type === "dayPass" ? "Day Pass" : st.type === "weekly" ? "Weekly Pass" : "Monthly Membership"),
            type: st.type === "dayPass" ? "day_pass" : (st.type || "custom"),
            durationDays: st.type === "dayPass" ? 1 : st.type === "weekly" ? 7 : 30,
            price: Number(st.price) || 0,
            mrp: Number(st.price) ? Math.round(st.price * 1.2) : null,
            description: st.description || "",
            inclusions: ["Full Gym Access"],
            isActive: true,
            maxFreezeDays: st.type === "monthly" ? 7 : 0
        }));
    }

    const { startingPrice, startingPlanType } = calculateStartingPrice(plans);

    return {
        _id: gym._id,
        ownerId: gym.ownerId,
        name: gym.name,
        description: gym.description || "",
        address: gym.address,
        city: gym.city,
        pincode: gym.pincode,
        location: gym.location,
        distanceKm: gym.distanceKm !== undefined ? gym.distanceKm : undefined,
        phone: gym.phone || "",
        photos: gym.photos || [],
        amenities: gym.amenities || [],
        openingHours: gym.openingHours || [],
        holidays: gym.holidays || [],
        womenOnlyHours: gym.womenOnlyHours || { enabled: false, shifts: [] },
        plans,
        startingPrice,
        startingPlanType,
        enableSlots: Boolean(gym.enableSlots),
        capacityPerSlot: Number(gym.capacityPerSlot || 20),
        status: gym.status,
        rejectionReason: gym.rejectionReason || "",
        ratingAvg: Number(gym.ratingAvg || 0),
        ratingCount: Number(gym.ratingCount || 0),
        isFeatured: Boolean(gym.isFeatured),
        featuredUntil: gym.featuredUntil || null,
        createdAt: gym.createdAt,
        updatedAt: gym.updatedAt
    };
}

/**
 * POST /api/gyms
 * Register a new gym (starts as 'pending')
 * Requires opening hours and at least one active membership plan
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
            openingHours,
            holidays = [],
            womenOnlyHours,
            plans,
            enableSlots = false,
            sessionTypes = [],
            capacityPerSlot = 20
        } = req.body;

        if (!name || !address || !city || !pincode) {
            return res.status(400).json({
                success: false,
                message: "name, address, city, and pincode are required"
            });
        }

        // Validate Opening Hours (strictly required)
        const hoursValidation = validateOpeningHours(openingHours);
        if (!hoursValidation.valid) {
            return res.status(400).json({
                success: false,
                message: hoursValidation.message
            });
        }

        // Validate Plans (at least one active plan required)
        const plansToValidate = (Array.isArray(plans) && plans.length > 0) ? plans : sessionTypes;
        const plansValidation = validatePlans(plansToValidate);
        if (!plansValidation.valid) {
            return res.status(400).json({
                success: false,
                message: plansValidation.message
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
            openingHours: hoursValidation.normalizedHours,
            holidays: Array.isArray(holidays) ? holidays : [],
            womenOnlyHours: womenOnlyHours || { enabled: false, shifts: [] },
            plans: plansValidation.normalizedPlans,
            enableSlots: Boolean(enableSlots),
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
            gym: formatGymResponse(gym.toObject())
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
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Access denied. Only the gym owner or admin can update this gym." });
        }

        const updates = req.body;
        // Never allow updating ownerId or status through this endpoint
        delete updates.ownerId;
        delete updates.status;
        delete updates.ratingAvg;
        delete updates.ratingCount;

        // Opening hours validation if provided
        if (updates.openingHours) {
            const hoursVal = validateOpeningHours(updates.openingHours);
            if (!hoursVal.valid) {
                return res.status(400).json({ success: false, message: hoursVal.message });
            }
            updates.openingHours = hoursVal.normalizedHours;
        }

        // Plans validation if provided
        if (updates.plans) {
            const plansVal = validatePlans(updates.plans);
            if (!plansVal.valid) {
                return res.status(400).json({ success: false, message: plansVal.message });
            }
            updates.plans = plansVal.normalizedPlans;
        }

        // Coordinates update if provided
        if (updates.latitude !== undefined && updates.longitude !== undefined) {
            updates.location = {
                type: "Point",
                coordinates: [Number(updates.longitude), Number(updates.latitude)]
            };
            delete updates.latitude;
            delete updates.longitude;
        }

        Object.assign(gym, updates);
        await gym.save();

        return res.status(200).json({
            success: true,
            message: "Gym updated successfully",
            gym: formatGymResponse(gym.toObject())
        });
    } catch (error) {
        console.error("❌ Error updating gym:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to update gym" });
    }
};

/**
 * GET /api/gyms/mine (and /my)
 * Fetch gyms owned by current authenticated user
 */
exports.getMyGyms = async (req, res) => {
    try {
        const userId = req.user.id;
        const gyms = await Gym.find({ ownerId: userId }).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
            success: true,
            count: gyms.length,
            gyms: gyms.map(g => formatGymResponse(g))
        });
    } catch (error) {
        console.error("❌ Error fetching owner gyms:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch gyms" });
    }
};

/**
 * GET /api/gyms/nearby
 * GeoJSON $geoNear query
 */
exports.getNearbyGyms = async (req, res) => {
    try {
        const {
            lat,
            latitude,
            lng,
            longitude,
            radiusKm = 5,
            amenities,
            maxPrice,
            openNow,
            sort = "distance",
            page = 1,
            limit = 10
        } = req.query;

        const userLat = Number(lat !== undefined ? lat : latitude);
        const userLng = Number(lng !== undefined ? lng : longitude);

        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({
                success: false,
                message: "Valid latitude (lat) and longitude (lng) query parameters are required"
            });
        }

        const radius = Math.min(Math.max(Number(radiusKm) || 5, 0.5), 25);
        const maxDistanceMeters = radius * 1000;
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
        const skip = (pageNum - 1) * limitNum;

        const geoNearStage = {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [userLng, userLat]
                },
                distanceField: "distanceMeters",
                maxDistance: maxDistanceMeters,
                spherical: true,
                query: { status: "approved" }
            }
        };

        const matchConditions = {};
        if (amenities) {
            const amenityList = String(amenities).split(',').map(a => a.trim().toLowerCase());
            matchConditions.amenities = { $all: amenityList };
        }

        const pipeline = [geoNearStage];
        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({ $match: matchConditions });
        }

        pipeline.push({
            $addFields: {
                distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 2] }
            }
        });

        // Sorting
        let sortStage = { isFeatured: -1, distanceKm: 1 };
        if (sort === "rating") {
            sortStage = { isFeatured: -1, ratingAvg: -1, distanceKm: 1 };
        } else if (sort === "price_asc") {
            sortStage = { isFeatured: -1, startingPrice: 1, distanceKm: 1 };
        }
        pipeline.push({ $sort: sortStage });

        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await Gym.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limitNum });

        const gyms = await Gym.aggregate(pipeline);

        let formattedGyms = gyms.map(g => formatGymResponse(g));

        // Filter maxPrice if provided
        if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
            const maxP = Number(maxPrice);
            formattedGyms = formattedGyms.filter(g => g.startingPrice !== null && g.startingPrice <= maxP);
        }

        // Filter openNow if requested
        if (openNow === 'true' || openNow === true) {
            const currentDay = getKolkataWeekday();
            const currentHHMM = getKolkataTimeString();
            const currentMin = timeToMinutes(currentHHMM);

            formattedGyms = formattedGyms.filter(g => {
                const dayHours = (g.openingHours || []).find(h => h.day === currentDay);
                if (!dayHours || dayHours.isClosed) return false;
                const shifts = dayHours.shifts && dayHours.shifts.length > 0 ? dayHours.shifts : [{ open: dayHours.open, close: dayHours.close }];
                return shifts.some(s => currentMin >= timeToMinutes(s.open) && currentMin <= timeToMinutes(s.close));
            });
        }

        return res.status(200).json({
            success: true,
            count: formattedGyms.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            radiusKm: radius,
            gyms: formattedGyms
        });
    } catch (error) {
        console.error("❌ Error searching nearby gyms:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to search nearby gyms" });
    }
};

/**
 * GET /api/gyms/:id
 * Get single gym details (publicly viewable without booking)
 */
exports.getGymById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const roles = req.user?.roles || [];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid gym ID format" });
        }

        const gym = await Gym.findById(id).lean();
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        if (gym.status !== "approved") {
            const isOwner = userId && gym.ownerId.toString() === userId.toString();
            const isAdmin = roles.includes('admin');
            if (!isOwner && !isAdmin) {
                return res.status(403).json({ success: false, message: "This gym is not currently public" });
            }
        }

        return res.status(200).json({
            success: true,
            gym: formatGymResponse(gym)
        });
    } catch (error) {
        console.error("❌ Error fetching gym details:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch gym" });
    }
};

/**
 * GET /api/gyms/:id/slots?date=YYYY-MM-DD
 * Available slots for date (or indicates full-day access if enableSlots is false)
 */
exports.getGymSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const date = req.query.date || getKolkataDate();

        const gym = await Gym.findById(id).lean();
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const targetDate = new Date(`${date}T00:00:00+05:30`);
        const weekday = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long'
        }).format(targetDate);

        // Check holiday
        const holiday = (gym.holidays || []).find(h => h.date === date);
        if (holiday) {
            return res.status(200).json({
                success: true,
                date,
                day: weekday,
                isClosed: true,
                holidayReason: holiday.reason,
                message: `Gym is closed on ${date} for ${holiday.reason}`,
                slots: []
            });
        }

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

        const shifts = dayHours.shifts && dayHours.shifts.length > 0 ? dayHours.shifts : [{ open: dayHours.open || "06:00", close: dayHours.close || "22:00" }];

        // If slots are not enabled, a day pass is valid for the full day during opening hours
        if (!gym.enableSlots) {
            return res.status(200).json({
                success: true,
                date,
                day: weekday,
                isClosed: false,
                enableSlots: false,
                message: "Day passes and memberships are valid anytime during opening shifts on this date.",
                openingShifts: shifts,
                slots: [
                    {
                        slot: "All Day Access",
                        availableCapacity: gym.capacityPerSlot || 50,
                        isBookable: true
                    }
                ]
            });
        }

        // Generate hourly slots inside opening shifts
        const capacityPerSlot = gym.capacityPerSlot || 20;
        const rawSlots = [];
        for (const shift of shifts) {
            const startHour = parseInt(shift.open.split(':')[0], 10);
            const endHour = parseInt(shift.close.split(':')[0], 10);
            for (let hour = startHour; hour < endHour; hour++) {
                const sStart = `${String(hour).padStart(2, '0')}:00`;
                const sEnd = `${String(hour + 1).padStart(2, '0')}:00`;
                rawSlots.push(`${sStart}-${sEnd}`);
            }
        }

        const bookedCounts = await GymBooking.aggregate([
            { $match: { gymId: gym._id, date, status: { $in: ["confirmed", "attended"] } } },
            { $group: { _id: "$timeSlot", count: { $sum: 1 } } }
        ]);

        const bookedMap = new Map();
        bookedCounts.forEach(b => bookedMap.set(b._id, b.count));

        const slots = rawSlots.map(slotStr => {
            const booked = bookedMap.get(slotStr) || 0;
            const availableCapacity = Math.max(0, capacityPerSlot - booked);
            return {
                slot: slotStr,
                totalCapacity: capacityPerSlot,
                bookedCount: booked,
                availableCapacity,
                isFull: availableCapacity <= 0
            };
        });

        return res.status(200).json({
            success: true,
            date,
            day: weekday,
            isClosed: false,
            enableSlots: true,
            totalSlots: slots.length,
            slots
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/gyms/:id/enquiry
 * Submit enquiry for a gym
 */
exports.createEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || null;
        const { name, phone, message = "", preferredTime = "", wantsTrial = false } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ success: false, message: "name and phone are required" });
        }

        const gym = await Gym.findById(id);
        if (!gym) {
            return res.status(404).json({ success: false, message: "Gym not found" });
        }

        const enquiry = await GymEnquiry.create({
            gymId: gym._id,
            userId,
            name: name.trim(),
            phone: phone.trim(),
            message: message.trim(),
            preferredTime: preferredTime.trim(),
            wantsTrial: Boolean(wantsTrial)
        });

        // Notify gym owner
        await Notification.create({
            userId: gym.ownerId,
            title: "New Gym Enquiry 📩",
            message: `${name} (${phone}) sent an enquiry for ${gym.name}: "${message || (wantsTrial ? 'Free trial requested' : 'General details requested')}"`,
            type: "gym_enquiry",
            data: { gymId: gym._id, enquiryId: enquiry._id }
        });

        return res.status(201).json({
            success: true,
            message: "Enquiry submitted successfully. The gym owner has been notified.",
            enquiry
        });
    } catch (error) {
        console.error("❌ Error creating enquiry:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/gyms/:id/enquiries
 * Owner/Admin: View all enquiries for a gym
 */
exports.getEnquiriesForOwner = async (req, res) => {
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
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const enquiries = await GymEnquiry.find({ gymId: id }).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
            success: true,
            count: enquiries.length,
            enquiries
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/gyms/:id/members
 * Owner/Admin: List gym members with status and expiry (paginated)
 */
exports.getGymMembers = async (req, res) => {
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
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
        const skip = (page - 1) * limit;

        const filter = { gymId: id };
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const total = await GymMembership.countDocuments(filter);
        const members = await GymMembership.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return res.status(200).json({
            success: true,
            count: members.length,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            members: members.map(m => ({
                id: m._id,
                user: m.userId,
                planName: m.planName,
                planType: m.planType,
                startDate: m.startDate,
                endDate: m.endDate,
                status: m.status,
                isFrozen: m.isFrozen,
                memberCode: m.memberCode,
                createdAt: m.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/gyms/:id/members/expiring-soon
 * Memberships expiring within 7 days
 */
exports.getMembersExpiringSoon = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const gym = await Gym.findById(id);
        if (!gym) return res.status(404).json({ success: false, message: "Gym not found" });

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "Access denied" });

        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const members = await GymMembership.find({
            gymId: id,
            status: "active",
            endDate: { $gte: now, $lte: sevenDaysLater }
        })
            .populate('userId', 'name email')
            .sort({ endDate: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: members.length,
            members: members.map(m => ({
                id: m._id,
                user: m.userId,
                planName: m.planName,
                endDate: m.endDate,
                daysRemaining: Math.ceil((new Date(m.endDate) - now) / (1000 * 60 * 60 * 24)),
                memberCode: m.memberCode
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/gyms/:id/check-in
 * Check-in by member code or session booking code
 * Rejects if expired, frozen, or outside opening hours
 */
exports.checkInBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];
        const code = (req.body.memberCode || req.body.checkInCode || req.body.code || "").trim();

        if (!code) {
            return res.status(400).json({ success: false, message: "memberCode or checkInCode is required" });
        }

        const gym = await Gym.findById(id);
        if (!gym) return res.status(404).json({ success: false, message: "Gym not found" });

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Only the gym owner or admin can perform check-ins" });
        }

        const now = new Date();
        const currentDay = getKolkataWeekday();
        const currentHHMM = getKolkataTimeString();
        const currentMin = timeToMinutes(currentHHMM);

        // 1. Check if it matches a Gym Membership
        const membership = await GymMembership.findOne({ gymId: id, memberCode: code }).populate('userId', 'name email');
        if (membership) {
            if (membership.status === "cancelled") {
                return res.status(400).json({ success: false, message: "Check-in rejected: Membership has been cancelled" });
            }
            if (membership.isFrozen) {
                return res.status(400).json({ success: false, message: "Check-in rejected: Membership is currently frozen" });
            }
            if (membership.status === "expired" || now > membership.endDate) {
                return res.status(400).json({
                    success: false,
                    message: `Check-in rejected: Membership has expired on ${membership.endDate.toISOString().split('T')[0]}`
                });
            }
            if (now < membership.startDate) {
                return res.status(400).json({
                    success: false,
                    message: `Check-in rejected: Membership has not started yet (valid from ${membership.startDate.toISOString().split('T')[0]})`
                });
            }

            // Check gym opening hours right now
            const holiday = (gym.holidays || []).find(h => h.date === getKolkataDate());
            if (holiday) {
                return res.status(400).json({ success: false, message: `Check-in rejected: Gym is closed today for ${holiday.reason}` });
            }

            const dayHours = (gym.openingHours || []).find(h => h.day === currentDay);
            if (!dayHours || dayHours.isClosed) {
                return res.status(400).json({ success: false, message: `Check-in rejected: Gym is closed on ${currentDay}` });
            }

            const shifts = dayHours.shifts && dayHours.shifts.length > 0 ? dayHours.shifts : [{ open: dayHours.open, close: dayHours.close }];
            const isWithinShift = shifts.some(s => currentMin >= timeToMinutes(s.open) && currentMin <= timeToMinutes(s.close));
            if (!isWithinShift) {
                const shiftDescriptions = shifts.map(s => `${s.open}-${s.close}`).join(', ');
                return res.status(400).json({
                    success: false,
                    message: `Check-in rejected: Gym is currently closed (current time: ${currentHHMM}). Opening shifts today: ${shiftDescriptions}`
                });
            }

            // All checks pass - Record GymVisit
            const visit = await GymVisit.create({
                membershipId: membership._id,
                gymId: gym._id,
                userId: membership.userId?._id || membership.userId,
                memberCode: code,
                checkInTime: now,
                notes: req.body.notes || "Member check-in"
            });

            return res.status(200).json({
                success: true,
                message: "Member check-in successful! Welcome to the gym.",
                visit: {
                    id: visit._id,
                    checkInTime: visit.checkInTime,
                    memberCode: visit.memberCode
                },
                member: {
                    id: membership.userId?._id,
                    name: membership.userId?.name || "Member",
                    plan: membership.planName,
                    planType: membership.planType,
                    validUntil: membership.endDate
                }
            });
        }

        // 2. Check if it matches a Single Session GymBooking
        const booking = await GymBooking.findOne({ gymId: id, checkInCode: code });
        if (booking) {
            if (booking.status === "attended") {
                return res.status(400).json({ success: false, message: "Code has already been checked in" });
            }
            if (booking.status !== "confirmed") {
                return res.status(400).json({ success: false, message: `Check-in rejected: Booking is currently ${booking.status}` });
            }

            booking.status = "attended";
            booking.attendedAt = now;
            await booking.save();

            return res.status(200).json({
                success: true,
                message: "Session booking check-in successful!",
                booking: {
                    id: booking._id,
                    date: booking.date,
                    timeSlot: booking.timeSlot,
                    status: booking.status
                }
            });
        }

        return res.status(404).json({
            success: false,
            message: "No active membership or booking found with the provided code for this gym"
        });
    } catch (error) {
        console.error("❌ Error during check-in:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/gyms/:id/earnings-by-plan
 * Revenue breakdown grouped by plan
 */
exports.getEarningsByPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const gym = await Gym.findById(id);
        if (!gym) return res.status(404).json({ success: false, message: "Gym not found" });

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "Access denied" });

        const breakdown = await GymMembership.aggregate([
            { $match: { gymId: gym._id, status: { $in: ["active", "expired", "upcoming"] } } },
            {
                $group: {
                    _id: { planType: "$planType", planName: "$planName" },
                    memberCount: { $sum: 1 },
                    totalRevenue: { $sum: "$price" }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        const earningsByPlan = breakdown.map(b => {
            const platformFee = Number((b.totalRevenue * 0.15).toFixed(2));
            const ownerEarnings = Number((b.totalRevenue - platformFee).toFixed(2));
            return {
                planName: b._id.planName,
                planType: b._id.planType,
                memberCount: b.memberCount,
                totalRevenue: Number(b.totalRevenue.toFixed(2)),
                platformFee,
                ownerEarnings
            };
        });

        const totalRevenue = earningsByPlan.reduce((acc, p) => acc + p.totalRevenue, 0);
        const totalPlatformFee = Number((totalRevenue * 0.15).toFixed(2));
        const totalOwnerEarnings = Number((totalRevenue - totalPlatformFee).toFixed(2));
        const totalMembers = earningsByPlan.reduce((acc, p) => acc + p.memberCount, 0);

        return res.status(200).json({
            success: true,
            summary: {
                totalRevenue,
                totalPlatformFee,
                totalOwnerEarnings,
                totalMembers
            },
            earningsByPlan
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/gyms/:id/bookings
 * List session bookings for owner
 */
exports.getGymBookingsForOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const gym = await Gym.findById(id);
        if (!gym) return res.status(404).json({ success: false, message: "Gym not found" });

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "Access denied" });

        const filter = { gymId: id };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.date) filter.date = req.query.date;

        const bookings = await GymBooking.find(filter)
            .populate('userId', 'name email')
            .sort({ date: -1, timeSlot: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/gyms/:id/earnings
 * Historical session booking revenue
 */
exports.getGymEarnings = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const gym = await Gym.findById(id);
        if (!gym) return res.status(404).json({ success: false, message: "Gym not found" });

        const isOwner = gym.ownerId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: "Access denied" });

        const bookingStats = await GymBooking.aggregate([
            { $match: { gymId: gym._id, status: { $in: ["confirmed", "attended"] } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$price" },
                    bookingsCount: { $sum: 1 }
                }
            }
        ]);

        const stats = bookingStats[0] || { totalRevenue: 0, bookingsCount: 0 };
        const platformFee = Number((stats.totalRevenue * 0.15).toFixed(2));
        const ownerEarnings = Number((stats.totalRevenue - platformFee).toFixed(2));

        return res.status(200).json({
            success: true,
            earnings: {
                totalRevenue: stats.totalRevenue,
                platformFee,
                ownerEarnings,
                bookingsCount: stats.bookingsCount
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/gyms/upload
 * Photo upload
 */
exports.uploadGymPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided" });
        }
        const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        return res.status(200).json({
            success: true,
            message: "Gym image uploaded successfully",
            url: fullUrl,
            filename: req.file.filename
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
