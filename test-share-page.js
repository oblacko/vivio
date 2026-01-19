/**
 * Тестовый скрипт для проверки HTML и метатегов страницы шеринга
 * Запуск: node test-share-page.js <video-id>
 */

const videoId = process.argv[2] || 'test-video-id';
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const url = `${baseUrl}/v/${videoId}`;

console.log('\n=== ТЕСТ СТРАНИЦЫ ШЕРИНГА ===\n');
console.log('URL:', url);
console.log('Video ID:', videoId);
console.log('\n=== ГЕНЕРИРУЕМАЯ ССЫЛКА В ShareDialog ===');
console.log(`${baseUrl}/v/${videoId}`);

async function testSharePage() {
  try {
    console.log('\n=== ЗАПРОС К СТРАНИЦЕ ===\n');
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TelegramBot (like TwitterBot)',
      }
    });

    console.log('Status:', response.status);
    console.log('Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    const html = await response.text();
    
    console.log('\n=== HTML RESPONSE ===\n');
    console.log(html);

    console.log('\n=== ИЗВЛЕЧЕННЫЕ META ТЕГИ ===\n');
    
    // Извлекаем основные Open Graph теги
    const ogTags = {
      'og:title': html.match(/<meta property="og:title" content="([^"]*)"/) ?.[1],
      'og:description': html.match(/<meta property="og:description" content="([^"]*)"/) ?.[1],
      'og:image': html.match(/<meta property="og:image" content="([^"]*)"/) ?.[1],
      'og:video': html.match(/<meta property="og:video" content="([^"]*)"/) ?.[1],
      'og:type': html.match(/<meta property="og:type" content="([^"]*)"/) ?.[1],
      'og:url': html.match(/<meta property="og:url" content="([^"]*)"/) ?.[1],
    };

    for (const [key, value] of Object.entries(ogTags)) {
      console.log(`${key}: ${value || 'НЕ НАЙДЕН'}`);
    }

    // Проверяем редирект
    if (html.includes('redirect') || response.status === 307 || response.status === 308) {
      console.log('\n⚠️ ОБНАРУЖЕН РЕДИРЕКТ - метатеги могут не читаться!');
    }

    // Проверяем наличие нужных тегов
    if (!ogTags['og:image']) {
      console.log('\n❌ КРИТИЧНО: og:image НЕ НАЙДЕН! Превью не будет отображаться!');
    }

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
  }
}

// Запускаем только если есть URL
if (baseUrl.includes('localhost')) {
  console.log('\n⚠️ Запуск на localhost - убедитесь что dev сервер запущен');
  console.log('   Запустите: npm run dev\n');
} else {
  testSharePage();
}
