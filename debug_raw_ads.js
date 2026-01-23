
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backEnd/.env' });

async function debug() {
  try {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");
    
    const collection = mongoose.connection.db.collection('advertisers');
    const advertisers = await collection.find({}).toArray();
    
    console.log(`Found ${advertisers.length} advertisers (RAW)`);
    
    advertisers.forEach(ad => {
        console.log(`Advertiser: ${ad._id} - ${ad.companyName}`);
        if (ad.ads && ad.ads.length > 0) {
            console.log("Ads:", JSON.stringify(ad.ads, null, 2));
        } else {
            console.log("No ads.");
        }
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

debug();
