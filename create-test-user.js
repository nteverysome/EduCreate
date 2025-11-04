const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const prisma = new PrismaClient();
  
  try {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'demo@educreate.com' },
      update: {
        name: '演示用戶',
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date()
      },
      create: {
        email: 'demo@educreate.com',
        name: '演示用戶',
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date()
      }
    });
    
    console.log('✅ 演示用戶已創建或更新');
    console.log('📧 Email: demo@educreate.com');
    console.log('🔑 Password: demo123');
    console.log('👤 Name:', user.name);
    
  } catch (error) {
    console.error('❌ 創建用戶失敗:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

