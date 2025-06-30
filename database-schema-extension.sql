-- WordWall Complete Recreation Database Schema Extension
-- Agent-5 Backend Engineer: 使用 sqlite-mcp + mcp-server-weaviate

-- 遊戲模板表 (擴展支持34個模板)
CREATE TABLE IF NOT EXISTS game_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL,
    memory_type TEXT NOT NULL,
    cognitive_load TEXT CHECK(cognitive_load IN ('low', 'medium', 'high')),
    difficulty_level INTEGER CHECK(difficulty_level BETWEEN 1 AND 5),
    description TEXT,
    features JSON,
    config_schema JSON,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入34個遊戲模板
INSERT OR REPLACE INTO game_templates VALUES
-- 已實現的25個模板
('quiz', 'Quiz', '測驗', 'assessment', 'recognition', 'low', 2, '多選題測驗遊戲', '["multiple_choice", "immediate_feedback", "scoring"]', '{"questions": [], "timeLimit": 0, "randomize": false}', true, datetime('now'), datetime('now')),
('gameshow-quiz', 'Gameshow Quiz', '競賽測驗', 'competitive', 'stress-enhanced', 'high', 4, '競賽風格的測驗遊戲', '["time_pressure", "competition", "buzzer_system"]', '{"questions": [], "timeLimit": 30, "lives": 3}', true, datetime('now'), datetime('now')),
('matching-pairs', 'Matching Pairs', '配對記憶', 'memory', 'spatial', 'medium', 3, '翻卡配對記憶遊戲', '["spatial_memory", "flip_animation", "pair_matching"]', '{"pairs": [], "gridSize": "4x4", "timeLimit": 0}', true, datetime('now'), datetime('now')),
('anagram', 'Anagram', '字母重組', 'word', 'reconstructive', 'medium', 3, '字母重新排列組詞遊戲', '["letter_rearrangement", "word_formation", "hints"]', '{"words": [], "difficulty": "medium", "hints": true}', true, datetime('now'), datetime('now')),
('hangman', 'Hangman', '猜詞遊戲', 'word', 'generative', 'high', 3, '經典的猜詞遊戲', '["word_guessing", "progressive_reveal", "lives_system"]', '{"words": [], "maxWrongGuesses": 6, "hints": false}', true, datetime('now'), datetime('now')),
('match-up', 'Match up', '拖拽配對', 'matching', 'associative', 'low', 2, '拖拽配對連線遊戲', '["drag_drop", "line_connection", "association"]', '{"pairs": [], "layout": "two_columns", "shuffle": true}', true, datetime('now'), datetime('now')),
('open-box', 'Open the box', '開箱驚喜', 'surprise', 'emotional', 'low', 1, '點擊開箱的驚喜遊戲', '["surprise_element", "random_rewards", "emotional_feedback"]', '{"boxes": [], "surpriseMode": true, "animations": true}', true, datetime('now'), datetime('now')),
('flash-cards', 'Flash cards', '閃卡記憶', 'memory', 'active-recall', 'medium', 2, '翻轉閃卡記憶遊戲', '["flip_animation", "spaced_repetition", "self_assessment"]', '{"cards": [], "autoFlip": false, "spacedRepetition": true}', true, datetime('now'), datetime('now')),
('find-match', 'Find the match', '找配對', 'matching', 'visual-search', 'medium', 2, '消除配對的視覺搜索遊戲', '["visual_search", "elimination", "pattern_recognition"]', '{"items": [], "matchCount": 2, "timeBonus": true}', true, datetime('now'), datetime('now')),
('unjumble', 'Unjumble', '句子重組', 'word', 'sequential-reconstruction', 'medium', 3, '重新排列句子順序的遊戲', '["sentence_ordering", "drag_drop", "grammar_check"]', '{"sentences": [], "wordLevel": false, "hints": true}', true, datetime('now'), datetime('now')),
('spin-wheel', 'Spin the wheel', '轉盤選擇', 'random', 'random-reinforcement', 'low', 1, '轉盤隨機選擇遊戲', '["random_selection", "wheel_animation", "suspense"]', '{"options": [], "spinDuration": 3, "sound": true}', true, datetime('now'), datetime('now')),
('wordsearch', 'Wordsearch', '單詞搜索', 'word', 'visual-search', 'medium', 2, '在字母網格中搜索單詞', '["grid_search", "word_highlighting", "direction_finding"]', '{"words": [], "gridSize": "15x15", "directions": ["horizontal", "vertical", "diagonal"]}', true, datetime('now'), datetime('now')),
('flying-fruit', 'Flying fruit', '飛行水果', 'action', 'dynamic-tracking', 'high', 4, '追蹤移動目標的動作遊戲', '["moving_targets", "click_accuracy", "speed_challenge"]', '{"targets": [], "speed": "medium", "duration": 60}', true, datetime('now'), datetime('now')),
('balloon-pop', 'Balloon pop', '氣球爆破', 'action', 'target-selection', 'medium', 3, '點擊正確氣球的選擇遊戲', '["target_selection", "pop_animation", "accuracy_scoring"]', '{"balloons": [], "popSound": true, "timeLimit": 0}', true, datetime('now'), datetime('now')),
('flip-tiles', 'Flip tiles', '翻轉瓷磚', 'reveal', 'reveal', 'medium', 2, '翻轉瓷磚揭示內容的遊戲', '["progressive_reveal", "tile_animation", "memory_challenge"]', '{"tiles": [], "revealMode": "click", "autoHide": false}', true, datetime('now'), datetime('now')),
('true-false', 'True or false', '判斷題', 'assessment', 'binary-decision', 'low', 1, '快速判斷對錯的遊戲', '["binary_choice", "quick_decision", "immediate_feedback"]', '{"statements": [], "timePerQuestion": 10, "showExplanation": true}', true, datetime('now'), datetime('now')),
('type-answer', 'Type the answer', '輸入答案', 'input', 'input-generation', 'high', 3, '鍵盤輸入答案的遊戲', '["text_input", "auto_complete", "spell_check"]', '{"questions": [], "caseSensitive": false, "hints": true}', true, datetime('now'), datetime('now')),
('image-quiz', 'Image quiz', '圖片測驗', 'visual', 'visual-recognition', 'medium', 3, '基於圖片的識別測驗', '["image_recognition", "progressive_reveal", "visual_clues"]', '{"images": [], "revealMode": "progressive", "timeLimit": 30}', true, datetime('now'), datetime('now')),
('maze-chase', 'Maze chase', '迷宮追逐', 'navigation', 'spatial-navigation', 'high', 4, '在迷宮中導航的空間遊戲', '["pathfinding", "spatial_navigation", "time_challenge"]', '{"maze": [], "playerSpeed": "normal", "obstacles": true}', true, datetime('now'), datetime('now')),
('whack-mole', 'Whack-a-mole', '打地鼠', 'reaction', 'reaction-speed', 'high', 4, '快速反應的打地鼠遊戲', '["reaction_time", "random_appearance", "score_multiplier"]', '{"holes": 9, "speed": "medium", "duration": 60}', true, datetime('now'), datetime('now')),
('speaking-cards', 'Speaking cards', '口語卡片', 'audio', 'auditory', 'medium', 2, '語音練習的卡片遊戲', '["speech_recognition", "pronunciation", "audio_feedback"]', '{"cards": [], "recordingEnabled": true, "playback": true}', true, datetime('now'), datetime('now')),
('group-sort', 'Group sort', '分組排序', 'categorization', 'categorical', 'medium', 3, '將項目分類到正確組別', '["categorization", "drag_drop", "group_validation"]', '{"items": [], "groups": [], "allowMultiple": false}', true, datetime('now'), datetime('now')),
('crossword', 'Crossword', '填字遊戲', 'word', 'semantic', 'high', 4, '經典的填字遊戲', '["grid_filling", "clue_solving", "word_intersection"]', '{"grid": [], "clues": {}, "autoCheck": true}', true, datetime('now'), datetime('now')),
('airplane', 'Airplane', '飛機遊戲', 'action', 'reaction-speed', 'high', 4, '控制飛機的反應遊戲', '["vehicle_control", "obstacle_avoidance", "speed_challenge"]', '{"obstacles": [], "speed": "medium", "lives": 3}', true, datetime('now'), datetime('now')),
('speed-sorting', 'Speed sorting', '快速分類', 'speed', 'speed-decision', 'high', 4, '時間壓力下的快速分類', '["time_pressure", "quick_categorization", "accuracy_bonus"]', '{"items": [], "categories": [], "timePerItem": 3}', true, datetime('now'), datetime('now')),

-- 新增的9個模板
('complete-sentence', 'Complete the sentence', '完成句子', 'language', 'contextual', 'medium', 3, '拖拽單詞完成句子', '["sentence_completion", "context_clues", "grammar_check"]', '{"sentences": [], "wordBank": [], "hints": true}', true, datetime('now'), datetime('now')),
('spell-word', 'Spell the word', '拼寫單詞', 'spelling', 'orthographic', 'medium', 3, '拼寫單詞的遊戲', '["letter_input", "spelling_check", "audio_pronunciation"]', '{"words": [], "inputMode": "type", "pronunciation": true}', true, datetime('now'), datetime('now')),
('rank-order', 'Rank order', '排序', 'logic', 'sequential', 'medium', 3, '按正確順序排列項目', '["ordering", "logic_reasoning", "sequence_validation"]', '{"items": [], "criteria": "", "allowPartial": true}', true, datetime('now'), datetime('now')),
('labelled-diagram', 'Labelled diagram', '標籤圖表', 'spatial', 'spatial-labeling', 'high', 4, '在圖表上標註標籤', '["image_annotation", "precise_positioning", "spatial_memory"]', '{"image": "", "labels": [], "tolerance": 20}', true, datetime('now'), datetime('now')),
('watch-memorize', 'Watch and memorize', '觀察記憶', 'memory', 'observational', 'high', 4, '觀看序列後回憶', '["sequence_memory", "attention_training", "recall_testing"]', '{"sequence": [], "showDuration": 5, "testType": "order"}', true, datetime('now'), datetime('now')),
('maths-generator', 'Maths generator', '數學生成器', 'math', 'mathematical', 'medium', 3, '自動生成數學題目', '["problem_generation", "calculation", "step_by_step"]', '{"operations": ["add"], "range": {"min": 1, "max": 100}, "showSteps": false}', true, datetime('now'), datetime('now')),
('word-magnets', 'Word magnets', '單詞磁鐵', 'creative', 'combinatorial', 'low', 2, '使用磁性單詞組合句子', '["word_combination", "sentence_building", "creative_expression"]', '{"words": [], "freeMode": true, "grammarCheck": false}', true, datetime('now'), datetime('now')),
('pair-no-pair', 'Pair or No Pair', '配對判斷', 'decision', 'binary-decision', 'medium', 2, '判斷是否為配對的遊戲', '["pair_recognition", "binary_decision", "pattern_matching"]', '{"pairs": [], "showTime": 3, "decisionTime": 5}', true, datetime('now'), datetime('now')),
('win-lose-quiz', 'Win or lose quiz', '輸贏測驗', 'risk', 'risk-decision', 'high', 4, '風險決策的測驗遊戲', '["risk_assessment", "decision_making", "probability"]', '{"questions": [], "riskLevels": 3, "rewards": []}', true, datetime('now'), datetime('now'));

-- 遊戲會話表 (記錄用戶遊戲過程)
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    duration_seconds INTEGER,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    accuracy_percentage REAL DEFAULT 0,
    attempts INTEGER DEFAULT 1,
    hints_used INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('started', 'paused', 'completed', 'abandoned')) DEFAULT 'started',
    game_data JSON, -- 遊戲狀態和詳細數據
    memory_metrics JSON, -- 記憶增強相關指標
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (template_id) REFERENCES game_templates(id)
);

-- 記憶增強配置表
CREATE TABLE IF NOT EXISTS memory_configurations (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    memory_type TEXT NOT NULL,
    cognitive_load TEXT NOT NULL,
    difficulty_level INTEGER NOT NULL,
    time_constraints JSON,
    repetition_settings JSON,
    feedback_mechanisms JSON,
    visual_enhancements JSON,
    competitive_elements JSON,
    enhancement_strategies JSON,
    neural_basis JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES game_templates(id)
);

-- 用戶學習分析表
CREATE TABLE IF NOT EXISTS user_learning_analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    memory_type TEXT NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    average_score REAL DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    accuracy_trend JSON, -- 準確率趨勢數據
    speed_trend JSON, -- 速度趨勢數據
    difficulty_progression JSON, -- 難度進展
    memory_retention_score REAL DEFAULT 0,
    last_played_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES game_templates(id)
);

-- 個性化推薦表
CREATE TABLE IF NOT EXISTS personalized_recommendations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL,
    recommendation_score REAL NOT NULL,
    reasons JSON, -- 推薦理由
    memory_types JSON, -- 相關記憶類型
    estimated_time INTEGER, -- 預估時間(分鐘)
    difficulty_match REAL, -- 難度匹配度
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES game_templates(id)
);

-- AI生成內容表
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'question', 'answer', 'image', 'audio'
    content_data JSON NOT NULL,
    generation_prompt TEXT,
    ai_model TEXT, -- 'gpt-4', 'dall-e-3', 'imagen3'
    quality_score REAL,
    usage_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT false,
    created_by TEXT, -- user_id or 'system'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES game_templates(id)
);

-- 創建索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_template_id ON game_sessions(template_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON game_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_learning_analytics_user_template ON user_learning_analytics(user_id, template_id);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_user_active ON personalized_recommendations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_template_type ON ai_generated_content(template_id, content_type);

-- 創建視圖以便於查詢
CREATE VIEW IF NOT EXISTS user_game_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    gt.id as template_id,
    gt.display_name as template_name,
    gt.memory_type,
    COUNT(gs.id) as total_sessions,
    AVG(gs.score) as average_score,
    MAX(gs.score) as best_score,
    SUM(gs.duration_seconds) as total_time_seconds,
    AVG(gs.accuracy_percentage) as average_accuracy,
    MAX(gs.completed_at) as last_played
FROM users u
CROSS JOIN game_templates gt
LEFT JOIN game_sessions gs ON u.id = gs.user_id AND gt.id = gs.template_id
WHERE gt.is_active = true
GROUP BY u.id, gt.id;

-- 觸發器：自動更新學習分析
CREATE TRIGGER IF NOT EXISTS update_learning_analytics
AFTER INSERT ON game_sessions
WHEN NEW.status = 'completed'
BEGIN
    INSERT OR REPLACE INTO user_learning_analytics (
        id, user_id, template_id, memory_type, total_sessions, total_time_seconds,
        average_score, best_score, last_played_at, updated_at
    )
    SELECT 
        COALESCE(ula.id, NEW.user_id || '_' || NEW.template_id),
        NEW.user_id,
        NEW.template_id,
        gt.memory_type,
        COALESCE(ula.total_sessions, 0) + 1,
        COALESCE(ula.total_time_seconds, 0) + NEW.duration_seconds,
        (COALESCE(ula.average_score * ula.total_sessions, 0) + NEW.score) / (COALESCE(ula.total_sessions, 0) + 1),
        MAX(COALESCE(ula.best_score, 0), NEW.score),
        NEW.completed_at,
        datetime('now')
    FROM game_templates gt
    LEFT JOIN user_learning_analytics ula ON ula.user_id = NEW.user_id AND ula.template_id = NEW.template_id
    WHERE gt.id = NEW.template_id;
END;
