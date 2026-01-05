const User = require("../models/User");
const Listing = require("../models/Listing");

// -----------------------------
// TOGGLE WISHLIST ITEM
// -----------------------------
exports.toggleWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const listingId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Ensure listing exists (optional but good practice)
        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ message: "Listing not found" });

        const isFavorited = user.wishlist.includes(listingId);

        if (isFavorited) {
            // Remove
            user.wishlist = user.wishlist.filter((id) => id.toString() !== listingId);
        } else {
            // Add
            user.wishlist.push(listingId);
        }

        await user.save();

        res.json({ success: true, data: { wishlist: user.wishlist, isFavorited: !isFavorited } });
    } catch (err) {
        console.error("ToggleWishlist error:", err);
        res.status(500).json({ message: "Failed to update wishlist" });
    }
};

// -----------------------------
// GET WISHLIST
// -----------------------------
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("wishlist");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ success: true, data: user.wishlist });
    } catch (err) {
        console.error("GetWishlist error:", err);
        res.status(500).json({ message: "Failed to fetch wishlist" });
    }
};

// -----------------------------
// UPDATE USER PROFILE
// -----------------------------
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, campus, hostel } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update fields
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (campus !== undefined) user.campus = campus;
        if (hostel !== undefined) user.hostel = hostel;

        await user.save();

        // Return sanitized user (without password)
        const { password, ...sanitizedUser } = user.toObject();
        res.json({ success: true, data: { user: sanitizedUser } });
    } catch (err) {
        console.error("UpdateProfile error:", err);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

// -----------------------------
// UPDATE NOTIFICATION PREFERENCES
// -----------------------------
exports.updateNotificationPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notifications } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update notification preferences
        if (notifications) {
            user.notifications = {
                ...user.notifications,
                ...notifications,
            };
        }

        await user.save();

        res.json({ success: true, data: { notifications: user.notifications } });
    } catch (err) {
        console.error("UpdateNotificationPreferences error:", err);
        res.status(500).json({ message: "Failed to update notification preferences" });
    }
};

// -----------------------------
// CHANGE PASSWORD
// -----------------------------
const bcrypt = require("bcryptjs");

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new passwords are required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.json({ success: true, message: "Password changed successfully" });
    } catch (err) {
        console.error("ChangePassword error:", err);
        res.status(500).json({ message: "Failed to change password" });
    }
};
// -----------------------------
// SELLER APPLICATION SYSTEM
// -----------------------------
exports.applyToBeSeller = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.role === 'seller' || user.isApprovedSeller) {
            return res.status(400).json({ success: false, message: "You are already an approved seller" });
        }

        // SUBMIT FOR APPROVAL
        user.sellerApplication = {
            reason: req.body.reason,
            category: req.body.category,
            status: 'pending',
            appliedAt: new Date()
        };

        // user.role stays 'customer' until approved
        user.isApprovedSeller = false;
        user.onboardingCompleted = true; // Completes onboarding process

        await user.save();

        res.json({
            success: true,
            message: "Application submitted for admin review!",
            data: { status: user.sellerApplication.status }
        });
    } catch (err) {
        console.error("ApplyToBeSeller error:", err);
        res.status(500).json({ success: false, message: "Failed to submit seller application" });
    }
};

// -----------------------------
// COMPLETE ONBOARDING
// -----------------------------
exports.completeOnboarding = async (req, res) => {
    try {
        const { role } = req.body; // 'customer' or 'seller' (pending)
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.onboardingCompleted = true;

        if (role === 'customer') {
            user.role = 'customer';
        }
        // If role is 'seller', we expect them to fill application immediately or later, 
        // but for now we mark onboarding as done so they don't see the screen again.

        await user.save();

        res.json({
            success: true,
            message: "Onboarding completed",
            data: {
                id: user._id,
                role: user.role,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (err) {
        console.error("CompleteOnboarding error:", err);
        res.status(500).json({ success: false, message: "Failed to complete onboarding" });
    }
};
// -----------------------------
// SET ROLE (Step 1 of Onboarding)
// -----------------------------
exports.setRole = async (req, res) => {
    try {
        const { role } = req.body; // 'customer' or 'seller'
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (role === 'customer') {
            user.role = 'customer';
            user.onboardingCompleted = true;
            // Clear any old stuck application potentially
            if (user.sellerApplication && user.sellerApplication.status === 'none') {
                user.sellerApplication.status = 'none';
            }
        } else if (role === 'seller') {
            // They are applying to be a seller
            // We set status to pending immediately so they see the "Pending" dashboard
            // validation of reason/category can happen in a separate step or we assume defaults for now
            // But prompt implies "Apply as Seller" -> Pending.

            user.role = 'customer'; // Role stays customer until approved
            user.onboardingCompleted = true;

            // Only set to pending if not already participating
            if (!user.sellerApplication || user.sellerApplication.status === 'none') {
                user.sellerApplication = {
                    status: 'pending',
                    appliedAt: new Date(),
                    reason: "Initial Application via Role Selection", // Default
                    category: "General" // Default
                };
            }
        } else {
            return res.status(400).json({ success: false, message: "Invalid role selection" });
        }

        await user.save();

        res.json({
            success: true,
            message: "Role updated successfully",
            data: {
                id: user._id,
                role: user.role,
                sellerApplication: user.sellerApplication,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (err) {
        console.error("SetRole error:", err);
        res.status(500).json({ success: false, message: "Failed to set role" });
    }
};
