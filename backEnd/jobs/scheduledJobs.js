
import cron from 'node-cron';
import tournamentService from '../services/tournamentService.js';

/**
 * Initialize all scheduled jobs
 */
export function initializeScheduledJobs() {
  
  // Run every 5 minutes: Check for tournaments to kickoff
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 Checking tournaments to kickoff...');
    try {
      const results = await tournamentService.checkAndKickoffTournaments();
      if (results.length > 0) {
        console.log(`✅ Kicked off ${results.length} tournaments`);
      }
    } catch (err) {
      console.error('❌ Error in kickoff job:', err.message);
    }
  });

  // Run every hour: Check for tournaments to start
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Checking tournaments to start...');
    try {
      const Tournament = (await import('../schemas/TournamentSchema.js')).default;
      const now = new Date();
      
      const tournamentsToStart = await Tournament.find({
        status: 'upcoming',
        playStartDate: { $lte: now }
      });
      
      for (const tournament of tournamentsToStart) {
        await tournamentService.startTournament(tournament._id);
        console.log(`✅ Started tournament: ${tournament.name}`);
      }
    } catch (err) {
      console.error('❌ Error starting tournaments:', err.message);
    }
  });

  // Run daily at midnight: Archive completed tournaments older than 30 days
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Archiving old tournaments...');
    try {
      const Tournament = (await import('../schemas/TournamentSchema.js')).default;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const oldTournaments = await Tournament.find({
        status: 'finished',
        updatedAt: { $lt: thirtyDaysAgo }
      });
      
      for (const tournament of oldTournaments) {
        await tournamentService.archiveTournament(tournament._id);
      }
      
      console.log(`✅ Archived ${oldTournaments.length} tournaments`);
    } catch (err) {
      console.error('❌ Error archiving tournaments:', err.message);
    }
  });

  // Run every hour: Complete stuck tournaments (all matches finished but tournament not marked finished)
  cron.schedule('30 * * * *', async () => {
    console.log('🔄 Checking for stuck tournaments to complete...');
    try {
      const Tournament = (await import('../schemas/TournamentSchema.js')).default;
      
      const inProgressTournaments = await Tournament.find({ 
        status: 'in-progress' 
      }).populate('matches');
      
      let completedCount = 0;
      
      for (const tournament of inProgressTournaments) {
        if (!tournament.matches || tournament.matches.length === 0) continue;
        
        const allFinished = tournament.matches.every(m => m.status === 'finished');
        
        if (allFinished) {
          console.log(`🏆 Auto-completing stuck tournament: ${tournament.name}`);
          await tournamentService.completeTournament(tournament._id);
          completedCount++;
        }
      }
      
      if (completedCount > 0) {
        console.log(`✅ Completed ${completedCount} stuck tournaments`);
      }
    } catch (err) {
      console.error('❌ Error completing stuck tournaments:', err.message);
    }
  });

  console.log('✅ Scheduled jobs initialized');
}