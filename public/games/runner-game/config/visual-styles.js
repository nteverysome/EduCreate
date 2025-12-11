/**
 * Runner Game 視覺風格配置
 * 支援 7 種主題風格切換
 * 每種風格包含：背景、玩家外觀、敵人外觀、音效
 */

export const RUNNER_VISUAL_STYLES = {
  // 雲朵主題（默認）
  clouds: {
    id: 'clouds',
    name: '雲朵',
    displayName: '☁️ 雲朵',
    description: '輕鬆愉快的天空跑酷主題',
    colors: {
      background: 0x87ceeb,    // 天空藍
      ground: 0x8B4513,        // 泥土棕
      player: 0x4fc3f7,        // 淺藍色玩家
      enemy: 0xffffff,         // 白色雲朵敵人
      coin: 0xffd700,          // 金幣顏色
      text: '#ffffff',
      modalBg: 0x2c2c2c
    },
    emoji: {
      player: '🏃',
      enemy: '☁️',
      coin: '⭐',
      decorations: ['🌤️', '🌈', '🦋', '🌸']
    }
  },

  // 電子遊戲主題
  videogame: {
    id: 'videogame',
    name: '電子遊戲',
    displayName: '🎮 電子遊戲',
    description: '復古像素風格跑酷遊戲',
    colors: {
      background: 0x000000,    // 黑色背景
      ground: 0x00ff00,        // 綠色地面
      player: 0x00ff00,        // 綠色玩家
      enemy: 0xff00ff,         // 紫色敵人
      coin: 0xffff00,          // 黃色金幣
      text: '#00ff00',
      modalBg: 0x001100
    },
    emoji: {
      player: '👾',
      enemy: '👻',
      coin: '💎',
      decorations: ['⭐', '🎯', '🕹️', '📺']
    }
  },

  // 太空主題
  space: {
    id: 'space',
    name: '太空',
    displayName: '🚀 太空',
    description: '穿越星際的太空跑酷冒險',
    colors: {
      background: 0x0d1b2a,    // 深藍太空
      ground: 0x4a4a4a,        // 灰色地面
      player: 0x00e5ff,        // 青色太空人
      enemy: 0x9c27b0,         // 紫色外星人
      coin: 0xffd700,          // 金色星星
      text: '#00e5ff',
      modalBg: 0x1b263b
    },
    emoji: {
      player: '🚀',
      enemy: '👽',
      coin: '⭐',
      decorations: ['🌟', '🌙', '💫', '🛸']
    }
  },

  // 海底主題
  underwater: {
    id: 'underwater',
    name: '海底',
    displayName: '🐠 海底',
    description: '神秘的深海探險之旅',
    colors: {
      background: 0x006994,    // 海洋藍
      ground: 0xd4a574,        // 沙地顏色
      player: 0xff9800,        // 橙色潛水員
      enemy: 0x00bcd4,         // 青色水母
      coin: 0xffc107,          // 金色珍珠
      text: '#00bcd4',
      modalBg: 0x004d66
    },
    emoji: {
      player: '🐬',
      enemy: '🐙',
      coin: '🐚',
      decorations: ['🐠', '🦀', '🌊', '🪸']
    }
  },

  // 恐龍主題
  dinosaur: {
    id: 'dinosaur',
    name: '恐龍',
    displayName: '🦕 恐龍',
    description: '穿越回史前時代的恐龍冒險',
    colors: {
      background: 0x8d6e63,    // 沙漠棕
      ground: 0x6d4c41,        // 深棕地面
      player: 0x4caf50,        // 綠色恐龍
      enemy: 0xa1887f,         // 岩石顏色
      coin: 0xffc107,          // 金色蛋
      text: '#4caf50',
      modalBg: 0x4e342e
    },
    emoji: {
      player: '🦖',
      enemy: '🪨',
      coin: '🥚',
      decorations: ['🌴', '🌋', '🦕', '☄️']
    }
  },

  // 森林主題
  forest: {
    id: 'forest',
    name: '森林',
    displayName: '🌲 森林',
    description: '神秘魔法森林中的跑酷之旅',
    colors: {
      background: 0x228b22,    // 森林綠
      ground: 0x5d4037,        // 泥土棕
      player: 0xff5722,        // 橙色狐狸
      enemy: 0x795548,         // 棕色障礙
      coin: 0xffeb3b,          // 金色果實
      text: '#ffeb3b',
      modalBg: 0x1b5e20
    },
    emoji: {
      player: '🦊',
      enemy: '🌲',
      coin: '🍎',
      decorations: ['🍄', '🦉', '🌿', '🦋']
    }
  },

  // 糖果主題
  candy: {
    id: 'candy',
    name: '糖果',
    displayName: '🍬 糖果',
    description: '甜蜜夢幻的糖果世界',
    colors: {
      background: 0xffc0cb,    // 粉紅色
      ground: 0x8b4513,        // 巧克力棕
      player: 0xff69b4,        // 粉色玩家
      enemy: 0x9c27b0,         // 紫色糖果
      coin: 0xffd700,          // 金色糖果
      text: '#ff69b4',
      modalBg: 0x880e4f
    },
    emoji: {
      player: '🧁',
      enemy: '🍭',
      coin: '⭐',
      decorations: ['🍩', '🍪', '🎂', '🍫']
    }
  }
};

// 獲取視覺風格
export function getVisualStyle(styleName) {
  return RUNNER_VISUAL_STYLES[styleName] || RUNNER_VISUAL_STYLES.clouds;
}

// 獲取所有視覺風格列表
export function getAllVisualStyles() {
  return Object.values(RUNNER_VISUAL_STYLES);
}

