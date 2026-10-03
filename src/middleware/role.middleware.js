// 📄 Path: src/middleware/role.middleware.js
const User = require('../models/user.model');

/**
 * Middleware to enforce role-based access control (user, gym_owner, admin)
 * Allows users who possess AT LEAST ONE of the specified allowedRoles
 */
const requireRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id || req.user?._id || req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            // Fetch current roles from database
            const userDoc = await User.findById(userId).select('roles email').lean();
            const userRoles = (userDoc && Array.isArray(userDoc.roles) && userDoc.roles.length > 0)
                ? userDoc.roles
                : (req.user.roles || ["user"]);

            // Attach resolved roles to req.user for downstream controllers
            req.user.roles = userRoles;

            const hasRole = allowedRoles.some(r => userRoles.includes(r));
            if (!hasRole) {
                return res.status(403).json({
                    success: false,
                    message: `Forbidden: requires one of [${allowedRoles.join(', ')}] role(s)`
                });
            }

            next();
        } catch (error) {
            console.error("❌ Role Authorization Error:", error.message);
            return res.status(500).json({
                success: false,
                message: "Role authorization check failed"
            });
        }
    };
};

module.exports = requireRole;
