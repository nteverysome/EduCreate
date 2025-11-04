const { PrismaClient } = require('@prisma/client');

async function checkUser() {
  const prisma = new PrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@educreate.com' }
    });
    
    if (user) {
      console.log('✅ 用戶已找到');
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🔑 Has Password:', !!user.password);
      console.log('✉️ Email Verified:', user.emailVerified);
      console.log('🎭 Role:', user.role);
      console.log('📅 Created At:', user.createdAt);
    } else {
      console.log('❌ 用戶不存在');
    }
    
  } catch (error) {
    console.error('❌ 查詢失敗:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

