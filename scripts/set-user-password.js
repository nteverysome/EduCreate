const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setUserPassword() {
  try {
    console.log('🔐 為演示用戶設置密碼...');

    const email = 'demo@example.com';
    const password = 'demo123'; // 簡單的演示密碼

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ 找不到用戶:', email);
      return;
    }

    console.log('✅ 找到用戶:', user.name, user.email);

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    // 更新用戶密碼
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log('✅ 密碼設置成功！');
    console.log('📋 登入信息：');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   用戶: ${user.name}`);

  } catch (error) {
    console.error('❌ 設置密碼失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  setUserPassword()
    .then(() => {
      console.log('✅ 腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error);
      process.exit(1);
    });
}

module.exports = { setUserPassword };
