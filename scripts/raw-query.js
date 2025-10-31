const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    // 查詢活動
    const activity = await prisma.$queryRaw`
      SELECT id, title, "isPublic", "isPublicShared"
      FROM "Activity"
      WHERE id = 'cmh93tjuh0001l404hszkdf94'
    `;
    
    console.log('Activity:', activity);
    
    // 查詢詞彙項目
    const items = await prisma.$queryRaw`
      SELECT id, english, chinese, "imageUrl", "audioUrl"
      FROM "VocabularyItem"
      WHERE "activityId" = 'cmh93tjuh0001l404hszkdf94'
      LIMIT 5
    `;
    
    console.log('VocabularyItems:', items);
    
    // 統計
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN english IS NOT NULL AND english != '' THEN 1 END) as with_english,
        COUNT(CASE WHEN "audioUrl" IS NOT NULL THEN 1 END) as with_audio
      FROM "VocabularyItem"
      WHERE "activityId" = 'cmh93tjuh0001l404hszkdf94'
    `;
    
    console.log('Stats:', stats);
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();

