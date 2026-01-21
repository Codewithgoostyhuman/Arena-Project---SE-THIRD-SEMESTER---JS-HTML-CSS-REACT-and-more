
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../schemas/UserSchema.js';
import Advertiser from '../schemas/AdvertiserSchema.js';

dotenv.config();

const debugAndFix = async () => {
    console.log("Starting Debug Script...");
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/arena-esports');
        console.log("Connected to DB");

        const user = await User.findOne({ email: 'advertiser@brand.com' });
        if (!user) {
            console.log("❌ User 'advertiser@brand.com' NOT FOUND!");
        } else {
            console.log(`✅ User found: ${user._id} | Role: ${user.role} | Status: ${user.status}`);
            console.log(`🔗 AdvertiserProfile Link: ${user.advertiserProfile}`);

            let profile = null;
            if (user.advertiserProfile) {
                profile = await Advertiser.findById(user.advertiserProfile);
                console.log(`📄 Profile Document: ${profile ? "EXISTS (" + profile._id + ")" : "MISSING"}`);
            } else {
                console.log("⚠️ User has no advertiserProfile linked.");
            }

            // FIX
            if (!profile) {
                console.log("🛠️  Creating MISSING Advertiser Profile...");
                const newProfile = await Advertiser.create({
                    user: user._id,
                    companyName: "Brand Inc.",
                    payments: 1000,
                    ads: []
                });
                
                user.advertiserProfile = newProfile._id;
                user.role = 'advertiser'; 
                await user.save();
                console.log(`✅ Fixed! Linked new profile: ${newProfile._id}`);
            } else {
                console.log("✅ Data integrity is GOOD.");
            }
        }
        process.exit(0);
    } catch (e) {
        console.error("❌ Error:", e);
        process.exit(1);
    }
};

debugAndFix();
