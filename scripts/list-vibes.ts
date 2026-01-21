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

async function listVibes() {
  try {
    console.log('🔍 Fetching all vibes from database...\n');
    
    const vibes = await prisma.vibe.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`📊 Total vibes in database: ${vibes.length}\n`);
    
    if (vibes.length === 0) {
      console.log('❌ No vibes found in database!');
      return;
    }
    
    vibes.forEach((vibe, index) => {
      console.log(`${index + 1}. "${vibe.title}"`);
      console.log(`   Category: ${vibe.category}`);
      console.log(`   Description: ${vibe.description || 'N/A'}`);
      console.log(`   Active: ${vibe.isActive ? '✅' : '❌'}`);
      console.log(`   Participants: ${vibe.participantCount}`);
      console.log(`   Tags: ${vibe.tags.map(vt => vt.tag.name).join(', ') || 'None'}`);
      console.log(`   Created: ${vibe.createdAt.toISOString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listVibes();
