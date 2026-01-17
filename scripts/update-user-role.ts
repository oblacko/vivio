import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
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

async function updateUserRole() {
  const email = 'yaoblacko@gmail.com';
  
  try {
    console.log(`🔍 Searching for user: ${email}`);
    
    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }
    
    console.log(`✅ User found: ${user.name || user.email}`);
    console.log(`   Current role: ${user.role}`);
    
    if (user.role === UserRole.ADMIN) {
      console.log(`ℹ️  User is already an ADMIN`);
      return;
    }
    
    // Обновить роль на ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: UserRole.ADMIN },
    });
    
    console.log(`✅ User role updated successfully!`);
    console.log(`   New role: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
