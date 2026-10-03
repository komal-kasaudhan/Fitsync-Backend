// 📄 Path: src/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    targetType: {
        type: String,
        enum: ["Gym", "TrainerProfile", "Product"],
        required: true,
        index: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'bookingRef'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: "",
        trim: true
    }
}, {
    timestamps: true
});

// Ensure a user can only review a target once per booking/order
reviewSchema.index({ targetId: 1, userId: 1, bookingId: 1 }, { sparse: true });
reviewSchema.index({ targetId: 1, userId: 1, orderId: 1 }, { sparse: true });

// Static helper to recalculate average rating & count for any target
reviewSchema.statics.calculateAverageRating = async function (targetType, targetId) {
    const stats = await this.aggregate([
        { $match: { targetId: new mongoose.Types.ObjectId(targetId) } },
        {
            $group: {
                _id: '$targetId',
                ratingAvg: { $avg: '$rating' },
                ratingCount: { $sum: 1 }
            }
        }
    ]);

    const avg = stats.length > 0 ? Math.round(stats[0].ratingAvg * 10) / 10 : 0;
    const count = stats.length > 0 ? stats[0].ratingCount : 0;

    if (targetType === "Gym") {
        const Gym = mongoose.model('Gym');
        await Gym.findByIdAndUpdate(targetId, { ratingAvg: avg, ratingCount: count });
    } else if (targetType === "TrainerProfile" && mongoose.models.TrainerProfile) {
        const TrainerProfile = mongoose.model('TrainerProfile');
        await TrainerProfile.findByIdAndUpdate(targetId, { ratingAvg: avg, ratingCount: count });
    } else if (targetType === "Product" && mongoose.models.Product) {
        const Product = mongoose.model('Product');
        await Product.findByIdAndUpdate(targetId, { ratingAvg: avg, ratingCount: count });
    }
};

reviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.targetType, this.targetId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await doc.constructor.calculateAverageRating(doc.targetType, doc.targetId);
    }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
