-- 診斷數據丟失問題的 SQL 腳本
-- 執行日期: 2025-11-04

-- 1. 檢查 Activity 表的數據
SELECT 
  'Activity 表統計' as check_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN "deletedAt" IS NULL THEN 1 END) as active_count,
  COUNT(CASE WHEN "deletedAt" IS NOT NULL THEN 1 END) as deleted_count,
  COUNT(DISTINCT "userId") as unique_users
FROM "Activity";

-- 2. 檢查 Folder 表的數據
SELECT 
  'Folder 表統計' as check_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN "deletedAt" IS NULL THEN 1 END) as active_count,
  COUNT(CASE WHEN "deletedAt" IS NOT NULL THEN 1 END) as deleted_count,
  COUNT(DISTINCT "userId") as unique_users
FROM "Folder";

-- 3. 檢查每個用戶的活動數量
SELECT 
  u."id",
  u."email",
  COUNT(a."id") as activity_count,
  COUNT(f."id") as folder_count
FROM "User" u
LEFT JOIN "Activity" a ON u."id" = a."userId" AND a."deletedAt" IS NULL
LEFT JOIN "Folder" f ON u."id" = f."userId" AND f."deletedAt" IS NULL
GROUP BY u."id", u."email"
ORDER BY activity_count DESC;

-- 4. 檢查孤立的活動（沒有對應用戶的活動）
SELECT 
  'Orphaned Activities' as check_type,
  COUNT(*) as orphaned_count
FROM "Activity" a
LEFT JOIN "User" u ON a."userId" = u."id"
WHERE u."id" IS NULL AND a."deletedAt" IS NULL;

-- 5. 檢查孤立的資料夾（沒有對應用戶的資料夾）
SELECT 
  'Orphaned Folders' as check_type,
  COUNT(*) as orphaned_count
FROM "Folder" f
LEFT JOIN "User" u ON f."userId" = u."id"
WHERE u."id" IS NULL AND f."deletedAt" IS NULL;

-- 6. 檢查活動和資料夾的關聯
SELECT 
  'Activity-Folder 關聯' as check_type,
  COUNT(DISTINCT a."id") as activities_with_folder,
  COUNT(DISTINCT a."folderId") as unique_folders
FROM "Activity" a
WHERE a."folderId" IS NOT NULL AND a."deletedAt" IS NULL;

-- 7. 檢查是否有損壞的外鍵
SELECT 
  'Broken Foreign Keys' as check_type,
  COUNT(*) as broken_count
FROM "Activity" a
LEFT JOIN "Folder" f ON a."folderId" = f."id"
WHERE a."folderId" IS NOT NULL 
  AND f."id" IS NULL 
  AND a."deletedAt" IS NULL;

-- 8. 檢查最近的活動和資料夾
SELECT 
  'Recent Activities' as check_type,
  COUNT(*) as count,
  MAX("createdAt") as latest_created,
  MAX("updatedAt") as latest_updated
FROM "Activity"
WHERE "deletedAt" IS NULL;

SELECT 
  'Recent Folders' as check_type,
  COUNT(*) as count,
  MAX("createdAt") as latest_created,
  MAX("updatedAt") as latest_updated
FROM "Folder"
WHERE "deletedAt" IS NULL;

-- 9. 檢查 VocabularyItem 表
SELECT 
  'VocabularyItem 表統計' as check_type,
  COUNT(*) as total_count,
  COUNT(DISTINCT "activityId") as unique_activities
FROM "VocabularyItem";

-- 10. 檢查是否有孤立的詞彙項目
SELECT 
  'Orphaned VocabularyItems' as check_type,
  COUNT(*) as orphaned_count
FROM "VocabularyItem" vi
LEFT JOIN "Activity" a ON vi."activityId" = a."id"
WHERE a."id" IS NULL;

