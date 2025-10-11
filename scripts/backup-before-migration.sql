-- 架構簡化前的數據備份腳本
-- 執行日期: 2025-10-11
-- 目的: 在架構簡化前備份所有相關數據

-- 1. 備份 Activity 表數據
CREATE TABLE IF NOT EXISTS activity_backup_20251011 AS 
SELECT * FROM "Activity";

-- 2. 備份 VocabularySet 表數據  
CREATE TABLE IF NOT EXISTS vocabulary_set_backup_20251011 AS
SELECT * FROM "VocabularySet";

-- 3. 備份 VocabularyItem 表數據
CREATE TABLE IF NOT EXISTS vocabulary_item_backup_20251011 AS
SELECT * FROM "VocabularyItem";

-- 4. 備份 LearningProgress 表數據（如果存在）
CREATE TABLE IF NOT EXISTS learning_progress_backup_20251011 AS
SELECT * FROM "LearningProgress";

-- 5. 創建關聯關係備份表
CREATE TABLE IF NOT EXISTS activity_vocabulary_mapping_backup_20251011 AS
SELECT 
    a.id as activity_id,
    a.title as activity_title,
    a.content->>'vocabularySetId' as vocabulary_set_id,
    vs.title as vocabulary_set_title,
    vs.geptLevel,
    vs.totalWords,
    COUNT(vi.id) as actual_vocabulary_count
FROM "Activity" a
LEFT JOIN "VocabularySet" vs ON a.content->>'vocabularySetId' = vs.id
LEFT JOIN "VocabularyItem" vi ON vs.id = vi.setId
WHERE a.content->>'vocabularySetId' IS NOT NULL
GROUP BY a.id, a.title, vs.id, vs.title, vs.geptLevel, vs.totalWords;

-- 6. 統計當前數據量
SELECT 
    'Activity' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN content->>'vocabularySetId' IS NOT NULL THEN 1 END) as with_vocabulary_set
FROM "Activity"
UNION ALL
SELECT 
    'VocabularySet' as table_name,
    COUNT(*) as record_count,
    NULL as with_vocabulary_set
FROM "VocabularySet"
UNION ALL
SELECT 
    'VocabularyItem' as table_name,
    COUNT(*) as record_count,
    NULL as with_vocabulary_set
FROM "VocabularyItem";

-- 7. 驗證數據完整性
SELECT 
    'Orphaned VocabularySet' as issue_type,
    COUNT(*) as count
FROM "VocabularySet" vs
WHERE NOT EXISTS (
    SELECT 1 FROM "Activity" a 
    WHERE a.content->>'vocabularySetId' = vs.id
)
UNION ALL
SELECT 
    'Orphaned VocabularyItem' as issue_type,
    COUNT(*) as count
FROM "VocabularyItem" vi
WHERE NOT EXISTS (
    SELECT 1 FROM "VocabularySet" vs 
    WHERE vs.id = vi.setId
);

-- 8. 記錄備份完成時間
INSERT INTO migration_log (phase, action, status, timestamp, notes)
VALUES ('Phase1', 'backup_complete', 'success', NOW(), 'All data backed up successfully');
