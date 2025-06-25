// 簡化的演示服務器
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'demo-secret-key';

// 中間件
app.use(cors({
  origin: 'http://localhost:3002',
  credentials: true
}));
app.use(express.json());

// 模擬數據庫
const users = [
  {
    id: '1',
    username: 'demo_teacher',
    email: 'teacher@demo.com',
    displayName: '演示教師',
    role: 'TEACHER',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
  },
  {
    id: '2',
    username: 'demo_student',
    email: 'student@demo.com',
    displayName: '演示學生',
    role: 'STUDENT',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // password
  }
];

const activities = [
  {
    id: '1',
    title: '數學基礎測驗',
    description: '測試基本數學運算能力',
    template: { name: '測驗', type: 'QUIZ' },
    user: { displayName: '演示教師', username: 'demo_teacher' },
    userId: '1',
    isPublic: true,
    content: {
      questions: [
        { question: '2 + 2 = ?', options: ['3', '4', '5', '6'], correct: 1 },
        { question: '5 × 3 = ?', options: ['12', '15', '18', '20'], correct: 1 }
      ]
    },
    settings: { timeLimit: 60, showScore: true },
    tags: ['數學', '基礎'],
    difficultyLevel: 2,
    estimatedDuration: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { gameResults: 156, likes: 23, gameSessions: 89 }
  },
  {
    id: '2',
    title: '英語詞彙配對',
    description: '學習常用英語單詞',
    template: { name: '配對', type: 'MATCH_UP' },
    user: { displayName: '演示教師', username: 'demo_teacher' },
    userId: '1',
    isPublic: true,
    content: {
      pairs: [
        { english: 'cat', chinese: '貓' },
        { english: 'dog', chinese: '狗' },
        { english: 'bird', chinese: '鳥' }
      ]
    },
    settings: { shuffleItems: true },
    tags: ['英語', '詞彙'],
    difficultyLevel: 1,
    estimatedDuration: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { gameResults: 89, likes: 15, gameSessions: 67 }
  }
];

const gameResults = [];

// 認證中間件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// 路由

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Wordwall Clone Demo Server is running!'
  });
});

// 認證路由
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 演示登入
app.post('/api/auth/demo-login', (req, res) => {
  const { role } = req.body;
  const user = users.find(u => u.role === role);
  
  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid role' });
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken: accessToken
    }
  });
});

// 獲取用戶資料
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, data: { user: userWithoutPassword } });
});

// 活動路由
app.get('/api/activities/public', (req, res) => {
  const publicActivities = activities.filter(a => a.isPublic);
  res.json({
    success: true,
    data: {
      activities: publicActivities,
      pagination: {
        page: 1,
        limit: 10,
        total: publicActivities.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    }
  });
});

app.get('/api/activities/:id', (req, res) => {
  const activity = activities.find(a => a.id === req.params.id);
  if (!activity) {
    return res.status(404).json({ success: false, error: 'Activity not found' });
  }
  res.json({ success: true, data: { activity } });
});

app.get('/api/activities/user/me', authenticateToken, (req, res) => {
  const userActivities = activities.filter(a => a.userId === req.user.id);
  res.json({
    success: true,
    data: {
      activities: userActivities,
      pagination: {
        page: 1,
        limit: 10,
        total: userActivities.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    }
  });
});

// 遊戲結果路由
app.post('/api/game-results', authenticateToken, (req, res) => {
  const result = {
    id: Date.now().toString(),
    ...req.body,
    playerId: req.user.id,
    createdAt: new Date().toISOString()
  };
  gameResults.push(result);
  res.status(201).json({ success: true, data: { gameResult: result } });
});

// 用戶統計
app.get('/api/users/me/stats', authenticateToken, (req, res) => {
  const userResults = gameResults.filter(r => r.playerId === req.user.id);
  const userActivitiesCount = activities.filter(a => a.userId === req.user.id).length;
  
  const stats = {
    totalActivities: userActivitiesCount,
    totalGames: userResults.length,
    totalScore: userResults.reduce((sum, r) => sum + (r.score || 0), 0),
    averageScore: userResults.length > 0 ? userResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / userResults.length : 0,
    bestScore: userResults.length > 0 ? Math.max(...userResults.map(r => r.score || 0)) : 0,
    totalTimeSpent: userResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0)
  };
  
  res.json({ success: true, data: { stats } });
});

// 全局統計
app.get('/api/stats', (req, res) => {
  const stats = {
    totalUsers: users.length,
    totalActivities: activities.length,
    totalGamesPlayed: gameResults.length
  };
  res.json({ success: true, data: { stats } });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`🚀 Wordwall Clone Demo Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Demo credentials:`);
  console.log(`   Teacher: teacher@demo.com / password`);
  console.log(`   Student: student@demo.com / password`);
});
