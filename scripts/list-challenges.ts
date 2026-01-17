import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function listChallenges() {
  try {
    console.log('🔍 Fetching all challenges from database...\n');
    
    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`📊 Total challenges in database: ${challenges.length}\n`);
    
    if (challenges.length === 0) {
      console.log('❌ No challenges found in database!');
      return;
    }
    
    challenges.forEach((challenge, index) => {
      console.log(`${index + 1}. "${challenge.title}"`);
      console.log(`   Category: ${challenge.category}`);
      console.log(`   Description: ${challenge.description || 'N/A'}`);
      console.log(`   Active: ${challenge.isActive ? '✅' : '❌'}`);
      console.log(`   Participants: ${challenge.participantCount}`);
      console.log(`   Created: ${challenge.createdAt.toISOString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listChallenges();
