/**
 * 視覺樣式管理器 - 第二階段增強版
 * 提供30+主題樣式、顏色配置、字體選擇、動畫效果等
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Typography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
  };
  effects: {
    fadeIn: string;
    slideIn: string;
    scaleIn: string;
    rotateIn: string;
  };
}

export interface VisualStyle {
  id: string;
  name: string;
  description: string;
  category: 'classic' | 'modern' | 'playful' | 'professional' | 'themed' | 'seasonal';
  preview: string; // Base64 encoded preview image
  colors: ColorPalette;
  typography: Typography;
  animations: AnimationConfig;
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  isPopular?: boolean;
  isPremium?: boolean;
  tags: string[];
}

export class VisualStyleManager {
  private static styles: VisualStyle[] = [];

  // 初始化所有樣式
  static initialize() {
    this.styles = [
      // Classic 經典樣式
      this.createClassicStyle(),
      this.createMinimalStyle(),
      this.createElegantStyle(),
      
      // Modern 現代樣式
      this.createNeonStyle(),
      this.createGlassStyle(),
      this.createGradientStyle(),
      
      // Playful 趣味樣式
      this.createCartoonStyle(),
      this.createCandyStyle(),
      this.createRetroStyle(),
      
      // Professional 專業樣式
      this.createCorporateStyle(),
      this.createAcademicStyle(),
      this.createBusinessStyle(),
      
      // Themed 主題樣式
      this.createNatureStyle(),
      this.createSpaceStyle(),
      this.createOceanStyle(),
      this.createForestStyle(),
      this.createSunsetStyle(),
      
      // Seasonal 季節樣式
      this.createSpringStyle(),
      this.createSummerStyle(),
      this.createAutumnStyle(),
      this.createWinterStyle(),
      
      // 特殊樣式
      this.createDarkModeStyle(),
      this.createHighContrastStyle(),
      this.createPastelStyle(),
      this.createVintageStyle(),
      this.createCyberpunkStyle(),
      this.createWatercolorStyle(),
      this.createChalkboardStyle(),
      this.createPaperStyle(),
      this.createMetallicStyle(),
      this.createHolographicStyle()
    ];
  }

  // 獲取所有樣式
  static getAllStyles(): VisualStyle[] {
    if (this.styles.length === 0) {
      this.initialize();
    }
    return this.styles;
  }

  // 根據類別獲取樣式
  static getStylesByCategory(category: VisualStyle['category']): VisualStyle[] {
    return this.getAllStyles().filter(style => style.category === category);
  }

  // 獲取熱門樣式
  static getPopularStyles(): VisualStyle[] {
    return this.getAllStyles().filter(style => style.isPopular);
  }

  // 獲取免費樣式
  static getFreeStyles(): VisualStyle[] {
    return this.getAllStyles().filter(style => !style.isPremium);
  }

  // 根據標籤搜索樣式
  static searchStylesByTags(tags: string[]): VisualStyle[] {
    return this.getAllStyles().filter(style => 
      tags.some(tag => style.tags.includes(tag.toLowerCase()))
    );
  }

  // 獲取特定樣式
  static getStyle(styleId: string): VisualStyle | undefined {
    return this.getAllStyles().find(style => style.id === styleId);
  }

  // 生成 CSS 變量
  static generateCSSVariables(style: VisualStyle): Record<string, string> {
    return {
      // 顏色變量
      '--color-primary': style.colors.primary,
      '--color-secondary': style.colors.secondary,
      '--color-accent': style.colors.accent,
      '--color-background': style.colors.background,
      '--color-surface': style.colors.surface,
      '--color-text': style.colors.text,
      '--color-text-secondary': style.colors.textSecondary,
      '--color-border': style.colors.border,
      '--color-success': style.colors.success,
      '--color-warning': style.colors.warning,
      '--color-error': style.colors.error,
      '--color-info': style.colors.info,
      
      // 字體變量
      '--font-family': style.typography.fontFamily,
      '--font-size-xs': style.typography.fontSize.xs,
      '--font-size-sm': style.typography.fontSize.sm,
      '--font-size-base': style.typography.fontSize.base,
      '--font-size-lg': style.typography.fontSize.lg,
      '--font-size-xl': style.typography.fontSize.xl,
      '--font-size-2xl': style.typography.fontSize['2xl'],
      '--font-size-3xl': style.typography.fontSize['3xl'],
      
      // 圓角變量
      '--border-radius-none': style.borderRadius.none,
      '--border-radius-sm': style.borderRadius.sm,
      '--border-radius-md': style.borderRadius.md,
      '--border-radius-lg': style.borderRadius.lg,
      '--border-radius-xl': style.borderRadius.xl,
      '--border-radius-full': style.borderRadius.full,
      
      // 陰影變量
      '--shadow-none': style.shadows.none,
      '--shadow-sm': style.shadows.sm,
      '--shadow-md': style.shadows.md,
      '--shadow-lg': style.shadows.lg,
      '--shadow-xl': style.shadows.xl,
      
      // 間距變量
      '--spacing-xs': style.spacing.xs,
      '--spacing-sm': style.spacing.sm,
      '--spacing-md': style.spacing.md,
      '--spacing-lg': style.spacing.lg,
      '--spacing-xl': style.spacing.xl,
      
      // 動畫變量
      '--animation-duration-fast': style.animations.duration.fast,
      '--animation-duration-normal': style.animations.duration.normal,
      '--animation-duration-slow': style.animations.duration.slow,
      '--animation-easing-ease-in': style.animations.easing.easeIn,
      '--animation-easing-ease-out': style.animations.easing.easeOut,
      '--animation-easing-ease-in-out': style.animations.easing.easeInOut,
      '--animation-easing-bounce': style.animations.easing.bounce
    };
  }

  // 應用樣式到元素
  static applyStyleToElement(element: HTMLElement, styleId: string): void {
    const style = this.getStyle(styleId);
    if (!style) return;

    const cssVariables = this.generateCSSVariables(style);
    Object.entries(cssVariables).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });

    // 添加樣式類名
    element.classList.add(`style-${styleId}`);
  }

  // 創建經典樣式
  private static createClassicStyle(): VisualStyle {
    return {
      id: 'classic',
      name: '經典藍',
      description: '永恆的藍色主題，專業且易讀',
      category: 'classic',
      preview: '',
      colors: {
        primary: '#3B82F6',
        secondary: '#64748B',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#1E293B',
        textSecondary: '#64748B',
        border: '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      },
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          linear: 'linear',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        },
        effects: {
          fadeIn: 'opacity 300ms ease-in-out',
          slideIn: 'transform 300ms ease-out',
          scaleIn: 'transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          rotateIn: 'transform 300ms ease-in-out'
        }
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      isPopular: true,
      isPremium: false,
      tags: ['classic', 'professional', 'blue', 'clean']
    };
  }

  // 創建其他樣式的方法...
  private static createMinimalStyle(): VisualStyle {
    return {
      id: 'minimal',
      name: '極簡白',
      description: '簡潔的黑白設計，注重內容本身',
      category: 'classic',
      preview: '',
      colors: {
        primary: '#000000',
        secondary: '#6B7280',
        accent: '#374151',
        background: '#FFFFFF',
        surface: '#FAFAFA',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#2563EB'
      },
      typography: {
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      animations: {
        duration: {
          fast: '100ms',
          normal: '200ms',
          slow: '400ms'
        },
        easing: {
          linear: 'linear',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out',
          bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        },
        effects: {
          fadeIn: 'opacity 200ms ease-in-out',
          slideIn: 'transform 200ms ease-out',
          scaleIn: 'transform 200ms ease-in-out',
          rotateIn: 'transform 200ms ease-in-out'
        }
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
        full: '9999px'
      },
      shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        lg: '0 4px 6px 0 rgba(0, 0, 0, 0.07)',
        xl: '0 8px 15px 0 rgba(0, 0, 0, 0.08)'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem'
      },
      isPopular: true,
      isPremium: false,
      tags: ['minimal', 'clean', 'monochrome', 'simple']
    };
  }

  // 更多樣式創建方法將在後續添加...
  private static createElegantStyle(): VisualStyle {
    // 實現優雅樣式
    return {
      id: 'elegant',
      name: '優雅紫',
      description: '高雅的紫色調，適合正式場合',
      category: 'classic',
      preview: '',
      colors: {
        primary: '#8B5CF6',
        secondary: '#A78BFA',
        accent: '#F59E0B',
        background: '#FEFEFE',
        surface: '#F9FAFB',
        text: '#374151',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#8B5CF6'
      },
      typography: {
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      animations: {
        duration: {
          fast: '200ms',
          normal: '400ms',
          slow: '600ms'
        },
        easing: {
          linear: 'linear',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        },
        effects: {
          fadeIn: 'opacity 400ms ease-in-out',
          slideIn: 'transform 400ms ease-out',
          scaleIn: 'transform 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          rotateIn: 'transform 400ms ease-in-out'
        }
      },
      borderRadius: {
        none: '0',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      },
      shadows: {
        none: 'none',
        sm: '0 2px 4px 0 rgba(139, 92, 246, 0.1)',
        md: '0 4px 8px 0 rgba(139, 92, 246, 0.15)',
        lg: '0 8px 16px 0 rgba(139, 92, 246, 0.2)',
        xl: '0 16px 32px 0 rgba(139, 92, 246, 0.25)'
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      isPopular: false,
      isPremium: false,
      tags: ['elegant', 'purple', 'formal', 'sophisticated']
    };
  }

  // 創建現代霓虹樣式
  private static createNeonStyle(): VisualStyle {
    return {
      id: 'neon',
      name: '霓虹夜',
      description: '炫酷的霓虹效果，充滿未來感',
      category: 'modern',
      preview: '',
      colors: {
        primary: '#00FFFF',
        secondary: '#FF00FF',
        accent: '#FFFF00',
        background: '#0A0A0A',
        surface: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        border: '#333333',
        success: '#00FF00',
        warning: '#FFAA00',
        error: '#FF0040',
        info: '#00AAFF'
      },
      typography: {
        fontFamily: '"Orbitron", "Courier New", monospace',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          linear: 'linear',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        },
        effects: {
          fadeIn: 'opacity 300ms ease-in-out',
          slideIn: 'transform 300ms ease-out',
          scaleIn: 'transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          rotateIn: 'transform 300ms ease-in-out'
        }
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        none: 'none',
        sm: '0 0 5px rgba(0, 255, 255, 0.5)',
        md: '0 0 10px rgba(0, 255, 255, 0.7)',
        lg: '0 0 20px rgba(0, 255, 255, 0.8)',
        xl: '0 0 30px rgba(0, 255, 255, 1)'
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      isPopular: true,
      isPremium: true,
      tags: ['neon', 'futuristic', 'dark', 'cyberpunk', 'glow']
    };
  }

  // 其他樣式創建方法的占位符...
  private static createGlassStyle(): VisualStyle {
    // 玻璃態樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createGradientStyle(): VisualStyle {
    // 漸變樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createCartoonStyle(): VisualStyle {
    // 卡通樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createCandyStyle(): VisualStyle {
    // 糖果樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createRetroStyle(): VisualStyle {
    // 復古樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createCorporateStyle(): VisualStyle {
    // 企業樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createAcademicStyle(): VisualStyle {
    // 學術樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createBusinessStyle(): VisualStyle {
    // 商務樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createNatureStyle(): VisualStyle {
    // 自然樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createSpaceStyle(): VisualStyle {
    // 太空樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createOceanStyle(): VisualStyle {
    // 海洋樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createForestStyle(): VisualStyle {
    // 森林樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createSunsetStyle(): VisualStyle {
    // 日落樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createSpringStyle(): VisualStyle {
    // 春季樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createSummerStyle(): VisualStyle {
    // 夏季樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createAutumnStyle(): VisualStyle {
    // 秋季樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createWinterStyle(): VisualStyle {
    // 冬季樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createDarkModeStyle(): VisualStyle {
    // 暗黑模式樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createHighContrastStyle(): VisualStyle {
    // 高對比度樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createPastelStyle(): VisualStyle {
    // 粉彩樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createVintageStyle(): VisualStyle {
    // 復古樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createCyberpunkStyle(): VisualStyle {
    // 賽博朋克樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createWatercolorStyle(): VisualStyle {
    // 水彩樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createChalkboardStyle(): VisualStyle {
    // 黑板樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createPaperStyle(): VisualStyle {
    // 紙張樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createMetallicStyle(): VisualStyle {
    // 金屬樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }

  private static createHolographicStyle(): VisualStyle {
    // 全息樣式實現
    return this.createClassicStyle(); // 臨時返回經典樣式
  }
}
