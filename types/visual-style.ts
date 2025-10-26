/**
 * 視覺風格類型定義
 * 參考 Wordwall 的 Visual Styles 功能實現
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
 * 預定義的視覺風格
 */
export const VISUAL_STYLES: VisualStyle[] = [
  {
    id: 'primary',
    name: 'primary',
    displayName: '🎨 幼兒風格',
    description: '適合幼兒園和小學低年級，使用大字體和明亮色彩',
    cssClass: 'visual-style-primary',
    fontFamily: 'Comic Sans MS, cursive',
    backgroundColor: '#FFF9E6',
    primaryColor: '#FF6B6B',
    secondaryColor: '#4ECDC4',
    backgroundImage: undefined,
    soundTheme: 'cheerful',
    animationStyle: 'bouncy',
    preview: '/images/visual-styles/primary-preview.png'
  },
  {
    id: 'modern',
    name: 'modern',
    displayName: '🌟 現代風格',
    description: '適合中學和高中，簡潔現代的設計',
    cssClass: 'visual-style-modern',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#FFFFFF',
    primaryColor: '#2196F3',
    secondaryColor: '#FF9800',
    backgroundImage: undefined,
    soundTheme: 'modern',
    animationStyle: 'smooth',
    preview: '/images/visual-styles/modern-preview.png'
  },
  {
    id: 'classic',
    name: 'classic',
    displayName: '📚 經典風格',
    description: '傳統教室風格，適合所有年齡層',
    cssClass: 'visual-style-classic',
    fontFamily: 'Georgia, serif',
    backgroundColor: '#F5F5DC',
    primaryColor: '#8B4513',
    secondaryColor: '#DAA520',
    backgroundImage: undefined,
    soundTheme: 'classic',
    animationStyle: 'subtle',
    preview: '/images/visual-styles/classic-preview.png'
  },
  {
    id: 'dark',
    name: 'dark',
    displayName: '🌙 深色風格',
    description: '深色主題，減少眼睛疲勞',
    cssClass: 'visual-style-dark',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#1E1E1E',
    primaryColor: '#BB86FC',
    secondaryColor: '#03DAC6',
    backgroundImage: undefined,
    soundTheme: 'modern',
    animationStyle: 'smooth',
    preview: '/images/visual-styles/dark-preview.png'
  },
  {
    id: 'nature',
    name: 'nature',
    displayName: '🌿 自然風格',
    description: '自然清新的綠色主題',
    cssClass: 'visual-style-nature',
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#F0F8F0',
    primaryColor: '#4CAF50',
    secondaryColor: '#8BC34A',
    backgroundImage: undefined,
    soundTheme: 'nature',
    animationStyle: 'smooth',
    preview: '/images/visual-styles/nature-preview.png'
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
  return VISUAL_STYLES[1]; // 默認使用現代風格
}

