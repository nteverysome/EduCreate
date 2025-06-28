-- 第一階段數據庫遷移腳本
-- 添加支持 wordwall.net 核心功能的新字段和表

-- 1. 創建 Folder 表
CREATE TABLE IF NOT EXISTS "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- 2. 為 Activity 表添加新字段
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "templateType" TEXT;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "isDraft" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "folderId" TEXT;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "lastPlayed" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "playCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "shareCount" INTEGER NOT NULL DEFAULT 0;

-- 3. 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS "Activity_userId_isDraft_idx" ON "Activity"("userId", "isDraft");
CREATE INDEX IF NOT EXISTS "Activity_userId_folderId_idx" ON "Activity"("userId", "folderId");
CREATE INDEX IF NOT EXISTS "Activity_templateType_idx" ON "Activity"("templateType");
CREATE INDEX IF NOT EXISTS "Activity_lastPlayed_idx" ON "Activity"("lastPlayed");
CREATE INDEX IF NOT EXISTS "Folder_userId_idx" ON "Folder"("userId");

-- 4. 添加外鍵約束
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_folderId_fkey" 
    FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. 添加唯一約束
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_name_userId_key" UNIQUE ("name", "userId");

-- 6. 更新現有數據
-- 將現有活動標記為非草稿狀態
UPDATE "Activity" SET "isDraft" = false WHERE "isDraft" IS NULL;

-- 為現有活動設置默認模板類型
UPDATE "Activity" SET "templateType" = 
    CASE 
        WHEN "type" = 'QUIZ' THEN 'QUIZ'
        WHEN "type" = 'MATCHING' THEN 'MATCHING'
        WHEN "type" = 'FLASHCARDS' THEN 'FLASHCARDS'
        WHEN "type" = 'UNIVERSAL_CONTENT' THEN 'UNIVERSAL'
        ELSE 'UNIVERSAL'
    END
WHERE "templateType" IS NULL;

-- 7. 創建示例文件夾（可選）
-- 這些可以在應用程序啟動時創建，而不是在遷移中
-- INSERT INTO "Folder" ("id", "name", "description", "userId", "createdAt", "updatedAt")
-- SELECT 
--     'folder_' || generate_random_uuid(),
--     '我的第一個文件夾',
--     '存放學習活動的文件夾',
--     "id",
--     CURRENT_TIMESTAMP,
--     CURRENT_TIMESTAMP
-- FROM "User" 
-- WHERE NOT EXISTS (SELECT 1 FROM "Folder" WHERE "userId" = "User"."id");

-- 8. 添加檢查約束
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_playCount_check" CHECK ("playCount" >= 0);
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_shareCount_check" CHECK ("shareCount" >= 0);

-- 9. 創建視圖以便於查詢
CREATE OR REPLACE VIEW "ActivityWithFolder" AS
SELECT 
    a.*,
    f."name" as "folderName",
    f."color" as "folderColor",
    f."icon" as "folderIcon"
FROM "Activity" a
LEFT JOIN "Folder" f ON a."folderId" = f."id";

-- 10. 創建函數以更新活動統計
CREATE OR REPLACE FUNCTION update_activity_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新最後遊玩時間
    IF TG_OP = 'UPDATE' AND OLD."playCount" < NEW."playCount" THEN
        NEW."lastPlayed" = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
DROP TRIGGER IF EXISTS activity_stats_trigger ON "Activity";
CREATE TRIGGER activity_stats_trigger
    BEFORE UPDATE ON "Activity"
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_stats();

-- 11. 創建函數以自動清理舊的草稿
CREATE OR REPLACE FUNCTION cleanup_old_drafts()
RETURNS void AS $$
BEGIN
    -- 刪除超過 30 天的未命名草稿
    DELETE FROM "Activity" 
    WHERE "isDraft" = true 
      AND "title" LIKE 'Untitled%'
      AND "createdAt" < CURRENT_TIMESTAMP - INTERVAL '30 days';
      
    -- 記錄清理結果
    RAISE NOTICE 'Cleaned up old drafts';
END;
$$ LANGUAGE plpgsql;

-- 12. 創建定期清理任務（需要 pg_cron 擴展）
-- SELECT cron.schedule('cleanup-drafts', '0 2 * * *', 'SELECT cleanup_old_drafts();');

-- 13. 添加註釋
COMMENT ON TABLE "Folder" IS '用戶文件夾，用於組織活動';
COMMENT ON COLUMN "Activity"."templateType" IS '活動的模板類型';
COMMENT ON COLUMN "Activity"."isDraft" IS '是否為草稿狀態';
COMMENT ON COLUMN "Activity"."folderId" IS '所屬文件夾ID';
COMMENT ON COLUMN "Activity"."lastPlayed" IS '最後遊玩時間';
COMMENT ON COLUMN "Activity"."playCount" IS '遊玩次數';
COMMENT ON COLUMN "Activity"."shareCount" IS '分享次數';

-- 14. 創建用於統計的視圖
CREATE OR REPLACE VIEW "UserActivityStats" AS
SELECT 
    u."id" as "userId",
    u."name" as "userName",
    COUNT(a."id") as "totalActivities",
    COUNT(CASE WHEN a."isDraft" = false THEN 1 END) as "publishedActivities",
    COUNT(CASE WHEN a."isDraft" = true THEN 1 END) as "draftActivities",
    COUNT(DISTINCT a."folderId") as "foldersUsed",
    SUM(a."playCount") as "totalPlays",
    SUM(a."shareCount") as "totalShares",
    MAX(a."lastPlayed") as "lastActivity"
FROM "User" u
LEFT JOIN "Activity" a ON u."id" = a."userId"
GROUP BY u."id", u."name";

-- 15. 創建文件夾統計視圖
CREATE OR REPLACE VIEW "FolderStats" AS
SELECT 
    f."id" as "folderId",
    f."name" as "folderName",
    f."userId",
    COUNT(a."id") as "activityCount",
    COUNT(CASE WHEN a."isDraft" = false THEN 1 END) as "publishedCount",
    COUNT(CASE WHEN a."isDraft" = true THEN 1 END) as "draftCount",
    SUM(a."playCount") as "totalPlays",
    MAX(a."lastPlayed") as "lastActivity"
FROM "Folder" f
LEFT JOIN "Activity" a ON f."id" = a."folderId"
GROUP BY f."id", f."name", f."userId";

-- 完成遷移
SELECT 'Phase 1 migration completed successfully' as result;
