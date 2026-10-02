// 📄 Path: src/controllers/aiController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const DailyNutrition = require("../models/DailyNutrition");
const NutritionTarget = require("../models/NutritionTarget");
const Onboarding = require("../models/onboarding.model");
const WorkoutPlan = require("../models/WorkoutPlan");
const WorkoutPreferences = require("../models/WorkoutPreferences");
const AiChat = require("../models/AiChat");
const { getTodayKolkata, getWeekdayKolkata } = require("../utils/dateUtils");
const { chatWithAiCoach } = require("../service/geminiService");
const crypto = require("crypto");

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-3.5-flash", "gemini-flash-latest"];

// In-memory sliding rate limiter per user (e.g. max 20 requests per minute)
const userRequestCounts = new Map();

function checkRateLimit(userId) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 20;

    let userLog = userRequestCounts.get(String(userId));
    if (!userLog) {
        userLog = [];
        userRequestCounts.set(String(userId), userLog);
    }

    // Filter out timestamps outside window
    userLog = userLog.filter(ts => now - ts < windowMs);
    userRequestCounts.set(String(userId), userLog);

    if (userLog.length >= maxRequests) {
        return false;
    }

    userLog.push(now);
    return true;
}

function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing or empty in backend .env");
    }
    return new GoogleGenerativeAI(apiKey);
}

async function generateWithFallback(promptOrParts, generationConfig = {}, timeoutMs = 60000) {
    const genAI = getGenAI();
    let lastError = null;

    for (const modelName of FALLBACK_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Model timeout after ${timeoutMs}ms`)), timeoutMs)
            );
            const resultPromise = model.generateContent(promptOrParts);
            const result = await Promise.race([resultPromise, timeoutPromise]);
            return result.response.text().trim();
        } catch (err) {
            console.warn(`⚠️ Model ${modelName} failed (${err.status || err.message}), trying fallback...`);
            lastError = err;
        }
    }

    throw lastError || new Error("All Gemini models failed to respond.");
}

/**
 * FEATURE I: Ask AI (Floating Button & Multi-turn Chat)
 * POST /api/ai/ask
 * Body: { message, query, conversationId? }
 */
exports.askAiCoach = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const userMessage = (req.body.message || req.body.query || "").trim();
        let conversationId = req.body.conversationId || "default";

        if (!userMessage) {
            return res.status(400).json({ success: false, message: "message is required" });
        }

        // 1. Rate limiting
        if (!checkRateLimit(userId)) {
            return res.status(429).json({
                success: false,
                message: "You're asking questions very quickly! Please wait a moment before trying again."
            });
        }

        // 2. Build full user context from DB
        const date = getTodayKolkata();
        const onboarding = await Onboarding.findOne({ userId });
        const targets = await NutritionTarget.findOne({ $or: [{ userId }, { user: userId }] });
        const daily = await DailyNutrition.findOne({ $or: [{ userId }, { user: userId }], date });
        const plan = await WorkoutPlan.findOne({ userId, status: "Active" });
        const prefs = await WorkoutPreferences.findOne({ userId });

        const targetProtein = targets?.targetProtein || 100;
        const targetCalories = targets?.targetCalories || 2000;
        const consumedProtein = daily?.consumedProtein || daily?.consumed?.protein || 0;
        const consumedCalories = daily?.consumedCalories || daily?.consumed?.calories || 0;

        const todayWeekday = getWeekdayKolkata();
        const todayRoutine = plan?.routines?.find(r => r.dayName === todayWeekday);
        const todayWorkout = todayRoutine ? `${todayRoutine.focus} (${todayRoutine.isRestDay ? "Rest Day" : todayRoutine.duration + " mins"})` : "Rest / Active Recovery";

        const rawDiet = (onboarding?.goal || "").toLowerCase();
        const dietType = rawDiet.includes("non") ? "Non-Veg" : rawDiet.includes("egg") ? "Eggetarian" : "Vegetarian";

        const userContext = {
            goal: onboarding?.goal || "General Fitness",
            currentWeight: onboarding?.currentWeight || 70,
            targetWeight: onboarding?.targetWeight || 68,
            dietType,
            injuries: onboarding?.selectedMedicalConditions || [],
            equipment: prefs?.equipmentAvailable || ["Bodyweight"],
            remainingProtein: Math.max(0, Math.round((targetProtein - consumedProtein) * 10) / 10),
            remainingCalories: Math.max(0, Math.round(targetCalories - consumedCalories)),
            todayWorkout
        };

        // 3. Load or initialize conversation history
        let chatDoc = await AiChat.findOne({ userId, conversationId });
        if (!chatDoc) {
            chatDoc = new AiChat({
                userId,
                conversationId,
                messages: []
            });
        }

        const history = chatDoc.messages.slice(-10);

        // 4. Generate AI response (with scope guard, timeout, and fallback)
        let aiReply = "";
        try {
            aiReply = await chatWithAiCoach(userMessage, history, userContext);
        } catch (err) {
            console.error("❌ Gemini call in askAiCoach error:", err.message);
            aiReply = "I am experiencing high traffic right now. In the meantime, remember to prioritize hitting your protein target and drinking enough water!";
        }

        // 5. Save turn in DB
        chatDoc.messages.push({ role: "user", content: userMessage, timestamp: new Date() });
        chatDoc.messages.push({ role: "model", content: aiReply, timestamp: new Date() });

        // Keep last 40 messages max per conversation
        if (chatDoc.messages.length > 40) {
            chatDoc.messages = chatDoc.messages.slice(-40);
        }

        await chatDoc.save();

        return res.status(200).json({
            success: true,
            conversationId,
            reply: aiReply,
            answer: aiReply // Alias for backward compatibility
        });
    } catch (error) {
        console.error("❌ AI Coach Chat Error:", error);
        return res.status(500).json({
            success: false,
            message: "I am having a brief connection issue. Please try asking again in a moment.",
            error: error.message
        });
    }
};

/**
 * FEATURE I: Get Conversation History
 * GET /api/ai/history?conversationId=
 */
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;
        const conversationId = req.query.conversationId || "default";

        const chatDoc = await AiChat.findOne({ userId, conversationId });
        const messages = chatDoc ? chatDoc.messages : [];

        return res.status(200).json({
            success: true,
            conversationId,
            count: messages.length,
            messages
        });
    } catch (error) {
        console.error("❌ Error in getChatHistory:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to load chat history" });
    }
};

/**
 * 💡 Smart Insight Controller (Backward compatibility)
 */
exports.getSmartInsight = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const date = req.query.date || getTodayKolkata();

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

/**
 * 📸 Camera Food Image Vision Scan Controller
 */
exports.scanFoodImage = async (req, res) => {
    try {
        let imageBase64 = null;
        let mimeType = "image/jpeg";

        // Check multipart/form-data upload via multer
        if (req.file && req.file.buffer) {
            imageBase64 = req.file.buffer.toString("base64");
            mimeType = req.file.mimetype || "image/jpeg";
        } else if (req.body?.imageBase64 || req.body?.image) {
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

        const prompt = `Analyze this food image. Identify the dish and estimate nutrition per standard serving.
Respond with pure JSON only in this exact structure:
{
    "foodName": "Name of dish",
    "servingSize": "e.g. 1 bowl / 150g",
    "servingWeightGrams": 150,
    "calories": 250,
    "protein": 12,
    "carbs": 30,
    "fat": 8,
    "fiber": 3,
    "confidenceScore": 0.90,
    "dietType": "Veg or NonVeg or Vegan or Eggitarian",
    "ingredientsDetected": ["item 1", "item 2"]
}`;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType
            }
        };

        const rawResponse = await generateWithFallback([prompt, imagePart], {
            responseMimeType: "application/json"
        }, 75000);

        let parsedData;
        try {
            let cleaned = rawResponse.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "").trim();
            } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "").trim();
            }
            parsedData = JSON.parse(cleaned);
        } catch (jsonErr) {
            console.error("❌ Failed to parse Gemini Vision JSON:", jsonErr.message);
            return res.status(500).json({
                success: false,
                message: "Failed to parse nutritional data from image.",
                rawResponse
            });
        }

        return res.status(200).json({
            success: true,
            message: "Food scanned successfully",
            data: parsedData
        });
    } catch (error) {
        console.error("❌ Scan Food Image Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to scan food image",
            error: error.message
        });
    }
};