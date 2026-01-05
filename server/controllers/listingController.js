// server/controllers/listingController.js
const Listing = require("../models/Listing");

// -----------------------------
// GET ALL LISTINGS (filters)
// -----------------------------
exports.getAllListings = async (req, res) => {
  try {
    let query = {};

    const { q, category, minPrice, maxPrice, condition, location } = req.query;

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category && category !== "All Items") query.category = category;

    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };

    if (condition) query.condition = { $in: condition.split(",") };

    if (location)
      query.location = { $regex: location, $options: "i" };

    // Filter out sold items older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query.$and = [
      {
        $or: [
          { isSold: { $ne: true } }, // Not sold
          { isSold: true, soldAt: { $gte: sevenDaysAgo } }, // Sold within 7 days
        ],
      },
      // ONLY APPROVED LISTINGS
      { status: 'approved' }
    ];

    // Sorting
    let sortOption = { createdAt: -1 }; // default: newest
    const { sort } = req.query;

    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "popular") sortOption = { views: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    const listings = await Listing.find(query).sort(sortOption);
    res.json({ success: true, data: listings });
  } catch (err) {
    console.error("GetAllListings error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch listings" });
  }
};

// -----------------------------
// GET LISTING BY ID
// -----------------------------
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Unique View Tracking
    // Identifier: User ID (if auth) or IP address
    const viewerId = req.user ? req.user.id : req.ip;

    // Initialize viewedBy if it doesn't exist (compatibility)
    if (!listing.viewedBy) listing.viewedBy = [];

    if (!listing.viewedBy.includes(viewerId)) {
      listing.viewedBy.push(viewerId);
      listing.views += 1;
      await listing.save();
    }

    res.json({ success: true, data: listing });
  } catch (err) {
    console.error("GetListing error:", err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
};

// -----------------------------
// CREATE LISTING (WITH IMAGES)
// -----------------------------
exports.createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, location } = req.body;

    if (!title || !price || !category || !condition) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure images exist (multer upload)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Generate full URLs (Cloudinary returns the URL in file.path)
    const imageUrls = req.files.map((file) => file.path);

    const newListing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      location,
      images: imageUrls,
      seller: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        verified: req.user.isVerifiedStudent,
      },
      views: 0,
      isAvailable: true,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: newListing });
  } catch (err) {
    console.error("CreateListing error:", err);
    res.status(500).json({ message: "Failed to create listing" });
  }
};

// -----------------------------
// UPDATE LISTING
// -----------------------------
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Handle Images
    let finalImages = listing.images; // fallback

    // If we have new files or existingImages field, we update images
    if (req.files || req.body.existingImages) {
      const newImageUrls = req.files ? req.files.map((file) => file.path) : [];
      const existingImages = req.body.existingImages ? [].concat(req.body.existingImages) : [];
      finalImages = [...existingImages, ...newImageUrls];
    }

    // Create update object
    const updateData = {
      ...req.body,
      images: finalImages
    };

    const updated = await Listing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("UpdateListing error:", err);
    res.status(500).json({ message: "Failed to update listing" });
  }
};

// -----------------------------
// DELETE LISTING
// -----------------------------
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.seller.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Listing deleted" });
  } catch (err) {
    console.error("DeleteListing error:", err);
    res.status(500).json({ message: "Failed to delete listing" });
  }
};

// -----------------------------
// MARK LISTING AS SOLD
// -----------------------------
exports.markAsSold = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Verify ownership
    if (listing.seller.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Mark as sold
    listing.isSold = true;
    listing.soldAt = new Date();
    await listing.save();

    res.json({ success: true, listing });
  } catch (err) {
    console.error("MarkAsSold error:", err);
    res.status(500).json({ message: "Failed to mark listing as sold" });
  }
};

// -----------------------------
// TOGGLE LIKE ON LISTING
// -----------------------------
exports.toggleLike = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const userId = req.user.id;

    // Initialize likedBy if it doesn't exist
    if (!listing.likedBy) listing.likedBy = [];

    const isLiked = listing.likedBy.includes(userId);

    if (isLiked) {
      // Remove like
      listing.likedBy = listing.likedBy.filter((id) => id !== userId);
      listing.likes = Math.max(0, listing.likes - 1);
    } else {
      // Add like
      listing.likedBy.push(userId);
      listing.likes += 1;
    }

    await listing.save();

    res.json({ success: true, data: { isLiked: !isLiked, likes: listing.likes } });
  } catch (err) {
    console.error("ToggleLike error:", err);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

// -----------------------------
// SELLER: GET MY LISTINGS
// -----------------------------
exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ 'seller.id': req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: listings });
  } catch (err) {
    console.error("GetMyListings error:", err);
    res.status(500).json({ message: "Failed to fetch seller listings" });
  }
};

// -----------------------------
// ADMIN: LISTING VERIFICATION
// -----------------------------
exports.getPendingListings = async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, data: listings });
  } catch (err) {
    console.error("GetPendingListings error:", err);
    res.status(500).json({ message: "Failed to fetch pending listings" });
  }
};

exports.updateListingStatus = async (req, res) => {
  try {
    const { status, comments } = req.body; // status: 'approved' | 'rejected'
    const listingId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.status = status;
    if (comments) listing.adminComments = comments;

    await listing.save();

    res.json({ success: true, data: listing });
  } catch (err) {
    console.error("UpdateListingStatus error:", err);
    res.status(500).json({ message: "Failed to update listing status" });
  }
};
