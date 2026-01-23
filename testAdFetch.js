
import mongoose from 'mongoose';
import AdvertiserDomain from './backEnd/domains/Advertiser.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backEnd/.env' });

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    
    // Find any advertiser
    const Advertiser = mongoose.model('Advertiser');
    const advertiser = await Advertiser.findOne();
    
    if (!advertiser) {
      console.log("No advertiser found");
      process.exit(0);
    }
    
    console.log("Found advertiser:", advertiser._id);
    const ads = await AdvertiserDomain.getAds(advertiser._id);
    console.log("Ads fetched successfully:", ads.length);
    
    process.exit(0);
  } catch (err) {
    console.error("CRASH ERROR:", err);
    process.exit(1);
  }
}

test();
