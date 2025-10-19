/**
 * 檢查用戶驗證狀態
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserVerification() {
  try {
    const email = 'nteverysome4@gmail.com';
    
    console.log(`🔍 檢查用戶: ${email}\n`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log('❌ 用戶不存在');
      return;
    }

    console.log('✅ 用戶信息:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email Verified: ${user.emailVerified ? '✅ 已驗證' : '❌ 未驗證'}`);
    console.log(`   Email Verified Date: ${user.emailVerified || 'N/A'}`);
    console.log(`   Has Password: ${user.password ? '✅ 是' : '❌ 否'}`);
    console.log(`   Created At: ${user.createdAt}`);
    console.log(`   Updated At: ${user.updatedAt}`);

    // 檢查驗證令牌
    const verificationTokens = await prisma.verificationToken.findMany({
      where: {
        identifier: email,
      },
    });

    console.log(`\n📧 驗證令牌:`);
    if (verificationTokens.length === 0) {
      console.log('   沒有找到驗證令牌（可能已被使用或過期）');
    } else {
      verificationTokens.forEach((token, index) => {
        console.log(`   令牌 ${index + 1}:`);
        console.log(`     Token: ${token.token.substring(0, 20)}...`);
        console.log(`     Expires: ${token.expires}`);
        console.log(`     Is Expired: ${token.expires < new Date() ? '是' : '否'}`);
      });
    }

  } catch (error) {
    console.error('❌ 檢查失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUserVerification()
  .then(() => {
    console.log('\n✅ 檢查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 檢查失敗:', error);
    process.exit(1);
  });

