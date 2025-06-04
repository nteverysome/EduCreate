-- Supabase 種子資料腳本
-- 此腳本將建立測試用戶和基本資料

-- 插入測試用戶
-- 密碼: password123 (已加密)
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt") VALUES
('test-user-1', 'Admin User', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL.BoqjyW', 'ADMIN', NOW(), NOW()),
('test-user-2', 'Test User', 'user@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL.BoqjyW', 'USER', NOW(), NOW()),
('test-user-3', 'Demo User', 'demo@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL.BoqjyW', 'USER', NOW(), NOW());

-- 插入範本資料
INSERT INTO "Template" ("id", "name", "description", "type", "thumbnail", "config") VALUES
('template-1', '拖拽排序', '拖拽元素進行排序的互動模板', 'DRAG_DROP', '/templates/drag-drop.png', '{"elements": ["item1", "item2", "item3"], "correctOrder": [1, 2, 3]}'),
('template-2', '選擇題測驗', '多選題測驗模板', 'QUIZ', '/templates/quiz.png', '{"questions": [{"question": "範例問題", "options": ["選項A", "選項B", "選項C"], "correct": 0}]}'),
('template-3', '簡報展示', '互動式簡報模板', 'PRESENTATION', '/templates/presentation.png', '{"slides": [{"title": "標題", "content": "內容"}]}'),
('template-4', '教育遊戲', '遊戲化學習模板', 'GAME', '/templates/game.png', '{"gameType": "memory", "difficulty": "easy"}');

-- 插入訂閱方案
INSERT INTO "Plan" ("id", "name", "description", "price", "interval", "features") VALUES
('plan-free', '免費方案', '基本功能，適合個人使用', 0, 'MONTHLY', ARRAY['最多 3 個活動', '基本模板', '社群支援']),
('plan-pro', '專業方案', '進階功能，適合教師和小型機構', 19.99, 'MONTHLY', ARRAY['無限活動', '所有模板', '優先支援', '進階分析']),
('plan-enterprise', '企業方案', '完整功能，適合大型機構', 99.99, 'MONTHLY', ARRAY['無限活動', '自訂模板', '專屬支援', '完整分析', 'API 存取']);

-- 插入範例活動
INSERT INTO "Activity" ("id", "title", "description", "content", "elements", "type", "published", "templateId", "userId", "createdAt", "updatedAt") VALUES
('activity-1', '數學排序練習', '將數字按照大小順序排列', '{"instructions": "請將下列數字按照從小到大的順序排列"}', '[{"id": "num1", "value": "5"}, {"id": "num2", "value": "2"}, {"id": "num3", "value": "8"}, {"id": "num4", "value": "1"}]', 'DRAG_DROP', true, 'template-1', 'test-user-1', NOW(), NOW()),
('activity-2', '英文單字測驗', '測試基本英文單字的理解', '{"instructions": "請選擇正確的中文翻譯"}', '[{"question": "Apple 的中文是什麼？", "options": ["蘋果", "橘子", "香蕉"], "correct": 0}]', 'QUIZ', true, 'template-2', 'test-user-1', NOW(), NOW()),
('activity-3', '科學簡報', '介紹太陽系的基本知識', '{"instructions": "點擊下一頁繼續"}', '[{"slide": 1, "title": "太陽系", "content": "太陽系包含太陽和八大行星"}]', 'PRESENTATION', false, 'template-3', 'test-user-2', NOW(), NOW());

-- 插入範例 H5P 內容
INSERT INTO "H5PContent" ("id", "title", "description", "contentType", "contentPath", "metadata", "userId", "createdAt", "updatedAt") VALUES
('h5p-1', '互動式時間軸', '歷史事件的互動時間軸', 'H5P.Timeline', '/h5p/timeline-1', '{"events": [{"year": "1969", "event": "人類首次登月"}]}', 'test-user-1', NOW(), NOW()),
('h5p-2', '記憶卡片遊戲', '配對學習的記憶遊戲', 'H5P.MemoryGame', '/h5p/memory-1', '{"cards": [{"image": "cat.jpg", "text": "貓"}, {"image": "dog.jpg", "text": "狗"}]}', 'test-user-2', NOW(), NOW());

-- 插入測試訂閱
INSERT INTO "Subscription" ("id", "userId", "planId", "status", "startDate", "endDate", "currentPeriodStart", "currentPeriodEnd") VALUES
('sub-1', 'test-user-1', 'plan-pro', 'ACTIVE', NOW(), NOW() + INTERVAL '1 month', NOW(), NOW() + INTERVAL '1 month'),
('sub-2', 'test-user-2', 'plan-free', 'ACTIVE', NOW(), NULL, NOW(), NOW() + INTERVAL '1 month');