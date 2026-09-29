const { GoogleGenerativeAI } = require('@google/generative-ai');
const DailyNutrition = require('../models/DailyNutrition');

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// 💡 1. Smart Insight Controller
exports.getSmartInsight = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        const dailyRecord = await DailyNutrition.findOne({ userId, date });

        const consumed = dailyRecord ? (dailyRecord.consumed || { calories: dailyRecord.consumedCalories || 0, protein: dailyRecord.consumedProtein || 0 }) : { calories: 0, protein: 0 };
        const targetCalories = dailyRecord?.targetCalories || 2000;
        const targetProtein = dailyRecord?.targetProtein || 100;

        const remCalories = Math.max(0, targetCalories - (consumed.calories || 0));
        const remProtein = Math.max(0, targetProtein - (consumed.protein || 0));

        if (!apiKey) {
            return res.status(200).json({
                success: true,
                insight: "Eat paneer or chicken breast to easily complete your daily protein target!"
            });
        }

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `User Stats Today: Consumed ${consumed.calories}/${targetCalories} kcal, ${consumed.protein}/${targetProtein}g protein.
                        Remaining: ${remCalories} kcal and ${remProtein}g protein.
                        Write a crisp 1-sentence fitness advice (under 15 words) on what to eat or do next. No markdown, no quotes, no emojis.`;

        const result = await model.generateContent(prompt);
        const insightText = result.response.text().trim();

        return res.status(200).json({
            success: true,
            insight: insightText
        });
    } catch (error) {
        console.error("❌ Smart Insight Error:", error.message);
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
        const date = new Date().toISOString().split('T')[0];

        if (!query) {
            return res.status(400).json({ success: false, message: "Query is required" });
        }

        if (!apiKey) {
            return res.status(200).json({
                success: true,
                answer: "GEMINI_API_KEY is not configured on the backend server. Please check your .env file."
            });
        }

        const dailyRecord = await DailyNutrition.findOne({ userId, date });
        const consumed = dailyRecord ? (dailyRecord.consumed || { calories: dailyRecord.consumedCalories || 0, protein: dailyRecord.consumedProtein || 0 }) : { calories: 0, protein: 0 };

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `You are FitSync AI, an expert nutrition and fitness coach.
                        User Context Today: ${consumed.calories || 0}/2000 kcal consumed, ${consumed.protein || 0}/100g protein consumed.
                        User Question: "${query}".
                        Answer concisely in clear, helpful English under 50 words.`;

        const result = await model.generateContent(prompt);
        const answerText = result.response.text().trim();

        return res.status(200).json({
            success: true,
            answer: answerText
        });
    } catch (error) {
        console.error("❌ AI Coach Chat Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to process AI chat query" 
        });
    }
};

// 📸 3. Camera Food Image Vision Scan Controller
exports.scanFoodImage = async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ success: false, message: "imageBase64 is required" });
        }

        if (!apiKey) {
            return res.status(500).json({ success: false, message: "GEMINI_API_KEY missing on server" });
        }

        const model = genAI.getGenerativeModel({ 
            model: MODEL_NAME,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        Analyze this food image carefully and estimate its nutrition values.
        Return ONLY a raw JSON object response matching this exact structure:
        {
          "foodName": "Name of dish",
          "calories": estimated_calories_number,
          "protein": estimated_protein_number,
          "carbs": estimated_carbs_number,
          "fat": estimated_fat_number,
          "estimatedGram": estimated_weight_grams_number
        }
        `;

        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

        const imagePart = {
            inlineData: {
                data: cleanBase64,
                mimeType: "image/jpeg"
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().trim();

        let nutritionData;
        try {
            nutritionData = JSON.parse(responseText);
        } catch (parseErr) {
            const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            nutritionData = JSON.parse(cleanJson);
        }

        return res.status(200).json({
            success: true,
            ...nutritionData
        });

    } catch (error) {
        console.error("❌ AI Food Scan Error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to scan food image with AI" });
    }
};