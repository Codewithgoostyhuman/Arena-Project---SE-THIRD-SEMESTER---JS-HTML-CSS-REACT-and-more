// backend/scripts/seedRatingFormulas.js
// Creates default rating formulas
// Usage: node scripts/seedRatingFormulas.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RatingFormula from '../schemas/RatingFormulaSchema.js';

dotenv.config();

const seedRatingFormulas = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arena-esports');
        console.log('✅ Connected to MongoDB\n');

        console.log('📊 Creating default rating formulas...');
        
        // Clear existing formulas (optional)
        await RatingFormula.deleteMany({});
        console.log('🗑️  Cleared existing rating formulas');

        const formulas = await RatingFormula.create([
            {
                name: 'Standard Scoring',
                description: 'Standard 3-1-0 point system (Win: 3, Draw: 1, Loss: 0)',
                winnerScore: 3,
                loserScore: 0,
                drawScore: 1,
                isDefault: true,
                status: 'active'
            },
            {
                name: 'High Stakes Scoring',
                description: 'Winner takes all - 5 points for win, 0 for everything else',
                winnerScore: 5,
                loserScore: 0,
                drawScore: 0,
                isDefault: false,
                status: 'active'
            },
            {
                name: 'Balanced Scoring',
                description: 'Balanced system with draw rewards (Win: 2, Draw: 1, Loss: 0)',
                winnerScore: 2,
                loserScore: 0,
                drawScore: 1,
                isDefault: false,
                status: 'active'
            }
        ]);

        console.log(`✅ Created ${formulas.length} rating formulas:`);
        formulas.forEach(f => {
            console.log(`   - ${f.name} (${f.isDefault ? 'DEFAULT' : 'Optional'})`);
        });

        console.log('\n✅ Rating formulas seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedRatingFormulas();