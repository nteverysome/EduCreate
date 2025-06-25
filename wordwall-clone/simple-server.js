/**
 * Wordwall Clone - 簡化版服務器 (無需依賴)
 * 可以立即運行，展示所有功能
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME類型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// 模擬數據存儲
let activities = [];
let vocabulary = [];
let games = [];
let nextId = 1;

// 創建HTTP服務器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // 設置CORS頭部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 處理OPTIONS請求
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API路由處理
    if (pathname.startsWith('/api/')) {
        handleApiRequest(req, res, pathname, method);
        return;
    }

    // 靜態文件服務
    serveStaticFile(req, res, pathname);
});

// 處理API請求
function handleApiRequest(req, res, pathname, method) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = body ? JSON.parse(body) : {};
            
            switch (pathname) {
                case '/api/health':
                    sendJsonResponse(res, 200, {
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        version: '1.0.0'
                    });
                    break;

                case '/api/activities':
                    if (method === 'POST') {
                        createActivity(res, data);
                    } else if (method === 'GET') {
                        getActivities(res);
                    }
                    break;

                case '/api/games/generate':
                    if (method === 'POST') {
                        generateGame(res, data);
                    }
                    break;

                case '/api/vocabulary/analyze':
                    if (method === 'POST') {
                        analyzeVocabulary(res, data);
                    }
                    break;

                default:
                    sendJsonResponse(res, 404, { error: 'API端點不存在' });
            }
        } catch (error) {
            console.error('API錯誤:', error);
            sendJsonResponse(res, 500, { error: '服務器內部錯誤' });
        }
    });
}

// 創建活動
function createActivity(res, data) {
    const activity = {
        id: nextId++,
        title: data.title || '未命名活動',
        description: data.description || '',
        targetAudience: data.targetAudience || 'elementary',
        vocabulary: data.vocabulary || [],
        createdAt: new Date().toISOString()
    };

    activities.push(activity);
    
    sendJsonResponse(res, 201, {
        message: '活動創建成功',
        activityId: activity.id,
        vocabularyCount: activity.vocabulary.length
    });
}

// 獲取活動列表
function getActivities(res) {
    sendJsonResponse(res, 200, {
        activities: activities.map(activity => ({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            targetAudience: activity.targetAudience,
            vocabularyCount: activity.vocabulary.length,
            createdAt: activity.createdAt
        }))
    });
}

// 生成遊戲
function generateGame(res, data) {
    const { activityId, gameType, vocabulary } = data;
    
    // 模擬智能遊戲生成
    const gameConfig = generateGameConfig(gameType, vocabulary || []);
    
    const game = {
        id: nextId++,
        activityId: activityId || 0,
        gameType,
        config: gameConfig,
        createdAt: new Date().toISOString()
    };

    games.push(game);

    sendJsonResponse(res, 200, {
        message: '遊戲生成成功',
        gameId: game.id,
        gameType,
        config: gameConfig
    });
}

// 分析詞彙
function analyzeVocabulary(res, data) {
    const { vocabulary } = data;
    
    if (!vocabulary || vocabulary.length === 0) {
        sendJsonResponse(res, 400, { error: '詞彙數據不能為空' });
        return;
    }

    // 模擬智能分析
    const analysis = {
        count: vocabulary.length,
        complexity: calculateComplexity(vocabulary),
        difficulty: analyzeDifficulty(vocabulary),
        categories: analyzeCategories(vocabulary),
        recommendations: generateRecommendations(vocabulary)
    };

    sendJsonResponse(res, 200, analysis);
}

// 生成遊戲配置
function generateGameConfig(gameType, vocabulary) {
    const baseConfig = {
        vocabulary: vocabulary,
        createdAt: new Date().toISOString()
    };

    switch (gameType) {
        case 'quiz':
            return {
                ...baseConfig,
                type: 'quiz',
                questions: vocabulary.map(word => ({
                    question: word.english,
                    correctAnswer: word.chinese,
                    options: generateQuizOptions(word.chinese, vocabulary),
                    difficulty: word.difficulty || 'beginner'
                })),
                settings: {
                    timeLimit: 60,
                    questionsCount: Math.min(10, vocabulary.length),
                    randomOrder: true
                }
            };

        case 'match':
            return {
                ...baseConfig,
                type: 'match',
                pairs: vocabulary.slice(0, 16).map(word => ({
                    id: word.id || Math.random().toString(36).substr(2, 9),
                    left: word.english,
                    right: word.chinese
                })),
                settings: {
                    timeLimit: 120,
                    maxAttempts: 3
                }
            };

        case 'cards':
            return {
                ...baseConfig,
                type: 'cards',
                cards: vocabulary.map(word => ({
                    id: word.id || Math.random().toString(36).substr(2, 9),
                    front: word.english,
                    back: word.chinese,
                    pronunciation: word.pronunciation
                })),
                settings: {
                    autoFlip: false,
                    showPronunciation: true
                }
            };

        default:
            return baseConfig;
    }
}

// 生成選擇題選項
function generateQuizOptions(correctAnswer, vocabulary) {
    const options = [correctAnswer];
    const otherAnswers = vocabulary
        .map(word => word.chinese)
        .filter(text => text !== correctAnswer);
    
    while (options.length < 4 && otherAnswers.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherAnswers.length);
        options.push(otherAnswers.splice(randomIndex, 1)[0]);
    }
    
    while (options.length < 4) {
        options.push(`選項 ${options.length}`);
    }
    
    return options.sort(() => Math.random() - 0.5);
}

// 計算複雜度
function calculateComplexity(vocabulary) {
    let totalComplexity = 0;
    
    vocabulary.forEach(word => {
        let wordComplexity = 0;
        wordComplexity += (word.english?.length || 0) * 0.1;
        wordComplexity += (word.chinese?.length || 0) * 0.15;
        
        const difficultyScores = { beginner: 1, intermediate: 2, advanced: 3 };
        wordComplexity += difficultyScores[word.difficulty || 'beginner'];
        
        totalComplexity += wordComplexity;
    });

    return Math.round((totalComplexity / vocabulary.length) * 100) / 100;
}

// 分析難度分佈
function analyzeDifficulty(vocabulary) {
    const distribution = { beginner: 0, intermediate: 0, advanced: 0 };
    vocabulary.forEach(word => {
        distribution[word.difficulty || 'beginner']++;
    });

    const total = vocabulary.length;
    return {
        beginner: Math.round((distribution.beginner / total) * 100),
        intermediate: Math.round((distribution.intermediate / total) * 100),
        advanced: Math.round((distribution.advanced / total) * 100)
    };
}

// 分析類別
function analyzeCategories(vocabulary) {
    const categories = {};
    vocabulary.forEach(word => {
        const category = word.category || 'uncategorized';
        categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
}

// 生成推薦
function generateRecommendations(vocabulary) {
    const recommendations = [];
    const count = vocabulary.length;

    if (count >= 5 && count <= 50) {
        recommendations.push({
            gameType: 'quiz',
            suitability: 95,
            reason: `詞彙數量 (${count}) 非常適合選擇題遊戲`
        });
    }

    if (count >= 4 && count <= 20) {
        recommendations.push({
            gameType: 'match',
            suitability: 90,
            reason: `詞彙數量 (${count}) 適合配對遊戲`
        });
    }

    recommendations.push({
        gameType: 'cards',
        suitability: 85,
        reason: '閃卡遊戲適合所有詞彙數量'
    });

    return recommendations.sort((a, b) => b.suitability - a.suitability);
}

// 服務靜態文件
function serveStaticFile(req, res, pathname) {
    // 默認首頁
    if (pathname === '/') {
        pathname = '/interactive-demo.html';
    }

    const filePath = path.join(__dirname, pathname);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>404 - 文件不存在</title></head>
                        <body>
                            <h1>404 - 文件不存在</h1>
                            <p>請求的文件 "${pathname}" 不存在</p>
                            <p><a href="/interactive-demo.html">返回演示頁面</a></p>
                            <p><a href="/vocabulary-input.html">詞彙管理系統</a></p>
                            <p><a href="/agent-dashboard.html">Agent儀表板</a></p>
                        </body>
                    </html>
                `);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('服務器內部錯誤');
            }
            return;
        }

        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'text/plain';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// 發送JSON響應
function sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
}

// 啟動服務器
server.listen(PORT, () => {
    console.log('🚀 Wordwall Clone 簡化服務器已啟動！');
    console.log(`📱 訪問地址: http://localhost:${PORT}`);
    console.log(`🎮 遊戲演示: http://localhost:${PORT}/interactive-demo.html`);
    console.log(`📝 詞彙管理: http://localhost:${PORT}/vocabulary-input.html`);
    console.log(`🤖 Agent儀表板: http://localhost:${PORT}/agent-dashboard.html`);
    console.log(`🔗 API健康檢查: http://localhost:${PORT}/api/health`);
    console.log('\n✨ 所有功能都可以正常使用，無需安裝任何依賴！');
});

// 優雅關閉
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信號，正在關閉服務器...');
    server.close(() => {
        console.log('服務器已關閉');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n收到SIGINT信號，正在關閉服務器...');
    server.close(() => {
        console.log('服務器已關閉');
        process.exit(0);
    });
});

module.exports = server;
