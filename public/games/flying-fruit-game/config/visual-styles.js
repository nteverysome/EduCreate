/**
 * Flying Fruit 視覺風格配置
 * 基於 Wordwall 的 10 種主題風格
 */

export const VISUAL_STYLES = {
    // 叢林主題
    jungle: {
        name: '叢林',
        background: {
            topColor: 0x2d5a27,
            bottomColor: 0x1a3a15
        },
        decorations: ['🌴', '🌿', '🍃', '🦜'],
        fruitEmojis: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌', '🍉'],
        fruitColors: [0xff6b6b, 0xffa502, 0xffd93d, 0x6c5ce7, 0xff4757, 0xffb8b8, 0xe74c3c, 0x2ecc71, 0xf1c40f, 0x27ae60]
    },
    
    // 雲朵主題
    clouds: {
        name: '雲朵',
        background: {
            topColor: 0x87ceeb,
            bottomColor: 0x4a90d9
        },
        decorations: ['☁️', '🌤️', '🌈', '🦋'],
        fruitEmojis: ['☁️', '💨', '🌸', '🌺', '🌼', '🌻', '🌷', '🌹', '💐', '🪻'],
        fruitColors: [0xffffff, 0xe0e0e0, 0xffb6c1, 0xff69b4, 0xffd700, 0xffa500, 0xff6347, 0xff1493, 0xda70d6, 0x9370db]
    },
    
    // 太空主題
    space: {
        name: '太空',
        background: {
            topColor: 0x0f0f23,
            bottomColor: 0x1a1a3e
        },
        decorations: ['⭐', '🌟', '✨', '🚀'],
        fruitEmojis: ['🌍', '🌙', '⭐', '🪐', '☄️', '🌠', '🛸', '👽', '🌌', '💫'],
        fruitColors: [0x3498db, 0x9b59b6, 0xe74c3c, 0xf39c12, 0x1abc9c, 0x2ecc71, 0xe91e63, 0x00bcd4, 0xff5722, 0x795548]
    },
    
    // 海底主題
    underwater: {
        name: '海底',
        background: {
            topColor: 0x006994,
            bottomColor: 0x003d5c
        },
        decorations: ['🐠', '🐟', '🦀', '🐚'],
        fruitEmojis: ['🐙', '🦑', '🦐', '🦞', '🐡', '🐬', '🐳', '🦈', '🐢', '🪼'],
        fruitColors: [0xff6b6b, 0xffa502, 0x00d2d3, 0x54a0ff, 0x5f27cd, 0xff9ff3, 0x48dbfb, 0x1dd1a1, 0xfeca57, 0xff6b6b]
    },
    
    // 慶典主題
    celebration: {
        name: '慶典',
        background: {
            topColor: 0xff6b6b,
            bottomColor: 0xffa502
        },
        decorations: ['🎈', '🎉', '🎊', '🎁'],
        fruitEmojis: ['🎈', '🎁', '🎀', '🎊', '🎉', '🎂', '🍰', '🧁', '🍭', '🍬'],
        fruitColors: [0xff6b6b, 0xffa502, 0xffd93d, 0x6c5ce7, 0xff4757, 0x00d2d3, 0x54a0ff, 0x5f27cd, 0xff9ff3, 0x1dd1a1]
    },
    
    // 農場主題
    farm: {
        name: '農場',
        background: {
            topColor: 0x87ceeb,
            bottomColor: 0x90EE90
        },
        decorations: ['🌾', '🌻', '🐔', '🐄'],
        fruitEmojis: ['🍎', '🍐', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🍒', '🥕'],
        fruitColors: [0xff6b6b, 0xc8e6c9, 0xffa502, 0xffd93d, 0x6c5ce7, 0xff4757, 0x3f51b5, 0xffb8b8, 0xe74c3c, 0xff9800]
    },
    
    // 糖果主題
    candy: {
        name: '糖果',
        background: {
            topColor: 0xffc0cb,
            bottomColor: 0xffb6c1
        },
        decorations: ['🍭', '🍬', '🍫', '🧁'],
        fruitEmojis: ['🍭', '🍬', '🍫', '🧁', '🍩', '🍪', '🎂', '🍰', '🍡', '🍧'],
        fruitColors: [0xff69b4, 0xff1493, 0xda70d6, 0x9370db, 0x00ced1, 0x40e0d0, 0x7fffd4, 0x98fb98, 0xffd700, 0xffa500]
    },
    
    // 恐龍主題
    dinosaur: {
        name: '恐龍',
        background: {
            topColor: 0x8B4513,
            bottomColor: 0x556B2F
        },
        decorations: ['🦕', '🦖', '🌋', '🪨'],
        fruitEmojis: ['🦕', '🦖', '🥚', '🦴', '🌿', '🪨', '🌋', '🏔️', '🌲', '🦎'],
        fruitColors: [0x2e7d32, 0x558b2f, 0x8bc34a, 0xcddc39, 0x795548, 0x6d4c41, 0x8d6e63, 0xa1887f, 0xbcaaa4, 0xd7ccc8]
    },
    
    // 冬季主題
    winter: {
        name: '冬季',
        background: {
            topColor: 0xb3e5fc,
            bottomColor: 0xe1f5fe
        },
        decorations: ['❄️', '⛄', '🎄', '🎅'],
        fruitEmojis: ['❄️', '⛄', '🎄', '🎅', '🦌', '🎁', '🔔', '⭐', '🌟', '🧣'],
        fruitColors: [0x03a9f4, 0x00bcd4, 0x009688, 0x4caf50, 0x8bc34a, 0xcddc39, 0xffeb3b, 0xffc107, 0xff9800, 0xff5722]
    },
    
    // 彩虹主題
    rainbow: {
        name: '彩虹',
        background: {
            topColor: 0x9c27b0,
            bottomColor: 0x2196f3
        },
        decorations: ['🌈', '✨', '💫', '🦄'],
        fruitEmojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '💗', '💖'],
        fruitColors: [0xf44336, 0xff9800, 0xffeb3b, 0x4caf50, 0x2196f3, 0x9c27b0, 0xffffff, 0x000000, 0xe91e63, 0xff4081]
    }
};

// 獲取視覺風格
export function getVisualStyle(styleName) {
    return VISUAL_STYLES[styleName] || VISUAL_STYLES.jungle;
}

// 獲取所有風格名稱
export function getAllStyleNames() {
    return Object.keys(VISUAL_STYLES);
}

// 獲取隨機風格
export function getRandomStyle() {
    const styles = Object.keys(VISUAL_STYLES);
    const randomIndex = Math.floor(Math.random() * styles.length);
    return VISUAL_STYLES[styles[randomIndex]];
}

