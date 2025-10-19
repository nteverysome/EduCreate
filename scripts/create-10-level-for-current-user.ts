import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function create10LevelFolders() {
  try {
    console.log('🚀 開始為當前用戶創建 10 層嵌套資料夾結構...\n');

    // 獲取用戶 ID（從命令行參數或環境變量）
    const userId = process.argv[2] || 'cmgt4vj1y0000jr0434tf8ipd'; // 默認使用 nteverysome@gmail.com 的 ID

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.error(`❌ 找不到用戶 ID: ${userId}`);
      return;
    }

    console.log(`✅ 使用用戶: ${user.email} (ID: ${user.id})\n`);

    // 檢查是否已經存在 10 層結構
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: '第10層',
        userId: user.id,
        type: 'ACTIVITIES',
        deletedAt: null
      }
    });

    if (existingFolder) {
      console.log('⚠️  10 層結構已經存在！');
      console.log('如果要重新創建，請先刪除現有的資料夾。\n');
      
      // 顯示現有結構
      await displayFolderStructure(user.id);
      return;
    }

    // 創建 10 層嵌套資料夾
    let parentId: string | null = null;
    let parentPath = '';
    const folderIds: string[] = [];

    for (let i = 1; i <= 10; i++) {
      const folderName = `第${i}層`;
      const depth = i - 1; // depth 從 0 開始
      const path = parentId ? `${parentPath}/${parentId}` : `/${folderName}`;

      console.log(`📁 創建資料夾: ${folderName} (深度: ${depth}, 父資料夾: ${parentId || '根目錄'})`);

      const folder = await prisma.folder.create({
        data: {
          name: folderName,
          description: `這是第 ${i} 層資料夾，用於測試 10 層嵌套功能`,
          color: getColorForLevel(i),
          icon: 'folder',
          type: 'ACTIVITIES',
          parentId: parentId,
          depth: depth,
          path: path,
          userId: user.id
        }
      });

      console.log(`  ✅ 創建成功！ID: ${folder.id}`);
      console.log(`  📍 路徑: ${folder.path}\n`);

      folderIds.push(folder.id);
      parentId = folder.id;
      parentPath = path;
    }

    console.log('🎉 10 層嵌套資料夾結構創建完成！\n');
    console.log('📊 資料夾結構：');
    console.log('根目錄');
    for (let i = 1; i <= 10; i++) {
      const indent = '  '.repeat(i);
      console.log(`${indent}└── 第${i}層`);
    }

    console.log('\n✅ 完成！現在可以在 https://edu-create.vercel.app/my-activities 測試 10 層導航功能。');

  } catch (error) {
    console.error('❌ 創建失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 顯示現有的資料夾結構
async function displayFolderStructure(userId: string) {
  const folders = await prisma.folder.findMany({
    where: {
      userId: userId,
      type: 'ACTIVITIES',
      deletedAt: null
    },
    orderBy: [
      { depth: 'asc' },
      { name: 'asc' }
    ]
  });

  console.log('📊 現有資料夾結構：\n');
  
  // 遞迴顯示資料夾樹
  function displayTree(parentId: string | null, indent: string = '') {
    const childFolders = folders.filter(f => f.parentId === parentId);
    
    childFolders.forEach((folder, index) => {
      const isLast = index === childFolders.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      const nextIndent = indent + (isLast ? '    ' : '│   ');

      console.log(`${indent}${prefix}${folder.name} (深度: ${folder.depth})`);
      displayTree(folder.id, nextIndent);
    });
  }

  console.log('根目錄');
  displayTree(null);
}

// 根據層級返回不同的顏色
function getColorForLevel(level: number): string {
  const colors = [
    '#3B82F6', // 藍色
    '#10B981', // 綠色
    '#F59E0B', // 黃色
    '#8B5CF6', // 紫色
    '#EC4899', // 粉色
    '#EF4444', // 紅色
    '#6366F1', // 靛色
    '#06B6D4', // 青色
    '#F97316', // 橙色
    '#6B7280'  // 灰色
  ];
  return colors[(level - 1) % colors.length];
}

create10LevelFolders();

