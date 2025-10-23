/**
 * 監控 TTS 生成進度
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function monitorProgress() {
  try {
    console.log('=== TTS 生成進度監控 ===\n');

    // 1. 總記錄數
    const totalCount = await prisma.tTSCache.count();
    console.log(`📊 已生成音頻總數: ${totalCount}\n`);

    // 2. 按 GEPT 級別統計
    const byLevel = await prisma.tTSCache.groupBy({
      by: ['geptLevel'],
      _count: true
    });
    
    console.log('📊 按 GEPT 級別統計:');
    
    const targets = {
      'ELEMENTARY': 2356 * 4, // 9,424
      'INTERMEDIATE': 2568 * 4, // 10,272
      'HIGH_INTERMEDIATE': 3138 * 4 // 12,552
    };
    
    let totalProgress = 0;
    let totalTarget = 0;
    
    for (const [level, target] of Object.entries(targets)) {
      const current = byLevel.find(item => item.geptLevel === level)?._count || 0;
      const percentage = ((current / target) * 100).toFixed(2);
      totalProgress += current;
      totalTarget += target;
      
      console.log(`  - ${level}: ${current}/${target} (${percentage}%)`);
    }
    
    console.log();
    console.log(`📊 總進度: ${totalProgress}/${totalTarget} (${((totalProgress / totalTarget) * 100).toFixed(2)}%)`);
    console.log();

    // 3. 按語言統計
    const byLanguage = await prisma.tTSCache.groupBy({
      by: ['language'],
      _count: true
    });
    console.log('📊 按語言統計:');
    byLanguage.forEach(item => {
      console.log(`  - ${item.language}: ${item._count} 個`);
    });
    console.log();

    // 4. 最近生成的 5 條記錄
    const recent = await prisma.tTSCache.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        text: true,
        language: true,
        voice: true,
        geptLevel: true,
        createdAt: true
      }
    });
    
    console.log('📝 最近生成的 5 條記錄:');
    recent.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} [${item.language}/${item.voice}] - ${item.geptLevel}`);
    });
    console.log();

    // 5. 預估剩餘時間
    if (totalProgress > 0) {
      const firstRecord = await prisma.tTSCache.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      
      const lastRecord = await prisma.tTSCache.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      
      if (firstRecord && lastRecord) {
        const timeElapsed = (lastRecord.createdAt - firstRecord.createdAt) / 1000; // 秒
        const avgTimePerAudio = timeElapsed / totalProgress;
        const remaining = totalTarget - totalProgress;
        const estimatedTimeRemaining = (remaining * avgTimePerAudio) / 3600; // 小時
        
        console.log('⏱️  時間估算:');
        console.log(`  - 已用時間: ${(timeElapsed / 3600).toFixed(2)} 小時`);
        console.log(`  - 平均速度: ${avgTimePerAudio.toFixed(2)} 秒/音頻`);
        console.log(`  - 預估剩餘時間: ${estimatedTimeRemaining.toFixed(2)} 小時`);
      }
    }

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

monitorProgress();

