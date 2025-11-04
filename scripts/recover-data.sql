-- 數據恢復腳本
-- ⚠️ 警告：執行前請備份數據庫！
-- 執行日期: 2025-11-04

-- 1. 恢復被誤刪除的活動（如果 deletedAt 不為 null）
-- 注意：只恢復最近 7 天內刪除的活動
UPDATE "Activity"
SET "deletedAt" = NULL, "updatedAt" = NOW()
WHERE "deletedAt" IS NOT NULL 
  AND "deletedAt" > NOW() - INTERVAL '7 days'
  AND "userId" IS NOT NULL;

-- 2. 恢復被誤刪除的資料夾
UPDATE "Folder"
SET "deletedAt" = NULL, "updatedAt" = NOW()
WHERE "deletedAt" IS NOT NULL 
  AND "deletedAt" > NOW() - INTERVAL '7 days'
  AND "userId" IS NOT NULL;

-- 3. 修復孤立的活動（沒有對應用戶的活動）
-- 這些活動應該被刪除或重新分配
DELETE FROM "Activity"
WHERE "userId" NOT IN (SELECT "id" FROM "User")
  AND "deletedAt" IS NULL;

-- 4. 修復孤立的資料夾
DELETE FROM "Folder"
WHERE "userId" NOT IN (SELECT "id" FROM "User")
  AND "deletedAt" IS NULL;

-- 5. 修復損壞的外鍵（活動指向不存在的資料夾）
UPDATE "Activity"
SET "folderId" = NULL, "updatedAt" = NOW()
WHERE "folderId" IS NOT NULL 
  AND "folderId" NOT IN (SELECT "id" FROM "Folder")
  AND "deletedAt" IS NULL;

-- 6. 修復孤立的詞彙項目
DELETE FROM "VocabularyItem"
WHERE "activityId" NOT IN (SELECT "id" FROM "Activity")
  AND "activityId" IS NOT NULL;

-- 7. 驗證修復結果
SELECT 
  'Recovery Summary' as status,
  (SELECT COUNT(*) FROM "Activity" WHERE "deletedAt" IS NULL) as active_activities,
  (SELECT COUNT(*) FROM "Folder" WHERE "deletedAt" IS NULL) as active_folders,
  (SELECT COUNT(*) FROM "VocabularyItem") as vocabulary_items;

-- 8. 檢查修復後的數據完整性
SELECT 
  u."email",
  COUNT(DISTINCT a."id") as activity_count,
  COUNT(DISTINCT f."id") as folder_count,
  COUNT(DISTINCT vi."id") as vocabulary_count
FROM "User" u
LEFT JOIN "Activity" a ON u."id" = a."userId" AND a."deletedAt" IS NULL
LEFT JOIN "Folder" f ON u."id" = f."userId" AND f."deletedAt" IS NULL
LEFT JOIN "VocabularyItem" vi ON a."id" = vi."activityId"
GROUP BY u."id", u."email"
HAVING COUNT(DISTINCT a."id") > 0 OR COUNT(DISTINCT f."id") > 0
ORDER BY activity_count DESC;

