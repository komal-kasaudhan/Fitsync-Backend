const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const onboardingRoutes = require("./routes/onboarding.routes");
const workoutRoutes = require("./routes/workout.routes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const equipmentRoutes = require("./routes/equipment.routes");
const userRoutes = require("./routes/user.routes");
const targetRoutes = require("./routes/target.routes");
const adminRoutes = require("./routes/admin.routes");
const homeRoutes = require("./routes/home.routes");
const gymRoutes = require("./routes/gym.routes");
const gymBookingRoutes = require("./routes/gymBooking.routes");
const gymMembershipRoutes = require("./routes/gymMembership.routes");
const notificationRoutes = require("./routes/notification.routes");
const geoRoutes = require("./routes/geo.routes");
const configRoutes = require("./routes/config.routes");
const reportRoutes = require("./routes/report.routes");
const trainerRoutes = require("./routes/trainer.routes");
const trainerBookingRoutes = require("./routes/trainerBooking.routes");
const sellerRoutes = require("./routes/seller.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const addressRoutes = require("./routes/address.routes");

const app = express();

// 90-second request timeout guard
app.use((req, res, next) => {
    req.setTimeout(90000);
    res.setTimeout(90000, () => {
        if (!res.headersSent) {
            res.status(504).json({ success: false, message: "Request timed out after 90 seconds" });
        }
    });
    next();
});

// Serve static files and uploads automatically
app.use('/exercise-images', express.static(path.join(__dirname, '../public/exercise-images')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));



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

// Health check endpoint (No auth, phone-friendly)
app.get("/api/health", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(200).json({
        status: "ok",
        db: isDbConnected ? "connected" : "offline",
        time: new Date().toISOString()
    });
});

// Database-offline guard: return 503 if DB is offline instead of hanging
app.use("/api", (req, res, next) => {
    if (req.path === "/health") {
        return next();
    }
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database offline"
        });
    }
    next();
});

// API Routes
if (authRoutes) app.use("/api/auth", authRoutes);
if (onboardingRoutes) app.use("/api/onboarding", onboardingRoutes);
if (workoutRoutes) app.use("/api/workout", workoutRoutes);
if (nutritionRoutes) {
    app.use("/api/nutrition", nutritionRoutes);
    app.use("/api/v1/nutrition", nutritionRoutes);
}
if (equipmentRoutes) app.use("/api/equipment", equipmentRoutes);
if (userRoutes) app.use("/api/user", userRoutes);
if (targetRoutes) app.use("/api/targets", targetRoutes);
if (aiRoutes) {
    app.use("/api/ai", aiRoutes);
    app.use("/api/v1/nutrition/ai", aiRoutes);
}
if (adminRoutes) app.use("/api/admin", adminRoutes);
if (homeRoutes) app.use("/api/home", homeRoutes);
if (gymRoutes) app.use("/api/gyms", gymRoutes);
if (gymBookingRoutes) app.use("/api/gym-bookings", gymBookingRoutes);
if (gymMembershipRoutes) app.use("/api/gym-memberships", gymMembershipRoutes);
if (notificationRoutes) app.use("/api/notifications", notificationRoutes);
if (geoRoutes) app.use("/api/geo", geoRoutes);
if (configRoutes) app.use("/api/config", configRoutes);
if (reportRoutes) app.use("/api/reports", reportRoutes);
if (trainerRoutes) app.use("/api/trainers", trainerRoutes);
if (trainerBookingRoutes) app.use("/api/trainer-bookings", trainerBookingRoutes);
if (sellerRoutes) app.use("/api/seller", sellerRoutes);
if (productRoutes) app.use("/api/products", productRoutes);
if (cartRoutes) app.use("/api/cart", cartRoutes);
if (orderRoutes) app.use("/api/orders", orderRoutes);
if (addressRoutes) app.use("/api/addresses", addressRoutes);



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