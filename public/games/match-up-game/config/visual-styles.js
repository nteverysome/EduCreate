/**
 * Match-up 遊戲視覺風格配置
 * 
 * 定義 7 種視覺風格的配置
 * 每種風格包含：顏色、字體、背景等
 */

export const MATCH_UP_VISUAL_STYLES = {
  clouds: {
    id: 'clouds',
    name: '雲朵',
    displayName: '☁️ 雲朵',
    description: '輕鬆愉快的雲朵主題，適合所有年齡層',
    colors: {
      primary: '#4FC3F7',
      secondary: '#FFFFFF',
      text: '#000000',
      background: '#87CEEB',
      cardBackground: '#E3F2FD',
      cardBorder: '#4FC3F7'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  },
  videogame: {
    id: 'videogame',
    name: '電子遊戲',
    displayName: '🎮 電子遊戲',
    description: '復古像素風格，適合遊戲愛好者',
    colors: {
      primary: '#00FF00',
      secondary: '#FF00FF',
      text: '#000000',
      background: '#000000',
      cardBackground: '#003300',
      cardBorder: '#00FF00'
    },
    fonts: {
      primary: '"Press Start 2P"',
      secondary: 'monospace'
    }
  },
  magiclibrary: {
    id: 'magiclibrary',
    name: '魔法圖書館',
    displayName: '📚 魔法圖書館',
    description: '神秘的魔法圖書館主題，充滿魔法氛圍',
    colors: {
      primary: '#9C27B0',
      secondary: '#FFD700',
      text: '#FFFFFF',
      background: '#4A148C',
      cardBackground: '#7B1FA2',
      cardBorder: '#FFD700'
    },
    fonts: {
      primary: 'Georgia',
      secondary: 'serif'
    }
  },
  underwater: {
    id: 'underwater',
    name: '水下',
    displayName: '🐠 水下',
    description: '神秘的海底世界主題',
    colors: {
      primary: '#00BCD4',
      secondary: '#FF9800',
      text: '#FFFFFF',
      background: '#006064',
      cardBackground: '#00838F',
      cardBorder: '#FF9800'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  },
  pets: {
    id: 'pets',
    name: '寵物',
    displayName: '🐶 寵物',
    description: '可愛的寵物主題，適合動物愛好者',
    colors: {
      primary: '#FF6F00',
      secondary: '#FFAB91',
      text: '#FFFFFF',
      background: '#FFE4B5',
      cardBackground: '#FFB74D',
      cardBorder: '#FF6F00'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  },
  space: {
    id: 'space',
    name: '太空',
    displayName: '🚀 太空',
    description: '神秘的外太空主題',
    colors: {
      primary: '#00E5FF',
      secondary: '#9C27B0',
      text: '#000000',
      background: '#0D1B2A',
      cardBackground: '#1A237E',
      cardBorder: '#00E5FF'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  },
  dinosaur: {
    id: 'dinosaur',
    name: '恐龍',
    displayName: '🦕 恐龍',
    description: '史前恐龍主題，適合恐龍愛好者',
    colors: {
      primary: '#4CAF50',
      secondary: '#A1887F',
      text: '#FFFFFF',
      background: '#8D6E63',
      cardBackground: '#558B2F',
      cardBorder: '#A1887F'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  }
};

// 導出所有視覺風格 ID
export const MATCH_UP_VISUAL_STYLE_IDS = Object.keys(MATCH_UP_VISUAL_STYLES);

// 導出視覺風格列表（用於 UI）
export const MATCH_UP_VISUAL_STYLE_LIST = Object.values(MATCH_UP_VISUAL_STYLES);

