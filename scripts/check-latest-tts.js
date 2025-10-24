const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatest() {
  try {
    const records = await prisma.tTSCache.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        text: true,
        language: true,
        voice: true,
        geptLevel: true,
        createdAt: true
      }
    });

    console.log('最近 10 條記錄:');
    records.forEach((r, i) => {
      const time = new Date(r.createdAt).toLocaleString('zh-TW');
      console.log(`${i+1}. ${r.text} [${r.language}/${r.voice}] - ${r.geptLevel} - ${time}`);
    });

    // 檢查最後一條記錄的時間
    if (records.length > 0) {
      const lastRecord = records[0];
      const lastTime = new Date(lastRecord.createdAt);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastTime) / 1000 / 60);
      
      console.log(`\n⏱️  最後一條記錄是 ${diffMinutes} 分鐘前`);
      
      if (diffMinutes > 10) {
        console.log('⚠️  警告: 超過 10 分鐘沒有新記錄,進程可能已停止!');
      } else {
        console.log('✅ 進程正在運行');
      }
    }

  } catch (error) {
    console.error('錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatest();

