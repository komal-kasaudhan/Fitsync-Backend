const { GoogleGenerativeAI } = require("@google/generative-ai");
const DailyNutrition = require("../models/DailyNutrition");

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-3.5-flash", "gemini-flash-latest"];

function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing or empty in backend .env");
    }
    return new GoogleGenerativeAI(apiKey);
}

async function generateWithFallback(promptOrParts, generationConfig = {}) {
    const genAI = getGenAI();
    let lastError = null;

    for (const modelName of FALLBACK_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
            const result = await model.generateContent(promptOrParts);
            return result.response.text().trim();
        } catch (err) {
            console.warn(`⚠️ Model ${modelName} failed (${err.status || err.message}), trying fallback...`);
            lastError = err;
        }
    }

    throw lastError || new Error("All Gemini models failed to respond.");
}

// 💡 1. Smart Insight Controller
exports.getSmartInsight = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const date = req.query.date || new Date().toISOString().split("T")[0];

        const dailyRecord = await DailyNutrition.findOne({ userId, date });
        const consumed = dailyRecord ? (dailyRecord.consumed || { calories: dailyRecord.consumedCalories || 0, protein: dailyRecord.consumedProtein || 0 }) : { calories: 0, protein: 0 };
        const targetCalories = dailyRecord?.targetCalories || 2000;
        const targetProtein = dailyRecord?.targetProtein || 100;

        const remCalories = Math.max(0, targetCalories - (consumed.calories || 0));
        const remProtein = Math.max(0, targetProtein - (consumed.protein || 0));

        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                success: true,
                insight: "Eat paneer, eggs, or chicken breast to complete your daily protein target!"
            });
        }

        const prompt = `User Stats Today: Consumed ${consumed.calories}/${targetCalories} kcal, ${consumed.protein}/${targetProtein}g protein.
                        Remaining: ${remCalories} kcal and ${remProtein}g protein.
                        Write a crisp 1-sentence fitness advice (under 15 words) on what to eat or do next. No markdown, no quotes, no emojis.`;

        const insightText = await generateWithFallback(prompt);

        return res.status(200).json({
            success: true,
            insight: insightText
        });
    } catch (error) {
        console.error("❌ Smart Insight Error:", error);
        return res.status(200).json({
            success: true,
            insight: "Keep pushing towards your daily macros and stay hydrated!"
        });
    }
};

// 🤖 2. Interactive AI Coach Chat Controller
exports.askAiCoach = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { query } = req.body;
        const date = new Date().toISOString().split("T")[0];

        if (!query || query.trim() === "") {
            return res.status(400).json({ success: false, message: "Query is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                success: true,
                answer: "GEMINI_API_KEY is not configured on the backend server. Please configure it in your .env file."
            });
        }

        const dailyRecord = await DailyNutrition.findOne({ userId, date });
        const consumed = dailyRecord ? (dailyRecord.consumed || { calories: dailyRecord.consumedCalories || 0, protein: dailyRecord.consumedProtein || 0 }) : { calories: 0, protein: 0 };

        const prompt = `You are FitSync AI, an expert nutrition and fitness coach.
                        User Context Today: ${consumed.calories || 0}/2000 kcal consumed, ${consumed.protein || 0}/100g protein consumed.
                        User Question: "${query.trim()}".
                        Answer concisely in clear, helpful English under 60 words.`;

        const answerText = await generateWithFallback(prompt);

        return res.status(200).json({
            success: true,
            answer: answerText
        });
    } catch (error) {
        console.error("❌ AI Coach Chat Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process AI chat query",
            error: error.message
        });
    }
};

// 📸 3. Camera Food Image Vision Scan Controller
exports.scanFoodImage = async (req, res) => {
    try {
        let imageBase64 = null;
        let mimeType = "image/jpeg";

        // Check multipart/form-data upload via multer
        if (req.file && req.file.buffer) {
            imageBase64 = req.file.buffer.toString("base64");
            mimeType = req.file.mimetype || "image/jpeg";
        } else if (req.body?.imageBase64 || req.body?.image) {
            // Check JSON body base64 string
            const raw = req.body.imageBase64 || req.body.image;
            if (raw.includes(",")) {
                const parts = raw.split(",");
                const match = parts[0].match(/:(.*?);/);
                if (match) mimeType = match[1];
                imageBase64 = parts[1];
            } else {
                imageBase64 = raw;
            }
        }

        if (!imageBase64 || imageBase64.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "No image provided. Please upload an image file ('image') or provide 'imageBase64' in JSON."
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "GEMINI_API_KEY is not configured on the backend server. Please add it to your .env file."
            });
        }

        const prompt = `
        Analyze this image carefully.
        First, determine if this image clearly contains edible food, meal, or beverage.
        If NO food is detected (e.g. human face, clothing, document, room, furniture, plain background, non-food item), return ONLY this JSON:
        {
          "isFood": false,
          "message": "No food detected in image",
          "foodName": "Unknown",
          "calories": 0,
          "protein": 0,
          "carbs": 0,
          "fat": 0,
          "estimatedGram": 0
        }

        If food IS detected, estimate the portion and nutritional breakdown. Return ONLY this JSON:
        {
          "isFood": true,
          "foodName": "Specific name of dish or food item",
          "calories": <estimated calories as number>,
          "protein": <estimated protein in grams as number>,
          "carbs": <estimated carbohydrates in grams as number>,
          "fat": <estimated fats in grams as number>,
          "estimatedGram": <estimated total serving weight in grams as number>
        }
        `;

        const imagePart = {
            inlineData: {
                data: imageBase64.trim(),
                mimeType: mimeType
            }
        };

        const responseText = await generateWithFallback(
            [prompt, imagePart],
            { responseMimeType: "application/json" }
        );

        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        } catch (jsonErr) {
            const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
            parsedData = JSON.parse(cleanJson);
        }

        if (parsedData.isFood === false) {
            return res.status(200).json({
                success: false,
                isFood: false,
                message: "No food detected in the provided image. Please take a clear picture of your food.",
                foodName: "Unknown",
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                estimatedGram: 0
            });
        }

        return res.status(200).json({
            success: true,
            isFood: true,
            foodName: parsedData.foodName || "Identified Dish",
            calories: Math.round(Number(parsedData.calories) || 0),
            protein: parseFloat(Number(parsedData.protein || 0).toFixed(1)),
            carbs: parseFloat(Number(parsedData.carbs || 0).toFixed(1)),
            fat: parseFloat(Number(parsedData.fat || 0).toFixed(1)),
            estimatedGram: Math.round(Number(parsedData.estimatedGram) || 100)
        });

    } catch (error) {
        console.error("❌ AI Food Scan Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to scan food image with AI: " + error.message,
            error: error.message
        });
    }
};