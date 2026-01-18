import mongoose from 'mongoose';
import Match from '../schemas/MatchSchema.js';
import User from '../schemas/UserSchema.js';
import Game from '../schemas/GameSchema.js';
import Tournament from '../schemas/TournamentSchema.js';
import dotenv from 'dotenv';

dotenv.config();

const seedMatches = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get some users and games
    const users = await User.find().limit(4);
    const ticTacToeGame = await Game.findOne({ type: 'TicTacToe' });
    const RPS = await Game.findOne({type:'RockPaperScissors'});
    const numberGuess = await Game.findOne({type:"NumberGuessDuel"})
    const tournament = await Tournament.findOne();

    if (users.length < 2 || !ticTacToeGame) {
      console.log('Need at least 2 users and TicTacToe game in database');
      process.exit(1);
    }

    // Delete old matches
    await Match.deleteMany({});
    console.log('Cleared old matches');

    // Create new matches
    const matches = [
      {
        tournament: tournament?._id,
        game: ticTacToeGame._id,
        players: [users[2]._id, users[3]._id],
        round: 1,
        matchNumber: 1,
        status: 'live',
        bestOf: 3,
        score: { player1: 0, player2: 0 }
      },
      {
        tournament: tournament?._id,
        game: numberGuess._id,
        players: [users[2]._id, users[3]._id],
        round: 1,
        matchNumber: 2,
        status: 'live',
        bestOf: 3,
        score: { player1: 0, player2: 0 }
      }
    ];

    const createdMatches = await Match.insertMany(matches);
    console.log(`✅ Created ${createdMatches.length} matches`);
    
    createdMatches.forEach(match => {
      console.log(`Match ${match.matchNumber}: ${match._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding matches:', error);
    process.exit(1);
  }
};

seedMatches();