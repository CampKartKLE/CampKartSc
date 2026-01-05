const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin'],
      default: 'customer'
    },
    sellerApplication: {
      reason: { type: String },
      category: { type: String },
      status: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
      },
      appliedAt: { type: Date },
      reviewedAt: { type: Date }
    },
    isApprovedSeller: {
      type: Boolean,
      default: false
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    campus: { type: String },
    hostel: { type: String }, // New field for hostel/block information
    password: { type: String, required: true },
    isVerifiedStudent: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
    // Notification preferences
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      messageAlerts: { type: Boolean, default: true },
      listingUpdates: { type: Boolean, default: false },
      marketingEmails: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
