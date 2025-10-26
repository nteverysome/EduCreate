/**
 * 視覺風格資源配置
 * 參考 Wordwall 的完整場景替換系統
 * 
 * 每種視覺風格包含：
 * - 背景圖片
 * - 遊戲物件（太空船、雲朵等）
 * - 音效主題
 * - 顏色配置
 * - 動畫配置
 */

export const VISUAL_STYLE_ASSETS = {
    primary: {
        id: 'primary',
        name: '幼兒風格',
        displayName: '🎨 幼兒風格',
        description: '適合幼兒園和小學低年級，使用大字體和明亮色彩',
        
        // 背景配置
        background: {
            color: 0xFFF9E6,  // 淺黃色
            image: null,  // 暫時使用純色背景
            parallax: false
        },
        
        // 遊戲物件配置
        assets: {
            // 太空船（玩家）
            spaceship: {
                key: 'spaceship_primary',
                path: '/games/shimozurdo-game/assets/themes/primary/spaceship.png',
                scale: 1.2,  // 放大 20%，更適合幼兒
                tint: 0xFF6B6B  // 紅色調
            },
            
            // 雲朵（敵人）
            clouds: [
                {
                    key: 'cloud1_primary',
                    path: '/games/shimozurdo-game/assets/themes/primary/cloud1.png',
                    scale: 1.1,
                    tint: 0x4ECDC4  // 青色調
                },
                {
                    key: 'cloud2_primary',
                    path: '/games/shimozurdo-game/assets/themes/primary/cloud2.png',
                    scale: 1.1,
                    tint: 0x4ECDC4
                }
            ],
            
            // UI 元素
            ui: {
                healthBar: {
                    color: 0xFF6B6B,
                    backgroundColor: 0xFFCCCC
                },
                targetWord: {
                    backgroundColor: '#FFFF00',
                    textColor: '#000000',
                    fontSize: '40px',  // 更大的字體
                    fontFamily: 'Comic Sans MS, cursive'
                }
            }
        },
        
        // 音效配置
        sounds: {
            background: null,  // 暫時不使用背景音樂
            hit: null,
            success: null
        },
        
        // 顏色配置
        colors: {
            primary: '#FF6B6B',
            secondary: '#4ECDC4',
            text: '#000000',
            background: '#FFF9E6'
        },
        
        // 動畫配置
        animations: {
            style: 'bouncy',
            speed: 1.2,
            easing: 'Bounce.easeOut'
        }
    },
    
    modern: {
        id: 'modern',
        name: '現代風格',
        displayName: '🌟 現代風格',
        description: '適合中學和高中，簡潔現代的設計',
        
        background: {
            color: 0xFFFFFF,  // 白色
            image: null,
            parallax: false
        },
        
        assets: {
            spaceship: {
                key: 'spaceship_modern',
                path: '/games/shimozurdo-game/assets/themes/modern/spaceship.png',
                scale: 1.0,
                tint: 0x2196F3  // 藍色調
            },
            
            clouds: [
                {
                    key: 'cloud1_modern',
                    path: '/games/shimozurdo-game/assets/themes/modern/cloud1.png',
                    scale: 1.0,
                    tint: 0xFF9800  // 橙色調
                },
                {
                    key: 'cloud2_modern',
                    path: '/games/shimozurdo-game/assets/themes/modern/cloud2.png',
                    scale: 1.0,
                    tint: 0xFF9800
                }
            ],
            
            ui: {
                healthBar: {
                    color: 0x2196F3,
                    backgroundColor: 0xBBDEFB
                },
                targetWord: {
                    backgroundColor: '#2196F3',
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
            primary: '#2196F3',
            secondary: '#FF9800',
            text: '#000000',
            background: '#FFFFFF'
        },
        
        animations: {
            style: 'smooth',
            speed: 1.0,
            easing: 'Sine.easeInOut'
        }
    },
    
    classic: {
        id: 'classic',
        name: '經典風格',
        displayName: '📚 經典風格',
        description: '傳統教室風格，適合所有年齡層',
        
        background: {
            color: 0xF5F5DC,  // 米色
            image: null,
            parallax: false
        },
        
        assets: {
            spaceship: {
                key: 'spaceship_classic',
                path: '/games/shimozurdo-game/assets/themes/classic/spaceship.png',
                scale: 1.0,
                tint: 0x8B4513  // 棕色調
            },
            
            clouds: [
                {
                    key: 'cloud1_classic',
                    path: '/games/shimozurdo-game/assets/themes/classic/cloud1.png',
                    scale: 1.0,
                    tint: 0xDAA520  // 金色調
                },
                {
                    key: 'cloud2_classic',
                    path: '/games/shimozurdo-game/assets/themes/classic/cloud2.png',
                    scale: 1.0,
                    tint: 0xDAA520
                }
            ],
            
            ui: {
                healthBar: {
                    color: 0x8B4513,
                    backgroundColor: 0xDEB887
                },
                targetWord: {
                    backgroundColor: '#DAA520',
                    textColor: '#000000',
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
            primary: '#8B4513',
            secondary: '#DAA520',
            text: '#000000',
            background: '#F5F5DC'
        },
        
        animations: {
            style: 'subtle',
            speed: 0.9,
            easing: 'Linear'
        }
    },
    
    dark: {
        id: 'dark',
        name: '深色風格',
        displayName: '🌙 深色風格',
        description: '深色主題，減少眼睛疲勞',
        
        background: {
            color: 0x1E1E1E,  // 深灰色
            image: null,
            parallax: false
        },
        
        assets: {
            spaceship: {
                key: 'spaceship_dark',
                path: '/games/shimozurdo-game/assets/themes/dark/spaceship.png',
                scale: 1.0,
                tint: 0xBB86FC  // 紫色調
            },
            
            clouds: [
                {
                    key: 'cloud1_dark',
                    path: '/games/shimozurdo-game/assets/themes/dark/cloud1.png',
                    scale: 1.0,
                    tint: 0x03DAC6  // 青色調
                },
                {
                    key: 'cloud2_dark',
                    path: '/games/shimozurdo-game/assets/themes/dark/cloud2.png',
                    scale: 1.0,
                    tint: 0x03DAC6
                }
            ],
            
            ui: {
                healthBar: {
                    color: 0xBB86FC,
                    backgroundColor: 0x4A4A4A
                },
                targetWord: {
                    backgroundColor: '#BB86FC',
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
            primary: '#BB86FC',
            secondary: '#03DAC6',
            text: '#FFFFFF',
            background: '#1E1E1E'
        },
        
        animations: {
            style: 'smooth',
            speed: 1.0,
            easing: 'Sine.easeInOut'
        }
    },
    
    nature: {
        id: 'nature',
        name: '自然風格',
        displayName: '🌿 自然風格',
        description: '自然清新的綠色主題',
        
        background: {
            color: 0xF0F8F0,  // 淺綠色
            image: null,
            parallax: false
        },
        
        assets: {
            spaceship: {
                key: 'spaceship_nature',
                path: '/games/shimozurdo-game/assets/themes/nature/spaceship.png',
                scale: 1.0,
                tint: 0x4CAF50  // 綠色調
            },
            
            clouds: [
                {
                    key: 'cloud1_nature',
                    path: '/games/shimozurdo-game/assets/themes/nature/cloud1.png',
                    scale: 1.0,
                    tint: 0x8BC34A  // 淺綠色調
                },
                {
                    key: 'cloud2_nature',
                    path: '/games/shimozurdo-game/assets/themes/nature/cloud2.png',
                    scale: 1.0,
                    tint: 0x8BC34A
                }
            ],
            
            ui: {
                healthBar: {
                    color: 0x4CAF50,
                    backgroundColor: 0xC8E6C9
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
            secondary: '#8BC34A',
            text: '#000000',
            background: '#F0F8F0'
        },
        
        animations: {
            style: 'smooth',
            speed: 1.0,
            easing: 'Sine.easeInOut'
        }
    }
};

/**
 * 獲取視覺風格配置
 * @param {string} styleId - 視覺風格 ID
 * @returns {object} - 視覺風格配置
 */
export function getVisualStyleAssets(styleId) {
    return VISUAL_STYLE_ASSETS[styleId] || VISUAL_STYLE_ASSETS.modern;
}

