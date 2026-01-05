const User = require("../models/User");
const Listing = require("../models/Listing");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Get system stats
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingSellers = await User.countDocuments({ "sellerApplication.status": 'pending' });
        const pendingListings = await Listing.countDocuments({ status: 'pending' });
        const approvedListings = await Listing.countDocuments({ status: 'approved' });

        res.json({
            success: true,
            data: {
                totalUsers,
                pendingSellers,
                pendingListings,
                activeListings: approvedListings // Frontend expects activeListings
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Seller Applications Management
exports.getPendingSellers = async (req, res) => {
    try {
        const pendingSellers = await User.find({ "sellerApplication.status": 'pending' })
            .select('-password')
            .sort('-createdAt');
        res.json({ success: true, data: pendingSellers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSellerStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.sellerApplication.status = status;
        user.sellerApplication.reviewedAt = new Date();

        if (status === 'approved') {
            user.role = 'seller';
            user.isApprovedSeller = true;
        } else if (status === 'rejected') {
            user.isApprovedSeller = false;
            user.sellerApplication.reason = reason;
        }

        await user.save();
        res.json({ success: true, message: `Seller application ${status}`, data: { status, userId: user._id } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Chat Monitoring
exports.getAllConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate('participants', 'name email')
            .populate('lastMessage')
            .sort('-lastMessageAt');
        res.json({ success: true, data: conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getConversationMessages = async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id })
            .populate('sender', 'name email')
            .sort('createdAt');
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Message deleted by admin" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// User Moderation
exports.moderateUser = async (req, res) => {
    try {
        const { action, duration, reason } = req.body;
        const targetUserId = req.params.id;

        const user = await User.findById(targetUserId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        console.log(`[ADMIN ACTION] Admin ${req.user.email} performed ${action} on ${user.email}. Reason: ${reason}. Duration: ${duration || 'N/A'}`);

        if (action === 'ban') {
            user.role = 'customer';
            user.isApprovedSeller = false;
            user.sellerApplication.status = 'none';
            user.onboardingCompleted = false;
        }

        await user.save();

        res.json({
            success: true,
            message: `User ${user.name} has been ${action}ed successfully.`,
            data: { action, userId: user._id, logLine: `Action ${action} recorded by system.` }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Listing Approval
exports.getPendingListings = async (req, res) => {
    try {
        const listings = await Listing.find({ status: 'pending' }).sort('-createdAt');
        res.json({ success: true, data: listings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateListingStatus = async (req, res) => {
    try {
        const { status, comments } = req.body; // approved | rejected
        const listing = await Listing.findById(req.params.id);

        if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

        listing.status = status;
        if (comments) listing.adminComments = comments;

        await listing.save();
        res.json({ success: true, message: `Listing is now ${status}`, data: { status, listingId: listing._id } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Search user by email for moderation
exports.getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email.toLowerCase().trim() }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user }); // Fixed to return user directly as expected by frontend possibly, but plan says data: ...
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

