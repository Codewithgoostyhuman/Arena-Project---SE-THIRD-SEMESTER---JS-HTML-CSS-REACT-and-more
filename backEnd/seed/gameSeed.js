import mongoose from "mongoose";
import Game from "../schemas/GameSchema.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/arena";

async function seedGames() {
  try {
    await mongoose.connect("mongodb+srv://arena-database:arena-data-base-123@arena-data.cmwzvyk.mongodb.net/");
    console.log("MongoDB connected");

    // Clear old games
    await Game.deleteMany({});
    console.log("Old games cleared");

    // Seed data
    const games = [
      {
        name: "Classic TicTacToe",
        description: "The traditional 3x3 TicTacToe game.",
        type: "TicTacToe",
        minPlayers: 2,
        maxPlayers: 2,
        rules: "Players take turns marking X or O. First to get 3 in a row wins."
      },
      {
        name: "Rock Paper Scissors Duel",
        description: "A quick game to test luck and strategy.",
        type: "RockPaperScissors",
        minPlayers: 2,
        maxPlayers: 2,
        rules: "Players choose Rock, Paper, or Scissors simultaneously. Rock beats Scissors, Scissors beats Paper, Paper beats Rock."
      },
      {
        name: "Number Guess Duel",
        description: "Players try to guess the opponent's number.",
        type: "NumberGuessDuel",
        minPlayers: 2,
        maxPlayers: 2,
        rules: "Each player selects a number between 1-10. The closest guess to the opponent's number wins."
      }
    ];

    const createdGames = await Game.insertMany(games);
    console.log(`Seeded ${createdGames.length} games`);

    process.exit(0);
  } catch (err) {
    console.error("Game seeding failed:", err);
    process.exit(1);
  }
}

seedGames();
