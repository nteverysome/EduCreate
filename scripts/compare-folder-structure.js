const { PrismaClient } = require('@prisma/client');

// 本地開發環境
const devPrisma = new PrismaClient();

// 生產環境（Development Branch）
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

(async () => {
  try {
    console.log('🔍 比較本地開發和生產環境的資料夾結構...\n');
    
    const devFolders = await devPrisma.folder.findMany({
      where: { userId: '105965362903711325694' },
      orderBy: { id: 'asc' }
    });
    
    const prodFolders = await prodPrisma.folder.findMany({
      where: { userId: '105965362903711325694' },
      orderBy: { id: 'asc' }
    });
    
    console.log('📊 資料夾數量：');
    console.log('本地開發:', devFolders.length);
    console.log('生產環境:', prodFolders.length);
    
    if (devFolders.length !== prodFolders.length) {
      console.log('\n⚠️  資料夾數量不一致！');
    }
    
    // 檢查差異
    console.log('\n🔗 檢查父子關係差異：');
    
    let differences = 0;
    devFolders.forEach(devFolder => {
      const prodFolder = prodFolders.find(f => f.id === devFolder.id);
      if (!prodFolder) {
        console.log(`❌ 本地有但生產沒有: ${devFolder.name} (ID: ${devFolder.id})`);
        differences++;
      } else if (devFolder.parentId !== prodFolder.parentId) {
        console.log(`⚠️  父資料夾不同: ${devFolder.name}`);
        console.log(`   本地父ID: ${devFolder.parentId || '(根)'}`);
        console.log(`   生產父ID: ${prodFolder.parentId || '(根)'}`);
        differences++;
      }
    });
    
    prodFolders.forEach(prodFolder => {
      const devFolder = devFolders.find(f => f.id === prodFolder.id);
      if (!devFolder) {
        console.log(`❌ 生產有但本地沒有: ${prodFolder.name} (ID: ${prodFolder.id})`);
        differences++;
      }
    });
    
    if (differences === 0) {
      console.log('✅ 資料夾結構完全一致！');
    } else {
      console.log(`\n⚠️  發現 ${differences} 個差異`);
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
})();

