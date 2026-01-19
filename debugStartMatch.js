
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './backEnd/schemas/MatchSchema.js';
import Game from './backEnd/schemas/GameSchema.js';
import User from './backEnd/schemas/UserSchema.js';
import League from './backEnd/schemas/LeagueSchema.js';
import matchGameService from './backEnd/services/matchService.js';

dotenv.config({ path: './backEnd/.env' });

async function debug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const matchId = '678d2348a60421fd7a840e6c'; // You might need a valid ID from the user or just find one
    // Let's find any ready match
    const match = await Match.findOne({ status: 'ready' }).populate('players game');
    
    if (!match) {
      console.log('No ready match found to debug');
      process.exit(0);
    }

    console.log('Debugging match:', match._id);
    console.log('Game Type:', match.game?.type);
    console.log('Players found:', match.players.length);

    try {
      const started = await matchGameService.startMatch(match._id);
      console.log('Successfully started match!', started._id);
    } catch (err) {
      console.error('FAILED to start match:');
      console.error(err);
    }

  } catch (error) {
    console.error('Debug script failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
