const { PrismaClient } = require('@prisma/client');

async function checkChallenges() {
  const prisma = new PrismaClient();

  try {
    const challenges = await prisma.challenge.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        isActive: true
      }
    });

    console.log('Challenges in DB:');
    if (challenges.length === 0) {
      console.log('No challenges found!');
    } else {
      challenges.forEach(c => {
        console.log(`ID: ${c.id}, Title: ${c.title}, Category: ${c.category}, Active: ${c.isActive}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChallenges();