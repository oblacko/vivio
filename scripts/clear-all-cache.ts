import { createClient } from 'redis';
import { kv } from '@vercel/kv';

async function clearLocalCache() {
  console.log('🧹 Clearing local caches...\n');

  // Очистка Redis/Vercel KV кеша
  try {
    const redisUrl = process.env.REDIS_URL;
    const kvUrl = process.env.KV_REST_API_URL;

    if (redisUrl) {
      console.log('🔗 Connecting to Redis...');
      const client = createClient({ url: redisUrl });

      try {
        await client.connect();
        console.log('✅ Connected to Redis');

        // Удаляем все кеши
        const keys = await client.keys('*');
        if (keys.length > 0) {
          const result = await client.del(keys);
          console.log(`🗑️  Cleared ${result} Redis cache keys`);
        } else {
          console.log('ℹ️  No Redis cache keys found');
        }

      } catch (error) {
        console.error('❌ Redis error:', error instanceof Error ? error.message : String(error));
      } finally {
        await client.disconnect();
        console.log('👋 Disconnected from Redis');
      }
    } else if (kvUrl) {
      console.log('🔗 Using Vercel KV...');
      // Для Vercel KV можно очистить конкретные ключи
      try {
        const keys = ['challenges:list', 'challenges:list:v2'];
        for (const key of keys) {
          await kv.del(key);
        }
        console.log('🗑️  Cleared Vercel KV cache');
      } catch (error) {
        console.error('❌ Vercel KV error:', error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log('⚠️  No Redis or KV configured, skipping cache clear');
    }
  } catch (error) {
    console.error('❌ Cache clear error:', error);
  }

  console.log('✅ Local cache clearing completed!');
}

async function clearProductionCache() {
  console.log('🌐 Clearing production caches via API...\n');

  const productionUrl = process.env.PRODUCTION_URL || process.env.VERCEL_URL;
  if (!productionUrl) {
    console.log('⚠️  PRODUCTION_URL or VERCEL_URL not set, skipping production cache clear');
    return;
  }

  try {
    const url = `https://${productionUrl.replace('https://', '')}/api/cache/clear`;
    console.log(`📡 Calling ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Добавьте авторизацию если нужно
        // 'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Production cache cleared:', result.message);
    } else {
      const error = await response.text();
      console.error('❌ Failed to clear production cache:', error);
    }
  } catch (error) {
    console.error('❌ Production cache clear error:', error);
  }
}

async function clearAllCache() {
  const isProduction = process.env.NODE_ENV === 'production';
  const clearProd = process.argv.includes('--prod') || process.argv.includes('--production');

  if (isProduction || clearProd) {
    await clearProductionCache();
  } else {
    await clearLocalCache();
    console.log('\n💡 Tip: Use --prod flag to clear production caches');
    console.log('💡 Example: npm run cache:clear -- --prod');
  }
}

clearAllCache().catch(console.error);