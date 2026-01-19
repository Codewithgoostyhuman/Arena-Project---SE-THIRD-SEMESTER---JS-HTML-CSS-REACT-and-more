// Test script for auto match-making feature
// Run with: node testAutoMatchMaking.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import tournamentService from './services/tournamentService.js';
import TournamentModel from './schemas/TournamentSchema.js';
import MatchModel from './schemas/MatchSchema.js';
import User from './schemas/UserSchema.js';
import LeagueModel from './schemas/LeagueSchema.js';

async function testAutoMatchMaking() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find a tournament that is open_for_applications with expired applicationEndDate
    // Or simulate one
    const openTournaments = await TournamentModel.find({ 
      status: 'open_for_applications' 
    }).populate('league').populate('players');

    console.log(`\n📊 Found ${openTournaments.length} tournaments with status 'open_for_applications'\n`);

    if (openTournaments.length === 0) {
      console.log('No open tournaments found. Let\'s test the checkAndKickoffTournaments directly...\n');
      
      // Run the cron job function directly
      const results = await tournamentService.checkAndKickoffTournaments();
      console.log('📋 checkAndKickoffTournaments results:', JSON.stringify(results, null, 2));
    } else {
      // Show tournament details
      for (const t of openTournaments) {
        console.log(`Tournament: ${t.name}`);
        console.log(`  - Style: ${t.style}`);
        console.log(`  - Players: ${t.players.length}`);
        console.log(`  - Max Players: ${t.maxPlayers}`);
        console.log(`  - Application End: ${t.applicationEndDate}`);
        console.log(`  - Status: ${t.status}`);
        console.log('');
      }

      // Find one with past applicationEndDate
      const now = new Date();
      const expiredTournament = openTournaments.find(
        t => t.applicationEndDate && new Date(t.applicationEndDate) <= now
      );

      if (expiredTournament) {
        console.log(`\n🎯 Testing kickoff for: ${expiredTournament.name}`);
        console.log(`   Players: ${expiredTournament.players.length}`);
        
        try {
          const result = await tournamentService.kickoffTournamentAutomatically(expiredTournament._id);
          
          if (result.cancelled) {
            console.log(`\n❌ Tournament cancelled: ${result.reason}`);
          } else {
            console.log(`\n✅ Tournament started!`);
            console.log(`   Matches generated: ${result.matches.length}`);
            console.log(`   Status: ${result.tournament.status}`);
            
            // Show match details
            console.log('\n📋 Generated Matches:');
            result.matches.forEach((match, i) => {
              console.log(`   Match ${i + 1}: Round ${match.round}, Players: ${match.players.length}`);
            });
          }
        } catch (err) {
          console.log(`\n❌ Error: ${err.message}`);
        }
      } else {
        console.log('No expired tournaments found. Testing checkAndKickoffTournaments...');
        const results = await tournamentService.checkAndKickoffTournaments();
        console.log('Results:', results);
      }
    }

    // Show current match count
    const matchCount = await MatchModel.countDocuments();
    console.log(`\n📊 Total matches in database: ${matchCount}`);

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Test complete, disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAutoMatchMaking();
