import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { kv } from '@vercel/kv';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // 1. Очистка кеша челленджей
    console.log('🧹 Clearing challenges cache...');
    try {
      await kv.del('challenges');
      console.log('✅ Cache cleared successfully\n');
    } catch (cacheError) {
      console.log('⚠️  Could not clear cache (Redis might not be configured):',
        cacheError instanceof Error ? cacheError.message : String(cacheError));
      console.log('   Continuing anyway...\n');
    }
    
    // 2. Обновление роли пользователя
    const email = 'yaoblacko@gmail.com';
    console.log(`🔍 Updating user role: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
    } else {
      console.log(`   Current role: ${user.role}`);
      
      if (user.role === UserRole.ADMIN) {
        console.log(`   ℹ️  User is already an ADMIN\n`);
      } else {
        await prisma.user.update({
          where: { email },
          data: { role: UserRole.ADMIN },
        });
        console.log(`   ✅ Role updated to ADMIN\n`);
      }
    }
    
    console.log('🎉 All done!');
    console.log('\n💡 Refresh your browser to see the new challenges');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
