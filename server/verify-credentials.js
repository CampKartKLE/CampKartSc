const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const email = '01fe23bcs073@kletech.ac.in';
        const password = '123456';

        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User NOT found with email:', email);
            process.exit(0);
        }

        console.log('✅ User FOUND:', user.name);
        console.log('   ID:', user._id);
        console.log('   Current Role:', user.role);
        console.log('   Seller Status:', user.sellerApprovalStatus);
        console.log('   Is Approved Seller:', user.isApprovedSeller);

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log('✅ Password "123456" is CORRECT');
        } else {
            console.log('❌ Password "123456" is INCORRECT');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
