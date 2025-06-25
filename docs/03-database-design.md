# 🗄️ 數據庫設計規格

## 🎯 設計目標

設計一個高效、可擴展的數據庫架構，支持教育遊戲平台的所有核心功能。

## 📐 數據庫架構概覽

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │    │   Cloudinary    │
│   (主數據庫)     │    │     (緩存)       │    │   (文件存儲)     │
│                 │    │                 │    │                 │
│ - 用戶數據       │    │ - 會話數據       │    │ - 圖片文件       │
│ - 活動內容       │    │ - 遊戲狀態       │    │ - 音頻文件       │
│ - 遊戲結果       │    │ - 排行榜         │    │ - 視頻文件       │
│ - 系統配置       │    │ - 速率限制       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 數據模型設計

### 🔐 用戶相關表

#### users (用戶表)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'teacher' CHECK (role IN ('student', 'teacher', 'admin')),
  subscription_type VARCHAR(50) DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'school')),
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### user_sessions (用戶會話表)
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

### 🎮 遊戲模板相關表

#### templates (模板表)
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('quiz', 'match_up', 'spin_wheel', 'group_sort', 'flash_cards', 'anagram', 'find_match', 'open_box')),
  description TEXT,
  icon_url TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  default_settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_is_active ON templates(is_active);
CREATE INDEX idx_templates_sort_order ON templates(sort_order);
```

#### template_categories (模板分類表)
```sql
CREATE TABLE template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- HEX 顏色代碼
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE template_category_relations (
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  category_id UUID REFERENCES template_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, category_id)
);
```

### 📝 活動相關表

#### activities (活動表)
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  visual_style VARCHAR(50) DEFAULT 'default',
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  language VARCHAR(10) DEFAULT 'en',
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration INTEGER, -- 預估遊戲時間(秒)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_template_id ON activities(template_id);
CREATE INDEX idx_activities_is_public ON activities(is_public);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_play_count ON activities(play_count);
CREATE INDEX idx_activities_tags ON activities USING GIN(tags);
```

#### activity_versions (活動版本表)
```sql
CREATE TABLE activity_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  change_description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(activity_id, version_number)
);

-- 索引
CREATE INDEX idx_activity_versions_activity_id ON activity_versions(activity_id);
CREATE INDEX idx_activity_versions_created_at ON activity_versions(created_at);
```

### 🎯 遊戲結果相關表

#### game_sessions (遊戲會話表)
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  player_name VARCHAR(100),
  player_email VARCHAR(255),
  player_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_type VARCHAR(20) DEFAULT 'single' CHECK (session_type IN ('single', 'multiplayer', 'assignment')),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  is_completed BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT
);

-- 索引
CREATE INDEX idx_game_sessions_activity_id ON game_sessions(activity_id);
CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at);
```

#### game_results (遊戲結果表)
```sql
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  player_name VARCHAR(100) NOT NULL,
  player_email VARCHAR(255),
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN max_score > 0 THEN (score::DECIMAL / max_score * 100) ELSE 0 END
  ) STORED,
  time_taken INTEGER, -- 遊戲用時(秒)
  answers JSONB DEFAULT '{}', -- 詳細答案記錄
  metadata JSONB DEFAULT '{}', -- 額外元數據
  completed_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_game_results_session_id ON game_results(session_id);
CREATE INDEX idx_game_results_activity_id ON game_results(activity_id);
CREATE INDEX idx_game_results_score ON game_results(score);
CREATE INDEX idx_game_results_completed_at ON game_results(completed_at);
```

### 📚 教學管理相關表

#### assignments (作業表)
```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructions TEXT,
  access_code VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(100), -- 可選的作業密碼
  max_attempts INTEGER DEFAULT 1,
  time_limit INTEGER, -- 時間限制(秒)
  show_results BOOLEAN DEFAULT true,
  show_correct_answers BOOLEAN DEFAULT false,
  allow_review BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  due_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_assignments_activity_id ON assignments(activity_id);
CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX idx_assignments_access_code ON assignments(access_code);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
```

#### assignment_submissions (作業提交表)
```sql
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_name VARCHAR(100) NOT NULL,
  student_email VARCHAR(255),
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL,
  time_taken INTEGER,
  answers JSONB DEFAULT '{}',
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(assignment_id, student_email, attempt_number)
);

-- 索引
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_assignment_submissions_submitted_at ON assignment_submissions(submitted_at);
```

### 🌐 分享與社交相關表

#### activity_shares (活動分享表)
```sql
CREATE TABLE activity_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('link', 'embed', 'qr_code')),
  share_token VARCHAR(100) UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_activity_shares_activity_id ON activity_shares(activity_id);
CREATE INDEX idx_activity_shares_share_token ON activity_shares(share_token);
```

#### activity_likes (活動點讚表)
```sql
CREATE TABLE activity_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- 索引
CREATE INDEX idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX idx_activity_likes_user_id ON activity_likes(user_id);
```

### 📊 系統管理相關表

#### audit_logs (審計日誌表)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### system_settings (系統設置表)
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_system_settings_key ON system_settings(key);
```

## 🔄 Redis 緩存設計

### 緩存鍵命名規範
```javascript
// 用戶相關
user:session:{userId}           // 用戶會話信息
user:profile:{userId}           // 用戶資料緩存
user:permissions:{userId}       // 用戶權限緩存

// 活動相關
activity:data:{activityId}      // 活動完整數據
activity:stats:{activityId}     // 活動統計數據
activity:popular                // 熱門活動列表

// 遊戲相關
game:session:{sessionId}        // 遊戲會話狀態
game:leaderboard:{activityId}   // 排行榜數據
game:realtime:{gameId}          // 實時遊戲狀態

// 系統相關
rate_limit:{ip}:{endpoint}      // API 速率限制
system:settings                 // 系統設置緩存
template:list                   // 模板列表緩存
```

### 緩存策略
```javascript
// 緩存過期時間設置
const CACHE_TTL = {
  USER_SESSION: 24 * 60 * 60,      // 24小時
  USER_PROFILE: 60 * 60,           // 1小時
  ACTIVITY_DATA: 30 * 60,          // 30分鐘
  GAME_SESSION: 2 * 60 * 60,       // 2小時
  LEADERBOARD: 5 * 60,             // 5分鐘
  SYSTEM_SETTINGS: 60 * 60,        // 1小時
  RATE_LIMIT: 60                   // 1分鐘
};
```

## 📈 性能優化策略

### 數據庫優化
```sql
-- 分區表設計 (按時間分區)
CREATE TABLE game_results_y2024m01 PARTITION OF game_results
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 物化視圖 (活動統計)
CREATE MATERIALIZED VIEW activity_stats AS
SELECT 
  a.id,
  a.title,
  COUNT(gr.id) as total_plays,
  AVG(gr.score) as avg_score,
  MAX(gr.score) as max_score
FROM activities a
LEFT JOIN game_results gr ON a.id = gr.activity_id
GROUP BY a.id, a.title;

-- 定期刷新物化視圖
CREATE OR REPLACE FUNCTION refresh_activity_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY activity_stats;
END;
$$ LANGUAGE plpgsql;
```

### 查詢優化
```sql
-- 複合索引優化
CREATE INDEX idx_activities_public_popular ON activities(is_public, play_count DESC) 
WHERE is_public = true;

-- 部分索引優化
CREATE INDEX idx_activities_recent_public ON activities(created_at DESC) 
WHERE is_public = true AND created_at > NOW() - INTERVAL '30 days';
```

## 🧪 測試數據準備

### 測試數據腳本
```sql
-- 插入測試用戶
INSERT INTO users (email, username, password_hash, display_name, role) VALUES
('teacher@test.com', 'teacher1', '$2b$10$hash...', 'Test Teacher', 'teacher'),
('student@test.com', 'student1', '$2b$10$hash...', 'Test Student', 'student');

-- 插入測試模板
INSERT INTO templates (name, type, description, config) VALUES
('基礎測驗', 'quiz', '多選題測驗模板', '{"maxQuestions": 10, "timeLimit": 300}'),
('配對遊戲', 'match_up', '拖拽配對模板', '{"maxPairs": 8, "allowHints": true}');

-- 插入測試活動
INSERT INTO activities (user_id, template_id, title, content, is_public) VALUES
((SELECT id FROM users WHERE email = 'teacher@test.com'), 
 (SELECT id FROM templates WHERE type = 'quiz'), 
 '英語單字測驗', 
 '{"questions": [{"text": "What is apple in Chinese?", "options": ["蘋果", "香蕉", "橘子"], "correct": 0}]}',
 true);
```

---

**狀態**: ⏳ 計劃中
**負責人**: 數據庫工程師
**預計完成**: 第 2 天
**依賴項**: 技術架構設計完成

## 🔧 實施步驟

1. **創建數據庫**: 設置 PostgreSQL 實例
2. **執行 DDL**: 運行表結構創建腳本
3. **配置索引**: 創建性能優化索引
4. **設置緩存**: 配置 Redis 緩存策略
5. **插入種子數據**: 添加初始測試數據
6. **性能測試**: 驗證查詢性能
