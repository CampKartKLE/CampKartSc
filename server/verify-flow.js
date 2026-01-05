// verify-flow.js
const mongoose = require('mongoose');
const Listing = require('./models/Listing');
require('dotenv').config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Simulate getAllListings query
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let query = {};
        query.$and = [
            {
                $or: [
                    { isSold: { $ne: true } },
                    { isSold: true, soldAt: { $gte: sevenDaysAgo } },
                ],
            },
            { status: 'approved' }
        ];

        const listings = await Listing.find(query);
        console.log(`Verification: Found ${listings.length} approved listings for marketplace.`);

        if (listings.length > 0) {
            console.log("Success: Marketplace will show items.");
        } else {
            console.log("Warning: Marketplace is still empty (No approved listings).");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
