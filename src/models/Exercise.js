// 📄 Path: src/models/Exercise.js
const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    targetArea: {
        type: String,
        required: true
    },
    primaryTarget: {
        type: String, 
        required: true
    },
    secondaryTarget: {
        type: String 
    },
    coachTips: [{
        type: String
    }],
    stepsList: [{
        type: String
    }],
    mistakesList: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Exercise', ExerciseSchema);