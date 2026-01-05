const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const admins = [
    'royalraghu53@gmail.com',
    'smkspurti@gmail.com',
    '280pu1siddharth@gmail.com',
    'harshithambanakar@gmail.com',
    'manjunathsm891@gmail.com',
    'snehacgoudar2005@gmail.com'
];

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
