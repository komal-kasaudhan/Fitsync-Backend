const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization") || req.header("authorization");

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Token missing"
            });
        }

        let token = authHeader.trim();
        if (token.toLowerCase().startsWith("bearer ")) {
            token = token.slice(7).trim();
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Normalize user ID across all controllers (id, _id, userId)
        const userId = decoded.id || decoded._id || decoded.userId;
        req.user = {
            ...decoded,
            id: userId,
            _id: userId,
            userId: userId
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
                expiredAt: error.expiredAt
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

module.exports = auth;