/**
 * Скрипт для тестирования коротких ссылок /v/[id]
 * 
 * Проверяет:
 * 1. Наличие метатегов в HTML до редиректа
 * 2. Корректность Open Graph тегов
 * 3. Работу редиректа для браузеров
 * 
 * Использование:
 * node test-short-url.js http://localhost:3000/v/VIDEO_ID
 * или
 * node test-short-url.js https://vivio.vercel.app/v/VIDEO_ID
 */

const url = process.argv[2];

if (!url) {
  console.error('❌ Укажите URL для тестирования');
  console.error('Пример: node test-short-url.js http://localhost:3000/v/VIDEO_ID');
  process.exit(1);
}

async function testShortUrl() {
  try {
    console.log('\n=== ТЕСТИРОВАНИЕ КОРОТКОЙ ССЫЛКИ ===\n');
    console.log(`URL: ${url}\n`);
    
    // Тест 1: Проверка метатегов для ботов
    console.log('📝 Тест 1: Метатеги для ботов (TelegramBot User-Agent)');
    console.log('─────────────────────────────────────────────────');
    
    const botResponse = await fetch(url, {
      headers: {
        'User-Agent': 'TelegramBot (like TwitterBot)',
      },
      redirect: 'manual' // Не следуем редиректам автоматически
    });

    console.log(`Status: ${botResponse.status}`);
    
    if (botResponse.status >= 300 && botResponse.status < 400) {
      const location = botResponse.headers.get('location');
      console.log(`⚠️  Получен HTTP редирект на: ${location}`);
      console.log('⚠️  Боты не увидят метатеги при HTTP редиректе!');
    } else {
      console.log('✅ Нет HTTP редиректа - боты смогут прочитать метатеги');
    }

    const html = await botResponse.text();
    
    // Извлекаем метатеги
    const metaTags = {
      'og:title': html.match(/<meta property="og:title" content="([^"]*)"/) ?.[1],
      'og:description': html.match(/<meta property="og:description" content="([^"]*)"/) ?.[1],
      'og:image': html.match(/<meta property="og:image" content="([^"]*)"/) ?.[1],
      'og:video': html.match(/<meta property="og:video" content="([^"]*)"/) ?.[1],
      'og:type': html.match(/<meta property="og:type" content="([^"]*)"/) ?.[1],
      'og:url': html.match(/<meta property="og:url" content="([^"]*)"/) ?.[1],
      'twitter:card': html.match(/<meta name="twitter:card" content="([^"]*)"/) ?.[1],
      'twitter:player': html.match(/<meta name="twitter:player" content="([^"]*)"/) ?.[1],
    };

    console.log('\n📋 Найденные метатеги:');
    for (const [key, value] of Object.entries(metaTags)) {
      if (value) {
        console.log(`  ✅ ${key}: ${value.substring(0, 80)}${value.length > 80 ? '...' : ''}`);
      } else {
        console.log(`  ❌ ${key}: НЕ НАЙДЕН`);
      }
    }

    // Тест 2: Проверка редиректа для пользователей
    console.log('\n🌐 Тест 2: Редирект для пользователей (браузер)');
    console.log('─────────────────────────────────────────────────');
    
    const browserResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow' // Следуем редиректам
    });

    console.log(`Final URL: ${browserResponse.url}`);
    
    if (browserResponse.url !== url) {
      console.log('✅ Редирект работает');
    } else {
      console.log('⚠️  Редирект не сработал');
    }

    // Тест 3: Валидация метатегов
    console.log('\n🔍 Тест 3: Валидация метатегов');
    console.log('─────────────────────────────────────────────────');
    
    const requiredTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
    const missingTags = requiredTags.filter(tag => !metaTags[tag]);
    
    if (missingTags.length === 0) {
      console.log('✅ Все обязательные метатеги присутствуют');
    } else {
      console.log(`❌ Отсутствуют метатеги: ${missingTags.join(', ')}`);
    }

    // Проверка размеров изображения
    if (metaTags['og:image']) {
      const imageWidth = html.match(/<meta property="og:image:width" content="(\d+)"/) ?.[1];
      const imageHeight = html.match(/<meta property="og:image:height" content="(\d+)"/) ?.[1];
      
      if (imageWidth && imageHeight) {
        console.log(`✅ Размеры изображения: ${imageWidth}x${imageHeight}`);
        if (imageWidth >= 1200 && imageHeight >= 630) {
          console.log('✅ Размеры соответствуют рекомендациям (минимум 1200x630)');
        } else {
          console.log('⚠️  Размеры меньше рекомендуемых (1200x630)');
        }
      }
    }

    // Итоги
    console.log('\n📊 ИТОГИ');
    console.log('─────────────────────────────────────────────────');
    
    const hasRequiredTags = missingTags.length === 0;
    const hasNoHttpRedirect = botResponse.status === 200;
    const redirectWorks = browserResponse.url !== url;
    
    if (hasRequiredTags && hasNoHttpRedirect && redirectWorks) {
      console.log('✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
      console.log('   - Метатеги присутствуют');
      console.log('   - Боты могут их прочитать');
      console.log('   - Редирект работает для пользователей');
    } else {
      console.log('⚠️  ЕСТЬ ПРОБЛЕМЫ:');
      if (!hasRequiredTags) console.log('   ❌ Не все метатеги присутствуют');
      if (!hasNoHttpRedirect) console.log('   ❌ HTTP редирект блокирует чтение метатегов');
      if (!redirectWorks) console.log('   ❌ Редирект не работает');
    }

    console.log('\n💡 СЛЕДУЮЩИЕ ШАГИ:');
    console.log('─────────────────────────────────────────────────');
    console.log('1. Проверьте в Facebook Debugger: https://developers.facebook.com/tools/debug/');
    console.log('2. Проверьте в Twitter Card Validator: https://cards-dev.twitter.com/validator');
    console.log('3. Отправьте ссылку в Telegram для проверки превью');
    console.log('4. Проверьте в VK (вставьте ссылку в пост)');
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    process.exit(1);
  }
}

testShortUrl();
