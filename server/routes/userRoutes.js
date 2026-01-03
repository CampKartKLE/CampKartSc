const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected Routes
router.post("/wishlist/:id", authMiddleware, userController.toggleWishlist);
router.get("/wishlist", authMiddleware, userController.getWishlist);

// Profile management
router.put("/profile", authMiddleware, userController.updateProfile);

// Notification preferences
router.put("/notifications", authMiddleware, userController.updateNotificationPreferences);

// Password change
router.put("/password", authMiddleware, userController.changePassword);

// Seller Application
router.post("/apply-seller", authMiddleware, userController.applyToBeSeller);

// Admin Seller Management
const { isAdmin } = require("../middleware/roleMiddleware");
router.get("/admin/pending-sellers", authMiddleware, isAdmin, userController.getPendingSellers);
router.post("/admin/approve-seller", authMiddleware, isAdmin, userController.updateSellerStatus);

module.exports = router;
