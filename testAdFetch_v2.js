
import mongoose from 'mongoose';
import Advertiser from './backEnd/schemas/AdvertiserSchema.js';
import User from './backEnd/schemas/UserSchema.js';
import Tournament from './backEnd/schemas/TournamentSchema.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backEnd/.env' });

async function test() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");
    
    // Find an advertiser user
    const user = await User.findOne({ role: 'advertiser' });
    if (!user) {
        console.log("❌ No advertiser user found");
        process.exit(1);
    }
    console.log("✅ Found advertiser user:", user.name, "ID:", user._id);
    console.log("Advertiser Profile ID:", user.advertiserProfile);

    const advertiser = await Advertiser.findById(user.advertiserProfile).populate('ads.tournament');
    if (!advertiser) {
        console.log("❌ Advertiser profile not found in DB");
        process.exit(1);
    }
    console.log("✅ Found advertiser profile. Ads count:", advertiser.ads.length);
    console.log("Ads Sample:", JSON.stringify(advertiser.ads.slice(0, 1), null, 2));

    process.exit(0);
  } catch (err) {
    console.error("❌ CRASH ERROR:", err);
    process.exit(1);
  }
}

test();
