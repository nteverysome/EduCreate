import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFolderParentIds() {
  try {
    console.log('🔍 檢查資料夾的 parentId 值...\n');

    // 獲取所有 activities 類型的資料夾
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
        userId: true
      },
      orderBy: {
        depth: 'asc'
      }
    });

    console.log(`📁 找到 ${folders.length} 個資料夾\n`);

    // 按深度分組
    const byDepth: Record<number, typeof folders> = {};
    folders.forEach(folder => {
      if (!byDepth[folder.depth]) {
        byDepth[folder.depth] = [];
      }
      byDepth[folder.depth].push(folder);
    });

    // 顯示每個深度的資料夾
    Object.keys(byDepth).sort((a, b) => Number(a) - Number(b)).forEach(depthStr => {
      const depth = Number(depthStr);
      const foldersAtDepth = byDepth[depth];
      
      console.log(`\n📊 深度 ${depth} (${foldersAtDepth.length} 個資料夾):`);
      console.log('─'.repeat(80));
      
      foldersAtDepth.forEach(folder => {
        console.log(`  📁 ${folder.name}`);
        console.log(`     ID: ${folder.id}`);
        console.log(`     parentId: ${folder.parentId || 'null'}`);
        console.log(`     path: ${folder.path || 'null'}`);
        console.log(`     userId: ${folder.userId}`);
        console.log('');
      });
    });

    // 檢查父子關係
    console.log('\n🔗 檢查父子關係:');
    console.log('─'.repeat(80));
    
    const foldersWithParent = folders.filter(f => f.parentId !== null);
    console.log(`\n有父資料夾的資料夾數量: ${foldersWithParent.length}`);
    
    foldersWithParent.forEach(folder => {
      const parent = folders.find(f => f.id === folder.parentId);
      if (parent) {
        console.log(`  ✅ ${folder.name} → 父資料夾: ${parent.name}`);
      } else {
        console.log(`  ❌ ${folder.name} → 父資料夾 ID ${folder.parentId} 不存在！`);
      }
    });

    const rootFolders = folders.filter(f => f.parentId === null);
    console.log(`\n根資料夾數量: ${rootFolders.length}`);
    rootFolders.forEach(folder => {
      console.log(`  🏠 ${folder.name} (depth: ${folder.depth})`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFolderParentIds();

