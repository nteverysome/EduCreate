/**
 * 視覺風格類型定義
 * 參考 Wordwall 的 Visual Styles 功能實現
 *
 * Wordwall 的 7 種視覺風格：
 * 1. Clouds (雲朵)
 * 2. Video Game (電子遊戲)
 * 3. Magic Library (魔法圖書館)
 * 4. Underwater (水下)
 * 5. Pets (寵物)
 * 6. Space (太空)
 * 7. Dinosaur (恐龍)
 */

export interface VisualStyle {
  id: string;
  name: string;
  displayName: string;
  description: string;
  cssClass: string;
  fontFamily: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundImage?: string;
  soundTheme?: string;
  animationStyle?: string;
  preview: string; // 預覽圖片 URL
}

/**
 * 預定義的視覺風格（參考 Wordwall）
 */
export const VISUAL_STYLES: VisualStyle[] = [
  {
    id: 'clouds',
    name: 'clouds',
    displayName: '☁️ 雲朵',
    description: '輕鬆愉快的雲朵主題，適合所有年齡層',
    cssClass: 'visual-style-clouds',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#87CEEB',
    primaryColor: '#4FC3F7',
    secondaryColor: '#FFFFFF',
    backgroundImage: undefined,
    soundTheme: 'cheerful',
    animationStyle: 'smooth',
    preview: '/images/visual-styles/clouds-preview.png'
  },
  {
    id: 'videogame',
    name: 'videogame',
    displayName: '🎮 電子遊戲',
    description: '復古像素風格，適合遊戲愛好者',
    cssClass: 'visual-style-videogame',
    fontFamily: '"Press Start 2P", monospace',
    backgroundColor: '#000000',
    primaryColor: '#00FF00',
    secondaryColor: '#FF00FF',
    backgroundImage: undefined,
    soundTheme: 'retro',
    animationStyle: 'bouncy',
    preview: '/images/visual-styles/videogame-preview.png'
  },
  {
    id: 'magiclibrary',
    name: 'magiclibrary',
    displayName: '📚 魔法圖書館',
    description: '神秘的魔法圖書館主題，充滿魔法氛圍',
    cssClass: 'visual-style-magiclibrary',
    fontFamily: 'Georgia, serif',
    backgroundColor: '#2C1B47',
    primaryColor: '#9C27B0',
    secondaryColor: '#FFD700',
    backgroundImage: undefined,
    soundTheme: 'magical',
    animationStyle: 'smooth',
    preview: '/images/visual-styles/magiclibrary-preview.png'
  },
  {
    id: 'underwater',
    name: 'underwater',
    displayName: '🐠 水下',
    description: '神秘的海底世界主題',
    cssClass: 'visual-style-underwater',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#006994',
    primaryColor: '#00BCD4',
    secondaryColor: '#FF9800',
    backgroundImage: undefined,
    soundTheme: 'underwater',
    animationStyle: 'smooth',
    preview: '/images/visual-styles/underwater-preview.png'
  },
  {
    id: 'pets',
    name: 'pets',
    displayName: '🐶 寵物',
    description: '可愛的寵物主題，適合動物愛好者',
    cssClass: 'visual-style-pets',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#FFE4B5',
    primaryColor: '#FF6F00',
    secondaryColor: '#FFAB91',
    backgroundImage: undefined,
    soundTheme: 'playful',
    animationStyle: 'bouncy',
    preview: '/images/visual-styles/pets-preview.png'
  },
  {
    id: 'space',
    name: 'space',
    displayName: '🚀 太空',
    description: '神秘的外太空主題',
    cssClass: 'visual-style-space',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#0D1B2A',
    primaryColor: '#00E5FF',
    secondaryColor: '#9C27B0',
    backgroundImage: undefined,
    soundTheme: 'space',
    animationStyle: 'smooth',
    preview: '/images/visual-styles/space-preview.png'
  },
  {
    id: 'dinosaur',
    name: 'dinosaur',
    displayName: '🦕 恐龍',
    description: '史前恐龍主題，適合恐龍愛好者',
    cssClass: 'visual-style-dinosaur',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#8D6E63',
    primaryColor: '#4CAF50',
    secondaryColor: '#A1887F',
    backgroundImage: undefined,
    soundTheme: 'prehistoric',
    animationStyle: 'bouncy',
    preview: '/images/visual-styles/dinosaur-preview.png'
  }
];

/**
 * 根據 ID 獲取視覺風格
 */
export function getVisualStyleById(id: string): VisualStyle | undefined {
  return VISUAL_STYLES.find(style => style.id === id);
}

/**
 * 獲取默認視覺風格
 */
export function getDefaultVisualStyle(): VisualStyle {
  return VISUAL_STYLES[0]; // 默認使用雲朵風格
}

