/**
 * Wordwall Clone - 後端API服務器
 * Multi-Agent Backend Architecture Agent 生成
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const Redis = require('redis');
const path = require('path');

// 初始化Express應用
const app = express();
const PORT = process.env.PORT || 3000;

// 數據庫連接配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'wordwall_clone',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// Redis連接配置
const redisClient = Redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
});

// PostgreSQL連接池
const pool = new Pool(dbConfig);

// 中間件配置
app.use(helmet()); // 安全頭部
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 100, // 每個IP最多100個請求
    message: { error: '請求過於頻繁，請稍後再試' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 靜態文件服務
app.use(express.static(path.join(__dirname)));

// JWT認證中間件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '需要認證令牌' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: '無效的認證令牌' });
        }
        req.user = user;
        next();
    });
};

// ==================== 用戶認證API ====================

// 用戶註冊
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role = 'teacher' } = req.body;

        // 驗證輸入
        if (!username || !email || !password) {
            return res.status(400).json({ error: '用戶名、郵箱和密碼都是必需的' });
        }

        // 檢查用戶是否已存在
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: '用戶名或郵箱已存在' });
        }

        // 加密密碼
        const hashedPassword = await bcrypt.hash(password, 12);

        // 創建用戶
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, role, created_at) 
             VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, role`,
            [username, email, hashedPassword, role]
        );

        const user = result.rows[0];

        // 生成JWT令牌
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: '用戶註冊成功',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('註冊錯誤:', error);
        res.status(500).json({ error: '服務器內部錯誤' });
    }
});

// 用戶登錄
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: '郵箱和密碼都是必需的' });
        }

        // 查找用戶
        const result = await pool.query(
            'SELECT id, username, email, password_hash, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: '郵箱或密碼錯誤' });
        }

        const user = result.rows[0];

        // 驗證密碼
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: '郵箱或密碼錯誤' });
        }

        // 生成JWT令牌
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: '登錄成功',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('登錄錯誤:', error);
        res.status(500).json({ error: '服務器內部錯誤' });
    }
});

// ==================== 活動管理API ====================

// 創建活動
app.post('/api/activities', authenticateToken, async (req, res) => {
    try {
        const { title, description, targetAudience, vocabulary } = req.body;
        const userId = req.user.userId;

        if (!title || !vocabulary || vocabulary.length === 0) {
            return res.status(400).json({ error: '活動標題和詞彙列表是必需的' });
        }

        // 開始事務
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 創建活動
            const activityResult = await client.query(
                `INSERT INTO activities (title, description, target_audience, creator_id, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`,
                [title, description, targetAudience, userId]
            );

            const activityId = activityResult.rows[0].id;

            // 批量插入詞彙
            const vocabularyValues = vocabulary.map((word, index) => 
                `($1, $${index * 6 + 2}, $${index * 6 + 3}, $${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6}, $${index * 6 + 7})`
            ).join(', ');

            const vocabularyParams = [activityId];
            vocabulary.forEach(word => {
                vocabularyParams.push(
                    word.english,
                    word.chinese,
                    word.pronunciation || null,
                    word.category || null,
                    word.difficulty || 'beginner'
                );
            });

            await client.query(
                `INSERT INTO vocabulary (activity_id, english_text, chinese_text, pronunciation, category, difficulty, created_at)
                 VALUES ${vocabularyValues}`,
                vocabularyParams
            );

            await client.query('COMMIT');

            res.status(201).json({
                message: '活動創建成功',
                activityId,
                vocabularyCount: vocabulary.length
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('創建活動錯誤:', error);
        res.status(500).json({ error: '服務器內部錯誤' });
    }
});

// 獲取用戶的活動列表
app.get('/api/activities', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT a.id, a.title, a.description, a.target_audience, a.created_at, a.updated_at,
                   COUNT(v.id) as vocabulary_count
            FROM activities a
            LEFT JOIN vocabulary v ON a.id = v.activity_id
            WHERE a.creator_id = $1
        `;
        const params = [userId];

        if (search) {
            query += ` AND (a.title ILIKE $${params.length + 1} OR a.description ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        query += ` GROUP BY a.id ORDER BY a.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // 獲取總數
        let countQuery = 'SELECT COUNT(*) FROM activities WHERE creator_id = $1';
        const countParams = [userId];
        if (search) {
            countQuery += ` AND (title ILIKE $2 OR description ILIKE $2)`;
            countParams.push(`%${search}%`);
        }
        const countResult = await pool.query(countQuery, countParams);

        res.json({
            activities: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        });

    } catch (error) {
        console.error('獲取活動列表錯誤:', error);
        res.status(500).json({ error: '服務器內部錯誤' });
    }
});

// 獲取活動詳情
app.get('/api/activities/:id', authenticateToken, async (req, res) => {
    try {
        const activityId = req.params.id;
        const userId = req.user.userId;

        // 獲取活動信息
        const activityResult = await pool.query(
            'SELECT * FROM activities WHERE id = $1 AND creator_id = $2',
            [activityId, userId]
        );

        if (activityResult.rows.length === 0) {
            return res.status(404).json({ error: '活動不存在或無權限訪問' });
        }

        // 獲取詞彙列表
        const vocabularyResult = await pool.query(
            'SELECT * FROM vocabulary WHERE activity_id = $1 ORDER BY created_at',
            [activityId]
        );

        const activity = activityResult.rows[0];
        activity.vocabulary = vocabularyResult.rows;

        res.json(activity);

    } catch (error) {
        console.error('獲取活動詳情錯誤:', error);
        res.status(500).json({ error: '服務器內部錯誤' });
    }
});

// ==================== 遊戲生成API ====================

// 生成遊戲配置
app.post('/api/games/generate', authenticateToken, async (req, res) => {
    try {
        const { activityId, gameType, settings = {} } = req.body;
        const userId = req.user.userId;

        // 驗證活動權限
        const activityResult = await pool.query(
            'SELECT id FROM activities WHERE id = $1 AND creator_id = $2',
            [activityId, userId]
        );

        if (activityResult.rows.length === 0) {
            return res.status(404).json({ error: '活動不存在或無權限訪問' });
        }

        // 獲取詞彙數據
        const vocabularyResult = await pool.query(
            'SELECT * FROM vocabulary WHERE activity_id = $1',
            [activityId]
        );

        const vocabulary = vocabularyResult.rows;
        if (vocabulary.length === 0) {
            return res.status(400).json({ error: '活動中沒有詞彙數據' });
        }

        // 生成遊戲配置
        const gameConfig = generateGameConfig(gameType, vocabulary, settings);

        // 保存遊戲記錄
        const gameResult = await pool.query(
            `INSERT INTO games (activity_id, game_type, config, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING id`,
            [activityId, gameType, JSON.stringify(gameConfig)]
        );

        res.json({
            message: '遊戲生成成功',
            gameId: gameResult.rows[0].id,
            gameType,
            config: gameConfig
        });

    } catch (error) {
        console.error('生成遊戲錯誤:', error);
        res.status(500).json({ error: '服務器內部錯誤' });
    }
});

// 遊戲配置生成函數
function generateGameConfig(gameType, vocabulary, settings) {
    const baseConfig = {
        vocabulary: vocabulary.map(word => ({
            id: word.id,
            english: word.english_text,
            chinese: word.chinese_text,
            pronunciation: word.pronunciation,
            category: word.category,
            difficulty: word.difficulty
        })),
        createdAt: new Date().toISOString()
    };

    switch (gameType) {
        case 'quiz':
            return {
                ...baseConfig,
                type: 'quiz',
                questions: vocabulary.map(word => ({
                    question: word.english_text,
                    correctAnswer: word.chinese_text,
                    options: generateQuizOptions(word.chinese_text, vocabulary),
                    difficulty: word.difficulty
                })),
                settings: {
                    timeLimit: settings.timeLimit || 60,
                    questionsCount: Math.min(settings.questionsCount || 10, vocabulary.length),
                    randomOrder: settings.randomOrder !== false
                }
            };

        case 'match':
            return {
                ...baseConfig,
                type: 'match',
                pairs: vocabulary.slice(0, 16).map(word => ({
                    id: word.id,
                    left: word.english_text,
                    right: word.chinese_text
                })),
                settings: {
                    timeLimit: settings.timeLimit || 120,
                    maxAttempts: settings.maxAttempts || 3
                }
            };

        case 'cards':
            return {
                ...baseConfig,
                type: 'cards',
                cards: vocabulary.map(word => ({
                    id: word.id,
                    front: word.english_text,
                    back: word.chinese_text,
                    pronunciation: word.pronunciation
                })),
                settings: {
                    autoFlip: settings.autoFlip || false,
                    showPronunciation: settings.showPronunciation !== false
                }
            };

        default:
            throw new Error(`不支持的遊戲類型: ${gameType}`);
    }
}

// 生成選擇題選項
function generateQuizOptions(correctAnswer, vocabulary) {
    const options = [correctAnswer];
    const otherAnswers = vocabulary
        .map(word => word.chinese_text)
        .filter(text => text !== correctAnswer);
    
    // 隨機選擇3個錯誤選項
    while (options.length < 4 && otherAnswers.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherAnswers.length);
        options.push(otherAnswers.splice(randomIndex, 1)[0]);
    }
    
    // 如果詞彙不足4個，用默認選項填充
    while (options.length < 4) {
        options.push(`選項 ${options.length}`);
    }
    
    // 打亂選項順序
    return options.sort(() => Math.random() - 0.5);
}

// ==================== 健康檢查 ====================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404處理
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'API端點不存在' });
    } else {
        res.sendFile(path.join(__dirname, 'interactive-demo.html'));
    }
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
    console.error('服務器錯誤:', error);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? '服務器內部錯誤' 
            : error.message 
    });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`🚀 Wordwall Clone API 服務器運行在端口 ${PORT}`);
    console.log(`📱 前端界面: http://localhost:${PORT}`);
    console.log(`🔗 API端點: http://localhost:${PORT}/api`);
});

// 優雅關閉
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信號，正在關閉服務器...');
    pool.end();
    redisClient.quit();
    process.exit(0);
});

module.exports = app;
