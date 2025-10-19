import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeFolderHierarchy() {
  try {
    console.log('📊 分析資料夾層級結構...\n');

    // 獲取所有資料夾
    const folders = await prisma.folder.findMany({
      where: {
        type: 'ACTIVITIES',
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        depth: true,
        path: true,
        userId: true,
        _count: {
          select: {
            activities: true,
            children: true
          }
        }
      },
      orderBy: [
        { depth: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`✅ 找到 ${folders.length} 個資料夾\n`);

    // 按層級分組
    const foldersByDepth: { [key: number]: typeof folders } = {};
    folders.forEach(folder => {
      if (!foldersByDepth[folder.depth]) {
        foldersByDepth[folder.depth] = [];
      }
      foldersByDepth[folder.depth].push(folder);
    });

    // 顯示層級統計
    console.log('📈 層級統計：');
    Object.keys(foldersByDepth).sort((a, b) => Number(a) - Number(b)).forEach(depth => {
      const count = foldersByDepth[Number(depth)].length;
      console.log(`  第 ${depth} 層：${count} 個資料夾`);
    });
    console.log('');

    // 顯示詳細的資料夾樹狀結構
    console.log('🌳 資料夾樹狀結構：\n');

    // 遞迴顯示資料夾樹
    function displayFolderTree(parentId: string | null, indent: string = '') {
      const childFolders = folders.filter(f => f.parentId === parentId);
      
      childFolders.forEach((folder, index) => {
        const isLast = index === childFolders.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        const nextIndent = indent + (isLast ? '    ' : '│   ');

        console.log(`${indent}${prefix}${folder.name} (深度: ${folder.depth}, 活動: ${folder._count.activities}, 子資料夾: ${folder._count.children})`);
        console.log(`${indent}${isLast ? '    ' : '│   '}ID: ${folder.id}`);
        console.log(`${indent}${isLast ? '    ' : '│   '}路徑: ${folder.path || '/'}`);

        // 遞迴顯示子資料夾
        displayFolderTree(folder.id, nextIndent);
      });
    }

    // 從根目錄開始顯示
    displayFolderTree(null);

    console.log('\n📋 詳細資料夾列表：\n');
    folders.forEach(folder => {
      console.log(`名稱: ${folder.name}`);
      console.log(`  ID: ${folder.id}`);
      console.log(`  父資料夾 ID: ${folder.parentId || '(根目錄)'}`);
      console.log(`  深度: ${folder.depth}`);
      console.log(`  路徑: ${folder.path || '/'}`);
      console.log(`  活動數量: ${folder._count.activities}`);
      console.log(`  子資料夾數量: ${folder._count.children}`);
      console.log('');
    });

    // 檢查是否有孤立的資料夾（parentId 指向不存在的資料夾）
    console.log('🔍 檢查孤立資料夾：\n');
    const folderIds = new Set(folders.map(f => f.id));
    const orphanedFolders = folders.filter(f => 
      f.parentId && !folderIds.has(f.parentId)
    );

    if (orphanedFolders.length > 0) {
      console.log(`⚠️  發現 ${orphanedFolders.length} 個孤立資料夾：`);
      orphanedFolders.forEach(folder => {
        console.log(`  - ${folder.name} (ID: ${folder.id}, 父 ID: ${folder.parentId})`);
      });
    } else {
      console.log('✅ 沒有孤立資料夾');
    }

    console.log('\n✅ 分析完成！');

  } catch (error) {
    console.error('❌ 分析失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeFolderHierarchy();

