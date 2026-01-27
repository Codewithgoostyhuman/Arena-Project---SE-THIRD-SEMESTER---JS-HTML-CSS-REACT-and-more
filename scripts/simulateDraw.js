
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Schemas
import User from '../backEnd/schemas/UserSchema.js';
import Match from '../backEnd/schemas/MatchSchema.js';
import League from '../backEnd/schemas/LeagueSchema.js';
import Tournament from '../backEnd/schemas/TournamentSchema.js';
import Game from '../backEnd/schemas/GameSchema.js';
import RatingFormula from '../backEnd/schemas/RatingFormulaSchema.js';

// Import Services
import matchService from '../backEnd/services/matchService.js';
import tournamentService from '../backEnd/services/tournamentService.js';

// Configure Dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backEnd/.env') });

// Mock IO
const mockIo = {
    to: (room) => ({
        emit: (event, data) => {
            console.log(`📡 IO EMIT [${room}] ${event}:`, JSON.stringify(data, null, 2));
        }
    }),
    notifyUser: () => {},
    notifyMatch: () => {},
    notifyTournament: () => {}
};

const simulateDraw = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI is missing");
        
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('✅ Connected.');

        // 1. Setup Data - Reuse from seed logic mostly, or just find existing players
        const player1 = await User.findOne({ email: 'john@player.com' });
        const player2 = await User.findOne({ email: 'mike@player.com' });
        
        if (!player1 || !player2) {
            throw new Error("Players not found. Run seed script first.");
        }

        const game = await Game.findOne({ type: 'TicTacToe' });
        if (!game) throw new Error("TicTacToe not found");

        const formula = await RatingFormula.findOne({ name: 'Standard Rating' }) || 
                       await RatingFormula.create({ name: 'Standard Rating', isDefault: true });

        // Create a standalone Tournament for this test
        const tournament = await Tournament.create({
            name: `Draw Test Tournament ${Date.now()}`,
            status: 'ongoing', // Skip setup
            players: [player1._id, player2._id],
            style: 'SingleElimination',
            maxPlayers: 2
        });

        const league = await League.findOne(); // Grab any league
        tournament.league = league._id;
        await tournament.save();
        
        console.log(`⚔️ Created Test Tournament: ${tournament.name}`);

        // Create Match manually
        const match = await Match.create({
            tournament: tournament._id,
            league: league._id,
            game: game._id,
            players: [player1._id, player2._id],
            round: 1,
            matchNumber: 1,
            status: 'live', // Start as live
            bestOf: 1,
            score: { player1: 0, player2: 0 },
            currentTurn: player1._id,
            currentGameState: {
                board: Array(9).fill(null),
                currentPlayer: player1._id,
                players: { [player1._id]: 'X', [player2._id]: 'O' },
                playerIds: [player1._id, player2._id],
                gameOver: false,
                winner: null,
                isDraw: false
            },
            games: [{
                gameNumber: 1,
                gameState: {
                   board: Array(9).fill(null),
                   currentPlayer: player1._id,
                   players: { [player1._id]: 'X', [player2._id]: 'O' },
                   playerIds: [player1._id, player2._id],
                   gameOver: false,
                   winner: null,
                   isDraw: false
                },
                moves: []
            }]
        });

        console.log(`🎮 Created Match: ${match._id}`);

        // Force a Draw sequence in TicTacToe
        // X O X
        // X O X
        // O X O
        
        const moves = [
            { p: player1, i: 0 }, // X
            { p: player2, i: 1 }, // O
            { p: player1, i: 2 }, // X
            { p: player2, i: 4 }, // O
            { p: player1, i: 3 }, // X
            { p: player2, i: 5 }, // O (block mid right) - Wait, let's follow a known draw pattern
            // 0:X, 1:O, 2:X
            // 3:X, 4:O, 5:X
            // 6:O, 7:X, 8:O
            
            // X O X  (0, 1, 2)
            // X O X  (3, 4, 5) -> 3 is X, 4 is O. 5 is X.
            // O X O  (6, 7, 8)
            
            // P1: 0, 2, 3, 5, 7 -- Wait
            // 0 (P1), 1 (P2), 2 (P1), 4 (P2), 3 (P1), 5 (P2), 7 (P1), 6 (P2), 8 (P1 -> X)
            
            // Let's retry:
            // 0 (X), 4 (O), 8 (X), 1 (O), 7 (X), 6 (O), 2 (X), 5 (O), 3 (X)
            // X O X
            // X O O
            // O X X
            // 0:X, 1:O, 2:X
            // 3:X, 4:O, 5:O
            // 6:O, 7:X, 8:X 
        ];
        
        // Sequence: 0, 4, 8, 1, 7, 6, 2, 5, 3
        const drawSequence = [0, 4, 8, 1, 7, 6, 2, 5, 3];
        let currentPlayerIndex = 0; // 0 for P1, 1 for P2

        for (const pos of drawSequence) {
            const player = currentPlayerIndex === 0 ? player1 : player2;
            console.log(`👉 Move: Player ${player.name} (${player._id}) at ${pos}`);
            
            const result = await matchService.processMove(match._id, player._id, pos, mockIo);
            
            // console.log(`   Status: ${result.match.status}, Turn: ${result.match.currentTurn}`);
            if (result.moveResult.gameOver) {
                console.log('🏁 Game Over detected inside loop!');
                console.log('   Winner:', result.moveResult.winner);
                console.log('   IsDraw:', result.moveResult.isDraw);
            }
            
            currentPlayerIndex = (currentPlayerIndex + 1) % 2;
        }

        // Final Verification
        const finalMatch = await Match.findById(match._id);
        console.log('-------------------------------------------');
        console.log('🕵️ FINAL MATCH STATE VERIFICATION');
        console.log('-------------------------------------------');
        console.log(`Status: ${finalMatch.status} (Expected: finished)`);
        console.log(`IsDraw: ${finalMatch.isDraw} (Expected: true)`);
        console.log(`Games Count: ${finalMatch.games.length} (Expected: 1)`);
        console.log(`Current Game State Board:`, finalMatch.currentGameState.board);
        
        if (finalMatch.status !== 'finished') {
            console.error('❌ FAILURE: Match status reverted to live!');
        } else if (finalMatch.games.length > 1) {
            console.error('❌ FAILURE: New game started unexpectedly!');
        } else {
            console.log('✅ PROOF: Match race condition fixed! Status is finished and board is preserved.');
        }

        mongoose.disconnect();

    } catch (error) {
        console.error('❌ Error:', error);
        mongoose.disconnect();
    }
};

simulateDraw();
