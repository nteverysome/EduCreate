/**
 * 測試用戶密碼
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testPassword() {
  try {
    const email = 'nteverysome4@gmail.com';
    const testPassword = 'z089336161';
    
    console.log(`🔍 測試用戶: ${email}`);
    console.log(`🔑 測試密碼: ${testPassword}\n`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
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
    console.log(`   Has Password: ${user.password ? '✅ 是' : '❌ 否'}`);

    if (!user.password) {
      console.log('\n❌ 用戶沒有密碼');
      return;
    }

    console.log(`\n🔐 密碼哈希: ${user.password.substring(0, 30)}...`);

    // 測試密碼
    console.log('\n🔑 測試密碼匹配...');
    const isMatch = await bcrypt.compare(testPassword, user.password);

    if (isMatch) {
      console.log('✅ 密碼匹配成功！');
      console.log('\n📊 登入應該成功的條件檢查:');
      console.log(`   1. 用戶存在: ✅`);
      console.log(`   2. 有密碼: ✅`);
      console.log(`   3. 郵箱已驗證: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`   4. 密碼正確: ✅`);
      
      if (!user.emailVerified) {
        console.log('\n⚠️  警告: 郵箱未驗證，NextAuth 會拒絕登入');
      } else {
        console.log('\n✅ 所有條件都滿足，登入應該成功！');
      }
    } else {
      console.log('❌ 密碼不匹配！');
      console.log('\n可能的原因:');
      console.log('   1. 用戶輸入的密碼不正確');
      console.log('   2. 密碼在註冊時沒有正確保存');
      console.log('   3. 密碼哈希算法不一致');
    }

  } catch (error) {
    console.error('❌ 測試失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testPassword()
  .then(() => {
    console.log('\n✅ 測試完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 測試失敗:', error);
    process.exit(1);
  });

