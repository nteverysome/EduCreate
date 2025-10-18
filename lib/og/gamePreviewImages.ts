/**
 * 遊戲預覽圖配置
 * 為每種遊戲類型提供預覽圖 URL
 */

export interface GamePreviewConfig {
  id: string;
  name: string;
  displayName: string;
  previewImage: string; // 預覽圖 URL
  icon: string;
  gradient: { from: string; to: string };
}

/**
 * 遊戲預覽圖映射
 * 
 * 預覽圖來源優先級：
 * 1. 實際遊戲截圖（存放在 /public/game-previews/）
 * 2. 遊戲 URL（直接使用遊戲頁面作為預覽）
 * 3. 默認漸變背景
 */
export const GAME_PREVIEW_CONFIGS: { [key: string]: GamePreviewConfig } = {
  // 飛機遊戲
  'airplane': {
    id: 'airplane',
    name: 'airplane',
    displayName: '飛機遊戲',
    previewImage: '/games/airplane-vite/index.html', // 使用遊戲 URL
    icon: '✈️',
    gradient: { from: '#0ea5e9', to: '#3b82f6' }
  },
  'airplane-vite': {
    id: 'airplane-vite',
    name: 'airplane',
    displayName: '飛機遊戲 (Vite版)',
    previewImage: '/games/airplane-vite/index.html',
    icon: '⚡',
    gradient: { from: '#0ea5e9', to: '#3b82f6' }
  },

  // Shimozurdo 雲朵遊戲
  'shimozurdo': {
    id: 'shimozurdo',
    name: 'shimozurdo',
    displayName: 'Shimozurdo 雲朵遊戲',
    previewImage: '/games/shimozurdo-game/index.html',
    icon: '☁️',
    gradient: { from: '#1e293b', to: '#475569' }
  },
  'shimozurdo-game': {
    id: 'shimozurdo-game',
    name: 'shimozurdo',
    displayName: 'Shimozurdo 雲朵遊戲',
    previewImage: '/games/shimozurdo-game/index.html',
    icon: '☁️',
    gradient: { from: '#1e293b', to: '#475569' }
  },

  // Dungeon 地牢探險
  'dungeon': {
    id: 'dungeon',
    name: 'dungeon',
    displayName: 'Dungeon 地牢探險',
    previewImage: '/games/dungeon-game/index.html',
    icon: '🏰',
    gradient: { from: '#7c3aed', to: '#a855f7' }
  },
  'dungeon-game': {
    id: 'dungeon-game',
    name: 'dungeon',
    displayName: 'Dungeon 地牢探險',
    previewImage: '/games/dungeon-game/index.html',
    icon: '🏰',
    gradient: { from: '#7c3aed', to: '#a855f7' }
  },

  // Runner 跑酷遊戲
  'runner': {
    id: 'runner',
    name: 'runner',
    displayName: 'Runner 跑酷遊戲',
    previewImage: '/games/runner-game/index.html',
    icon: '🏃',
    gradient: { from: '#f59e0b', to: '#ef4444' }
  },
  'runner-game': {
    id: 'runner-game',
    name: 'runner',
    displayName: 'Runner 跑酷遊戲',
    previewImage: '/games/runner-game/index.html',
    icon: '🏃',
    gradient: { from: '#f59e0b', to: '#ef4444' }
  },

  // Blastemup 太空射擊
  'blastemup': {
    id: 'blastemup',
    name: 'blastemup',
    displayName: 'Blastemup 太空射擊',
    previewImage: '/games/blastemup-game/index.html',
    icon: '💥',
    gradient: { from: '#dc2626', to: '#991b1b' }
  },
  'blastemup-game': {
    id: 'blastemup-game',
    name: 'blastemup',
    displayName: 'Blastemup 太空射擊',
    previewImage: '/games/blastemup-game/index.html',
    icon: '💥',
    gradient: { from: '#dc2626', to: '#991b1b' }
  },

  // Starshake 太空冒險
  'starshake': {
    id: 'starshake',
    name: 'starshake',
    displayName: 'Starshake 太空冒險',
    previewImage: '/games/starshake-game/index.html',
    icon: '🌟',
    gradient: { from: '#fbbf24', to: '#f59e0b' }
  },
  'starshake-game': {
    id: 'starshake-game',
    name: 'starshake',
    displayName: 'Starshake 太空冒險',
    previewImage: '/games/starshake-game/index.html',
    icon: '🌟',
    gradient: { from: '#fbbf24', to: '#f59e0b' }
  },

  // Fate 命運之戰
  'fate': {
    id: 'fate',
    name: 'fate',
    displayName: 'Fate 命運之戰',
    previewImage: '/games/fate-game/index.html',
    icon: '⚡',
    gradient: { from: '#6366f1', to: '#4f46e5' }
  },
  'fate-game': {
    id: 'fate-game',
    name: 'fate',
    displayName: 'Fate 命運之戰',
    previewImage: '/games/fate-game/index.html',
    icon: '⚡',
    gradient: { from: '#6366f1', to: '#4f46e5' }
  },

  // Mars 火星探險
  'mars': {
    id: 'mars',
    name: 'mars',
    displayName: 'Mars 火星探險',
    previewImage: '/games/mars-game/index.html',
    icon: '🔴',
    gradient: { from: '#dc2626', to: '#b91c1c' }
  },
  'mars-game': {
    id: 'mars-game',
    name: 'mars',
    displayName: 'Mars 火星探險',
    previewImage: '/games/mars-game/index.html',
    icon: '🔴',
    gradient: { from: '#dc2626', to: '#b91c1c' }
  },

  // Math Attack 數學攻擊
  'math-attack': {
    id: 'math-attack',
    name: 'math-attack',
    displayName: 'Math Attack 數學攻擊',
    previewImage: '/games/math-attack-game/index.html',
    icon: '🔢',
    gradient: { from: '#10b981', to: '#059669' }
  },
  'math-attack-game': {
    id: 'math-attack-game',
    name: 'math-attack',
    displayName: 'Math Attack 數學攻擊',
    previewImage: '/games/math-attack-game/index.html',
    icon: '🔢',
    gradient: { from: '#10b981', to: '#059669' }
  },

  // PushPull 推拉方塊
  'pushpull': {
    id: 'pushpull',
    name: 'pushpull',
    displayName: 'PushPull 推拉方塊',
    previewImage: '/games/pushpull-game/index.html',
    icon: '🧩',
    gradient: { from: '#8b5cf6', to: '#7c3aed' }
  },
  'pushpull-game': {
    id: 'pushpull-game',
    name: 'pushpull',
    displayName: 'PushPull 推拉方塊',
    previewImage: '/games/pushpull-game/index.html',
    icon: '🧩',
    gradient: { from: '#8b5cf6', to: '#7c3aed' }
  },

  // WallHammer 破牆遊戲
  'wallhammer': {
    id: 'wallhammer',
    name: 'wallhammer',
    displayName: 'WallHammer 破牆遊戲',
    previewImage: '/games/wallhammer-game/index.html',
    icon: '🔨',
    gradient: { from: '#f97316', to: '#ea580c' }
  },
  'wallhammer-game': {
    id: 'wallhammer-game',
    name: 'wallhammer',
    displayName: 'WallHammer 破牆遊戲',
    previewImage: '/games/wallhammer-game/index.html',
    icon: '🔨',
    gradient: { from: '#f97316', to: '#ea580c' }
  },

  // Zenbaki 數字遊戲
  'zenbaki': {
    id: 'zenbaki',
    name: 'zenbaki',
    displayName: 'Zenbaki 數字遊戲',
    previewImage: '/games/zenbaki-game/index.html',
    icon: '🔢',
    gradient: { from: '#06b6d4', to: '#0891b2' }
  },
  'zenbaki-game': {
    id: 'zenbaki-game',
    name: 'zenbaki',
    displayName: 'Zenbaki 數字遊戲',
    previewImage: '/games/zenbaki-game/index.html',
    icon: '🔢',
    gradient: { from: '#06b6d4', to: '#0891b2' }
  },

  // 基礎遊戲類型
  'quiz': {
    id: 'quiz',
    name: 'quiz',
    displayName: '測驗遊戲',
    previewImage: '', // 使用漸變背景
    icon: '❓',
    gradient: { from: '#3b82f6', to: '#8b5cf6' }
  },
  'matching': {
    id: 'matching',
    name: 'matching',
    displayName: '配對遊戲',
    previewImage: '',
    icon: '🔗',
    gradient: { from: '#ec4899', to: '#8b5cf6' }
  },
  'flashcards': {
    id: 'flashcards',
    name: 'flashcards',
    displayName: '單字卡片',
    previewImage: '',
    icon: '📚',
    gradient: { from: '#f59e0b', to: '#ef4444' }
  },
  'vocabulary': {
    id: 'vocabulary',
    name: 'vocabulary',
    displayName: '詞彙遊戲',
    previewImage: '',
    icon: '📝',
    gradient: { from: '#10b981', to: '#06b6d4' }
  },
  'hangman': {
    id: 'hangman',
    name: 'hangman',
    displayName: '猜字遊戲',
    previewImage: '',
    icon: '🎯',
    gradient: { from: '#14b8a6', to: '#06b6d4' }
  },
  'memory': {
    id: 'memory',
    name: 'memory',
    displayName: '記憶卡片',
    previewImage: '',
    icon: '🧠',
    gradient: { from: '#8b5cf6', to: '#ec4899' }
  },
};

/**
 * 獲取遊戲預覽配置
 */
export function getGamePreviewConfig(gameType: string): GamePreviewConfig {
  const normalizedType = gameType.toLowerCase();
  return GAME_PREVIEW_CONFIGS[normalizedType] || GAME_PREVIEW_CONFIGS[gameType] || {
    id: 'default',
    name: 'default',
    displayName: '遊戲',
    previewImage: '',
    icon: '🎮',
    gradient: { from: '#667eea', to: '#764ba2' }
  };
}

