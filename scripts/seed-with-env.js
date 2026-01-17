// Загрузка переменных окружения из .env.local
const fs = require('fs');
const { execSync } = require('child_process');

// Функция для парсинга .env файлов
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // Пропускаем комментарии и пустые строки
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Убираем кавычки если есть
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      process.env[key] = value;
    }
  });
}

// Загружаем .env.production (приоритетный), затем .env.local и .env
loadEnvFile('.env');
loadEnvFile('.env.local');
loadEnvFile('.env.production');

// Проверяем DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env or .env.local');
  process.exit(1);
}

console.log('✅ Environment variables loaded');

// Запускаем seed скрипт
try {
  execSync('npx tsx prisma/seed.ts', {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('❌ Seed script failed');
  process.exit(1);
}
