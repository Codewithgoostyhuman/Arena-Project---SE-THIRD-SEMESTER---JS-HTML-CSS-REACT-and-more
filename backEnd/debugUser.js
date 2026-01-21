
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../schemas/UserSchema.js';
import Advertiser from '../schemas/AdvertiserSchema.js';

dotenv.config();

const debugUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arena-esports');
        console.log("Connected to DB");

        const user = await User.findOne({ email: 'advertiser@brand.com' });
        if (!user) {
            console.log("User not found!");
        } else {
            console.log("User found:", user._id);
            console.log("User Role:", user.role);
            console.log("User AdvertiserProfile Field:", user.advertiserProfile);
            
            if (user.advertiserProfile) {
                const profile = await Advertiser.findById(user.advertiserProfile);
                console.log("Linked Profile found:", profile ? "YES" : "NO");
                console.log("Profile ID:", profile ? profile._id : "N/A");
            } else {
                console.log("User has no advertiserProfile set.");
            }
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

debugUser();
