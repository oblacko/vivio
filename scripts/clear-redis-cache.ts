import { createClient } from 'redis';

async function clearCache() {
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  
  if (!redisUrl) {
    console.log('⚠️  REDIS_URL not configured, skipping cache clear');
    return;
  }
  
  console.log('🔗 Connecting to Redis...');
  const client = createClient({ url: redisUrl });
  
  try {
    await client.connect();
    console.log('✅ Connected to Redis');
    
    // Удаляем кеш челленджей
    const result = await client.del('challenges');
    console.log(`🧹 Cleared cache (keys removed: ${result})`);
    
  } catch (error) {
    console.error('❌ Redis error:', error instanceof Error ? error.message : String(error));
  } finally {
    await client.disconnect();
    console.log('👋 Disconnected from Redis');
  }
}

clearCache();
