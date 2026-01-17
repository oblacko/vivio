const fs = require('fs');
const { execSync } = require('child_process');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  content.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

// Загружаем ЛОКАЛЬНЫЕ env (не production!)
loadEnvFile('.env');
loadEnvFile('.env.local');

console.log('✅ Using LOCAL database');
console.log(`📍 Database: ${process.env.DATABASE_URL?.substring(0, 50)}...\n`);

try {
  execSync('npx tsx prisma/seed.ts', {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('❌ Seed failed');
  process.exit(1);
}
