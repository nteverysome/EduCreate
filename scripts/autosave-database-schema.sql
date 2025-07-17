-- =====================================================
-- EduCreate AutoSave 系統數據庫架構
-- 基於 EDUCREAT_COMPREHENSIVE_ANALYSIS_AND_ROADMAP.md B.2 規範
-- =====================================================

-- 1. 創建自動保存事件表 (按時間分區)
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

-- 2. 創建索引優化查詢性能
CREATE INDEX IF NOT EXISTS idx_autosave_events_activity_guid ON autosave_events (activity_guid);
CREATE INDEX IF NOT EXISTS idx_autosave_events_user_id ON autosave_events (user_id);
CREATE INDEX IF NOT EXISTS idx_autosave_events_session_id ON autosave_events (session_id);
CREATE INDEX IF NOT EXISTS idx_autosave_events_created_at ON autosave_events (created_at);
CREATE INDEX IF NOT EXISTS idx_autosave_events_success ON autosave_events (success);
CREATE INDEX IF NOT EXISTS idx_autosave_events_change_type ON autosave_events (change_type);

-- 3. 創建 GIN 索引用於 JSONB 元數據查詢
CREATE INDEX IF NOT EXISTS idx_autosave_events_metadata_gin ON autosave_events USING GIN (metadata);

-- 4. 創建月度分區函數
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

-- 5. 創建自動分區管理函數
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

-- 6. 創建初始分區 (2024年和2025年)
SELECT create_monthly_partition('autosave_events', '2024-01-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-02-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-03-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-04-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-05-01'::date);
SELECT create_monthly_partition('autosave_events', '2024-06-01'::date);
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

-- 7. 創建定時任務自動創建未來分區 (需要 pg_cron 擴展)
-- SELECT cron.schedule('auto-partition', '0 0 1 * *', 'SELECT auto_create_partitions();');

-- 8. 創建性能監控視圖
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

-- 9. 創建用戶活動統計視圖
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

-- 10. 插入示例測試數據
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
);

-- 11. 創建清理舊分區的函數 (保留6個月數據)
CREATE OR REPLACE FUNCTION cleanup_old_partitions()
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
        RAISE NOTICE 'Dropped old partition: %', partition_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 12. 創建觸發器函數用於自動更新統計
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

-- 完成提示
SELECT 'AutoSave 數據庫架構創建完成！' as status;
