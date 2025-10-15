const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateFolderTypes() {
  console.log('🚀 开始迁移资料夹类型...');

  try {
    // 1. 查找所有资料夹
    const folders = await prisma.folder.findMany({
      include: {
        activities: true,
        results: true
      }
    });

    console.log(`📁 找到 ${folders.length} 个资料夹需要处理`);

    let activitiesCount = 0;
    let resultsCount = 0;
    let mixedCount = 0;

    for (const folder of folders) {
      const hasActivities = folder.activities.length > 0;
      const hasResults = folder.results.length > 0;

      let newType;
      let reason;

      if (hasActivities && hasResults) {
        // 两者都有，优先设置为 ACTIVITIES
        newType = 'ACTIVITIES';
        reason = '包含活动和结果，优先设置为活动类型';
        mixedCount++;
      } else if (hasActivities) {
        // 只有活动
        newType = 'ACTIVITIES';
        reason = '只包含活动';
        activitiesCount++;
      } else if (hasResults) {
        // 只有结果
        newType = 'RESULTS';
        reason = '只包含结果';
        resultsCount++;
      } else {
        // 空资料夹，根据名称判断
        if (folder.name.includes('结果') || folder.name.includes('結果') || folder.name.includes('result')) {
          newType = 'RESULTS';
          reason = '空资料夹，根据名称判断为结果类型';
          resultsCount++;
        } else {
          newType = 'ACTIVITIES';
          reason = '空资料夹，默认为活动类型';
          activitiesCount++;
        }
      }

      // 更新资料夹类型
      await prisma.folder.update({
        where: { id: folder.id },
        data: { type: newType }
      });

      console.log(`✅ 更新资料夹 "${folder.name}" -> ${newType} (${reason})`);
    }

    console.log('\n📊 迁移统计：');
    console.log(`- ACTIVITIES 类型: ${activitiesCount} 个`);
    console.log(`- RESULTS 类型: ${resultsCount} 个`);
    console.log(`- 混合类型 (设为 ACTIVITIES): ${mixedCount} 个`);
    console.log(`- 总计: ${folders.length} 个`);

    console.log('\n🎉 资料夹类型迁移完成！');

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 执行迁移
if (require.main === module) {
  migrateFolderTypes()
    .then(() => {
      console.log('✅ 迁移脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 迁移脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { migrateFolderTypes };
