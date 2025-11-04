#!/usr/bin/env node

/**
 * 數據丟失診斷腳本
 * 用途：診斷 Activity 和 Folder 數據是否丟失
 * 執行：node scripts/diagnose-data-loss.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseDataLoss() {
  console.log('🔍 開始診斷數據丟失問題...\n');

  try {
    // 1. 檢查 Activity 表
    console.log('📊 1. Activity 表統計');
    const activityStats = await prisma.activity.aggregate({
      _count: true,
    });
    const activeActivities = await prisma.activity.count({
      where: { deletedAt: null }
    });
    const deletedActivities = await prisma.activity.count({
      where: { deletedAt: { not: null } }
    });
    console.log(`   總數: ${activityStats._count}`);
    console.log(`   活躍: ${activeActivities}`);
    console.log(`   已刪除: ${deletedActivities}\n`);

    // 2. 檢查 Folder 表
    console.log('📊 2. Folder 表統計');
    const folderStats = await prisma.folder.aggregate({
      _count: true,
    });
    const activeFolders = await prisma.folder.count({
      where: { deletedAt: null }
    });
    const deletedFolders = await prisma.folder.count({
      where: { deletedAt: { not: null } }
    });
    console.log(`   總數: ${folderStats._count}`);
    console.log(`   活躍: ${activeFolders}`);
    console.log(`   已刪除: ${deletedFolders}\n`);

    // 3. 檢查每個用戶的數據
    console.log('📊 3. 每個用戶的數據統計');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            activities: true,
            folders: true
          }
        }
      }
    });

    if (users.length === 0) {
      console.log('   ⚠️ 沒有找到用戶\n');
    } else {
      for (const user of users) {
        console.log(`   ${user.email}:`);
        console.log(`     - 活動: ${user._count.activities}`);
        console.log(`     - 資料夾: ${user._count.folders}`);
      }
      console.log();
    }

    // 4. 檢查孤立的活動
    console.log('📊 4. 孤立的活動（沒有對應用戶）');
    const orphanedActivities = await prisma.activity.count({
      where: {
        userId: { notIn: (await prisma.user.findMany({ select: { id: true } })).map(u => u.id) },
        deletedAt: null
      }
    });
    console.log(`   數量: ${orphanedActivities}\n`);

    // 5. 檢查孤立的資料夾
    console.log('📊 5. 孤立的資料夾（沒有對應用戶）');
    const orphanedFolders = await prisma.folder.count({
      where: {
        userId: { notIn: (await prisma.user.findMany({ select: { id: true } })).map(u => u.id) },
        deletedAt: null
      }
    });
    console.log(`   數量: ${orphanedFolders}\n`);

    // 6. 檢查損壞的外鍵
    console.log('📊 6. 損壞的外鍵（活動指向不存在的資料夾）');
    const brokenForeignKeys = await prisma.activity.count({
      where: {
        folderId: { not: null },
        folder: null,
        deletedAt: null
      }
    });
    console.log(`   數量: ${brokenForeignKeys}\n`);

    // 7. 檢查 VocabularyItem
    console.log('📊 7. VocabularyItem 表統計');
    const vocabStats = await prisma.vocabularyItem.aggregate({
      _count: true,
    });
    console.log(`   總數: ${vocabStats._count}\n`);

    // 8. 總結
    console.log('📋 診斷總結:');
    console.log(`   ✅ Activity 表: ${activeActivities} 個活躍記錄`);
    console.log(`   ✅ Folder 表: ${activeFolders} 個活躍記錄`);
    console.log(`   ⚠️ 孤立活動: ${orphanedActivities}`);
    console.log(`   ⚠️ 孤立資料夾: ${orphanedFolders}`);
    console.log(`   ⚠️ 損壞外鍵: ${brokenForeignKeys}\n`);

    if (activeActivities === 0 && activeFolders === 0) {
      console.log('🚨 警告：沒有找到任何活躍的活動或資料夾！');
      console.log('   這可能表示數據在遷移過程中丟失了。\n');
    } else {
      console.log('✅ 數據看起來完整。\n');
    }

  } catch (error) {
    console.error('❌ 診斷失敗:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseDataLoss();

