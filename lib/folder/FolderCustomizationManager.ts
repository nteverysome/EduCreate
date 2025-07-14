/**
 * 檔案夾視覺自定義管理器
 * 基於Wordwall視覺系統設計，實現檔案夾顏色和圖標自定義系統
 */

export interface FolderCustomization {
  id: string;
  folderId: string;
  userId: string;
  colorScheme: FolderColorScheme;
  iconType: FolderIconType;
  customIcon?: string;
  backgroundPattern?: FolderBackgroundPattern;
  borderStyle?: FolderBorderStyle;
  textStyle?: FolderTextStyle;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  metadata: {
    version: string;
    theme: string;
    accessibility: AccessibilitySettings;
  };
}

export interface FolderColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  hover: string;
  active: string;
  gradient?: {
    start: string;
    end: string;
    direction: 'horizontal' | 'vertical' | 'diagonal';
  };
}

export enum FolderIconType {
  DEFAULT = 'default',
  ACADEMIC = 'academic',
  SUBJECT = 'subject',
  LEVEL = 'level',
  ACTIVITY = 'activity',
  CUSTOM = 'custom',
  EMOJI = 'emoji',
  SYMBOL = 'symbol'
}

export interface FolderBackgroundPattern {
  type: 'solid' | 'gradient' | 'pattern' | 'texture';
  pattern?: 'dots' | 'stripes' | 'grid' | 'waves' | 'geometric';
  opacity: number;
  scale: number;
  rotation: number;
}

export interface FolderBorderStyle {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  radius: number;
  shadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };
}

export interface FolderTextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'light';
  textAlign: 'left' | 'center' | 'right';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing: number;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  colorBlindFriendly: boolean;
  focusIndicator: boolean;
}

export interface FolderTheme {
  id: string;
  name: string;
  description: string;
  colorSchemes: FolderColorScheme[];
  iconSets: FolderIconSet[];
  patterns: FolderBackgroundPattern[];
  isBuiltIn: boolean;
  category: 'academic' | 'creative' | 'professional' | 'fun' | 'accessibility';
  preview: string;
  accessibility: AccessibilitySettings;
}

export interface FolderIconSet {
  id: string;
  name: string;
  icons: FolderIcon[];
  category: string;
  style: 'outline' | 'filled' | 'duotone' | 'gradient';
}

export interface FolderIcon {
  id: string;
  name: string;
  svg: string;
  unicode?: string;
  keywords: string[];
  category: string;
  accessibility: {
    alt: string;
    description: string;
  };
}

export class FolderCustomizationManager {
  private customizations = new Map<string, FolderCustomization>();
  private themes = new Map<string, FolderTheme>();
  private iconSets = new Map<string, FolderIconSet>();
  private defaultTheme: FolderTheme;

  constructor() {
    this.initializeDefaultThemes();
    this.initializeDefaultIconSets();
  }

  /**
   * 初始化默認主題
   */
  private initializeDefaultThemes(): void {
    // Wordwall 風格主題
    const wordwallTheme: FolderTheme = {
      id: 'wordwall-default',
      name: 'Wordwall 經典',
      description: '基於 Wordwall 的經典視覺設計',
      colorSchemes: [
        {
          primary: '#4A90E2',
          secondary: '#7ED321',
          accent: '#F5A623',
          background: '#FFFFFF',
          text: '#333333',
          border: '#E0E0E0',
          hover: '#F8F9FA',
          active: '#E3F2FD'
        }
      ],
      iconSets: [],
      patterns: [],
      isBuiltIn: true,
      category: 'academic',
      preview: '/themes/wordwall-preview.png',
      accessibility: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReaderOptimized: true,
        colorBlindFriendly: true,
        focusIndicator: true
      }
    };

    // 學術主題
    const academicTheme: FolderTheme = {
      id: 'academic-professional',
      name: '學術專業',
      description: '適合學術和專業環境的簡潔設計',
      colorSchemes: [
        {
          primary: '#2E3440',
          secondary: '#5E81AC',
          accent: '#88C0D0',
          background: '#ECEFF4',
          text: '#2E3440',
          border: '#D8DEE9',
          hover: '#E5E9F0',
          active: '#D8DEE9'
        }
      ],
      iconSets: [],
      patterns: [],
      isBuiltIn: true,
      category: 'professional',
      preview: '/themes/academic-preview.png',
      accessibility: {
        highContrast: true,
        largeText: false,
        reducedMotion: true,
        screenReaderOptimized: true,
        colorBlindFriendly: true,
        focusIndicator: true
      }
    };

    // 創意主題
    const creativeTheme: FolderTheme = {
      id: 'creative-colorful',
      name: '創意彩色',
      description: '充滿活力的彩色設計，激發創造力',
      colorSchemes: [
        {
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
          accent: '#45B7D1',
          background: '#F8F9FA',
          text: '#2C3E50',
          border: '#BDC3C7',
          hover: '#ECF0F1',
          active: '#D5DBDB',
          gradient: {
            start: '#FF6B6B',
            end: '#4ECDC4',
            direction: 'diagonal'
          }
        }
      ],
      iconSets: [],
      patterns: [],
      isBuiltIn: true,
      category: 'creative',
      preview: '/themes/creative-preview.png',
      accessibility: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReaderOptimized: true,
        colorBlindFriendly: false,
        focusIndicator: true
      }
    };

    // 無障礙主題
    const accessibilityTheme: FolderTheme = {
      id: 'accessibility-high-contrast',
      name: '無障礙高對比',
      description: '高對比度設計，符合無障礙標準',
      colorSchemes: [
        {
          primary: '#000000',
          secondary: '#FFFFFF',
          accent: '#0066CC',
          background: '#FFFFFF',
          text: '#000000',
          border: '#000000',
          hover: '#F0F0F0',
          active: '#E0E0E0'
        }
      ],
      iconSets: [],
      patterns: [],
      isBuiltIn: true,
      category: 'accessibility',
      preview: '/themes/accessibility-preview.png',
      accessibility: {
        highContrast: true,
        largeText: true,
        reducedMotion: true,
        screenReaderOptimized: true,
        colorBlindFriendly: true,
        focusIndicator: true
      }
    };

    this.themes.set(wordwallTheme.id, wordwallTheme);
    this.themes.set(academicTheme.id, academicTheme);
    this.themes.set(creativeTheme.id, creativeTheme);
    this.themes.set(accessibilityTheme.id, accessibilityTheme);
    
    this.defaultTheme = wordwallTheme;
  }

  /**
   * 初始化默認圖標集
   */
  private initializeDefaultIconSets(): void {
    // 學術圖標集
    const academicIconSet: FolderIconSet = {
      id: 'academic-icons',
      name: '學術圖標',
      category: 'academic',
      style: 'outline',
      icons: [
        {
          id: 'book',
          name: '書本',
          svg: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
          keywords: ['book', 'reading', 'study', '書本', '閱讀', '學習'],
          category: 'academic',
          accessibility: {
            alt: '書本圖標',
            description: '代表書籍、閱讀和學習的圖標'
          }
        },
        {
          id: 'graduation-cap',
          name: '學士帽',
          svg: '<svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>',
          keywords: ['graduation', 'education', 'degree', '畢業', '教育', '學位'],
          category: 'academic',
          accessibility: {
            alt: '學士帽圖標',
            description: '代表畢業、教育和學術成就的圖標'
          }
        }
      ]
    };

    // 科目圖標集
    const subjectIconSet: FolderIconSet = {
      id: 'subject-icons',
      name: '科目圖標',
      category: 'subject',
      style: 'filled',
      icons: [
        {
          id: 'language',
          name: '語言',
          svg: '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>',
          keywords: ['language', 'english', 'chinese', '語言', '英語', '中文'],
          category: 'subject',
          accessibility: {
            alt: '語言圖標',
            description: '代表語言學習和多語言的圖標'
          }
        }
      ]
    };

    this.iconSets.set(academicIconSet.id, academicIconSet);
    this.iconSets.set(subjectIconSet.id, subjectIconSet);
  }

  /**
   * 獲取檔案夾自定義設定
   */
  getFolderCustomization(folderId: string): FolderCustomization | null {
    return this.customizations.get(folderId) || null;
  }

  /**
   * 設定檔案夾自定義
   */
  async setFolderCustomization(
    folderId: string,
    userId: string,
    customization: Partial<FolderCustomization>
  ): Promise<FolderCustomization> {
    const existing = this.customizations.get(folderId);
    
    const newCustomization: FolderCustomization = {
      id: existing?.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      folderId,
      userId,
      colorScheme: customization.colorScheme || this.defaultTheme.colorSchemes[0],
      iconType: customization.iconType || FolderIconType.DEFAULT,
      customIcon: customization.customIcon,
      backgroundPattern: customization.backgroundPattern,
      borderStyle: customization.borderStyle,
      textStyle: customization.textStyle,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
      isDefault: customization.isDefault || false,
      metadata: {
        version: '1.0.0',
        theme: customization.metadata?.theme || 'wordwall-default',
        accessibility: customization.metadata?.accessibility || this.defaultTheme.accessibility
      }
    };

    this.customizations.set(folderId, newCustomization);
    return newCustomization;
  }

  /**
   * 獲取所有可用主題
   */
  getAvailableThemes(): FolderTheme[] {
    return Array.from(this.themes.values());
  }

  /**
   * 獲取主題
   */
  getTheme(themeId: string): FolderTheme | null {
    return this.themes.get(themeId) || null;
  }

  /**
   * 獲取所有圖標集
   */
  getAvailableIconSets(): FolderIconSet[] {
    return Array.from(this.iconSets.values());
  }

  /**
   * 獲取圖標集
   */
  getIconSet(iconSetId: string): FolderIconSet | null {
    return this.iconSets.get(iconSetId) || null;
  }

  /**
   * 搜索圖標
   */
  searchIcons(query: string, category?: string): FolderIcon[] {
    const results: FolderIcon[] = [];
    const lowerQuery = query.toLowerCase();

    for (const iconSet of this.iconSets.values()) {
      if (category && iconSet.category !== category) continue;

      for (const icon of iconSet.icons) {
        const matchesName = icon.name.toLowerCase().includes(lowerQuery);
        const matchesKeywords = icon.keywords.some(keyword => 
          keyword.toLowerCase().includes(lowerQuery)
        );

        if (matchesName || matchesKeywords) {
          results.push(icon);
        }
      }
    }

    return results;
  }

  /**
   * 生成CSS樣式
   */
  generateFolderCSS(customization: FolderCustomization): string {
    const { colorScheme, backgroundPattern, borderStyle, textStyle } = customization;
    
    let css = `
      .folder-${customization.folderId} {
        background-color: ${colorScheme.background};
        color: ${colorScheme.text};
        border: ${borderStyle?.width || 1}px ${borderStyle?.style || 'solid'} ${colorScheme.border};
        border-radius: ${borderStyle?.radius || 8}px;
    `;

    // 漸變背景
    if (colorScheme.gradient) {
      const direction = this.getGradientDirection(colorScheme.gradient.direction);
      css += `background: linear-gradient(${direction}, ${colorScheme.gradient.start}, ${colorScheme.gradient.end});`;
    }

    // 陰影
    if (borderStyle?.shadow) {
      css += `box-shadow: ${borderStyle.shadow.x}px ${borderStyle.shadow.y}px ${borderStyle.shadow.blur}px ${borderStyle.shadow.color};`;
    }

    // 文字樣式
    if (textStyle) {
      css += `
        font-family: ${textStyle.fontFamily};
        font-size: ${textStyle.fontSize}px;
        font-weight: ${textStyle.fontWeight};
        text-align: ${textStyle.textAlign};
        text-transform: ${textStyle.textTransform};
        letter-spacing: ${textStyle.letterSpacing}px;
      `;
    }

    css += `}`;

    // 懸停效果
    css += `
      .folder-${customization.folderId}:hover {
        background-color: ${colorScheme.hover};
        transform: translateY(-2px);
        transition: all 0.2s ease;
      }
    `;

    // 激活效果
    css += `
      .folder-${customization.folderId}:active,
      .folder-${customization.folderId}.active {
        background-color: ${colorScheme.active};
      }
    `;

    return css;
  }

  /**
   * 獲取漸變方向
   */
  private getGradientDirection(direction: 'horizontal' | 'vertical' | 'diagonal'): string {
    switch (direction) {
      case 'horizontal':
        return 'to right';
      case 'vertical':
        return 'to bottom';
      case 'diagonal':
        return '45deg';
      default:
        return 'to right';
    }
  }

  /**
   * 驗證顏色對比度
   */
  validateColorContrast(foreground: string, background: string): boolean {
    // 簡化的對比度檢查，實際應該使用 WCAG 對比度算法
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    
    const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                    (Math.min(fgLuminance, bgLuminance) + 0.05);
    
    return contrast >= 4.5; // WCAG AA 標準
  }

  /**
   * 獲取顏色亮度
   */
  private getLuminance(color: string): number {
    // 簡化的亮度計算
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * 應用無障礙設定
   */
  applyAccessibilitySettings(
    customization: FolderCustomization,
    settings: AccessibilitySettings
  ): FolderCustomization {
    const updated = { ...customization };
    
    if (settings.highContrast) {
      // 調整為高對比度顏色
      updated.colorScheme = {
        ...updated.colorScheme,
        primary: '#000000',
        background: '#FFFFFF',
        text: '#000000',
        border: '#000000'
      };
    }
    
    if (settings.largeText && updated.textStyle) {
      updated.textStyle.fontSize = Math.max(updated.textStyle.fontSize * 1.2, 16);
    }
    
    if (settings.reducedMotion) {
      // 移除動畫效果（在CSS生成時處理）
    }
    
    updated.metadata.accessibility = settings;
    return updated;
  }

  /**
   * 導出自定義設定
   */
  exportCustomization(folderId: string): string | null {
    const customization = this.customizations.get(folderId);
    if (!customization) return null;
    
    return JSON.stringify(customization, null, 2);
  }

  /**
   * 導入自定義設定
   */
  importCustomization(data: string): FolderCustomization | null {
    try {
      const customization = JSON.parse(data) as FolderCustomization;
      
      // 驗證數據結構
      if (!customization.folderId || !customization.colorScheme) {
        throw new Error('Invalid customization data');
      }
      
      this.customizations.set(customization.folderId, customization);
      return customization;
    } catch (error) {
      console.error('Failed to import customization:', error);
      return null;
    }
  }

  /**
   * 重置為默認設定
   */
  resetToDefault(folderId: string, userId: string): FolderCustomization {
    const defaultCustomization: FolderCustomization = {
      id: `default_${Date.now()}`,
      folderId,
      userId,
      colorScheme: this.defaultTheme.colorSchemes[0],
      iconType: FolderIconType.DEFAULT,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true,
      metadata: {
        version: '1.0.0',
        theme: this.defaultTheme.id,
        accessibility: this.defaultTheme.accessibility
      }
    };

    this.customizations.set(folderId, defaultCustomization);
    return defaultCustomization;
  }
}

// 單例實例
export const folderCustomizationManager = new FolderCustomizationManager();
