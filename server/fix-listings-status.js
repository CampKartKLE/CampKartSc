const mongoose = require('mongoose');
const Listing = require('./models/Listing');
require('dotenv').config();

const migrateListings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const listings = await Listing.find({ status: { $exists: false } });
        console.log(`Found ${listings.length} listings without status.`);

        if (listings.length > 0) {
            const result = await Listing.updateMany(
                { status: { $exists: false } },
                { $set: { status: 'approved' } }
            );
            console.log(`Updated ${result.modifiedCount} listings to approved.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateListings();
