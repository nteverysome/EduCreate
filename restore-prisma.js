// 恢復 Prisma 依賴的腳本
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
