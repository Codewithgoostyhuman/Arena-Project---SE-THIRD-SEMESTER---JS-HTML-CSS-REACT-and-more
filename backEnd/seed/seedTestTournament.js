console.log('🏁 Script started');
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Schemas
import User from '../schemas/UserSchema.js';
import League from '../schemas/LeagueSchema.js';
import Tournament from '../schemas/TournamentSchema.js';
import Game from '../schemas/GameSchema.js';
import Match from '../schemas/MatchSchema.js';
import RatingFormula from '../schemas/RatingFormulaSchema.js';
import Application from '../schemas/ApplicationSchema.js';

// Import Service
import tournamentService from '../services/tournamentService.js';

// Configure Dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedTestTournament = async () => {
    try {
        const uri = process.env.MONGO_URI;
        console.log('🔌 Connecting to MongoDB...');
        console.log('URI:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'undefined');
        
        await mongoose.connect(uri);
        console.log('✅ Connected.');
        console.log('State:', mongoose.connection.readyState);

        // 1. Find Users
        const owner = await User.findOne({ email: 'owner1@arena.com' });
        const player1 = await User.findOne({ email: 'john@player.com' });
        const player2 = await User.findOne({ email: 'mike@player.com' });

        if (!owner || !player1 || !player2) {
            console.error('❌ Missing users. Please run the main seed script first: node backEnd/seed/seedScript.js');
            process.exit(1);
        }

        console.log('👥 Found Users:', {
            owner: owner.name,
            player1: player1.name,
            player2: player2.name
        });

        // 2. Find Game
        const game = await Game.findOne({ type: 'TicTacToe' });
        if (!game) {
            throw new Error('TicTacToe game not found');
        }
        console.log('🎮 Found Game:', game.name);

        // 3. Find or Create Rating Formula
        let formula = await RatingFormula.findOne({ name: 'Standard Rating' });
        if (!formula) {
            console.log('📊 Creating default Rating Formula...');
            formula = await RatingFormula.create({
                name: 'Standard Rating',
                description: 'Standard W/D/L: 3/1/0',
                winnerScore: 3,
                drawScore: 1,
                loserScore: 0,
                isDefault: true
            });
        }
        console.log('📊 Rating Formula:', formula.name);

        // 4. Find or Create League
        let league = await League.findOne({ 
            owner: owner._id, 
            name: 'Test League Check' 
        });

        if (!league) {
            console.log('🏆 Creating new League...');
            league = await League.create({
                name: 'Test League Check',
                description: 'League for testing winner announcement',
                owner: owner._id,
                game: game._id,
                ratingFormula: formula._id,
                status: 'active',
                type: 'public',
                region: 'Global'
            });
        }
        console.log('🏆 League Ready:', league.name);

        // 5. Create Tournament
        console.log('⚔️ Creating Tournament...');
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);

        const tournament = new Tournament({
            name: `Winner Test Tournament ${Date.now()}`,
            league: league._id,
            style: 'SingleElimination',
            maxPlayers: 2,
            playStartDate: startDate,
            playEndDate: endDate,
            applicationStartDate: startDate,
            applicationEndDate: endDate,
            status: 'open_for_applications',
            players: [],
            visibility: 'public'
        });
        await tournament.save();
        
        // Add tournament to league
        league.tournaments.push(tournament._id);
        await league.save();

        console.log('⚔️ Tournament Created:', tournament.name);

        // 6. Register Players (Applications)
        console.log('📝 Registering Players...');
        
        const app1 = await Application.create({
            user: player1._id,
            target: tournament._id,
            targetType: 'Tournament',
            message: 'Let me in',
            status: 'pending'
        });

        const app2 = await Application.create({
            user: player2._id,
            target: tournament._id,
            targetType: 'Tournament',
            message: 'I want to win',
            status: 'pending'
        });
        
        tournament.applications.push(app1._id);
        tournament.applications.push(app2._id);

        await tournament.save();
        console.log('📝 Applications Registered');

        // 7. Kickoff Tournament
        console.log('🚀 Kicking off Tournament...');
        
        const result = await tournamentService.kickoffTournamentAutomatically(tournament._id);
        
        if (result.cancelled) {
            console.error('❌ Kickoff Cancelled:', result.reason);
        } else {
            console.log('✅ Kickoff Successful!');
            console.log('-------------------------------------------');
            console.log('🎉 TOURNAMENT READY FOR TESTING');
            console.log('-------------------------------------------');
            console.log(`Tournament ID: ${result.tournament._id}`);
            console.log(`Tournament Name: ${result.tournament.name}`);
            console.log(`Status: ${result.tournament.status}`);
            console.log(`Matches Generated: ${result.matches.length}`);
            console.log('-------------------------------------------');
            console.log(`👉 Login as ${player1.email} or ${player2.email} to play.`);
            console.log(`👉 The tournament should be LIVE and visible in "My Tournaments".`);
            
            mongoose.disconnect();
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding test tournament:', error);
        console.error(error);
        process.exit(1);
    }
};

seedTestTournament();
