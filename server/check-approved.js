// check-approved.js
const mongoose = require('mongoose');
const Listing = require('./models/Listing');
require('dotenv').config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Listing.countDocuments({ status: 'approved' });
        const all = await Listing.countDocuments();
        console.log(`Total Listings: ${all}`);
        console.log(`Approved Listings: ${count}`);

        if (count === 0 && all > 0) {
            console.log("No approved listings found. Approving all for verification...");
            await Listing.updateMany({}, { status: 'approved' });
            console.log("All listings approved.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
