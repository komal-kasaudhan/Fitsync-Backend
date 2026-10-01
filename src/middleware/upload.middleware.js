const multer = require("multer");

// Use memory storage for fast processing with AI vision APIs
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/heic"];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported image type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, HEIC`), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max limit
    },
    fileFilter
});

// Middleware to handle single image from common field names ('image', 'photo', 'file')
const uploadImage = (req, res, next) => {
    // If request is application/json (e.g. Android app sending base64), skip multer
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("application/json")) {
        return next();
    }

    const singleUpload = upload.fields([
        { name: "image", maxCount: 1 },
        { name: "photo", maxCount: 1 },
        { name: "file", maxCount: 1 }
    ]);

    singleUpload(req, res, (err) => {
        if (err) {
            console.error("❌ Multer upload error:", err.message);
            return res.status(400).json({
                success: false,
                message: err.message || "Image upload failed. Ensure image is JPEG/PNG/WEBP and under 10MB."
            });
        }

        // Attach found file to req.file
        if (req.files) {
            req.file = req.files.image?.[0] || req.files.photo?.[0] || req.files.file?.[0];
        }

        next();
    });
};

module.exports = { upload, uploadImage };
