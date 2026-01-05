const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = '01fe23bcs286@kletech.ac.in';

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            process.exit(1);
        }

        console.log(`Resetting ${email} to clean customer state...`);

        // Force reset to basic customer
        user.role = 'customer';
        user.isApprovedSeller = false;
        user.sellerApplication = {
            status: 'none',
            reason: '',
            category: ''
        };
        // Ensure onboarding is complete so they don't get stuck there, 
        // but if they want to test EVERYTHING, maybe keep onboardingCompleted? 
        // The prompt says "apply for seller", which happens AFTER onboarding. 
        // So keeping onboardingCompleted = true is correct.
        user.onboardingCompleted = true;

        await user.save();

        console.log("User reset successfully. Current State:");
        console.log({
            role: user.role,
            isApprovedSeller: user.isApprovedSeller,
            appStatus: user.sellerApplication.status
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetUser();
