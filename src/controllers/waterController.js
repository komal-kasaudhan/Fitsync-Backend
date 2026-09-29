const DailyNutrition = require('../models/DailyNutrition');

// 💧 Add Water Controller
exports.addWater = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const { amountMl = 250, date } = req.body;
        const logDate = date || new Date().toISOString().split('T')[0];

        let record = await DailyNutrition.findOne({
            userId: userId,
            date: logDate
        });

        if (!record) {
            record = new DailyNutrition({
                userId: userId,
                date: logDate,
                consumedWater: Number(amountMl),
                consumed: {
                    waterMl: Number(amountMl),
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    fiber: 0
                }
            });
            await record.save();
        } else {
            const currentWater = (record.consumed?.waterMl || record.consumedWater || 0) + Number(amountMl);
            if (!record.consumed) {
                record.consumed = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, waterMl: 0 };
            }
            record.consumed.waterMl = currentWater;
            record.consumedWater = currentWater;
            await record.save();
        }

        const currentWaterMl = record.consumed?.waterMl || record.consumedWater || 0;
        const currentWaterLiters = parseFloat((currentWaterMl / 1000.0).toFixed(2));

        return res.status(200).json({
            success: true,
            message: 'Water logged successfully! 💧',
            waterMl: currentWaterMl,
            currentWaterLiters: currentWaterLiters
        });

    } catch (error) {
        console.error("❌ Add Water Controller Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to log water' 
        });
    }
};
