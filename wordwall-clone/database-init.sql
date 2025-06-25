-- Wordwall Clone 數據庫初始化腳本
-- Multi-Agent Backend Architecture Agent 生成

-- 創建數據庫 (如果不存在)
-- CREATE DATABASE wordwall_clone;

-- 使用數據庫
-- \c wordwall_clone;

-- 啟用UUID擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== 用戶表 ====================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'teacher' CHECK (role IN ('student', 'teacher', 'admin')),
    profile_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用戶表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ==================== 活動表 ====================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_audience VARCHAR(50) DEFAULT 'elementary' CHECK (target_audience IN ('elementary', 'middle', 'high', 'adult')),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER DEFAULT 30, -- 分鐘
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 活動表索引
CREATE INDEX IF NOT EXISTS idx_activities_creator_id ON activities(creator_id);
CREATE INDEX IF NOT EXISTS idx_activities_target_audience ON activities(target_audience);
CREATE INDEX IF NOT EXISTS idx_activities_is_public ON activities(is_public);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_tags ON activities USING GIN(tags);

-- ==================== 詞彙表 ====================
CREATE TABLE IF NOT EXISTS vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    english_text VARCHAR(255) NOT NULL,
    chinese_text VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    pinyin VARCHAR(255),
    category VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    usage_frequency INTEGER DEFAULT 0,
    learning_level INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 詞彙表索引
CREATE INDEX IF NOT EXISTS idx_vocabulary_activity_id ON vocabulary(activity_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_english_text ON vocabulary(english_text);
CREATE INDEX IF NOT EXISTS idx_vocabulary_chinese_text ON vocabulary(chinese_text);
CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON vocabulary(category);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty ON vocabulary(difficulty);
CREATE INDEX IF NOT EXISTS idx_vocabulary_tags ON vocabulary USING GIN(tags);

-- ==================== 多媒體資源表 ====================
CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'audio', 'video')),
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    language VARCHAR(10), -- 'en', 'zh', etc.
    quality VARCHAR(20) DEFAULT 'standard', -- 'low', 'standard', 'high'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 多媒體資源表索引
CREATE INDEX IF NOT EXISTS idx_media_files_vocabulary_id ON media_files(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_language ON media_files(language);

-- ==================== 遊戲表 ====================
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('quiz', 'match', 'cards', 'wheel', 'sort', 'airplane')),
    title VARCHAR(255),
    config JSONB NOT NULL DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    play_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 遊戲表索引
CREATE INDEX IF NOT EXISTS idx_games_activity_id ON games(activity_id);
CREATE INDEX IF NOT EXISTS idx_games_game_type ON games(game_type);
CREATE INDEX IF NOT EXISTS idx_games_is_published ON games(is_published);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);

-- ==================== 遊戲會話表 ====================
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    player_name VARCHAR(100), -- 允許匿名玩家
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- 秒
    answers JSONB DEFAULT '[]',
    session_data JSONB DEFAULT '{}',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 遊戲會話表索引
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON game_sessions(started_at);

-- ==================== 學習分析表 ====================
CREATE TABLE IF NOT EXISTS learning_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES vocabulary(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'view', 'correct', 'incorrect', 'skip', etc.
    response_time INTEGER, -- 毫秒
    difficulty_level VARCHAR(20),
    context_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 學習分析表索引
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_id ON learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_activity_id ON learning_analytics(activity_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_vocabulary_id ON learning_analytics(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_action_type ON learning_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_created_at ON learning_analytics(created_at);

-- ==================== 語音緩存表 ====================
CREATE TABLE IF NOT EXISTS audio_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_content TEXT NOT NULL,
    language VARCHAR(10) NOT NULL,
    voice_id VARCHAR(100) NOT NULL,
    audio_url TEXT NOT NULL,
    file_size INTEGER,
    duration DECIMAL(8,2), -- 秒
    tts_provider VARCHAR(50) NOT NULL,
    quality_score DECIMAL(3,2) DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 語音緩存表索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_audio_cache_unique ON audio_cache(text_content, language, voice_id);
CREATE INDEX IF NOT EXISTS idx_audio_cache_language ON audio_cache(language);
CREATE INDEX IF NOT EXISTS idx_audio_cache_tts_provider ON audio_cache(tts_provider);
CREATE INDEX IF NOT EXISTS idx_audio_cache_last_used_at ON audio_cache(last_used_at);

-- ==================== 系統配置表 ====================
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 系統配置表索引
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
CREATE INDEX IF NOT EXISTS idx_system_config_is_public ON system_config(is_public);

-- ==================== 觸發器函數 ====================

-- 更新 updated_at 字段的觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為需要的表創建觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON vocabulary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== 視圖 ====================

-- 活動統計視圖
CREATE OR REPLACE VIEW activity_stats AS
SELECT 
    a.id,
    a.title,
    a.creator_id,
    COUNT(DISTINCT v.id) as vocabulary_count,
    COUNT(DISTINCT g.id) as games_count,
    COUNT(DISTINCT gs.id) as total_plays,
    AVG(gs.score) as average_score,
    MAX(gs.created_at) as last_played_at,
    a.created_at,
    a.updated_at
FROM activities a
LEFT JOIN vocabulary v ON a.id = v.activity_id
LEFT JOIN games g ON a.id = g.activity_id
LEFT JOIN game_sessions gs ON g.id = gs.game_id
GROUP BY a.id, a.title, a.creator_id, a.created_at, a.updated_at;

-- 用戶學習進度視圖
CREATE OR REPLACE VIEW user_learning_progress AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT gs.game_id) as games_played,
    COUNT(DISTINCT a.id) as activities_accessed,
    AVG(gs.score) as average_score,
    SUM(gs.time_spent) as total_time_spent,
    MAX(gs.created_at) as last_activity_at
FROM users u
LEFT JOIN game_sessions gs ON u.id = gs.player_id
LEFT JOIN games g ON gs.game_id = g.id
LEFT JOIN activities a ON g.activity_id = a.id
GROUP BY u.id, u.username;

-- ==================== 初始數據 ====================

-- 插入系統配置
INSERT INTO system_config (config_key, config_value, description, is_public) VALUES
('app_version', '"1.0.0"', '應用程序版本', true),
('max_vocabulary_per_activity', '100', '每個活動最大詞彙數量', false),
('supported_languages', '["en", "zh"]', '支持的語言列表', true),
('default_game_settings', '{"timeLimit": 60, "maxAttempts": 3, "showHints": true}', '默認遊戲設置', false),
('tts_providers', '["google", "azure", "amazon"]', '支持的TTS服務提供商', false)
ON CONFLICT (config_key) DO NOTHING;

-- 創建默認管理員用戶 (密碼: admin123)
INSERT INTO users (username, email, password_hash, role, email_verified) VALUES
('admin', 'admin@wordwall-clone.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hOvG7Iy/2', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- 創建示例教師用戶 (密碼: teacher123)
INSERT INTO users (username, email, password_hash, role, email_verified) VALUES
('teacher_demo', 'teacher@wordwall-clone.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', true)
ON CONFLICT (email) DO NOTHING;

-- 提交事務
COMMIT;

-- 顯示創建結果
\echo '✅ 數據庫初始化完成！'
\echo '📊 已創建的表:'
\echo '   - users (用戶表)'
\echo '   - activities (活動表)'
\echo '   - vocabulary (詞彙表)'
\echo '   - media_files (多媒體資源表)'
\echo '   - games (遊戲表)'
\echo '   - game_sessions (遊戲會話表)'
\echo '   - learning_analytics (學習分析表)'
\echo '   - audio_cache (語音緩存表)'
\echo '   - system_config (系統配置表)'
\echo ''
\echo '👥 默認用戶:'
\echo '   - admin@wordwall-clone.com (管理員, 密碼: admin123)'
\echo '   - teacher@wordwall-clone.com (教師, 密碼: teacher123)'
\echo ''
\echo '🚀 可以開始使用 Wordwall Clone 了！'
