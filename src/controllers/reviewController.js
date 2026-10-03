// 📄 Path: src/controllers/reviewController.js
const mongoose = require('mongoose');
const Review = require('../models/Review');
const GymBooking = require('../models/GymBooking');
const Gym = require('../models/Gym');

/**
 * POST /api/gyms/:id/reviews
 * Submit a review for a gym.
 * Enforces rule: ONLY users with an attended booking at this gym can review!
 */
exports.createGymReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, comment = "" } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        const gym = await Gym.findById(id);
        if (!gym) {
            return res.status(404).json({
                success: false,
                message: "Gym not found"
            });
        }

        // Check if user has at least one attended booking at this gym
        const attendedBooking = await GymBooking.findOne({
            gymId: id,
            userId: userId,
            status: "attended"
        });

        if (!attendedBooking) {
            return res.status(403).json({
                success: false,
                message: "Only users who have attended a session at this gym can submit a review"
            });
        }

        // Check if user already reviewed with this booking
        let review = await Review.findOne({
            targetId: id,
            userId: userId,
            bookingId: attendedBooking._id
        });

        if (review) {
            // Update existing review
            review.rating = Number(rating);
            review.comment = comment.trim();
            await review.save();
        } else {
            // Create new review
            review = await Review.create({
                targetType: "Gym",
                targetId: id,
                userId: userId,
                bookingId: attendedBooking._id,
                rating: Number(rating),
                comment: comment.trim()
            });
        }

        // Fetch refreshed gym rating
        const refreshedGym = await Gym.findById(id).select('ratingAvg ratingCount');

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            review: {
                _id: review._id,
                targetId: review.targetId,
                rating: Number(review.rating),
                comment: review.comment,
                createdAt: review.createdAt
            },
            gymRating: {
                ratingAvg: Number(refreshedGym.ratingAvg || 0),
                ratingCount: Number(refreshedGym.ratingCount || 0)
            }
        });
    } catch (error) {
        console.error("❌ Error submitting review:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to submit review"
        });
    }
};

/**
 * GET /api/gyms/:id/reviews
 * Get all reviews for a gym
 */
exports.getGymReviews = async (req, res) => {
    try {
        const { id } = req.params;

        const reviews = await Review.find({ targetId: id, targetType: "Gym" })
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: reviews.length,
            reviews: reviews.map(r => ({
                _id: r._id,
                userName: r.userId ? r.userId.name : "Anonymous Member",
                rating: Number(r.rating || 0),
                comment: r.comment || "",
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.error("❌ Error fetching reviews:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch reviews"
        });
    }
};
