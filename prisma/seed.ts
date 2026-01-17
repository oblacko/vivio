import { PrismaClient, ChallengeCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please make sure .env.local or .env file exists with DATABASE_URL');
  process.exit(1);
}

// Using PrismaPg adapter for PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

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
    {
      title: 'Глич-пробуждение',
      description: 'RGB-глич эффект с неоновыми дубликатами',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create a glitch awakening effect: Static portrait in center frame on dark background. Face starts trembling and splits into RGB layers (glitch effect). Neon duplicates fly out from behind the head. Everything collapses into a perfect, slightly filtered portrait. Cinematic video with digital glitch aesthetics and neon elements.',
    },
    {
      title: 'Эпохи в лицах',
      description: 'Переход через стили разных эпох',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create an eras transformation: Normal modern portrait. Over 10-15 seconds, the face flips through styles: 90s retro film, black and white classic, cyberpunk, anime, pixel art. End with return to original with light glow. Smooth transitions between different artistic epochs.',
    },
    {
      title: 'Аниме-трансформация',
      description: 'Превращение в аниме-персонажа',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create anime transformation: Close-up portrait with even lighting. Quick zoom into eyes, frame glitches. Person transforms into anime character/manga hero. Speed-lines, sparkles, and bouncing nickname titles appear around them. Dynamic anime aesthetic with manga elements.',
    },
    {
      title: 'Музыкальный портрет',
      description: 'Оживление от музыки с неоновыми линиями',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create music-reactive portrait: Chest-up portrait, empty background for text/particles. With each beat, head and facial expressions slightly move. Neon outline lines flash. Text or emojis fly out from behind shoulders on music accents. Rhythmic movement synchronized with music.',
    },
    {
      title: 'Фото в телефоне',
      description: 'Проваливание в экран телефона',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create phone screen dive: First, hand with phone visible, static portrait on screen. Camera dives into screen, photo comes alive - person blinks, slightly changes pose. Background behind them starts moving. Vertical elements (text, stickers) appear like in stories. Social media aesthetic.',
    },
    {
      title: 'Двойная личность',
      description: 'Разделение на две половины',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create split personality: Strict, calm portrait in center. Face smoothly splits in two: left half - business style (cold color, strict text), right half - party style (warm color, graffiti, emojis). Halves alternately take control, changing expression. Dual identity contrast.',
    },
    {
      title: 'Город в силуэте',
      description: 'Timelapse внутри силуэта',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create city within silhouette: Portrait with strong backlight for clear silhouette. Background darkens. Inside silhouette, city/neon/space timelapse appears. Eyes slightly move. Contour periodically lights up in rhythm with music. Double exposure cinematic effect.',
    },
    {
      title: 'Быстрая смена стиля',
      description: 'Переодевание под щелчок',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create quick style change: Standard portrait in simple outfit. On click/beat, circular scanner flies around. Each pass changes style: street, office, luxury, anime cosplay, sport. Face slightly turns or winks with each switch. Fast fashion transformation effect.',
    },
    {
      title: 'Шкала эмоций',
      description: 'Эмоции от 0 до 100',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create emotion scale: Close-up portrait with neutral expression. Emotion scale (0-100) slides up from bottom. Indicator runs right. Face changes expression along the way: from icy seriousness to hysterical laughter. Labels/emojis pop up above head at each stage. Emotional range visualization.',
    },
    {
      title: 'Игровой герой',
      description: 'UI видеоигры с эффектами',
      category: ChallengeCategory.FACES,
      promptTemplate: 'Create game hero interface: Portrait with space top/bottom for interface. Video game UI overlays - HP bar, nickname, level. Pixel or 3D effects of hits, magic, boosts appear around person. Hero slightly moves like game character in selection menu. Gaming aesthetic with HUD elements.',
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