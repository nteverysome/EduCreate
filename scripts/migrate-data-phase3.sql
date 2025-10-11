-- Phase 3: 數據遷移腳本
-- 將 VocabularySet 數據合併到 Activity 表，更新 VocabularyItem 關聯

-- 1. 更新 Activity 表，合併 VocabularySet 數據
UPDATE "Activity" 
SET 
  "geptLevel" = CAST(vs."geptLevel" AS "GEPTLevel"),
  "totalWords" = vs."totalWords"
FROM "VocabularySet" vs
WHERE "Activity"."content"->>'vocabularySetId' = vs.id;

-- 2. 更新 VocabularyItem，建立與 Activity 的直接關聯
UPDATE "VocabularyItem" 
SET "activityId" = (
  SELECT a.id 
  FROM "Activity" a 
  WHERE a."content"->>'vocabularySetId' = "VocabularyItem"."setId"
);

-- 3. 驗證遷移完整性
SELECT 
  'Migration Verification' as check_type,
  COUNT(*) as total_activities,
  COUNT(CASE WHEN "geptLevel" IS NOT NULL THEN 1 END) as activities_with_gept_level,
  COUNT(CASE WHEN "totalWords" > 0 THEN 1 END) as activities_with_total_words
FROM "Activity";

-- 4. 驗證 VocabularyItem 遷移
SELECT 
  'VocabularyItem Migration Verification' as check_type,
  COUNT(*) as total_vocabulary_items,
  COUNT(CASE WHEN "activityId" IS NOT NULL THEN 1 END) as items_with_activity_id,
  COUNT(CASE WHEN "setId" IS NOT NULL THEN 1 END) as items_with_set_id
FROM "VocabularyItem";

-- 5. 檢查數據一致性
SELECT 
  'Data Consistency Check' as check_type,
  a.id as activity_id,
  a.title as activity_title,
  a."geptLevel",
  a."totalWords",
  COUNT(vi.id) as actual_vocabulary_count
FROM "Activity" a
LEFT JOIN "VocabularyItem" vi ON a.id = vi."activityId"
WHERE a."content"->>'vocabularySetId' IS NOT NULL
GROUP BY a.id, a.title, a."geptLevel", a."totalWords"
HAVING COUNT(vi.id) != a."totalWords"
LIMIT 10;

-- 6. 記錄遷移完成
INSERT INTO migration_log (phase, action, status, timestamp, notes)
VALUES ('Phase3', 'data_migration_complete', 'success', NOW(), 'VocabularySet data merged to Activity, VocabularyItem relations updated');
