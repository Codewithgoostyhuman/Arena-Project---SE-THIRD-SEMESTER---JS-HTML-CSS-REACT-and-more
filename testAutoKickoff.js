
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import tournamentService from './backEnd/services/tournamentService.js';

dotenv.config({ path: './backEnd/.env' });

async function testKickoff() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Checking for tournaments to kickoff...');
    const results = await tournamentService.checkAndKickoffTournaments();
    
    console.log('Kickoff Results:', JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testKickoff();
