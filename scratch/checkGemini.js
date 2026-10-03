require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function check() {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    
    const candidateModels = ["gemini-3.8-flash", "gemini-3.8-flash-lite", "gemini-3.5-flash", "gemini-3.0-flash", "gemini-flash-latest"];
    for (const m of candidateModels) {
        try {
            console.log(`Testing model: ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const res = await model.generateContent("Respond with JSON: {\"status\":\"ok\"}");
            console.log(`✅ Model ${m} Success! Output:`, res.response.text().trim());
            return;
        } catch (err) {
            console.log(`❌ Model ${m} failed. Status:`, err.status, "Message:", err.message);
        }
    }
}

check();
