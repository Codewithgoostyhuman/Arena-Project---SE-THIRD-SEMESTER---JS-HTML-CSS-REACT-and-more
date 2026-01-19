console.log('Script started...');
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './backEnd/schemas/MatchSchema.js';
import League from './backEnd/schemas/LeagueSchema.js';
import Tournament from './backEnd/schemas/TournamentSchema.js';
import Game from './backEnd/schemas/GameSchema.js';
import User from './backEnd/schemas/UserSchema.js';

dotenv.config({ path: './backEnd/.env' });

const matchId = '696e46f0e425ace140146a47';

async function debugMatch() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const match = await Match.findById(matchId)
            .populate('game')
            .populate('league')
            .populate('tournament')
            .populate('players');

        if (!match) {
            console.log('Match not found');
            return;
        }

        console.log('--- Match Debug Info ---');
        console.log('ID:', match._id);
        console.log('Status:', match.status);
        console.log('Game:', match.game ? {
            _id: match.game._id,
            name: match.game.name,
            type: match.game.type
        } : 'NULL');
        console.log('League:', match.league ? match.league.name : 'NULL');
        console.log('Tournament:', match.tournament ? match.tournament.name : 'NULL');
        console.log('Players:', match.players.map(p => p.name));
        console.log('Current Game State:', match.currentGameState);
        console.log('Current Turn:', match.currentTurn);
        console.log('-------------------------');

        if (!match.game) {
            console.log('CRITICAL: Game is MISSING from match!');
            // Check if league has it
            if (match.league) {
                console.log('League Game ID:', match.league.game);
            }
        }

    } catch (err) {
        console.error('Debug Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

debugMatch();
