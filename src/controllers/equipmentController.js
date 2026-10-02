// 📄 Path: src/controllers/equipmentController.js
const WorkoutPreferences = require('../models/WorkoutPreferences');
const WorkoutPlan = require('../models/WorkoutPlan');

const MASTER_EQUIPMENT = [
    { id: "bodyweight", name: "Bodyweight (No Equipment)", category: "Basic", icon: "accessibility" },
    { id: "dumbbell", name: "Dumbbells", category: "Free Weights", icon: "fitness_center" },
    { id: "barbell", name: "Barbell & Weight Plates", category: "Free Weights", icon: "fitness_center" },
    { id: "kettlebell", name: "Kettlebells", category: "Free Weights", icon: "sports_gymnastics" },
    { id: "resistance_band", name: "Resistance Bands", category: "Bands & Straps", icon: "linear_scale" },
    { id: "pull_up_bar", name: "Pull-Up Bar", category: "Calisthenics", icon: "horizontal_rule" },
    { id: "bench", name: "Flat / Incline Bench", category: "Benches", icon: "table_rows" },
    { id: "cable_machine", name: "Cable Machine (Gym)", category: "Gym Machines", icon: "settings_input_composite" },
    { id: "treadmill", name: "Treadmill", category: "Cardio", icon: "directions_run" },
    { id: "stationary_bike", name: "Stationary Bike", category: "Cardio", icon: "directions_bike" },
    { id: "jump_rope", name: "Jump Rope", category: "Cardio", icon: "refresh" },
    { id: "leg_press", name: "Leg Press Machine", category: "Gym Machines", icon: "compress" },
    { id: "foam_roller", name: "Foam Roller / Mat", category: "Mobility", icon: "self_improvement" }
];

/**
 * GET /api/equipment/master
 */
exports.getMasterEquipment = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            count: MASTER_EQUIPMENT.length,
            equipment: MASTER_EQUIPMENT
        });
    } catch (error) {
        console.error("❌ Error in getMasterEquipment:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/user/equipment
 */
exports.getUserEquipment = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const prefs = await WorkoutPreferences.findOne({ userId });

        const equipment = (prefs && prefs.equipmentAvailable && prefs.equipmentAvailable.length > 0)
            ? prefs.equipmentAvailable
            : ["bodyweight", "none", "dumbbell"];

        // Check if plan is stale
        const plan = await WorkoutPlan.findOne({ userId, status: "Active" });
        const planStale = plan ? (plan.planStale || false) : false;

        return res.status(200).json({
            success: true,
            equipment,
            planStale
        });
    } catch (error) {
        console.error("❌ Error in getUserEquipment:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PUT /api/user/equipment
 * Body: { equipment: [string] }
 * Marks active plan as stale so user can regenerate
 */
exports.updateUserEquipment = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const { equipment } = req.body;

        if (!Array.isArray(equipment)) {
            return res.status(400).json({ success: false, message: "equipment must be an array of strings" });
        }

        // 1. Update WorkoutPreferences
        const prefs = await WorkoutPreferences.findOneAndUpdate(
            { userId },
            {
                $set: {
                    userId,
                    equipmentAvailable: equipment
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 2. Mark current active plan as stale
        await WorkoutPlan.updateMany(
            { userId, status: "Active" },
            { $set: { planStale: true } }
        );

        return res.status(200).json({
            success: true,
            message: "Equipment updated successfully. Your workout plan has been marked as stale.",
            equipment: prefs.equipmentAvailable,
            planStale: true
        });
    } catch (error) {
        console.error("❌ Error in updateUserEquipment:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
