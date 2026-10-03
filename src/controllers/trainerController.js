// 📄 Path: src/controllers/trainerController.js
const mongoose = require('mongoose');
const TrainerProfile = require('../models/TrainerProfile');
const TrainerBooking = require('../models/TrainerBooking');
const User = require('../models/user.model');
const Review = require('../models/Review');
const { getKolkataDate, getKolkataWeekday, getKolkataTimeString } = require('../utils/kolkataTime');
const { getInitialPartnerStatus } = require('../utils/partnerUtils');

const NUTRITIONIST_DISCLAIMER = "Nutrition guidance is provided for general health and wellness purposes only and is not a medical diagnosis or treatment.";

/**
 * POST /api/trainers
 * Register trainer/nutritionist profile (starts as 'pending' unless AUTO_APPROVE_PARTNERS=true)
 * Promotes user to 'trainer' role
 */
exports.createTrainerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const existing = await TrainerProfile.findOne({ userId });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "You already have a trainer/nutritionist profile. Use PUT to update it.",
                profile: existing
            });
        }

        const {
            type,
            bio = "",
            specialties = [],
            certifications = [],
            experienceYears = 1,
            languages = ["English", "Hindi"],
            mode = "both",
            city = "",
            location,
            latitude,
            longitude,
            serviceRadiusKm = 10,
            pricing = { online: 500, offline: 800, packages: [] },
            weeklyAvailability = [],
            dateExceptions = [],
            photos = [],
            introVideoUrl = ""
        } = req.body;

        if (!type || !["trainer", "nutritionist", "both"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "type is required and must be 'trainer', 'nutritionist', or 'both'"
            });
        }

        // Coordinates [longitude, latitude]
        let coordinates = [77.2090, 28.6139];
        if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
            coordinates = [Number(location.coordinates[0]), Number(location.coordinates[1])];
        } else if (latitude !== undefined && longitude !== undefined) {
            coordinates = [Number(longitude), Number(latitude)];
        }

        const profile = await TrainerProfile.create({
            userId,
            type,
            bio: bio.trim(),
            specialties: Array.isArray(specialties) ? specialties : [],
            certifications: Array.isArray(certifications) ? certifications : [],
            experienceYears: Number(experienceYears) || 1,
            languages: Array.isArray(languages) ? languages : ["English", "Hindi"],
            mode,
            city: city.trim(),
            location: {
                type: "Point",
                coordinates
            },
            serviceRadiusKm: Number(serviceRadiusKm) || 10,
            pricing: {
                online: Number(pricing.online || 0),
                offline: Number(pricing.offline || 0),
                packages: Array.isArray(pricing.packages) ? pricing.packages : []
            },
            weeklyAvailability: Array.isArray(weeklyAvailability) ? weeklyAvailability : [],
            dateExceptions: Array.isArray(dateExceptions) ? dateExceptions : [],
            photos: Array.isArray(photos) ? photos : [],
            introVideoUrl: introVideoUrl.trim(),
            status: getInitialPartnerStatus()
        });

        // Promote user to include 'trainer' role
        await User.findByIdAndUpdate(userId, {
            $addToSet: { roles: "trainer" }
        });

        return res.status(201).json({
            success: true,
            message: "Trainer profile created successfully and submitted for review",
            profile
        });
    } catch (error) {
        console.error("❌ Error creating trainer profile:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/trainers/:id
 * Update trainer profile (Owner or Admin)
 */
exports.updateTrainerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const roles = req.user.roles || [];

        const profile = await TrainerProfile.findById(id);
        if (!profile) {
            return res.status(404).json({ success: false, message: "Trainer profile not found" });
        }

        const isOwner = profile.userId.toString() === userId.toString();
        const isAdmin = roles.includes('admin');
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this profile" });
        }

        const fields = [
            'type', 'bio', 'specialties', 'certifications', 'experienceYears',
            'languages', 'mode', 'city', 'serviceRadiusKm', 'pricing',
            'weeklyAvailability', 'dateExceptions', 'photos', 'introVideoUrl'
        ];

        fields.forEach(f => {
            if (req.body[f] !== undefined) profile[f] = req.body[f];
        });

        if (req.body.location && Array.isArray(req.body.location.coordinates)) {
            profile.location = { type: "Point", coordinates: req.body.location.coordinates.map(Number) };
        } else if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
            profile.location = { type: "Point", coordinates: [Number(req.body.longitude), Number(req.body.latitude)] };
        }

        await profile.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/trainers/mine
 * Return authenticated user's trainer profile
 */
exports.getMyTrainerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await TrainerProfile.findOne({ userId }).lean();
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "No trainer profile registered for this account"
            });
        }

        return res.status(200).json({
            success: true,
            profile: {
                ...profile,
                photos: profile.photos || [],
                specialties: profile.specialties || [],
                certifications: profile.certifications || [],
                languages: profile.languages || [],
                weeklyAvailability: profile.weeklyAvailability || [],
                dateExceptions: profile.dateExceptions || [],
                ratingAvg: Number(profile.ratingAvg || 0),
                ratingCount: Number(profile.ratingCount || 0)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/trainers
 * Public discovery with filters (type, mode, specialty, language, maxPrice, minRating, sort, pagination)
 */
exports.getTrainers = async (req, res) => {
    try {
        const {
            type,
            mode,
            specialty,
            language,
            maxPrice,
            minRating,
            city,
            sort = "rating",
            page = 1,
            limit = 10
        } = req.query;

        const filter = { status: "approved" };

        if (type) filter.type = type;
        if (mode) filter.mode = { $in: [mode, "both"] };
        if (specialty) filter.specialties = specialty;
        if (language) filter.languages = language;
        if (city) filter.city = new RegExp(city, 'i');
        if (minRating) filter.ratingAvg = { $gte: Number(minRating) };

        if (maxPrice) {
            filter.$or = [
                { "pricing.online": { $lte: Number(maxPrice) } },
                { "pricing.offline": { $lte: Number(maxPrice) } }
            ];
        }

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(Math.min(parseInt(limit) || 10, 50), 1);
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        const sortObj = { isFeatured: -1 }; // featured boosted
        if (sort === "price") {
            sortObj["pricing.online"] = 1;
        } else if (sort === "experience") {
            sortObj.experienceYears = -1;
        } else {
            sortObj.ratingAvg = -1;
            sortObj.ratingCount = -1;
        }

        const total = await TrainerProfile.countDocuments(filter);
        const trainers = await TrainerProfile.find(filter)
            .populate('userId', 'name')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .lean();

        const cleanList = trainers.map(t => {
            const isNutri = t.type === 'nutritionist' || t.type === 'both';
            return {
                _id: t._id,
                name: t.userId ? t.userId.name : "Professional",
                type: t.type,
                bio: t.bio || "",
                specialties: t.specialties || [],
                certifications: t.certifications || [],
                experienceYears: Number(t.experienceYears || 0),
                languages: t.languages || [],
                mode: t.mode,
                city: t.city || "",
                pricing: {
                    online: Number(t.pricing?.online || 0),
                    offline: Number(t.pricing?.offline || 0),
                    packages: t.pricing?.packages || []
                },
                photos: t.photos || [],
                ratingAvg: Number(t.ratingAvg || 0),
                ratingCount: Number(t.ratingCount || 0),
                isFeatured: Boolean(t.isFeatured),
                disclaimer: isNutri ? NUTRITIONIST_DISCLAIMER : undefined
            };
        });

        return res.status(200).json({
            success: true,
            count: cleanList.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            disclaimer: (type === 'nutritionist' || type === 'both') ? NUTRITIONIST_DISCLAIMER : undefined,
            trainers: cleanList
        });
    } catch (error) {
        console.error("❌ Error listing trainers:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/trainers/nearby
 * Search trainers near coordinates who offer offline/both services
 */
exports.getNearbyTrainers = async (req, res) => {
    try {
        const { lat, lng, radiusKm = 10, page = 1, limit = 10 } = req.query;
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ success: false, message: "lat and lng query parameters are required" });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ success: false, message: "Valid lat and lng numbers are required" });
        }

        const radiusNum = Math.min(Math.max(parseFloat(radiusKm) || 10, 0.1), 50);
        const maxMeters = radiusNum * 1000;

        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(Math.min(parseInt(limit) || 10, 50), 1);
        const skip = (pageNum - 1) * limitNum;

        const pipeline = [
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    distanceField: "distanceMeters",
                    maxDistance: maxMeters,
                    spherical: true,
                    query: {
                        status: "approved",
                        mode: { $in: ["offline", "both"] }
                    }
                }
            },
            {
                $addFields: {
                    distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 2] }
                }
            },
            {
                $sort: { isFeatured: -1, distanceKm: 1 }
            }
        ];

        const allResults = await TrainerProfile.aggregate(pipeline);
        await TrainerProfile.populate(allResults, { path: 'userId', select: 'name' });

        const total = allResults.length;
        const paged = allResults.slice(skip, skip + limitNum);

        return res.status(200).json({
            success: true,
            count: paged.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            radiusKm: radiusNum,
            trainers: paged.map(t => ({
                _id: t._id,
                name: t.userId ? t.userId.name : "Trainer",
                type: t.type,
                mode: t.mode,
                city: t.city || "",
                experienceYears: Number(t.experienceYears || 0),
                specialties: t.specialties || [],
                pricing: t.pricing || {},
                photos: t.photos || [],
                ratingAvg: Number(t.ratingAvg || 0),
                ratingCount: Number(t.ratingCount || 0),
                distanceKm: Number(t.distanceKm || 0),
                isFeatured: Boolean(t.isFeatured),
                disclaimer: (t.type === 'nutritionist' || t.type === 'both') ? NUTRITIONIST_DISCLAIMER : undefined
            }))
        });
    } catch (error) {
        console.error("❌ Error finding nearby trainers:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/trainers/:id
 * Single trainer details
 */
exports.getTrainerById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid trainer ID" });
        }

        const trainer = await TrainerProfile.findById(id).populate('userId', 'name email').lean();
        if (!trainer) {
            return res.status(404).json({ success: false, message: "Trainer not found" });
        }

        // Fetch recent reviews
        const reviews = await Review.find({ targetType: "TrainerProfile", targetId: id })
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const isNutri = trainer.type === 'nutritionist' || trainer.type === 'both';

        return res.status(200).json({
            success: true,
            trainer: {
                ...trainer,
                name: trainer.userId ? trainer.userId.name : "Trainer",
                specialties: trainer.specialties || [],
                certifications: trainer.certifications || [],
                languages: trainer.languages || [],
                weeklyAvailability: trainer.weeklyAvailability || [],
                photos: trainer.photos || [],
                ratingAvg: Number(trainer.ratingAvg || 0),
                ratingCount: Number(trainer.ratingCount || 0),
                disclaimer: isNutri ? NUTRITIONIST_DISCLAIMER : undefined
            },
            reviews: reviews.map(r => ({
                id: r._id,
                userName: r.userId ? r.userId.name : "Client",
                rating: Number(r.rating),
                comment: r.comment,
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/trainers/:id/slots?date=YYYY-MM-DD&mode=online|offline
 * Availability slots calculation
 */
exports.getTrainerSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const date = req.query.date || getKolkataDate();
        const mode = req.query.mode || "online";

        const trainer = await TrainerProfile.findById(id).lean();
        if (!trainer) {
            return res.status(404).json({ success: false, message: "Trainer not found" });
        }

        // Determine weekday in Asia/Kolkata
        const targetDate = new Date(`${date}T00:00:00+05:30`);
        const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' }).format(targetDate);

        // Check date exceptions first
        const exception = (trainer.dateExceptions || []).find(e => e.date === date);
        if (exception && exception.isUnavailable) {
            return res.status(200).json({
                success: true,
                date,
                day: weekday,
                isDayOff: true,
                message: "Trainer is unavailable on this date",
                slots: []
            });
        }

        // Default weekday slots
        const dayConfig = (trainer.weeklyAvailability || []).find(d => d.day === weekday);
        let candidateSlots = [];

        if (exception && Array.isArray(exception.customSlots) && exception.customSlots.length > 0) {
            candidateSlots = exception.customSlots;
        } else if (dayConfig && !dayConfig.isDayOff) {
            candidateSlots = dayConfig.slots || [];
        } else {
            // Default hourly slots 08:00 to 19:00 if not explicitly defined
            candidateSlots = [
                "07:00-08:00", "08:00-09:00", "09:00-10:00", "10:00-11:00",
                "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00"
            ];
        }

        // Fetch already booked slots
        const booked = await TrainerBooking.find({
            trainerProfileId: id,
            date: date,
            status: { $in: ["confirmed", "completed"] }
        }).select('slot').lean();

        const bookedSlots = new Set(booked.map(b => b.slot));

        const todayKolkata = getKolkataDate();
        const currentTime = getKolkataTimeString();

        const slots = candidateSlots.map(slotStr => {
            const isBooked = bookedSlots.has(slotStr);
            const slotStart = slotStr.split('-')[0];
            let isPast = false;
            if (date < todayKolkata) isPast = true;
            else if (date === todayKolkata && currentTime >= slotStart) isPast = true;

            return {
                slot: slotStr,
                available: !isBooked && !isPast,
                isBooked,
                isPast
            };
        });

        return res.status(200).json({
            success: true,
            date,
            day: weekday,
            mode,
            timezone: trainer.timezone || "Asia/Kolkata",
            slots
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
