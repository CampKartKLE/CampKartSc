const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

// All routes here require admin privileges
router.use(authMiddleware, isAdmin);

// Stats
router.get("/stats", adminController.getStats);

// Seller Management
router.get("/sellers/pending", adminController.getPendingSellers);
router.patch("/sellers/:id/status", adminController.updateSellerStatus);

// Chat Monitoring
router.get("/chats", adminController.getAllConversations);
router.get("/chats/:id/messages", adminController.getConversationMessages);
router.delete("/messages/:id", adminController.deleteMessage);

// Listing Management
router.get("/listings/pending", adminController.getPendingListings);
router.patch("/listings/:id/status", adminController.updateListingStatus);

// User Moderation
router.get("/users/search/:email", adminController.getUserByEmail);
router.patch("/users/:id/moderate", adminController.moderateUser);

module.exports = router;
