-- 當前架構分析腳本
-- 分析 Activity、VocabularySet、VocabularyItem 三表關聯

-- 1. 分析 Activity 表結構和數據
SELECT 
    'Activity Table Analysis' as analysis_type,
    COUNT(*) as total_records,
    COUNT(CASE WHEN content IS NOT NULL THEN 1 END) as with_content,
    COUNT(CASE WHEN content->>'vocabularySetId' IS NOT NULL THEN 1 END) as with_vocabulary_set_id,
    COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as with_title,
    COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as with_description
FROM "Activity";

-- 2. 分析 VocabularySet 表結構和數據
SELECT 
    'VocabularySet Table Analysis' as analysis_type,
    COUNT(*) as total_records,
    COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as with_title,
    COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as with_description,
    COUNT(CASE WHEN geptLevel IS NOT NULL THEN 1 END) as with_gept_level,
    COUNT(CASE WHEN totalWords > 0 THEN 1 END) as with_total_words
FROM "VocabularySet";

-- 3. 分析 VocabularyItem 表結構和數據
SELECT 
    'VocabularyItem Table Analysis' as analysis_type,
    COUNT(*) as total_records,
    COUNT(CASE WHEN setId IS NOT NULL THEN 1 END) as with_set_id,
    COUNT(CASE WHEN english IS NOT NULL THEN 1 END) as with_english,
    COUNT(CASE WHEN chinese IS NOT NULL THEN 1 END) as with_chinese,
    COUNT(CASE WHEN phonetic IS NOT NULL THEN 1 END) as with_phonetic
FROM "VocabularyItem";

-- 4. 分析關聯關係完整性
SELECT 
    'Relationship Analysis' as analysis_type,
    COUNT(DISTINCT a.id) as activities_with_vocabulary,
    COUNT(DISTINCT vs.id) as vocabulary_sets_linked,
    COUNT(DISTINCT vi.id) as vocabulary_items_total,
    AVG(vi_count.item_count) as avg_items_per_set
FROM "Activity" a
JOIN "VocabularySet" vs ON a.content->>'vocabularySetId' = vs.id
JOIN "VocabularyItem" vi ON vs.id = vi.setId
JOIN (
    SELECT setId, COUNT(*) as item_count
    FROM "VocabularyItem"
    GROUP BY setId
) vi_count ON vs.id = vi_count.setId;

-- 5. 檢查數據重複情況
SELECT 
    'Data Duplication Analysis' as analysis_type,
    COUNT(*) as total_pairs,
    COUNT(CASE WHEN a.title = vs.title THEN 1 END) as title_duplicates,
    COUNT(CASE WHEN a.description = vs.description THEN 1 END) as description_duplicates,
    COUNT(CASE WHEN a.userId = vs.userId THEN 1 END) as user_id_matches
FROM "Activity" a
JOIN "VocabularySet" vs ON a.content->>'vocabularySetId' = vs.id;

-- 6. 分析 JSON 關聯的複雜性
SELECT 
    'JSON Relationship Complexity' as analysis_type,
    COUNT(*) as activities_with_json_content,
    COUNT(CASE WHEN content->>'vocabularySetId' IS NOT NULL THEN 1 END) as with_vocabulary_set_id,
    COUNT(CASE WHEN content->>'gameTemplateId' IS NOT NULL THEN 1 END) as with_game_template_id,
    COUNT(CASE WHEN jsonb_array_length(content->'vocabularyItems') > 0 THEN 1 END) as with_vocabulary_items_in_content
FROM "Activity"
WHERE content IS NOT NULL;

-- 7. 檢查孤立數據
SELECT 
    'Orphaned Data Analysis' as analysis_type,
    orphaned_sets.count as orphaned_vocabulary_sets,
    orphaned_items.count as orphaned_vocabulary_items,
    missing_activities.count as activities_missing_vocabulary_sets
FROM 
(SELECT COUNT(*) as count FROM "VocabularySet" vs 
 WHERE NOT EXISTS (SELECT 1 FROM "Activity" a WHERE a.content->>'vocabularySetId' = vs.id)) orphaned_sets,
(SELECT COUNT(*) as count FROM "VocabularyItem" vi 
 WHERE NOT EXISTS (SELECT 1 FROM "VocabularySet" vs WHERE vs.id = vi.setId)) orphaned_items,
(SELECT COUNT(*) as count FROM "Activity" a 
 WHERE a.content->>'vocabularySetId' IS NOT NULL 
 AND NOT EXISTS (SELECT 1 FROM "VocabularySet" vs WHERE vs.id = a.content->>'vocabularySetId')) missing_activities;

-- 8. 分析字段使用情況
SELECT 
    'Field Usage Analysis' as analysis_type,
    'Activity' as table_name,
    jsonb_object_keys(content) as json_keys,
    COUNT(*) as usage_count
FROM "Activity"
WHERE content IS NOT NULL
GROUP BY jsonb_object_keys(content)
ORDER BY usage_count DESC;

-- 9. 檢查 ID 系統混亂情況
SELECT 
    'ID System Confusion Analysis' as analysis_type,
    a.id as activity_id,
    vs.id as vocabulary_set_id,
    a.title as activity_title,
    vs.title as vocabulary_set_title,
    CASE WHEN a.id = vs.id THEN 'SAME_ID' ELSE 'DIFFERENT_ID' END as id_comparison
FROM "Activity" a
JOIN "VocabularySet" vs ON a.content->>'vocabularySetId' = vs.id
LIMIT 10;

-- 10. 統計需要遷移的數據量
SELECT 
    'Migration Data Volume' as analysis_type,
    activity_count.count as activities_to_update,
    vocabulary_item_count.count as vocabulary_items_to_migrate,
    vocabulary_set_count.count as vocabulary_sets_to_merge
FROM 
(SELECT COUNT(*) as count FROM "Activity" WHERE content->>'vocabularySetId' IS NOT NULL) activity_count,
(SELECT COUNT(*) as count FROM "VocabularyItem") vocabulary_item_count,
(SELECT COUNT(*) as count FROM "VocabularySet") vocabulary_set_count;
