import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFoldersAPI() {
  try {
    console.log('🧪 測試 /api/folders GET 端點邏輯...\n');

    // 模擬 API 端點的查詢邏輯
    const type = 'activities';
    const parentId = undefined; // MoveFolderModal 不傳遞 parentId 參數

    // 構建查詢條件（這是我修改後的邏輯）
    const whereCondition: any = {
      userId: 'cmgt4vj1y0000jr0434tf8ipd', // 測試用戶 ID
      deletedAt: null,
      type: type === 'results' ? 'RESULTS' : 'ACTIVITIES',
    };

    // 只有當 parentId 參數存在時才過濾
    if (parentId !== undefined) {
      whereCondition.parentId = parentId || null;
      console.log('✅ parentId 參數存在，過濾條件:', whereCondition);
    } else {
      console.log('✅ parentId 參數不存在，不過濾 parentId');
      console.log('📋 查詢條件:', whereCondition);
    }

    // 執行查詢（使用 select 明確選擇字段）
    const folders = await prisma.folder.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        parentId: true,
        depth: true,
        path: true,
        createdAt: true,
        updatedAt: true,
        activities: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📁 查詢結果: 找到 ${folders.length} 個資料夾\n`);

    // 顯示前 10 個資料夾的詳細信息
    folders.slice(0, 10).forEach((folder, index) => {
      console.log(`${index + 1}. ${folder.name}`);
      console.log(`   ID: ${folder.id}`);
      console.log(`   parentId: ${folder.parentId || 'null'}`);
      console.log(`   depth: ${folder.depth}`);
      console.log(`   path: ${folder.path || 'null'}`);
      console.log('');
    });

    // 統計
    const withParent = folders.filter(f => f.parentId !== null);
    const withoutParent = folders.filter(f => f.parentId === null);

    console.log('📊 統計:');
    console.log(`   有 parentId 的資料夾: ${withParent.length}`);
    console.log(`   沒有 parentId 的資料夾 (根資料夾): ${withoutParent.length}`);

    // 檢查 TypeScript 類型
    console.log('\n🔍 檢查返回的對象結構:');
    if (folders.length > 0) {
      const firstFolder = folders[0];
      console.log('   Object keys:', Object.keys(firstFolder));
      console.log('   parentId 字段存在:', 'parentId' in firstFolder);
      console.log('   parentId 值:', firstFolder.parentId);
      console.log('   parentId 類型:', typeof firstFolder.parentId);
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFoldersAPI();

