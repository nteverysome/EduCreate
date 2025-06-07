#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Starting Prisma generation...');

// 嘗試多個可能的項目根目錄
const possibleRoots = [
  process.cwd(),
  path.resolve(__dirname, '..'),
  path.resolve(process.cwd(), '..'),
  '/vercel/path0'
];

let projectRoot = null;
let schemaPath = null;

// 尋找包含 Prisma schema 的目錄
for (const root of possibleRoots) {
  const testSchemaPath = path.join(root, 'prisma', 'schema.prisma');
  console.log(`🔍 Checking for schema at: ${testSchemaPath}`);
  
  if (fs.existsSync(testSchemaPath)) {
    projectRoot = root;
    schemaPath = testSchemaPath;
    break;
  }
}

if (!projectRoot || !schemaPath) {
  console.error('❌ Prisma schema not found in any of the expected locations:');
  possibleRoots.forEach(root => {
    console.error(`   - ${path.join(root, 'prisma', 'schema.prisma')}`);
  });
  
  // 列出當前目錄內容以幫助調試
  console.log('\n📂 Current directory contents:');
  try {
    const files = fs.readdirSync(process.cwd());
    files.forEach(file => console.log(`   - ${file}`));
  } catch (e) {
    console.log('   Unable to list directory contents');
  }
  
  process.exit(1);
}

// 切換到正確的項目根目錄
process.chdir(projectRoot);
console.log('📁 Using project root:', projectRoot);
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