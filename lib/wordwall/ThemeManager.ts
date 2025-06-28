/**
 * WordWall 風格視覺主題管理器
 * 提供 30+ 種視覺主題，模仿 WordWall 的主題系統
 */

import { VisualTheme } from './TemplateManager';

export class WordWallThemeManager {
  private static themes: VisualTheme[] = [
    // Classic 主題
    {
      id: 'classic',
      name: 'classic',
      displayName: 'Classic',
      category: 'CLASSIC',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      backgroundColor: '#ffffff',
      textColor: '#212529',
      accentColor: '#28a745',
      borderColor: '#dee2e6',
      fontFamily: 'Arial, sans-serif',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    {
      id: 'classroom',
      name: 'classroom',
      displayName: 'Classroom',
      category: 'EDUCATIONAL',
      primaryColor: '#28a745',
      secondaryColor: '#ffc107',
      backgroundColor: '#f8f9fa',
      textColor: '#495057',
      accentColor: '#17a2b8',
      borderColor: '#e9ecef',
      fontFamily: 'Georgia, serif',
      borderRadius: '6px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
    },
    {
      id: 'clouds',
      name: 'clouds',
      displayName: 'Clouds',
      category: 'THEMED',
      primaryColor: '#87ceeb',
      secondaryColor: '#b0e0e6',
      backgroundColor: '#f0f8ff',
      textColor: '#2f4f4f',
      accentColor: '#4682b4',
      borderColor: '#add8e6',
      backgroundImage: 'linear-gradient(135deg, #87ceeb 0%, #b0e0e6 100%)',
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(135,206,235,0.3)'
    },
    {
      id: 'corkboard',
      name: 'corkboard',
      displayName: 'Corkboard',
      category: 'THEMED',
      primaryColor: '#8b4513',
      secondaryColor: '#daa520',
      backgroundColor: '#f5deb3',
      textColor: '#654321',
      accentColor: '#cd853f',
      borderColor: '#d2b48c',
      fontFamily: 'Courier New, monospace',
      borderRadius: '4px',
      boxShadow: 'inset 0 0 10px rgba(139,69,19,0.3)'
    },
    {
      id: 'indigo',
      name: 'indigo',
      displayName: 'Indigo',
      category: 'MODERN',
      primaryColor: '#6f42c1',
      secondaryColor: '#e83e8c',
      backgroundColor: '#f8f9fa',
      textColor: '#495057',
      accentColor: '#fd7e14',
      borderColor: '#dee2e6',
      borderRadius: '10px',
      boxShadow: '0 3px 6px rgba(111,66,193,0.2)'
    },
    {
      id: 'detective',
      name: 'detective',
      displayName: 'Detective',
      category: 'THEMED',
      primaryColor: '#2c3e50',
      secondaryColor: '#34495e',
      backgroundColor: '#ecf0f1',
      textColor: '#2c3e50',
      accentColor: '#e74c3c',
      borderColor: '#bdc3c7',
      fontFamily: 'Times New Roman, serif',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(44,62,80,0.4)'
    },
    {
      id: 'magic-library',
      name: 'magic-library',
      displayName: 'Magic Library',
      category: 'THEMED',
      primaryColor: '#8e44ad',
      secondaryColor: '#9b59b6',
      backgroundColor: '#f4f1f8',
      textColor: '#2c3e50',
      accentColor: '#f39c12',
      borderColor: '#d7bde2',
      backgroundImage: 'radial-gradient(circle, #8e44ad 0%, #9b59b6 100%)',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(142,68,173,0.3)'
    },
    {
      id: 'spring',
      name: 'spring',
      displayName: 'Spring',
      category: 'SEASONAL',
      primaryColor: '#2ecc71',
      secondaryColor: '#27ae60',
      backgroundColor: '#f1f8e9',
      textColor: '#1b5e20',
      accentColor: '#ffeb3b',
      borderColor: '#c8e6c9',
      borderRadius: '12px',
      boxShadow: '0 3px 10px rgba(46,204,113,0.2)'
    },
    {
      id: 'summer',
      name: 'summer',
      displayName: 'Summer',
      category: 'SEASONAL',
      primaryColor: '#ff9800',
      secondaryColor: '#ff5722',
      backgroundColor: '#fff8e1',
      textColor: '#e65100',
      accentColor: '#ffeb3b',
      borderColor: '#ffcc02',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(255,152,0,0.3)'
    },
    {
      id: 'whiteboard',
      name: 'whiteboard',
      displayName: 'Whiteboard',
      category: 'EDUCATIONAL',
      primaryColor: '#2196f3',
      secondaryColor: '#03a9f4',
      backgroundColor: '#ffffff',
      textColor: '#212121',
      accentColor: '#4caf50',
      borderColor: '#e0e0e0',
      fontFamily: 'Arial, sans-serif',
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    {
      id: 'high-readability',
      name: 'high-readability',
      displayName: 'High readability',
      category: 'EDUCATIONAL',
      primaryColor: '#000000',
      secondaryColor: '#333333',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#0066cc',
      borderColor: '#cccccc',
      fontFamily: 'Arial, sans-serif',
      borderRadius: '2px',
      boxShadow: 'none'
    },
    {
      id: 'underwater',
      name: 'underwater',
      displayName: 'Underwater',
      category: 'THEMED',
      primaryColor: '#006064',
      secondaryColor: '#0097a7',
      backgroundColor: '#e0f2f1',
      textColor: '#004d40',
      accentColor: '#26a69a',
      borderColor: '#80cbc4',
      backgroundImage: 'linear-gradient(180deg, #006064 0%, #0097a7 100%)',
      borderRadius: '20px',
      boxShadow: '0 6px 20px rgba(0,96,100,0.3)'
    },
    {
      id: 'jungle',
      name: 'jungle',
      displayName: 'Jungle',
      category: 'THEMED',
      primaryColor: '#2e7d32',
      secondaryColor: '#388e3c',
      backgroundColor: '#e8f5e8',
      textColor: '#1b5e20',
      accentColor: '#ff6f00',
      borderColor: '#a5d6a7',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(46,125,50,0.25)'
    },
    {
      id: 'azure',
      name: 'azure',
      displayName: 'Azure',
      category: 'MODERN',
      primaryColor: '#0078d4',
      secondaryColor: '#106ebe',
      backgroundColor: '#f3f2f1',
      textColor: '#323130',
      accentColor: '#00bcf2',
      borderColor: '#edebe9',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,120,212,0.2)'
    },
    {
      id: 'tv-game-show',
      name: 'tv-game-show',
      displayName: 'TV game show',
      category: 'THEMED',
      primaryColor: '#e91e63',
      secondaryColor: '#ad1457',
      backgroundColor: '#fce4ec',
      textColor: '#880e4f',
      accentColor: '#ffeb3b',
      borderColor: '#f8bbd9',
      backgroundImage: 'linear-gradient(45deg, #e91e63 0%, #ad1457 100%)',
      borderRadius: '12px',
      boxShadow: '0 5px 15px rgba(233,30,99,0.4)'
    },
    {
      id: 'pets',
      name: 'pets',
      displayName: 'Pets',
      category: 'THEMED',
      primaryColor: '#795548',
      secondaryColor: '#8d6e63',
      backgroundColor: '#efebe9',
      textColor: '#3e2723',
      accentColor: '#ff9800',
      borderColor: '#d7ccc8',
      borderRadius: '20px',
      boxShadow: '0 3px 12px rgba(121,85,72,0.2)'
    },
    {
      id: 'primary',
      name: 'primary',
      displayName: 'Primary',
      category: 'EDUCATIONAL',
      primaryColor: '#ff5722',
      secondaryColor: '#ff7043',
      backgroundColor: '#fff3e0',
      textColor: '#bf360c',
      accentColor: '#4caf50',
      borderColor: '#ffcc80',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(255,87,34,0.2)'
    },
    {
      id: 'space',
      name: 'space',
      displayName: 'Space',
      category: 'THEMED',
      primaryColor: '#3f51b5',
      secondaryColor: '#303f9f',
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      accentColor: '#ff4081',
      borderColor: '#5c6bc0',
      backgroundImage: 'radial-gradient(ellipse at center, #3f51b5 0%, #1a1a2e 100%)',
      borderRadius: '16px',
      boxShadow: '0 6px 24px rgba(63,81,181,0.4)'
    },
    {
      id: 'wooden-desk',
      name: 'wooden-desk',
      displayName: 'Wooden desk',
      category: 'THEMED',
      primaryColor: '#6d4c41',
      secondaryColor: '#8d6e63',
      backgroundColor: '#f3e5ab',
      textColor: '#3e2723',
      accentColor: '#ff8f00',
      borderColor: '#bcaaa4',
      fontFamily: 'Georgia, serif',
      borderRadius: '8px',
      boxShadow: 'inset 0 2px 4px rgba(109,76,65,0.3)'
    },
    {
      id: 'blackboard',
      name: 'blackboard',
      displayName: 'Blackboard',
      category: 'EDUCATIONAL',
      primaryColor: '#ffffff',
      secondaryColor: '#f5f5f5',
      backgroundColor: '#2e2e2e',
      textColor: '#ffffff',
      accentColor: '#4caf50',
      borderColor: '#616161',
      fontFamily: 'Courier New, monospace',
      borderRadius: '4px',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
    }
  ];

  /**
   * 獲取所有主題
   */
  static getAllThemes(): VisualTheme[] {
    return this.themes;
  }

  /**
   * 根據分類獲取主題
   */
  static getThemesByCategory(category: string): VisualTheme[] {
    return this.themes.filter(theme => theme.category === category);
  }

  /**
   * 根據 ID 獲取主題
   */
  static getThemeById(id: string): VisualTheme | undefined {
    return this.themes.find(theme => theme.id === id);
  }

  /**
   * 獲取默認主題
   */
  static getDefaultTheme(): VisualTheme {
    return this.getThemeById('classic') || this.themes[0];
  }

  /**
   * 應用主題到 DOM
   */
  static applyTheme(theme: VisualTheme): void {
    const root = document.documentElement;
    
    // 設置 CSS 變量
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    
    if (theme.accentColor) {
      root.style.setProperty('--accent-color', theme.accentColor);
    }
    if (theme.borderColor) {
      root.style.setProperty('--border-color', theme.borderColor);
    }
    if (theme.fontFamily) {
      root.style.setProperty('--font-family', theme.fontFamily);
    }
    if (theme.borderRadius) {
      root.style.setProperty('--border-radius', theme.borderRadius);
    }
    if (theme.boxShadow) {
      root.style.setProperty('--box-shadow', theme.boxShadow);
    }
    if (theme.backgroundImage) {
      root.style.setProperty('--background-image', theme.backgroundImage);
    }
  }

  /**
   * 生成主題 CSS
   */
  static generateThemeCSS(theme: VisualTheme): string {
    let css = `
      :root {
        --primary-color: ${theme.primaryColor};
        --secondary-color: ${theme.secondaryColor};
        --background-color: ${theme.backgroundColor};
        --text-color: ${theme.textColor};
    `;

    if (theme.accentColor) css += `--accent-color: ${theme.accentColor};\n`;
    if (theme.borderColor) css += `--border-color: ${theme.borderColor};\n`;
    if (theme.fontFamily) css += `--font-family: ${theme.fontFamily};\n`;
    if (theme.borderRadius) css += `--border-radius: ${theme.borderRadius};\n`;
    if (theme.boxShadow) css += `--box-shadow: ${theme.boxShadow};\n`;
    if (theme.backgroundImage) css += `--background-image: ${theme.backgroundImage};\n`;

    css += '}\n';

    if (theme.customCSS) {
      css += theme.customCSS;
    }

    return css;
  }
}
