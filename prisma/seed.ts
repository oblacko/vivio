import { PrismaClient, ChallengeCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Создание базовых челленджей для каждой категории
  const challenges = [
    {
      title: 'Монументы в движении',
      description: 'Создайте видео, где архитектурные шедевры оживают',
      category: ChallengeCategory.MONUMENTS,
      promptTemplate: 'Transform this monument into a living, breathing entity with dynamic movement and flowing energy. Create a cinematic video where the architecture comes alive with graceful, fluid motion.',
    },
    {
      title: 'Питомцы в приключениях',
      description: 'Превратите фото питомца в эпическое приключение',
      category: ChallengeCategory.PETS,
      promptTemplate: 'Transform this pet into an adventurous hero on an epic journey. Create a dynamic video where the animal becomes the star of an action-packed adventure with dramatic movements and exciting scenes.',
    },
    {
      title: 'Лица с характером',
      description: 'Оживите портреты с уникальной индивидуальностью',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Bring this portrait to life with expressive emotions and dynamic facial movements. Create a cinematic video where the person comes alive with subtle yet powerful expressions and natural gestures.',
    },
    {
      title: 'Сезонные чудеса',
      description: 'Магия времен года в динамике',
      category: ChallengeCategory.SEASONAL,
      promptTemplate: 'Transform this seasonal scene into a magical, dynamic experience. Create a video where the elements of the season come alive with flowing movements, changing colors, and natural transitions.',
    },
  ];

  for (const challenge of challenges) {
    const existingChallenge = await prisma.challenge.findFirst({
      where: { title: challenge.title },
    });

    if (!existingChallenge) {
      await prisma.challenge.create({
        data: challenge,
      });
      console.log(`✅ Created challenge: ${challenge.title}`);
    } else {
      console.log(`⚠️  Challenge already exists: ${challenge.title}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });