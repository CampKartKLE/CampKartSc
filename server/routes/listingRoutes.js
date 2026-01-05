const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

// ------------------------
// Multer Setup
// ------------------------
const { storage } = require("../config/cloudinary");
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/");
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });

// ------------------------
// Multer Setup
// ------------------------
const upload = multer({ storage });

// ------------------------
// Listing Routes
// ------------------------
const optionalAuth = require("../middleware/optionalAuth");

const { isSeller } = require("../middleware/roleMiddleware");

// ------------------------
// Listing Routes
// ------------------------
router.get("/", listingController.getAllListings);
router.get("/:id", optionalAuth, listingController.getListingById);

router.post("/", authMiddleware, isSeller, upload.array("images", 5), listingController.createListing);

router.put("/:id", authMiddleware, isSeller, upload.array("images", 5), listingController.updateListing);
router.delete("/:id", authMiddleware, isSeller, listingController.deleteListing);

// Seller Dashboard Listings (all statuses)
router.get("/seller/my-listings", authMiddleware, isSeller, listingController.getMyListings);

// Mark as sold
router.patch("/:id/sold", authMiddleware, isSeller, listingController.markAsSold);

// Toggle like
router.post("/:id/like", authMiddleware, listingController.toggleLike);

// ------------------------
// Admin Listing Routes
// ------------------------
const { isAdmin } = require("../middleware/roleMiddleware");
router.get("/admin/pending", authMiddleware, isAdmin, listingController.getPendingListings);
router.patch("/admin/:id/status", authMiddleware, isAdmin, listingController.updateListingStatus);

module.exports = router;
