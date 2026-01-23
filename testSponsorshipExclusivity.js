// testSponsorshipExclusivity.js
import mongoose from 'mongoose';
import AdvertiserDomain from './backEnd/domains/Advertiser.js';
import User from './backEnd/schemas/UserSchema.js';
import Advertiser from './backEnd/schemas/AdvertiserSchema.js';
import Tournament from './backEnd/schemas/TournamentSchema.js';
import League from './backEnd/schemas/LeagueSchema.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backEnd/.env' });

async function runTest() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Setup Data
    const league = await League.create({ name: "Exclusivity Test League" });
    const tournament = await Tournament.create({ 
      name: "Exclusive Cup", 
      league: league._id,
      style: "Single Elimination",
      status: "seeking_sponsors"
    });

    const user1 = await User.create({ name: "Ad1", email: "ad1@test.com", password: "password", role: "advertiser", status: "active" });
    const user2 = await User.create({ name: "Ad2", email: "ad2@test.com", password: "password", role: "advertiser", status: "active" });

    const adProfile1 = await Advertiser.create({ user: user1._id, companyName: "Company 1" });
    const adProfile2 = await Advertiser.create({ user: user2._id, companyName: "Company 2" });

    user1.advertiserProfile = adProfile1._id;
    await user1.save();
    user2.advertiserProfile = adProfile2._id;
    await user2.save();

    console.log("Setup complete");

    // 2. Both advertisers request exclusive sponsorship
    await AdvertiserDomain.addSponsorshipRequest(adProfile1._id, tournament._id, league._id, 1000, 'exclusive');
    await AdvertiserDomain.addSponsorshipRequest(adProfile2._id, tournament._id, league._id, 1200, 'exclusive');

    let updatedTournament = await Tournament.findById(tournament._id);
    console.log("Tournament sponsorship requests count:", updatedTournament.sponsorshipRequests.length);

    // 3. Accept Advertiser 1
    console.log("Accepting Advertiser 1...");
    // index should be 0 for adProfile1's request in his own profile
    await AdvertiserDomain.updateSponsorshipRequest(adProfile1._id, 0, 'accepted');

    // 4. Verify results
    updatedTournament = await Tournament.findById(tournament._id);
    console.log("Tournament exclusive donor:", updatedTournament.exclusiveSponsor);
    console.log("Advertiser 1 request 0 status:", updatedTournament.sponsorshipRequests[0].status);
    console.log("Advertiser 2 request 1 status (should be declined):", updatedTournament.sponsorshipRequests[1].status);

    const updatedAd2 = await Advertiser.findById(adProfile2._id);
    console.log("Advertiser 2's own record status (should be declined):", updatedAd2.sponsorshipRequests[0].status);

    // 5. Try adding a new request - should fail
    console.log("Attempting a new request for exclusive tournament...");
    try {
      await AdvertiserDomain.addSponsorshipRequest(adProfile2._id, tournament._id, league._id, 2000, 'exclusive');
      console.log("FAIL: New request should have been blocked");
    } catch (err) {
      console.log("SUCCESS: Blocked new request:", err.message);
    }

    // Cleanup
    await League.findByIdAndDelete(league._id);
    await Tournament.findByIdAndDelete(tournament._id);
    await User.deleteMany({ _id: { $in: [user1._id, user2._id] } });
    await Advertiser.deleteMany({ _id: { $in: [adProfile1._id, adProfile2._id] } });

    console.log("Test finished");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runTest();
