-- 查詢活動信息
SELECT 
  id,
  title,
  "isPublic",
  "isPublicShared",
  "createdAt"
FROM "Activity"
WHERE id = 'cmh93tjuh0001l404hszkdf94';

-- 查詢該活動的詞彙項目
SELECT 
  id,
  "english",
  "chinese",
  "imageUrl",
  "audioUrl",
  "activityId"
FROM "VocabularyItem"
WHERE "activityId" = 'cmh93tjuh0001l404hszkdf94'
LIMIT 10;

-- 統計該活動的詞彙項目數量
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN "english" IS NOT NULL AND "english" != '' THEN 1 END) as items_with_english,
  COUNT(CASE WHEN "audioUrl" IS NOT NULL AND "audioUrl" != '' THEN 1 END) as items_with_audio,
  COUNT(CASE WHEN "imageUrl" IS NOT NULL AND "imageUrl" != '' THEN 1 END) as items_with_image
FROM "VocabularyItem"
WHERE "activityId" = 'cmh93tjuh0001l404hszkdf94';

