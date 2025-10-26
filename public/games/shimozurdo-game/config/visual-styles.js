/**
 * 視覺風格資源配置
 * 參考 Wordwall 的完整場景替換系統
 *
 * Wordwall 的 7 種視覺風格：
 * 1. Clouds (雲朵)
 * 2. Video Game (電子遊戲)
 * 3. Magic Library (魔法圖書館)
 * 4. Underwater (水下)
 * 5. Pets (寵物)
 * 6. Space (太空)
 * 7. Dinosaur (恐龍)
 *
 * 每種視覺風格包含：
 * - 背景圖片
 * - 遊戲物件（太空船、雲朵等）
 * - 音效主題
 * - 顏色配置
 * - 動畫配置
 */

export const VISUAL_STYLE_ASSETS = {
    clouds: {
        id: 'clouds',
        name: '雲朵',
        displayName: '☁️ 雲朵',
        description: '輕鬆愉快的雲朵主題，適合所有年齡層',
        
        // 背景配置
        background: {
            color: 0x87CEEB,  // 天空藍
            image: null,
            parallax: false
        },

        // 遊戲物件配置
        assets: {
            // 太空船（玩家）
            spaceship: {
                key: 'spaceship_clouds',
                path: '/games/shimozurdo-game/assets/themes/clouds/spaceship.png',
                scale: 1.0,
                tint: 0xFFFFFF  // 白色
            },

            // 雲朵（敵人）
            clouds: [
                {
                    key: 'cloud1_clouds',
                    path: '/games/shimozurdo-game/assets/themes/clouds/cloud1.png',
                    scale: 1.0,
                    tint: 0xFFFFFF
                },
                {
                    key: 'cloud2_clouds',
                    path: '/games/shimozurdo-game/assets/themes/clouds/cloud2.png',
                    scale: 1.0,
                    tint: 0xFFFFFF
                }
            ],

            // UI 元素
            ui: {
                healthBar: {
                    color: 0x4FC3F7,
                    backgroundColor: 0xE1F5FE
                },
                targetWord: {
                    backgroundColor: '#FFFFFF',
                    textColor: '#000000',
                    fontSize: '36px',
                    fontFamily: 'Roboto, sans-serif'
                }
            }
        },

        // 音效配置
        sounds: {
            background: null,
            hit: null,
            success: null
        },

        // 顏色配置
        colors: {
            primary: '#4FC3F7',
            secondary: '#FFFFFF',
            text: '#000000',
            background: '#87CEEB'
        },

        // 動畫配置
        animations: {
            style: 'smooth',
            speed: 1.0,
            easing: 'Sine.easeInOut'
        }
    },

    videogame: {
        id: 'videogame',
        name: '電子遊戲',
        displayName: '🎮 電子遊戲',
        description: '復古像素風格，適合遊戲愛好者',

        background: {
            color: 0x000000,  // 黑色
            image: null,
            parallax: false
        },

        assets: {
            spaceship: {
                key: 'spaceship_videogame',
                path: '/games/shimozurdo-game/assets/themes/videogame/spaceship.png',
                scale: 1.0,
                tint: 0x00FF00  // 綠色調（像素風格）
            },

            clouds: [
                {
                    key: 'cloud1_videogame',
                    path: '/games/shimozurdo-game/assets/themes/videogame/cloud1.png',
                    scale: 1.0,
                    tint: 0xFF00FF  // 紫紅色調
                },
                {
                    key: 'cloud2_videogame',
                    path: '/games/shimozurdo-game/assets/themes/videogame/cloud2.png',
                    scale: 1.0,
                    tint: 0xFF00FF
                }
            ],

            ui: {
                healthBar: {
                    color: 0x00FF00,
                    backgroundColor: 0x003300
                },
                targetWord: {
                    backgroundColor: '#00FF00',
                    textColor: '#000000',
                    fontSize: '36px',
                    fontFamily: '"Press Start 2P", monospace'
                }
            }
        },

        sounds: {
            background: null,
            hit: null,
            success: null
        },

        colors: {
            primary: '#00FF00',
            secondary: '#FF00FF',
            text: '#FFFFFF',
            background: '#000000'
        },

        animations: {
            style: 'bouncy',
            speed: 1.3,
            easing: 'Bounce.easeOut'
        }
    },

    magiclibrary: {
        id: 'magiclibrary',
        name: '魔法圖書館',
        displayName: '📚 魔法圖書館',
        description: '神秘的魔法圖書館主題，充滿魔法氛圍',

        background: {
            color: 0x2C1B47,  // 深紫色
            image: null,
            parallax: false
        },

        assets: {
            spaceship: {
                key: 'spaceship_magiclibrary',
                path: '/games/shimozurdo-game/assets/themes/magiclibrary/spaceship.png',
                scale: 1.0,
                tint: 0x9C27B0  // 紫色調
            },

            clouds: [
                {
                    key: 'cloud1_magiclibrary',
                    path: '/games/shimozurdo-game/assets/themes/magiclibrary/cloud1.png',
                    scale: 1.0,
                    tint: 0xFFD700  // 金色調
                },
                {
                    key: 'cloud2_magiclibrary',
                    path: '/games/shimozurdo-game/assets/themes/magiclibrary/cloud2.png',
                    scale: 1.0,
                    tint: 0xFFD700
                }
            ],

            ui: {
                healthBar: {
                    color: 0x9C27B0,
                    backgroundColor: 0xE1BEE7
                },
                targetWord: {
                    backgroundColor: '#9C27B0',
                    textColor: '#FFFFFF',
                    fontSize: '36px',
                    fontFamily: 'Georgia, serif'
                }
            }
        },

        sounds: {
            background: null,
            hit: null,
            success: null
        },

        colors: {
            primary: '#9C27B0',
            secondary: '#FFD700',
            text: '#FFFFFF',
            background: '#2C1B47'
        },

        animations: {
            style: 'smooth',
            speed: 0.95,
            easing: 'Sine.easeInOut'
        }
    },

    underwater: {
        id: 'underwater',
        name: '水下',
        displayName: '🐠 水下',
        description: '神秘的海底世界主題',

        background: {
            color: 0x006994,  // 深藍色
            image: null,
            parallax: false
        },

        assets: {
            spaceship: {
                key: 'spaceship_underwater',
                path: '/games/shimozurdo-game/assets/themes/underwater/spaceship.png',
                scale: 1.0,
                tint: 0x00BCD4  // 青色調
            },

            clouds: [
                {
                    key: 'cloud1_underwater',
                    path: '/games/shimozurdo-game/assets/themes/underwater/cloud1.png',
                    scale: 1.0,
                    tint: 0xFF9800  // 橙色調（珊瑚色）
                },
                {
                    key: 'cloud2_underwater',
                    path: '/games/shimozurdo-game/assets/themes/underwater/cloud2.png',
                    scale: 1.0,
                    tint: 0xFF9800
                }
            ],

            ui: {
                healthBar: {
                    color: 0x00BCD4,
                    backgroundColor: 0xB2EBF2
                },
                targetWord: {
                    backgroundColor: '#00BCD4',
                    textColor: '#FFFFFF',
                    fontSize: '36px',
                    fontFamily: 'Roboto, sans-serif'
                }
            }
        },

        sounds: {
            background: null,
            hit: null,
            success: null
        },

        colors: {
            primary: '#00BCD4',
            secondary: '#FF9800',
            text: '#FFFFFF',
            background: '#006994'
        },

        animations: {
            style: 'smooth',
            speed: 0.85,
            easing: 'Sine.easeInOut'
        }
    },

    pets: {
        id: 'pets',
        name: '寵物',
        displayName: '🐶 寵物',
        description: '可愛的寵物主題，適合動物愛好者',

        background: {
            color: 0xFFE4B5,  // 淺橙色
            image: null,
            parallax: false
        },

        assets: {
            spaceship: {
                key: 'spaceship_pets',
                path: '/games/shimozurdo-game/assets/themes/pets/spaceship.png',
                scale: 1.0,
                tint: 0xFF6F00  // 橙色調
            },

            clouds: [
                {
                    key: 'cloud1_pets',
                    path: '/games/shimozurdo-game/assets/themes/pets/cloud1.png',
                    scale: 1.0,
                    tint: 0xFFAB91  // 淺橙色調
                },
                {
                    key: 'cloud2_pets',
                    path: '/games/shimozurdo-game/assets/themes/pets/cloud2.png',
                    scale: 1.0,
                    tint: 0xFFAB91
                }
            ],

            ui: {
                healthBar: {
                    color: 0xFF6F00,
                    backgroundColor: 0xFFE0B2
                },
                targetWord: {
                    backgroundColor: '#FF6F00',
                    textColor: '#FFFFFF',
                    fontSize: '36px',
                    fontFamily: 'Roboto, sans-serif'
                }
            }
        },

        sounds: {
            background: null,
            hit: null,
            success: null
        },

        colors: {
            primary: '#FF6F00',
            secondary: '#FFAB91',
            text: '#000000',
            background: '#FFE4B5'
        },

        animations: {
            style: 'bouncy',
            speed: 1.1,
            easing: 'Bounce.easeOut'
        }
    },

    space: {
        id: 'space',
        name: '太空',
        displayName: '🚀 太空',
        description: '神秘的外太空主題',

        background: {
            color: 0x0D1B2A,  // 深藍黑色
            image: null,
            parallax: false
        },

        assets: {
            spaceship: {
                key: 'spaceship_space',
                path: '/games/shimozurdo-game/assets/themes/space/spaceship.png',
                scale: 1.0,
                tint: 0xFFFFFF  // 白色
            },

            clouds: [
                {
                    key: 'cloud1_space',
                    path: '/games/shimozurdo-game/assets/themes/space/cloud1.png',
                    scale: 1.0,
                    tint: 0x9C27B0  // 紫色調
                },
                {
                    key: 'cloud2_space',
                    path: '/games/shimozurdo-game/assets/themes/space/cloud2.png',
                    scale: 1.0,
                    tint: 0x9C27B0
                }
            ],

            ui: {
                healthBar: {
                    color: 0x00E5FF,
                    backgroundColor: 0x263238
                },
                targetWord: {
                    backgroundColor: '#00E5FF',
                    textColor: '#000000',
                    fontSize: '36px',
                    fontFamily: 'Roboto, sans-serif'
                }
            }
        },

        sounds: {
            background: null,
            hit: null,
            success: null
        },

        colors: {
            primary: '#00E5FF',
            secondary: '#9C27B0',
            text: '#FFFFFF',
            background: '#0D1B2A'
        },

        animations: {
            style: 'smooth',
            speed: 1.0,
            easing: 'Sine.easeInOut'
        }
    },

    dinosaur: {
        id: 'dinosaur',
        name: '恐龍',
        displayName: '🦕 恐龍',
        description: '史前恐龍主題，適合恐龍愛好者',

        background: {
            color: 0x8D6E63,  // 棕色
            image: null,
            parallax: false
        },

        assets: {
            spaceship: {
                key: 'spaceship_dinosaur',
                path: '/games/shimozurdo-game/assets/themes/dinosaur/spaceship.png',
                scale: 1.0,
                tint: 0x4CAF50  // 綠色調
            },

            clouds: [
                {
                    key: 'cloud1_dinosaur',
                    path: '/games/shimozurdo-game/assets/themes/dinosaur/cloud1.png',
                    scale: 1.0,
                    tint: 0xA1887F  // 淺棕色調
                },
                {
                    key: 'cloud2_dinosaur',
                    path: '/games/shimozurdo-game/assets/themes/dinosaur/cloud2.png',
                    scale: 1.0,
                    tint: 0xA1887F
                }
            ],

            ui: {
                healthBar: {
                    color: 0x4CAF50,
                    backgroundColor: 0xD7CCC8
                },
                targetWord: {
                    backgroundColor: '#4CAF50',
                    textColor: '#FFFFFF',
                    fontSize: '36px',
                    fontFamily: 'Roboto, sans-serif'
                }
            }
        },

        sounds: {
            background: null,
            hit: null,
            success: null
        },

        colors: {
            primary: '#4CAF50',
            secondary: '#A1887F',
            text: '#FFFFFF',
            background: '#8D6E63'
        },

        animations: {
            style: 'bouncy',
            speed: 1.0,
            easing: 'Bounce.easeOut'
        }
    }
};

/**
 * 獲取視覺風格配置
 * @param {string} styleId - 視覺風格 ID
 * @returns {object} - 視覺風格配置
 */
export function getVisualStyleAssets(styleId) {
    return VISUAL_STYLE_ASSETS[styleId] || VISUAL_STYLE_ASSETS.clouds;
}

