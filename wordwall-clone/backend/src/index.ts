import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';

// 載入環境變量
dotenv.config();

// 導入路由和中間件
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import activityRoutes from './routes/activities';
import gameResultRoutes from './routes/gameResults';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// 安全中間件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS 配置
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 限制每個 IP 每 15 分鐘最多 100 個請求
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

// 基本中間件
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/game-results', gameResultRoutes);

// 簡化的認證路由
app.post('/api/auth/demo-login', (req, res) => {
  const { role } = req.body;

  const demoUser = {
    id: role === 'STUDENT' ? 'student-1' : 'teacher-1',
    email: role === 'STUDENT' ? 'student@demo.com' : 'teacher@demo.com',
    username: role === 'STUDENT' ? 'student' : 'teacher',
    displayName: role === 'STUDENT' ? 'Demo Student' : 'Demo Teacher',
    role: role || 'TEACHER',
  };

  res.json({
    success: true,
    message: 'Demo login successful',
    data: {
      user: demoUser,
      token: 'demo-token-' + Date.now(),
    },
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: 'demo-user',
        email: 'demo@example.com',
        username: 'demo',
        displayName: 'Demo User',
        role: 'TEACHER',
      },
    },
  });
});

// 遊戲相關路由
app.get('/api/games/templates', (req, res) => {
  res.json({
    templates: [
      {
        id: 'QUIZ',
        name: '測驗',
        description: '多選題測驗遊戲',
        category: 'quiz',
        difficulty: 'easy',
        isAvailable: true,
      },
      {
        id: 'MATCH_UP',
        name: '配對',
        description: '拖拽配對遊戲',
        category: 'matching',
        difficulty: 'medium',
        isAvailable: true,
      },
      {
        id: 'SPIN_WHEEL',
        name: '轉盤',
        description: '旋轉轉盤遊戲',
        category: 'random',
        difficulty: 'easy',
        isAvailable: true,
      },
      {
        id: 'GROUP_SORT',
        name: '分組排序',
        description: '拖拽分組遊戲',
        category: 'sorting',
        difficulty: 'medium',
        isAvailable: true,
      },
      {
        id: 'FLASH_CARDS',
        name: '閃卡',
        description: '翻轉卡片學習',
        category: 'memory',
        difficulty: 'easy',
        isAvailable: true,
      },
    ],
  });
});

// 活動相關路由
app.get('/api/activities', (req, res) => {
  res.json({
    activities: [
      {
        id: '1',
        title: '數學基礎測驗',
        description: '測試基本數學運算',
        templateType: 'QUIZ',
        isPublic: true,
        playCount: 156,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: '英語詞彙配對',
        description: '學習常用英語單詞',
        templateType: 'MATCH_UP',
        isPublic: true,
        playCount: 89,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: '科學知識轉盤',
        description: '隨機科學知識問答',
        templateType: 'SPIN_WHEEL',
        isPublic: true,
        playCount: 67,
        createdAt: new Date().toISOString(),
      },
    ],
  });
});

// 統計數據路由
app.get('/api/stats', (req, res) => {
  res.json({
    stats: {
      totalUsers: 1250,
      totalActivities: 89,
      totalGamesPlayed: 15600,
      averageScore: 78.5,
      popularTemplates: [
        { type: 'QUIZ', count: 45, percentage: 50.6 },
        { type: 'MATCH_UP', count: 23, percentage: 25.8 },
        { type: 'SPIN_WHEEL', count: 12, percentage: 13.5 },
        { type: 'GROUP_SORT', count: 6, percentage: 6.7 },
        { type: 'FLASH_CARDS', count: 3, percentage: 3.4 },
      ],
    },
  });
});

// 演示遊戲數據路由
app.get('/api/demo/quiz', (req, res) => {
  res.json({
    id: 'demo-quiz',
    title: '數學基礎測驗',
    description: '測試基本數學運算能力',
    templateType: 'QUIZ',
    content: {
      questions: [
        {
          id: 'q1',
          text: '2 + 2 = ?',
          options: [
            { id: 'a', text: '3', isCorrect: false },
            { id: 'b', text: '4', isCorrect: true },
            { id: 'c', text: '5', isCorrect: false },
            { id: 'd', text: '6', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          text: '5 × 3 = ?',
          options: [
            { id: 'a', text: '12', isCorrect: false },
            { id: 'b', text: '15', isCorrect: true },
            { id: 'c', text: '18', isCorrect: false },
            { id: 'd', text: '20', isCorrect: false },
          ],
        },
        {
          id: 'q3',
          text: '10 ÷ 2 = ?',
          options: [
            { id: 'a', text: '4', isCorrect: false },
            { id: 'b', text: '5', isCorrect: true },
            { id: 'c', text: '6', isCorrect: false },
            { id: 'd', text: '8', isCorrect: false },
          ],
        },
      ],
      timeLimit: 60,
      showProgress: true,
      shuffleQuestions: false,
    },
  });
});

app.get('/api/demo/spin-wheel', (req, res) => {
  res.json({
    id: 'demo-spin-wheel',
    title: '幸運轉盤',
    description: '轉動轉盤看看你的運氣',
    templateType: 'SPIN_WHEEL',
    content: {
      segments: [
        { id: 's1', text: '大獎', color: '#ff6b6b', weight: 1, points: 100 },
        { id: 's2', text: '小獎', color: '#4ecdc4', weight: 3, points: 50 },
        { id: 's3', text: '安慰獎', color: '#45b7d1', weight: 5, points: 20 },
        { id: 's4', text: '再試一次', color: '#96ceb4', weight: 4, points: 10 },
        { id: 's5', text: '謝謝參與', color: '#ffeaa7', weight: 6, points: 5 },
        { id: 's6', text: '幸運星', color: '#dda0dd', weight: 2, points: 80 },
      ],
      mode: 'random',
      spinDuration: 3000,
      showPointer: true,
      allowMultipleSpin: true,
      enableSound: true,
    },
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 錯誤處理中間件
app.use(errorHandler);

// 簡化的 Socket.IO 處理器
io.on('connection', (socket) => {
  console.log(`[SOCKET] User connected: ${socket.id}`);

  socket.on('join-room', (data) => {
    const { roomId, playerName } = data;
    socket.join(roomId);
    socket.to(roomId).emit('player-joined', { playerName, playerId: socket.id });
    console.log(`[SOCKET] ${playerName} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] User disconnected: ${socket.id}`);
  });
});

// 啟動服務器
server.listen(PORT, () => {
  console.log(`🚀 Wordwall Clone Backend Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // 顯示可用的 API 端點
  console.log('\n📋 Available API Endpoints:');
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api/games/templates - Game templates`);
  console.log(`   GET  /api/activities - Activities list`);
  console.log(`   GET  /api/stats - Platform statistics`);
  console.log(`   GET  /api/demo/quiz - Demo quiz game`);
  console.log(`   GET  /api/demo/spin-wheel - Demo spin wheel game`);
  console.log(`   POST /api/auth/* - Authentication endpoints`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
