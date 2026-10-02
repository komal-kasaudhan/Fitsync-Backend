// 📄 Path: src/models/Exercise.js
const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        primaryMuscle: {
            type: String,
            required: true,
            index: true
        },
        secondaryMuscles: [{
            type: String,
            trim: true
        }],
        movementType: {
            type: String,
            enum: ['push', 'pull', 'legs', 'core', 'cardio', 'mobility', 'Push', 'Pull', 'Legs', 'Core', 'Cardio', 'Mobility'],
            required: true,
            index: true
        },
        equipment: [{
            type: String,
            trim: true,
            index: true
        }],
        locations: [{
            type: String,
            enum: ['gym', 'home', 'Gym', 'Home'],
            required: true,
            index: true
        }],
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'Beginner', 'Intermediate', 'Advanced'],
            default: 'beginner',
            index: true
        },
        goalTags: [{
            type: String,
            enum: ['fat_loss', 'muscle_gain', 'strength', 'endurance', 'mobility', 'general_fitness'],
            index: true
        }],
        contraindications: [{
            type: String,
            trim: true,
            index: true // e.g. knee, lower_back, shoulder, wrist, elbow, ankle, neck
        }],
        defaultSets: {
            type: Number,
            default: 3
        },
        defaultRepRange: {
            min: { type: Number, default: 8 },
            max: { type: Number, default: 12 }
        },
        restSec: {
            type: Number,
            default: 60
        },
        isTimed: {
            type: Boolean,
            default: false
        },
        durationSec: {
            type: Number,
            default: 0
        },
        instructions: [{
            type: String
        }],
        tips: [{
            type: String
        }],
        imageUrl: {
            type: String,
            default: ""
        },
        gifUrl: {
            type: String,
            default: ""
        },
        // Backward-compatibility aliases
        targetArea: { type: String },
        primaryTarget: { type: String },
        secondaryTarget: { type: String },
        coachTips: [{ type: String }],
        stepsList: [{ type: String }],
        mistakesList: [{ type: String }]
    },
    { timestamps: true }
);

ExerciseSchema.index({ primaryMuscle: 1, difficulty: 1, locations: 1 });

module.exports = mongoose.model('Exercise', ExerciseSchema);