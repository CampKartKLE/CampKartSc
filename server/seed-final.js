// server/seed-final.js
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const AUTHORIZED_ADMINS = [
    "royalraghu53@gmail.com",
    "smkspurti@gmail.com",
    "280pu1siddharth@gmail.com",
    "harshithambanakar@gmail.com",
    "manjunathsm891@gmail.com",
    "snehacgoudar2005@gmail.com"
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Seed Test Student
        const studentEmail = "01fe23bcs501@kletech.ac.in";
        const hashedPassword = await bcrypt.hash("123456", 10);

        await User.findOneAndUpdate(
            { email: studentEmail },
            {
                name: "Test Student",
                email: studentEmail,
                password: hashedPassword,
                role: "customer",
                onboardingCompleted: false,
                isVerifiedStudent: true
            },
            { upsert: true, new: true }
        );
        console.log(`✅ Seeded student: ${studentEmail}`);

        // 2. Seed Admins
        for (const email of AUTHORIZED_ADMINS) {
            await User.findOneAndUpdate(
                { email: email },
                {
                    role: "admin",
                    onboardingCompleted: true
                },
                { upsert: true }
            );
            console.log(`✅ Promoted Admin: ${email}`);
        }

        console.log('Done Seeding.');
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seed();
