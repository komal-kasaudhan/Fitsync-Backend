const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            unique: true
        },
        gender: { type: String, required: true },
        age: { type: Number, required: true },
        height: { type: Number, required: true },
        currentWeight: { type: Number, required: true },
        targetWeight: { type: Number, required: true },
        timeline: { type: String, default: "" },
        goal: { type: String, required: true },
        activityLevel: { type: String, required: true },
        workoutLocation: { type: String, required: true },
        selectedMedicalConditions: [{ type: String }], 
        physicalLimitations: { type: String, default: "" },
        notes: { type: String, default: "" },
        isHealthCleared: { type: Boolean, required: true }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("onboarding", onboardingSchema);