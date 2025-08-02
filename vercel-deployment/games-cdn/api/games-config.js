/**
 * Vercel Edge Function - 遊戲配置 API
 * 提供動態遊戲配置和版本管理
 */

export default async function handler(req, res) {
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', 'https://educreat.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 遊戲配置數據
  const gamesConfig = {
    'airplane': {
      id: 'airplane',
      name: 'Airplane Collision Game',
      version: '1.0.0',
      cdnUrl: 'https://games.educreat.vercel.app/airplane-game',
      entryPoint: '/index.html',
      manifest: {
        main: '/main-[hash].js',
        chunks: [
          '/chunks/phaser-[hash].js',
          '/chunks/scenes-[hash].js', 
          '/chunks/managers-[hash].js'
        ],
        assets: [
          '/assets/backgrounds/',
          '/assets/sprites/',
          '/assets/audio/'
        ]
      },
      features: {
        geptLevels: ['elementary', 'intermediate', 'advanced'],
        memoryScience: true,
        multiLanguage: true,
        offline: false
      },
      performance: {
        loadTime: '<3s',
        memoryUsage: '<100MB',
        fps: 60
      }
    },
    'match': {
      id: 'match',
      name: 'Memory Match Game',
      version: '1.0.0',
      cdnUrl: 'https://games.educreat.vercel.app/match-game',
      entryPoint: '/index.html',
      manifest: {
        main: '/main-[hash].js',
        chunks: [
          '/chunks/phaser-[hash].js',
          '/chunks/match-logic-[hash].js'
        ],
        assets: [
          '/assets/cards/',
          '/assets/effects/'
        ]
      },
      features: {
        geptLevels: ['elementary', 'intermediate'],
        memoryScience: true,
        multiLanguage: true,
        offline: true
      }
    },
    'quiz': {
      id: 'quiz',
      name: 'Interactive Quiz Game',
      version: '1.0.0',
      cdnUrl: 'https://games.educreat.vercel.app/quiz-game',
      entryPoint: '/index.html',
      manifest: {
        main: '/main-[hash].js',
        chunks: [
          '/chunks/quiz-engine-[hash].js',
          '/chunks/ui-components-[hash].js'
        ],
        assets: [
          '/assets/questions/',
          '/assets/feedback/'
        ]
      },
      features: {
        geptLevels: ['elementary', 'intermediate', 'advanced'],
        memoryScience: true,
        multiLanguage: true,
        offline: false
      }
    }
  };

  const { gameId } = req.query;

  try {
    if (gameId) {
      // 返回特定遊戲配置
      const gameConfig = gamesConfig[gameId];
      if (!gameConfig) {
        res.status(404).json({ error: 'Game not found' });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: gameConfig,
        timestamp: Date.now(),
        cdnStatus: 'active'
      });
    } else {
      // 返回所有遊戲配置
      res.status(200).json({
        success: true,
        data: gamesConfig,
        total: Object.keys(gamesConfig).length,
        timestamp: Date.now(),
        cdnStatus: 'active'
      });
    }
  } catch (error) {
    console.error('Games config API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
