const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Admins should be promoted via CLI or DB directly.
// Usage: node promote-admin.js email@example.com
const emailArg = process.argv[2];

if (!emailArg) {
    console.log('Please provide an email: node promote-admin.js user@kletech.ac.in');
    process.exit(1);
}

const admins = [emailArg.toLowerCase().trim()];

const promoteAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        for (const email of admins) {
            const user = await User.findOne({ email: email.toLowerCase().trim() });
            if (user) {
                user.role = 'admin';
                await user.save();
                console.log(`✅ Promoted to Admin: ${email}`);
            } else {
                console.log(`⚠️ User not found (skip): ${email}`);
            }
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

promoteAdmins();
