const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔍 檢查用戶 105965362903711325694 的資料夾系統...\n');
    
    const user = await prisma.user.findUnique({
      where: { id: '105965362903711325694' },
      include: {
        folders: {
          include: {
            activities: true
          }
        },
        activities: true
      }
    });
    
    if (user) {
      console.log('👤 用戶:', user.name);
      console.log('📊 總活動數:', user.activities.length);
      console.log('📁 總資料夾數:', user.folders.length);
      console.log('\n📋 資料夾詳情：');
      
      user.folders.forEach((folder, idx) => {
        console.log(`\n[${idx + 1}] ${folder.name}`);
        console.log('    ID:', folder.id);
        console.log('    活動數:', folder.activities.length);
        console.log('    顏色:', folder.color);
        console.log('    圖標:', folder.icon);
      });
      
      // 檢查是否有活動沒有分配到資料夾
      const activitiesInFolders = user.folders.reduce((sum, f) => sum + f.activities.length, 0);
      const unassignedActivities = user.activities.length - activitiesInFolders;
      
      console.log('\n\n📊 統計：');
      console.log('總活動數:', user.activities.length);
      console.log('資料夾中的活動:', activitiesInFolders);
      console.log('未分配的活動:', unassignedActivities);
      
      if (unassignedActivities > 0) {
        console.log('\n⚠️ 警告：有活動未分配到資料夾！');
      }
    } else {
      console.log('❌ 未找到用戶');
    }
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

