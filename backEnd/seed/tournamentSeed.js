// backend/seeders/seedTournaments.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../schemas/UserSchema.js';
import Game from '../schemas/GameSchema.js';
import LeagueModel from '../schemas/LeagueSchema.js';
import TournamentModel from '../schemas/TournamentSchema.js';
import RatingFormula from '../schemas/RatingFormulaSchema.js';
import tournamentService from '../services/tournamentService.js';

dotenv.config();

async function seedTournaments() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🎮 Starting Tournament Seeder...\n');

    // Step 1: Get or create users
    let users = await User.find().limit(10);
    
    if (users.length < 10) {
      console.log('Creating test users...');
      const userPromises = [];
      
      for (let i = users.length; i < 10; i++) {
        userPromises.push(
          User.create({
            name: `Player ${i + 1}`,
            email: `player${i + 1}@test.com`,
            password: 'password123',
            role: 'player',
            stats: {
              wins: 0,
              losses: 0,
              draws: 0,
              points: 1000
            }
          })
        );
      }
      
      const newUsers = await Promise.all(userPromises);
      users = [...users, ...newUsers];
    }
    console.log(`✅ Found/Created ${users.length} users`);

    // Step 2: Get or create a game
    let game = await Game.findOne();
    
    if (!game) {
      game = await Game.create({
        name: 'TicTacToe',
        description: 'Classic 3x3 grid strategy game',
        type: 'TicTacToe',
        minPlayers: 2,
        maxPlayers: 2,
        rules: 'Players alternate placing X and O on a 3x3 grid. First to get 3 in a row wins.',
        status: 'active'
      });
    }
    console.log(`✅ Found/Created game: ${game.name}`);

    // Step 3: Get or create rating formula
    let formula = await RatingFormula.findOne();
    
    if (!formula) {
      formula = await RatingFormula.create({
        name: 'Standard ELO',
        winnerScore: 25,
        loserScore: -15,
        drawScore: 5,
        description: 'Standard point-based rating system'
      });
    }
    console.log(`✅ Found/Created rating formula`);

    // Step 4: Create a league
    await LeagueModel.deleteMany({ name: 'Test Championship League' });
    
    const league = await LeagueModel.create({
      name: 'Test Championship League',
      description: 'A league for testing tournaments',
      owner: users[0]._id,
      game: game._id,
      ratingFormula: formula._id,
      status: 'active',
      visibility: 'public',
      tournaments: []
    });
    console.log(`✅ Created league: ${league.name}`);

    const now = new Date();
    
    // Scenario 1: Registration Open (can apply)
    console.log('\n📋 Creating Scenario 1: Open for Applications...');
    const tournament1 = await TournamentModel.create({
      name: '🏆 Spring Championship 2026',
      league: league._id,
      style: 'SingleElimination',
      maxPlayers: 8,
      applicationStartDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      applicationEndDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      playStartDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      playEndDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      status: 'open_for_applications',
      players: []
    });
    league.tournaments.push(tournament1._id);
    console.log(`   Created: ${tournament1.name} (ID: ${tournament1._id})`);
    
    // Scenario 2: Registration Closed, Ready for Auto-Kickoff
    console.log('\n⏰ Creating Scenario 2: Ready for Auto-Kickoff...');
    const tournament2 = await TournamentModel.create({
      name: '⚡ Flash Tournament',
      league: league._id,
      style: 'SingleElimination',
      maxPlayers: 8,
      applicationStartDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      applicationEndDate: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      playStartDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      playEndDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
      status: 'open_for_applications',
      players: []
    });
    league.tournaments.push(tournament2._id);
    console.log(`   Created: ${tournament2.name} (ID: ${tournament2._id})`);
    
    // Scenario 3: Upcoming (matches generated, waiting for start)
    console.log('\n🎯 Creating Scenario 3: Upcoming (Matches Ready)...');
    const playerIds3 = users.slice(0, 4).map(u => u._id);
    const tournament3 = await TournamentModel.create({
      name: '🎮 Summer Showdown',
      league: league._id,
      style: 'SingleElimination',
      maxPlayers: 8,
      applicationStartDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      applicationEndDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      playStartDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      playEndDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      status: 'open_for_applications',
      players: []
    });
    league.tournaments.push(tournament3._id);
    await tournamentService.kickoffTournamentAutomatically(tournament3._id);
    console.log(`   Created: ${tournament3.name} (ID: ${tournament3._id})`);
    
    // Scenario 4: Ready to Start
    console.log('\n🚀 Creating Scenario 4: Ready to Start...');
    const playerIds4 = users.slice(0, 4).map(u => u._id);
    const tournament4 = await TournamentModel.create({
      name: '🔥 Championship Finals',
      league: league._id,
      style: 'SingleElimination',
      maxPlayers: 8,
      applicationStartDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      applicationEndDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      playStartDate: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      playEndDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: 'open_for_applications',
      players: []
    });
    league.tournaments.push(tournament4._id);
    await tournamentService.kickoffTournamentAutomatically(tournament4._id);
    console.log(`   Created: ${tournament4.name} (ID: ${tournament4._id})`);
    
    await league.save();

    console.log('\n📊 Summary:');
    console.log(`   - Open for Applications: ${tournament1.name}`);
    console.log(`   - Ready for Kickoff: ${tournament2.name}`);
    console.log(`   - Upcoming: ${tournament3.name}`);
    console.log(`   - Ready to Start: ${tournament4.name}`);

    // Test auto-kickoff
    console.log('\n🔄 Testing auto-kickoff functionality...');
    const kickoffResults = await tournamentService.checkAndKickoffTournaments();
    console.log('Kickoff Results:', kickoffResults);

    console.log('\n✅ Tournament seeding completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error seeding tournaments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeder
seedTournaments();