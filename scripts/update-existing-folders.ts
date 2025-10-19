/**
 * 更新現有資料夾的 depth 和 path 字段
 * 
 * 這個腳本會：
 * 1. 將所有現有資料夾的 depth 設置為 0（根目錄）
 * 2. 將所有現有資料夾的 path 設置為 '/' + folderId
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingFolders() {
  try {
    console.log('🔄 開始更新現有資料夾...');

    // 獲取所有資料夾
    const folders = await prisma.folder.findMany({
      where: {
        parentId: null // 只處理根目錄資料夾
      }
    });

    console.log(`📁 找到 ${folders.length} 個根目錄資料夾`);

    // 更新每個資料夾
    let updatedCount = 0;
    for (const folder of folders) {
      await prisma.folder.update({
        where: { id: folder.id },
        data: {
          depth: 0,
          path: `/${folder.id}`
        }
      });
      updatedCount++;
      console.log(`✅ 已更新資料夾: ${folder.name} (${updatedCount}/${folders.length})`);
    }

    console.log(`\n🎉 成功更新 ${updatedCount} 個資料夾！`);
  } catch (error) {
    console.error('❌ 更新失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行腳本
updateExistingFolders()
  .then(() => {
    console.log('✅ 腳本執行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 腳本執行失敗:', error);
    process.exit(1);
  });

