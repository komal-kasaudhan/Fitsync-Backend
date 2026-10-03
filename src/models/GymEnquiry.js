// 📄 Path: src/models/GymEnquiry.js
const mongoose = require('mongoose');

const gymEnquirySchema = new mongoose.Schema({
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        default: ""
    },
    preferredTime: {
        type: String,
        default: ""
    },
    wantsTrial: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["new", "contacted", "closed"],
        default: "new"
    }
}, {
    timestamps: true
});

const GymEnquiry = mongoose.model('GymEnquiry', gymEnquirySchema);
module.exports = GymEnquiry;
