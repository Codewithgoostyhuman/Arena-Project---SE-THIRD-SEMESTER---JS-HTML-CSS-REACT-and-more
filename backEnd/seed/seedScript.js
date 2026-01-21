// backend/scripts/seedDatabase.js
// Fixed version - handles password hashing correctly
// Usage: node scripts/seedDatabase.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from "../schemas/UserSchema.js"
import Game from "../schemas/GameSchema.js"
import Advertiser from "../schemas/AdvertiserSchema.js"

dotenv.config();

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI );
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Game.deleteMany({});
        await Advertiser.deleteMany({});
        console.log('✅ Data cleared');

        // ======================
        // CREATE USERS
        // ======================
        console.log('\n👥 Creating users...');
        
        // IMPORTANT: We pass plain text password
        // The UserSchema.pre('save') middleware will hash it automatically
        const plainPassword = 'password123';

        // 1. Create Operator
        const operator = await User.create({
            name: 'Admin Operator',
            email: 'operator@arena.com',
            password: plainPassword, // Plain text - will be hashed by middleware
            role: 'operator',
            status: 'active'
        });
        console.log('✅ Created operator:', operator.email);

        // 2. Create Active Players
        const activePlayers = await User.create([
            {
                name: 'John Player',
                email: 'john@player.com',
                password: plainPassword,
                role: 'player',
                status: 'active',
                stats: {
                    wins: 15,
                    losses: 8,
                    draws: 2,
                    points: 150
                }
            },
            {
                name: 'Sarah Gamer',
                email: 'sarah@player.com',
                password: plainPassword,
                role: 'player',
                status: 'active',
                stats: {
                    wins: 22,
                    losses: 5,
                    draws: 1,
                    points: 220
                }
            },
            {
                name: 'Mike Champion',
                email: 'mike@player.com',
                password: plainPassword,
                role: 'player',
                status: 'active',
                stats: {
                    wins: 30,
                    losses: 10,
                    draws: 3,
                    points: 300
                }
            },
            {
                name: 'Emma ProGamer',
                email: 'emma@player.com',
                password: plainPassword,
                role: 'player',
                status: 'active',
                stats: {
                    wins: 18,
                    losses: 12,
                    draws: 0,
                    points: 180
                }
            }
        ]);
        console.log(`✅ Created ${activePlayers.length} active players`);

        // 3. Create Pending Players
        const pendingPlayers = await User.create([
            {
                name: 'Alex Newbie',
                email: 'alex@player.com',
                password: plainPassword,
                role: 'player',
                status: 'pending',
                stats: {
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    points: 0
                }
            },
            {
                name: 'Lisa Rookie',
                email: 'lisa@player.com',
                password: plainPassword,
                role: 'player',
                status: 'pending',
                stats: {
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    points: 0
                }
            },
            {
                name: 'Tom Beginner',
                email: 'tom@player.com',
                password: plainPassword,
                role: 'player',
                status: 'pending',
                stats: {
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    points: 0
                }
            }
        ]);
        console.log(`✅ Created ${pendingPlayers.length} pending players`);

        // 4. Create League Owners
        const leagueOwners = await User.create([
            {
                name: 'League Owner One',
                email: 'owner1@arena.com',
                password: plainPassword,
                role: 'leagueOwner',
                status: 'active',
                leagues: [],
                tournaments: []
            },
            {
                name: 'League Owner Two',
                email: 'owner2@arena.com',
                password: plainPassword,
                role: 'leagueOwner',
                status: 'active',
                leagues: [],
                tournaments: []
            }
        ]);
        console.log(`✅ Created ${leagueOwners.length} league owners`);

        // 5. Create Advertisers
        const advertiserUser = await User.create({
            name: 'Brand Advertiser',
            email: 'advertiser@brand.com',
            password: plainPassword,
            role: 'advertiser',
            status: 'active' // Changed to active for immediate testing
        });
        
        // Create linked Advertiser Profile
        const advertiserProfile = await Advertiser.create({
            user: advertiserUser._id,
            companyName: "Brand Inc.",
            payments: 1000, // Initial balance for testing
            ads: []
        });

        // Link profile to user
        advertiserUser.advertiserProfile = advertiserProfile._id;
        await advertiserUser.save();

        console.log(`✅ Created advertiser: ${advertiserUser.email}`);

        // ======================
        // CREATE GAMES
        // ======================
        console.log('\n🎮 Creating games...');
        
        const games = await Game.create([
            {
                name: 'Tic Tac Toe',
                description: 'Classic 3x3 grid game where players take turns marking spaces to get three in a row',
                type: 'TicTacToe',
                minPlayers: 2,
                maxPlayers: 2,
                rules: 'Players alternate placing X and O. First to get 3 in a row (horizontal, vertical, or diagonal) wins. If the board fills with no winner, it\'s a draw.',
                status: 'active'
            },
            {
                name: 'Rock Paper Scissors',
                description: 'Fast-paced hand game where rock beats scissors, scissors beats paper, and paper beats rock',
                type: 'RockPaperScissors',
                minPlayers: 2,
                maxPlayers: 2,
                rules: 'Both players simultaneously choose rock, paper, or scissors. Rock beats scissors, scissors beats paper, paper beats rock. Best of 3 rounds wins.',
                status: 'active'
            },
            {
                name: 'Number Guess Duel',
                description: 'Strategic guessing game where players try to predict their opponent\'s number',
                type: 'NumberGuessDuel',
                minPlayers: 2,
                maxPlayers: 2,
                rules: 'Each player picks a number (1-100). Players take turns guessing their opponent\'s number. Closest guess after 5 rounds wins.',
                status: 'active'
            },
            {
                name: 'Advanced Tic Tac Toe',
                description: 'Enhanced version of classic Tic Tac Toe with special power-ups',
                type: 'TicTacToe',
                minPlayers: 2,
                maxPlayers: 2,
                rules: 'Same as classic Tic Tac Toe but with power-ups that can clear cells or block opponent moves.',
                status: 'active'
            },
            {
                name: 'Speed Rock Paper Scissors',
                description: 'Fast-paced variant with time limits and combo bonuses',
                type: 'RockPaperScissors',
                minPlayers: 2,
                maxPlayers: 2,
                rules: 'Players must choose within 5 seconds. Win 3 rounds in a row for a bonus point. First to 7 points wins.',
                status: 'active'
            }
        ]);
        console.log(`✅ Created ${games.length} games`);

        // ======================
        // VERIFY PASSWORD HASHING
        // ======================
        console.log('\n🔐 Verifying password hashing...');
        const testUser = await User.findOne({ email: 'operator@arena.com' });
        console.log('Original password:', plainPassword);
        console.log('Stored hash starts with:', testUser.password.substring(0, 20) + '...');
        console.log('Hash length:', testUser.password.length);
        
        // Test password comparison
        const isMatch = await testUser.comparePassword(plainPassword);
        console.log('Password comparison test:', isMatch ? '✅ PASSED' : '❌ FAILED');

        // ======================
        // SUMMARY
        // ======================
        console.log('\n📊 DATABASE SEED SUMMARY');
        console.log('========================');
        
        const totalUsers = await User.countDocuments();
        const operators = await User.countDocuments({ role: 'operator' });
        const players = await User.countDocuments({ role: 'player' });
        const leagueOwnerCount = await User.countDocuments({ role: 'leagueOwner' });
        const advertiserCount = await User.countDocuments({ role: 'advertiser' });
        const activeUsers = await User.countDocuments({ status: 'active' });
        const pendingUsers = await User.countDocuments({ status: 'pending' });
        const totalGames = await Game.countDocuments();

        console.log('\n👥 USERS:');
        console.log(`   Total: ${totalUsers}`);
        console.log(`   - Operators: ${operators}`);
        console.log(`   - Players: ${players}`);
        console.log(`   - League Owners: ${leagueOwnerCount}`);
        console.log(`   - Advertisers: ${advertiserCount}`);
        console.log('\n📊 USER STATUS:');
        console.log(`   - Active: ${activeUsers}`);
        console.log(`   - Pending: ${pendingUsers}`);
        console.log('\n🎮 GAMES:');
        console.log(`   Total: ${totalGames}`);
        
        console.log('\n🔑 LOGIN CREDENTIALS');
        console.log('====================');
        console.log('\n🔧 OPERATOR:');
        console.log('   Email: operator@arena.com');
        console.log('   Password: password123');
        console.log('\n👤 PLAYERS:');
        console.log('   Email: john@player.com');
        console.log('   Password: password123');
        console.log('\n✅ All accounts use password: password123');
        console.log('\n👉 Try logging in now!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    }
};

seedDatabase();