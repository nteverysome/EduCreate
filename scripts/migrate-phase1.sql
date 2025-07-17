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

-- 16. 創建自動保存事件表 (按時間分區)
CREATE TABLE IF NOT EXISTS autosave_events (
    id BIGSERIAL PRIMARY KEY,
    activity_guid UUID NOT NULL,
    activity_id INTEGER,
    user_id INTEGER NOT NULL,

    -- 保存詳情
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('typing', 'paste', 'delete', 'template-switch', 'manual')),
    change_count INTEGER DEFAULT 0,
    save_reason VARCHAR(20) NOT NULL CHECK (save_reason IN ('interval', 'change', 'manual', 'page-switch', 'force')),

    -- 性能指標
    response_time INTEGER, -- 響應時間(毫秒)
    compression_ratio DECIMAL(5,2),
    content_size_before INTEGER,
    content_size_after INTEGER,
    content_hash VARCHAR(64), -- SHA-256 哈希

    -- 狀態和錯誤處理
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    network_status VARCHAR(20) DEFAULT 'online' CHECK (network_status IN ('online', 'offline', 'poor', 'excellent', 'good')),

    -- 版本控制
    session_id VARCHAR(100) NOT NULL,
    version_number INTEGER DEFAULT 1,

    -- 技術詳情
    user_agent TEXT,
    ip_address INET,

    -- 時間戳
    created_at TIMESTAMP DEFAULT NOW(),

    -- 元數據 (JSON格式存儲額外信息)
    metadata JSONB DEFAULT '{}'::jsonb
) PARTITION BY RANGE (created_at);

-- 17. 創建自動保存相關索引
CREATE INDEX IF NOT EXISTS idx_autosave_events_activity_guid ON autosave_events (activity_guid);
CREATE INDEX IF NOT EXISTS idx_autosave_events_user_id ON autosave_events (user_id);
CREATE INDEX IF NOT EXISTS idx_autosave_events_session_id ON autosave_events (session_id);
CREATE INDEX IF NOT EXISTS idx_autosave_events_created_at ON autosave_events (created_at);
CREATE INDEX IF NOT EXISTS idx_autosave_events_success ON autosave_events (success);
CREATE INDEX IF NOT EXISTS idx_autosave_events_change_type ON autosave_events (change_type);
CREATE INDEX IF NOT EXISTS idx_autosave_events_metadata_gin ON autosave_events USING GIN (metadata);

-- 18. 創建月度分區管理函數
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';

    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);

    -- 為新分區創建索引
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (activity_guid)',
                   partition_name || '_activity_guid_idx', partition_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (user_id)',
                   partition_name || '_user_id_idx', partition_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (session_id)',
                   partition_name || '_session_id_idx', partition_name);
END;
$$ LANGUAGE plpgsql;

-- 19. 創建自動分區管理函數
CREATE OR REPLACE FUNCTION auto_create_partitions()
RETURNS void AS $$
DECLARE
    current_month date;
    next_month date;
    month_after date;
BEGIN
    current_month := date_trunc('month', CURRENT_DATE);
    next_month := current_month + interval '1 month';
    month_after := next_month + interval '1 month';

    -- 創建當前月、下個月和後個月的分區
    PERFORM create_monthly_partition('autosave_events', current_month);
    PERFORM create_monthly_partition('autosave_events', next_month);
    PERFORM create_monthly_partition('autosave_events', month_after);
END;
$$ LANGUAGE plpgsql;

-- 20. 創建初始分區 (2024年和2025年)
SELECT create_monthly_partition('autosave_events', '2024-07-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-08-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-09-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-10-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-11-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-12-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-01-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-02-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-03-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-04-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-05-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-06-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-07-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-08-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-09-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-10-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-11-01'::date);
SELECT create_monthly_partition('autosave_events', '2025-12-01'::date);

-- 21. 創建自動保存性能監控視圖
CREATE OR REPLACE VIEW autosave_performance_summary AS
SELECT
    DATE(created_at) as save_date,
    COUNT(*) as total_saves,
    COUNT(*) FILTER (WHERE success = true) as successful_saves,
    COUNT(*) FILTER (WHERE success = false) as failed_saves,
    ROUND(AVG(response_time), 2) as avg_response_time,
    ROUND(AVG(compression_ratio), 2) as avg_compression_ratio,
    MAX(response_time) as max_response_time,
    MIN(response_time) as min_response_time,
    ROUND((COUNT(*) FILTER (WHERE success = true)::float / COUNT(*) * 100), 2) as success_rate
FROM autosave_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY save_date DESC;

-- 22. 創建用戶自動保存統計視圖
CREATE OR REPLACE VIEW user_autosave_stats AS
SELECT
    user_id,
    COUNT(*) as total_saves,
    COUNT(DISTINCT activity_guid) as unique_activities,
    COUNT(DISTINCT session_id) as unique_sessions,
    ROUND(AVG(response_time), 2) as avg_response_time,
    ROUND(AVG(compression_ratio), 2) as avg_compression_ratio,
    MAX(created_at) as last_save_time,
    ROUND((COUNT(*) FILTER (WHERE success = true)::float / COUNT(*) * 100), 2) as success_rate
FROM autosave_events
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY user_id
ORDER BY total_saves DESC;

-- 23. 插入自動保存示例測試數據
INSERT INTO autosave_events (
    activity_guid, activity_id, user_id, change_type, save_reason,
    response_time, compression_ratio, content_size_before, content_size_after,
    content_hash, session_id, version_number, network_status, metadata
) VALUES
(
    gen_random_uuid(), 1, 1, 'typing', 'interval',
    85, 2.3, 1024, 445, 'abc123def456', 'session_001', 1, 'online',
    '{"browser": "Chrome", "os": "Windows", "feature": "rich-text-editor"}'::jsonb
),
(
    gen_random_uuid(), 2, 1, 'paste', 'change',
    92, 1.8, 2048, 1138, 'def456ghi789', 'session_002', 2, 'online',
    '{"browser": "Firefox", "os": "macOS", "feature": "universal-content-editor"}'::jsonb
),
(
    gen_random_uuid(), 3, 2, 'template-switch', 'manual',
    156, 3.1, 4096, 1321, 'ghi789jkl012', 'session_003', 1, 'good',
    '{"browser": "Safari", "os": "iOS", "feature": "game-template"}'::jsonb
),
(
    gen_random_uuid(), 4, 1, 'typing', 'interval',
    67, 2.1, 512, 244, 'jkl012mno345', 'session_004', 3, 'excellent',
    '{"browser": "Edge", "os": "Windows", "feature": "flashcard-game"}'::jsonb
),
(
    gen_random_uuid(), 5, 2, 'delete', 'change',
    78, 1.9, 1536, 809, 'mno345pqr678', 'session_005', 1, 'online',
    '{"browser": "Chrome", "os": "Android", "feature": "quiz-game"}'::jsonb
);

-- 24. 創建自動保存清理函數
CREATE OR REPLACE FUNCTION cleanup_old_autosave_partitions()
RETURNS void AS $$
DECLARE
    cutoff_date date;
    partition_name text;
BEGIN
    cutoff_date := date_trunc('month', CURRENT_DATE - interval '6 months');

    FOR partition_name IN
        SELECT schemaname||'.'||tablename
        FROM pg_tables
        WHERE tablename LIKE 'autosave_events_%'
        AND tablename < 'autosave_events_' || to_char(cutoff_date, 'YYYY_MM')
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %s', partition_name);
        RAISE NOTICE 'Dropped old autosave partition: %', partition_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 25. 創建自動保存統計更新觸發器
CREATE OR REPLACE FUNCTION update_autosave_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 這裡可以添加實時統計更新邏輯
    -- 例如更新緩存表或發送通知
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
CREATE TRIGGER autosave_stats_trigger
    AFTER INSERT ON autosave_events
    FOR EACH ROW
    EXECUTE FUNCTION update_autosave_stats();

-- 26. 添加自動保存相關註釋
COMMENT ON TABLE autosave_events IS 'EduCreate 自動保存事件記錄表，按月分區存儲';
COMMENT ON COLUMN autosave_events.activity_guid IS '活動的全局唯一標識符';
COMMENT ON COLUMN autosave_events.change_type IS '變更類型：typing, paste, delete, template-switch, manual';
COMMENT ON COLUMN autosave_events.save_reason IS '保存原因：interval, change, manual, page-switch, force';
COMMENT ON COLUMN autosave_events.response_time IS '自動保存響應時間（毫秒）';
COMMENT ON COLUMN autosave_events.compression_ratio IS '內容壓縮比例';
COMMENT ON COLUMN autosave_events.content_hash IS '內容的 SHA-256 哈希值';
COMMENT ON COLUMN autosave_events.session_id IS '用戶會話標識符';
COMMENT ON COLUMN autosave_events.version_number IS '內容版本號';
COMMENT ON COLUMN autosave_events.metadata IS '額外的元數據信息（JSON格式）';

-- 完成遷移
SELECT 'Phase 1 migration with AutoSave completed successfully' as result;
