// scripts/fixStuckTournaments.js
// One-time script to complete tournaments that got stuck before the fix
// Run from backEnd folder: cd backEnd && node ../scripts/fixStuckTournaments.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixStuckTournaments() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://arena-database:arena-data-base-123@arena-data.cmwzvyk.mongodb.net/";
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!\n');
    
    // Import AFTER mongoose is connected so they use the same connection
    const Tournament = (await import('./schemas/TournamentSchema.js')).default;
    const tournamentService = (await import('./services/tournamentService.js')).default;
    
    console.log('🔍 Finding stuck tournaments (in-progress with all matches finished)...\n');
    
    const inProgressTournaments = await Tournament.find({ 
      status: 'in-progress' 
    }).populate('matches');
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const tournament of inProgressTournaments) {
      if (!tournament.matches || tournament.matches.length === 0) {
        console.log(`⏭️ Skipping "${tournament.name}" - No matches generated yet`);
        skippedCount++;
        continue;
      }
      
      const allFinished = tournament.matches.every(m => m.status === 'finished');
      
      if (allFinished) {
        console.log(`🏆 Completing stuck tournament: "${tournament.name}" (${tournament._id})`);
        console.log(`   - ${tournament.matches.length} matches, all finished`);
        
        try {
          await tournamentService.completeTournament(tournament._id);
          console.log(`   ✅ Completed successfully!\n`);
          fixedCount++;
        } catch (err) {
          console.error(`   ❌ Failed to complete: ${err.message}\n`);
        }
      } else {
        const finishedCount = tournament.matches.filter(m => m.status === 'finished').length;
        console.log(`⏳ "${tournament.name}" - Still active (${finishedCount}/${tournament.matches.length} matches finished)`);
        skippedCount++;
      }
    }
    
    console.log('\n========================================');
    console.log(`📊 Summary:`);
    console.log(`   - Total in-progress tournaments: ${inProgressTournaments.length}`);
    console.log(`   - Fixed (completed): ${fixedCount}`);
    console.log(`   - Skipped (still active or empty): ${skippedCount}`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixStuckTournaments();
