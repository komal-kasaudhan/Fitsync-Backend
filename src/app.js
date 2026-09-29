const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const onboardingRoutes = require("./routes/onboarding.routes");
const workoutRoutes = require("./routes/workout.routes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Enable CORS for all origins and headers
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lightweight Request Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

    res.on("finish", () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const color = statusCode >= 500 ? "\x1b[31m" : statusCode >= 400 ? "\x1b[33m" : "\x1b[32m";
        const reset = "\x1b[0m";
        console.log(`[${new Date().toLocaleTimeString()}] ${method} ${originalUrl} ${color}${statusCode}${reset} (${duration}ms) - IP: ${clientIp}`);
    });

    next();
});

// Root & Health Check Endpoints
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "FitSync Backend Running 🚀",
        version: "1.0.0",
        dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/health", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "UP" : "DEGRADED",
        dbConnected: isDbConnected,
        timestamp: new Date().toISOString(),
        clientIp: req.headers["x-forwarded-for"] || req.socket.remoteAddress
    });
});

// API Routes
if (authRoutes) app.use("/api/auth", authRoutes);
if (onboardingRoutes) app.use("/api/onboarding", onboardingRoutes);
if (workoutRoutes) app.use("/api/workout", workoutRoutes);
if (nutritionRoutes) app.use("/api/v1/nutrition", nutritionRoutes);
if (aiRoutes) app.use("/api/v1/nutrition/ai", aiRoutes);

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Unhandled Error:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;