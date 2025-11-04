#!/usr/bin/env node

/**
 * 恢復被刪除的活動腳本
 * 用途：恢復被誤刪除的活動
 * 執行：node scripts/restore-deleted-activities.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreDeletedActivities() {
  console.log('🔄 開始恢復被刪除的活動...\n');

  try {
    // 1. 檢查被刪除的活動
    console.log('📊 檢查被刪除的活動...');
    const deletedActivities = await prisma.activity.findMany({
      where: { deletedAt: { not: null } },
      select: {
        id: true,
        title: true,
        deletedAt: true,
        userId: true,
        user: { select: { email: true } }
      },
      take: 10
    });

    console.log(`   找到 ${deletedActivities.length} 個被刪除的活動（顯示前 10 個）:`);
    for (const activity of deletedActivities) {
      console.log(`   - ${activity.title} (${activity.user?.email}) - 刪除於: ${activity.deletedAt}`);
    }
    console.log();

    // 2. 恢復所有被刪除的活動
    console.log('🔄 恢復所有被刪除的活動...');
    const result = await prisma.activity.updateMany({
      where: { deletedAt: { not: null } },
      data: {
        deletedAt: null,
        updatedAt: new Date()
      }
    });

    console.log(`✅ 成功恢復 ${result.count} 個活動\n`);

    // 3. 驗證恢復結果
    console.log('📊 驗證恢復結果...');
    const activeActivities = await prisma.activity.count({
      where: { deletedAt: null }
    });
    const deletedCount = await prisma.activity.count({
      where: { deletedAt: { not: null } }
    });

    console.log(`   活躍活動: ${activeActivities}`);
    console.log(`   已刪除活動: ${deletedCount}\n`);

    // 4. 按用戶統計
    console.log('📊 按用戶統計活動數量:');
    const userStats = await prisma.user.findMany({
      select: {
        email: true,
        _count: {
          select: {
            activities: true
          }
        }
      }
    });

    for (const user of userStats) {
      if (user._count.activities > 0) {
        console.log(`   ${user.email}: ${user._count.activities} 個活動`);
      }
    }
    console.log();

    console.log('✅ 恢復完成！');

  } catch (error) {
    console.error('❌ 恢復失敗:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restoreDeletedActivities();

