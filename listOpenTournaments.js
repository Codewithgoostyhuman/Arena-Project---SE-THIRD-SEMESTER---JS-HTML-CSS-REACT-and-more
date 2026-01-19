
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tournament from './backEnd/schemas/TournamentSchema.js';

dotenv.config({ path: './backEnd/.env' });

async function listOpenTournaments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const now = new Date();
    console.log('Current Server Time:', now.toISOString());

    const tournaments = await Tournament.find({
      status: 'open_for_applications'
    }).select('name applicationStartDate applicationEndDate status players maxPlayers');

    console.log(`Found ${tournaments.length} open tournaments:`);
    tournaments.forEach(t => {
      console.log('---');
      console.log(`ID: ${t._id}`);
      console.log(`Name: ${t.name}`);
      console.log(`End Date: ${t.applicationEndDate.toISOString()}`);
      console.log(`Expired: ${t.applicationEndDate <= now}`);
      console.log(`Players: ${t.players.length}/${t.maxPlayers}`);
    });

  } catch (error) {
    console.error('Error listing tournaments:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listOpenTournaments();
