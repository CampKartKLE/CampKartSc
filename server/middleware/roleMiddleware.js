// server/middleware/roleMiddleware.js

/**
 * Middleware to check if user has admin role
 */
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }
};

/**
 * Middleware to check if user is an approved seller
 */
exports.isSeller = (req, res, next) => {
    if (req.user && (req.user.role === 'seller' || req.user.role === 'admin') && req.user.isApprovedSeller) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: "Access denied. Approved seller status required."
        });
    }
};

/**
 * Generic role checker
 */
exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of: ${roles.join(', ')}`
            });
        }
        next();
    };
};
