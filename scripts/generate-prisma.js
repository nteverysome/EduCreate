#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Starting Prisma generation...');

// 確保我們在正確的目錄中
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

console.log('📁 Current directory:', process.cwd());

// 檢查 Prisma schema 是否存在
const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Prisma schema not found at:', schemaPath);
  process.exit(1);
}

console.log('✅ Prisma schema found at:', schemaPath);

try {
  // 生成 Prisma Client
  console.log('🚀 Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true'
    }
  });
  
  console.log('✅ Prisma Client generated successfully!');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}