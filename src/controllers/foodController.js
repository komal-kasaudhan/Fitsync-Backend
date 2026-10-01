const Food = require('../models/Food');
exports.searchFoods = async (req, res) => {
    try {
        const { q, category, mealType, dietType } = req.query;
        
        let queryFilter = {};

        if (category && category !== 'All') {
            queryFilter.category = { $regex: category, $options: 'i' };
        }

        if (mealType && mealType !== 'All') {
            queryFilter.mealTypes = { $in: [new RegExp(mealType, 'i')] };
        }

        if (dietType && dietType !== 'All') {
            queryFilter.dietType = { $regex: dietType, $options: 'i' };
        }

        // 2. Search Query Matching (Name, Aliases, Category, MealTypes)
        if (q && q.trim() !== "") {
            const searchRegex = new RegExp(q.trim(), 'i');
            queryFilter.$or = [
                { name: searchRegex },
                { aliases: searchRegex },
                { category: searchRegex },
                { mealTypes: searchRegex }
            ];
        }

        const rawFoods = await Food.find(queryFilter).limit(50);

        // 3. 🔄 MAP & FLATTEN: Response to Match Android App Expectations
        const formattedFoods = rawFoods.map(item => {
            const nutrition = item.nutritionPerServing || {};
            return {
                id: item._id,
                _id: item._id,
                name: item.name,
                category: item.category || "General",
                subCategory: item.subCategory || "",
                servingType: item.servingType || "g",
                servingSize: item.servingSize || "100g",
                servingWeight: item.servingWeight || 100,
                
                // Root Level Flattened Nutrients for Android App
                calories: nutrition.calories !== undefined ? nutrition.calories : 0,
                protein: nutrition.protein !== undefined ? nutrition.protein : 0,
                carbs: nutrition.carbs !== undefined ? nutrition.carbs : 0,
                fat: nutrition.fat !== undefined ? nutrition.fat : 0,
                fiber: nutrition.fiber !== undefined ? nutrition.fiber : 0,
                dietType: item.dietType || "Veg",
                mealTypes: item.mealTypes || [],
                servingUnit: item.servingSize || "100g",
                verified: item.verified !== undefined ? item.verified : true
            };
        });

        return res.status(200).json({
            success: true,
            count: formattedFoods.length,
            data: formattedFoods
        });

    } catch (error) {
        console.error("Search Foods Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to search foods", 
            error: error.message 
        });
    }
};

// 📖 STEP 2: Get Single Food Details
exports.getFoodDetails = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food item not found' });
        }

        const nutrition = food.nutritionPerServing || {};
        
        const formattedFood = {
            id: food._id,
            _id: food._id,
            name: food.name,
            category: food.category,
            subCategory: food.subCategory,
            servingType: food.servingType,
            servingSize: food.servingSize,
            servingWeight: food.servingWeight,
            calories: nutrition.calories || 0,
            protein: nutrition.protein || 0,
            carbs: nutrition.carbs || 0,
            fat: nutrition.fat || 0,
            verified: food.verified
        };

        return res.status(200).json({ success: true, data: formattedFood });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};