// 📄 Path: src/controllers/equipmentController.js
const WorkoutPreferences = require('../models/WorkoutPreferences');
const WorkoutPlan = require('../models/WorkoutPlan');

const MASTER_EQUIPMENT = [
    { id: "bodyweight", label: "Bodyweight (No Equipment)", name: "Bodyweight (No Equipment)", category: "Basic", icon: "accessibility" },
    { id: "dumbbell", label: "Dumbbells", name: "Dumbbells", category: "Free Weights", icon: "fitness_center" },
    { id: "barbell", label: "Barbell & Weight Plates", name: "Barbell & Weight Plates", category: "Free Weights", icon: "fitness_center" },
    { id: "kettlebell", label: "Kettlebells", name: "Kettlebells", category: "Free Weights", icon: "sports_gymnastics" },
    { id: "resistance_band", label: "Resistance Bands", name: "Resistance Bands", category: "Bands & Straps", icon: "linear_scale" },
    { id: "pull_up_bar", label: "Pull-Up Bar", name: "Pull-Up Bar", category: "Calisthenics", icon: "horizontal_rule" },
    { id: "bench", label: "Flat / Incline Bench", name: "Flat / Incline Bench", category: "Benches", icon: "table_rows" },
    { id: "cable_machine", label: "Cable Machine (Gym)", name: "Cable Machine (Gym)", category: "Gym Machines", icon: "settings_input_composite" },
    { id: "treadmill", label: "Treadmill", name: "Treadmill", category: "Cardio", icon: "directions_run" },
    { id: "stationary_bike", label: "Stationary Bike", name: "Stationary Bike", category: "Cardio", icon: "directions_bike" },
    { id: "jump_rope", label: "Jump Rope", name: "Jump Rope", category: "Cardio", icon: "refresh" },
    { id: "leg_press", label: "Leg Press Machine", name: "Leg Press Machine", category: "Gym Machines", icon: "compress" },
    { id: "foam_roller", label: "Foam Roller / Mat", name: "Foam Roller / Mat", category: "Mobility", icon: "self_improvement" }
];

/**
 * TASK 4: Master Equipment list
 * GET /api/equipment/master
 * Response: { "equipment": [{ id, label, icon }] }
 */
exports.getMasterEquipment = async (req, res) => {
    try {
        const formatted = MASTER_EQUIPMENT.map(e => ({
            id: e.id,
            label: e.label || e.name,
            icon: e.icon
        }));

        return res.status(200).json({
            equipment: formatted
        });
    } catch (error) {
        console.error("❌ Error in getMasterEquipment:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * TASK 4: User Owned Equipment
 * GET /api/user/equipment
 * Response: { "equipment": ["dumbbell","bench"], "planStale": false }
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
        const planStale = plan ? Boolean(plan.planStale) : false;

        return res.status(200).json({
            equipment,
            planStale
        });
    } catch (error) {
        console.error("❌ Error in getUserEquipment:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * TASK 4: Update User Equipment
 * PUT /api/user/equipment
 * Body: { equipment: [string] }
 * Response: { "equipment": [...], "planStale": true }
 */
exports.updateUserEquipment = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        let { equipment } = req.body;

        // If client passes an object with equipment array or direct array
        if (!Array.isArray(equipment) && Array.isArray(req.body)) {
            equipment = req.body;
        }

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
            equipment: prefs.equipmentAvailable,
            planStale: true
        });
    } catch (error) {
        console.error("❌ Error in updateUserEquipment:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
