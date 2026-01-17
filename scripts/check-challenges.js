// Загрузка переменных окружения
const fs = require('fs');
const { execSync } = require('child_process');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    
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

loadEnvFile('.env');
loadEnvFile('.env.local');
loadEnvFile('.env.production');

console.log('✅ Environment variables loaded\n');

// Запускаем скрипт проверки
try {
  execSync('npx tsx scripts/list-challenges.ts', {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('❌ Script failed');
  process.exit(1);
}
