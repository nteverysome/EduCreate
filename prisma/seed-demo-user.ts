/**
 * 演示用戶種子腳本
 * 創建一個用於演示的用戶帳號
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 開始創建演示用戶...');

  // 演示用戶密碼
  const demoPassword = 'demo123';
  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  // 創建或更新演示用戶
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@educreate.com' },
    update: {
      name: '演示用戶',
      password: hashedPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
    create: {
      email: 'demo@educreate.com',
      name: '演示用戶',
      password: hashedPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  });

  console.log('✅ 演示用戶創建成功:');
  console.log('   Email:', demoUser.email);
  console.log('   Name:', demoUser.name);
  console.log('   Password:', demoPassword);
  console.log('   ID:', demoUser.id);

  // 創建演示用戶的預設資料夾
  const activityFolder = await prisma.folder.upsert({
    where: {
      name_userId_type: {
        name: '演示活動',
        userId: demoUser.id,
        type: 'ACTIVITIES',
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      name: '演示活動',
      type: 'ACTIVITIES',
    },
  });

  console.log('✅ 演示活動資料夾創建成功:', activityFolder.name);

  const resultFolder = await prisma.folder.upsert({
    where: {
      name_userId_type: {
        name: '演示結果',
        userId: demoUser.id,
        type: 'RESULTS',
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      name: '演示結果',
      type: 'RESULTS',
    },
  });

  console.log('✅ 演示結果資料夾創建成功:', resultFolder.name);

  console.log('\n🎉 演示用戶設置完成！');
  console.log('\n📝 使用說明:');
  console.log('   1. 訪問登入頁面');
  console.log('   2. 點擊「快速演示登入」按鈕');
  console.log('   3. 系統將自動使用演示帳號登入');
  console.log('\n⚠️  注意: 演示用戶的數據可能會被定期清理');
}

main()
  .catch((e) => {
    console.error('❌ 創建演示用戶失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

