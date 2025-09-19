// 創建無 Prisma 依賴的測試分支
const fs = require('fs');
const path = require('path');

console.log('🔧 創建無 Prisma 依賴的測試分支...');

// 1. 讀取當前 package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📍 步驟 1: 備份當前 package.json');
fs.writeFileSync(
  path.join(process.cwd(), 'package.json.backup'),
  JSON.stringify(packageJson, null, 2)
);

// 2. 移除 Prisma 相關依賴
console.log('📍 步驟 2: 移除 Prisma 相關依賴');

const prismaRelatedDeps = [
  '@prisma/client',
  'prisma'
];

let removedDeps = [];

prismaRelatedDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    removedDeps.push(dep);
    console.log(`✅ 移除依賴: ${dep}`);
  }
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    delete packageJson.devDependencies[dep];
    removedDeps.push(dep);
    console.log(`✅ 移除開發依賴: ${dep}`);
  }
});

// 3. 更新構建腳本
console.log('📍 步驟 3: 更新構建腳本');

// 移除 Prisma 相關的構建步驟
if (packageJson.scripts.build && packageJson.scripts.build.includes('prisma generate')) {
  packageJson.scripts.build = 'next build';
  console.log('✅ 更新 build 腳本移除 prisma generate');
}

if (packageJson.scripts.postinstall && packageJson.scripts.postinstall.includes('prisma generate')) {
  delete packageJson.scripts.postinstall;
  console.log('✅ 移除 postinstall 腳本');
}

// 4. 保存更新的 package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ 已更新 package.json');

// 5. 創建臨時的數據庫模擬文件
console.log('📍 步驟 4: 創建數據庫模擬文件');

const mockDbPath = path.join(process.cwd(), 'lib', 'mock-db.ts');
const mockDbContent = `// 臨時數據庫模擬 - 用於無 Prisma 測試
export const mockDb = {
  user: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-id', email: 'test@example.com' }),
    update: async () => ({ id: 'mock-id', email: 'test@example.com' }),
  },
  session: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-session', userId: 'mock-id' }),
    delete: async () => ({ id: 'mock-session' }),
  },
  account: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-account', userId: 'mock-id' }),
  },
  verificationToken: {
    findUnique: async () => null,
    create: async () => ({ identifier: 'test', token: 'mock-token' }),
    delete: async () => ({ identifier: 'test', token: 'mock-token' }),
  }
};

export default mockDb;
`;

// 確保 lib 目錄存在
const libDir = path.join(process.cwd(), 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

fs.writeFileSync(mockDbPath, mockDbContent);
console.log('✅ 已創建 mock-db.ts');

// 6. 更新 vercel.json 移除 Prisma 相關配置
console.log('📍 步驟 5: 更新 vercel.json');

const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
let vercelConfig = {};

if (fs.existsSync(vercelJsonPath)) {
  vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
}

// 移除 Prisma 相關的構建命令
if (vercelConfig.buildCommand && vercelConfig.buildCommand.includes('prisma generate')) {
  vercelConfig.buildCommand = 'next build';
  console.log('✅ 更新 vercel.json buildCommand');
}

if (vercelConfig.installCommand && vercelConfig.installCommand.includes('prisma generate')) {
  vercelConfig.installCommand = 'npm install';
  console.log('✅ 更新 vercel.json installCommand');
}

fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
console.log('✅ 已更新 vercel.json');

// 7. 創建恢復腳本
console.log('📍 步驟 6: 創建恢復腳本');

const restoreScript = `// 恢復 Prisma 依賴的腳本
const fs = require('fs');
const path = require('path');

console.log('🔄 恢復 Prisma 依賴...');

// 恢復 package.json
const backupPath = path.join(process.cwd(), 'package.json.backup');
const packageJsonPath = path.join(process.cwd(), 'package.json');

if (fs.existsSync(backupPath)) {
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  fs.writeFileSync(packageJsonPath, backupContent);
  console.log('✅ 已恢復 package.json');
  
  // 刪除備份文件
  fs.unlinkSync(backupPath);
  console.log('✅ 已刪除備份文件');
} else {
  console.log('❌ 找不到備份文件');
}

// 刪除模擬文件
const mockDbPath = path.join(process.cwd(), 'lib', 'mock-db.ts');
if (fs.existsSync(mockDbPath)) {
  fs.unlinkSync(mockDbPath);
  console.log('✅ 已刪除 mock-db.ts');
}

console.log('🎉 恢復完成！');
`;

fs.writeFileSync(path.join(process.cwd(), 'restore-prisma.js'), restoreScript);
console.log('✅ 已創建恢復腳本 restore-prisma.js');

console.log('\n🎯 無 Prisma 測試分支準備完成！');
console.log('\n📋 已完成的修改：');
console.log(`1. ✅ 移除 Prisma 依賴: ${removedDeps.join(', ')}`);
console.log('2. ✅ 更新構建腳本移除 prisma generate');
console.log('3. ✅ 創建數據庫模擬文件');
console.log('4. ✅ 更新 vercel.json 配置');
console.log('5. ✅ 創建恢復腳本');

console.log('\n🚀 下一步：');
console.log('1. 提交這些更改到新分支');
console.log('2. 推送到 GitHub 觸發 Vercel 部署');
console.log('3. 測試是否能成功部署');
console.log('4. 如果成功，說明問題確實是 Prisma 相關');
console.log('5. 使用 node restore-prisma.js 恢復原始配置');

console.log('\n⚠️ 注意：');
console.log('- 這個版本會跳過所有數據庫操作');
console.log('- 只用於測試 Vercel 部署是否成功');
console.log('- 不適合生產環境使用');
