// 🎬 影片處理服務器
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 5001;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 配置文件上傳
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads/videos';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /mp4|avi|mov|webm|mkv/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允許影片文件！'));
        }
    }
});

// 影片分析結果存儲
let analysisResults = {};

// 路由

// 健康檢查
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Video Processor',
        timestamp: new Date().toISOString()
    });
});

// 上傳影片
app.post('/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '沒有上傳文件' });
        }

        const videoInfo = {
            id: req.file.filename.replace(path.extname(req.file.filename), ''),
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadTime: new Date().toISOString(),
            path: req.file.path
        };

        res.json({
            success: true,
            message: '影片上傳成功',
            video: videoInfo
        });

    } catch (error) {
        res.status(500).json({ error: '上傳失敗: ' + error.message });
    }
});

// 分析影片
app.post('/analyze/:videoId', (req, res) => {
    try {
        const videoId = req.params.videoId;
        
        // 模擬影片分析過程
        const analysis = performVideoAnalysis(videoId);
        
        analysisResults[videoId] = analysis;
        
        res.json({
            success: true,
            analysis: analysis
        });

    } catch (error) {
        res.status(500).json({ error: '分析失敗: ' + error.message });
    }
});

// 獲取分析結果
app.get('/analysis/:videoId', (req, res) => {
    const videoId = req.params.videoId;
    const analysis = analysisResults[videoId];
    
    if (!analysis) {
        return res.status(404).json({ error: '找不到分析結果' });
    }
    
    res.json({
        success: true,
        analysis: analysis
    });
});

// 生成改進代碼
app.post('/generate-improvements/:videoId', (req, res) => {
    try {
        const videoId = req.params.videoId;
        const analysis = analysisResults[videoId];
        
        if (!analysis) {
            return res.status(404).json({ error: '找不到分析結果' });
        }
        
        const improvements = generateImprovements(analysis);
        
        res.json({
            success: true,
            improvements: improvements
        });

    } catch (error) {
        res.status(500).json({ error: '生成失敗: ' + error.message });
    }
});

// 影片分析函數
function performVideoAnalysis(videoId) {
    // 這裡實現實際的影片分析邏輯
    // 目前使用模擬數據
    
    return {
        videoId: videoId,
        analysisTime: new Date().toISOString(),
        
        // 遊戲機制分析
        gameplayAnalysis: {
            airplaneMovement: {
                type: 'smooth_vertical',
                speed: 'medium',
                responsiveness: 'high',
                physics: 'basic'
            },
            cloudSpawning: {
                frequency: '2-3_seconds',
                pattern: 'random_vertical',
                difficulty: 'progressive'
            },
            collisionDetection: {
                accuracy: 'pixel_perfect',
                feedback: 'immediate',
                effects: 'explosion_animation'
            }
        },
        
        // 視覺效果分析
        visualAnalysis: {
            airplane: {
                style: '2d_sprite',
                animation: 'basic',
                suggestions: ['add_3d_model', 'enhance_animation', 'add_trail_effect']
            },
            background: {
                style: 'static_gradient',
                layers: 1,
                suggestions: ['add_parallax_scrolling', 'animated_clouds', 'dynamic_lighting']
            },
            explosions: {
                style: 'simple_circle',
                particles: false,
                suggestions: ['particle_system', 'screen_shake', 'color_variation']
            }
        },
        
        // 性能分析
        performanceAnalysis: {
            frameRate: 'variable',
            optimization: 'basic',
            suggestions: ['use_requestAnimationFrame', 'object_pooling', 'efficient_collision']
        },
        
        // 用戶體驗分析
        uxAnalysis: {
            controls: {
                responsiveness: 'good',
                feedback: 'visual_only',
                suggestions: ['add_haptic_feedback', 'audio_cues', 'improved_visual_feedback']
            },
            difficulty: {
                curve: 'linear',
                adaptation: 'none',
                suggestions: ['dynamic_difficulty', 'player_skill_tracking', 'adaptive_spawning']
            }
        }
    };
}

// 生成改進建議
function generateImprovements(analysis) {
    return {
        codeImprovements: {
            // 飛機物理系統
            airplanePhysics: `
class EnhancedAirplane {
    constructor() {
        this.position = { x: 50, y: window.innerHeight / 2 };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.maxSpeed = 8;
        this.friction = 0.85;
    }
    
    update(input) {
        // 根據輸入計算加速度
        this.acceleration.y = input.up ? -0.5 : input.down ? 0.5 : 0;
        
        // 更新速度
        this.velocity.y += this.acceleration.y;
        this.velocity.y = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity.y));
        this.velocity.y *= this.friction;
        
        // 更新位置
        this.position.y += this.velocity.y;
        this.position.y = Math.max(50, Math.min(window.innerHeight - 100, this.position.y));
    }
}`,
            
            // 粒子系統
            particleSystem: `
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.pool = [];
    }
    
    createExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            particle.reset(x, y, color);
            this.particles.push(particle);
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (particle.isDead()) {
                this.pool.push(this.particles.splice(i, 1)[0]);
            }
        }
    }
    
    getParticle() {
        return this.pool.pop() || new Particle();
    }
}`,
            
            // 性能優化
            performanceOptimization: `
class GameLoop {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = 1000 / 60; // 60 FPS
    }
    
    run(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.accumulator += deltaTime;
        
        // 固定時間步長更新
        while (this.accumulator >= this.fixedTimeStep) {
            this.update(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }
        
        // 渲染
        this.render(this.accumulator / this.fixedTimeStep);
        
        requestAnimationFrame(this.run.bind(this));
    }
}`
        },
        
        visualImprovements: [
            '添加 3D 飛機模型',
            '實現多層背景視差滾動',
            '增強爆炸粒子效果',
            '添加動態光照效果',
            '優化顏色對比度'
        ],
        
        gameplayImprovements: [
            '智能難度調整',
            '物理引擎集成',
            '音效和震動反饋',
            '成就系統',
            '多人競技模式'
        ],
        
        performanceImprovements: [
            '對象池管理',
            '高效碰撞檢測',
            '渲染優化',
            '內存管理',
            '移動端優化'
        ]
    };
}

// 錯誤處理
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: '文件太大，最大允許 100MB' });
        }
    }
    
    res.status(500).json({ error: error.message });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`🎬 影片處理服務器運行在 http://localhost:${PORT}`);
    console.log(`📤 上傳端點: POST /upload`);
    console.log(`🔍 分析端點: POST /analyze/:videoId`);
    console.log(`📊 結果端點: GET /analysis/:videoId`);
});

module.exports = app;
