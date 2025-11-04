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
    console.log('🔧 開始修復生產環境的資料夾父子關係...\n');
    
    const devFolders = await devPrisma.folder.findMany({
      where: { userId: '105965362903711325694' }
    });
    
    console.log(`📊 準備同步 ${devFolders.length} 個資料夾的 parentId...\n`);
    
    let fixed = 0;
    let errors = 0;
    
    for (const devFolder of devFolders) {
      try {
        await prodPrisma.folder.update({
          where: { id: devFolder.id },
          data: { parentId: devFolder.parentId }
        });
        fixed++;
        
        if (fixed % 10 === 0) {
          console.log(`✅ 已修復 ${fixed} 個資料夾...`);
        }
      } catch (error) {
        console.error(`❌ 修復失敗: ${devFolder.name} (ID: ${devFolder.id})`);
        console.error(`   錯誤: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n✅ 修復完成！`);
    console.log(`   成功: ${fixed}`);
    console.log(`   失敗: ${errors}`);
    
    // 驗證修復
    console.log('\n🔍 驗證修復結果...\n');
    
    const prodFolders = await prodPrisma.folder.findMany({
      where: { userId: '105965362903711325694' }
    });
    
    let differences = 0;
    devFolders.forEach(devFolder => {
      const prodFolder = prodFolders.find(f => f.id === devFolder.id);
      if (prodFolder && devFolder.parentId !== prodFolder.parentId) {
        console.log(`⚠️  仍有差異: ${devFolder.name}`);
        console.log(`   本地: ${devFolder.parentId || '(根)'}`);
        console.log(`   生產: ${prodFolder.parentId || '(根)'}`);
        differences++;
      }
    });
    
    if (differences === 0) {
      console.log('✅ 所有資料夾的父子關係已正確同步！');
    } else {
      console.log(`\n⚠️  仍有 ${differences} 個資料夾的父子關係不正確`);
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
})();

