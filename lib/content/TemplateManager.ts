/**
 * 模板管理器 - 模仿 wordwall.net 的模板切換系統
 * 提供遊戲模板切換、視覺樣式管理和遊戲選項配置
 */

import { GameType } from './UniversalContentManager';

export interface GameTemplate {
  id: GameType;
  name: string;
  icon: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  features: string[];
  minItems: number;
  maxItems: number;
  requiresEvenItems: boolean;
  category: 'quiz' | 'matching' | 'memory' | 'action' | 'creative';
}

export interface VisualStyle {
  id: string;
  name: string;
  thumbnail: string;
  category: 'classic' | 'themed' | 'seasonal' | 'educational';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export interface GameOption {
  id: string;
  name: string;
  type: 'radio' | 'checkbox' | 'slider' | 'select';
  options?: string[];
  min?: number;
  max?: number;
  default: any;
  description: string;
}

export interface TemplateConfiguration {
  templateId: GameType;
  visualStyle: string;
  gameOptions: Record<string, any>;
  customSettings?: Record<string, any>;
}

export class TemplateManager {
  private static templates: GameTemplate[] = [
    {
      id: 'quiz',
      name: '測驗問答',
      icon: '❓',
      description: '多選題測驗，支持計時和即時反饋',
      difficulty: 'easy',
      estimatedTime: '5-15分鐘',
      features: ['多選題', '計時', '即時反饋', '分數統計'],
      minItems: 1,
      maxItems: 50,
      requiresEvenItems: false,
      category: 'quiz'
    },
    {
      id: 'matching',
      name: '配對遊戲',
      icon: '🔗',
      description: '拖拽配對遊戲，訓練記憶和邏輯',
      difficulty: 'medium',
      estimatedTime: '3-10分鐘',
      features: ['拖拽操作', '視覺配對', '多種佈局'],
      minItems: 3,
      maxItems: 20,
      requiresEvenItems: false,
      category: 'matching'
    },
    {
      id: 'flashcards',
      name: '單字卡片',
      icon: '📚',
      description: '翻轉卡片學習，支持進度追蹤',
      difficulty: 'easy',
      estimatedTime: '5-20分鐘',
      features: ['翻轉動畫', '進度追蹤', '重複學習'],
      minItems: 1,
      maxItems: 100,
      requiresEvenItems: false,
      category: 'memory'
    },
    {
      id: 'spin-wheel',
      name: '隨機轉盤',
      icon: '🎡',
      description: '隨機選擇轉盤，增加趣味性',
      difficulty: 'easy',
      estimatedTime: '2-8分鐘',
      features: ['隨機選擇', '動畫效果', '音效支持'],
      minItems: 2,
      maxItems: 20,
      requiresEvenItems: false,
      category: 'action'
    },
    {
      id: 'whack-a-mole',
      name: '打地鼠',
      icon: '🎯',
      description: '快速反應遊戲，訓練注意力',
      difficulty: 'hard',
      estimatedTime: '3-8分鐘',
      features: ['快速反應', '計時挑戰', '分數競賽'],
      minItems: 5,
      maxItems: 30,
      requiresEvenItems: false,
      category: 'action'
    },
    {
      id: 'memory-cards',
      name: '記憶卡片',
      icon: '🧠',
      description: '記憶配對遊戲，訓練記憶力',
      difficulty: 'medium',
      estimatedTime: '5-15分鐘',
      features: ['記憶挑戰', '配對遊戲', '翻轉動畫'],
      minItems: 4,
      maxItems: 24,
      requiresEvenItems: true,
      category: 'memory'
    }
  ];

  /**
   * 獲取所有可用模板
   */
  static getAllTemplates(): GameTemplate[] {
    return [...this.templates];
  }

  /**
   * 根據類別獲取模板
   */
  static getTemplatesByCategory(category: string): GameTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  /**
   * 獲取推薦模板（基於內容項目數量）
   */
  static getRecommendedTemplates(itemCount: number): GameTemplate[] {
    return this.templates
      .filter(template => 
        itemCount >= template.minItems && 
        itemCount <= template.maxItems &&
        (!template.requiresEvenItems || itemCount % 2 === 0)
      )
      .sort((a, b) => {
        // 優先推薦簡單的遊戲
        const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      })
      .slice(0, 6);
  }

  /**
   * 獲取模板的視覺樣式
   */
  static getTemplateStyles(templateId: GameType): VisualStyle[] {
    const commonStyles: VisualStyle[] = [
      {
        id: 'classic',
        name: 'Classic',
        thumbnail: '/styles/classic.jpg',
        category: 'classic',
        colors: { primary: '#3B82F6', secondary: '#EFF6FF', background: '#FFFFFF', text: '#1F2937' }
      },
      {
        id: 'classroom',
        name: 'Classroom',
        thumbnail: '/styles/classroom.jpg',
        category: 'educational',
        colors: { primary: '#059669', secondary: '#ECFDF5', background: '#F9FAFB', text: '#1F2937' }
      },
      {
        id: 'clouds',
        name: 'Clouds',
        thumbnail: '/styles/clouds.jpg',
        category: 'themed',
        colors: { primary: '#0EA5E9', secondary: '#E0F2FE', background: '#F0F9FF', text: '#0C4A6E' }
      }
    ];

    // 根據模板類型返回特定樣式
    const templateSpecificStyles: Record<GameType, VisualStyle[]> = {
      'quiz': [
        ...commonStyles,
        {
          id: 'tv-gameshow',
          name: 'TV Game Show',
          thumbnail: '/styles/quiz/tv-gameshow.jpg',
          category: 'themed',
          colors: { primary: '#DC2626', secondary: '#FEF2F2', background: '#1F2937', text: '#FFFFFF' }
        },
        {
          id: 'blackboard',
          name: 'Blackboard',
          thumbnail: '/styles/quiz/blackboard.jpg',
          category: 'educational',
          colors: { primary: '#FBBF24', secondary: '#FEF3C7', background: '#1F2937', text: '#FFFFFF' }
        }
      ],
      'matching': [
        ...commonStyles,
        {
          id: 'wooden-desk',
          name: 'Wooden Desk',
          thumbnail: '/styles/matching/wooden-desk.jpg',
          category: 'classic',
          colors: { primary: '#92400E', secondary: '#FEF3C7', background: '#FFFBEB', text: '#92400E' }
        }
      ],
      'flashcards': commonStyles,
      'spin-wheel': commonStyles,
      'whack-a-mole': commonStyles,
      'memory-cards': commonStyles
    };

    return templateSpecificStyles[templateId] || commonStyles;
  }

  /**
   * 獲取模板的遊戲選項
   */
  static getTemplateOptions(templateId: GameType): GameOption[] {
    const commonOptions: GameOption[] = [
      {
        id: 'timer',
        name: '計時器',
        type: 'radio',
        options: ['none', 'countUp', 'countDown'],
        default: 'none',
        description: '選擇計時模式'
      },
      {
        id: 'shuffleQuestions',
        name: '隨機問題順序',
        type: 'checkbox',
        default: false,
        description: '每次遊戲隨機排列問題順序'
      }
    ];

    const templateSpecificOptions: Record<GameType, GameOption[]> = {
      'quiz': [
        ...commonOptions,
        {
          id: 'lives',
          name: '生命值',
          type: 'slider',
          min: 0,
          max: 10,
          default: 0,
          description: '設置玩家生命值（0表示無限制）'
        },
        {
          id: 'shuffleAnswers',
          name: '隨機答案順序',
          type: 'checkbox',
          default: false,
          description: '每個問題的答案選項隨機排列'
        },
        {
          id: 'answerLabels',
          name: '答案標籤',
          type: 'radio',
          options: ['abc', 'none'],
          default: 'abc',
          description: '顯示 A、B、C 標籤或無標籤'
        },
        {
          id: 'showAnswers',
          name: '顯示正確答案',
          type: 'checkbox',
          default: true,
          description: '遊戲結束後顯示正確答案'
        }
      ],
      'matching': [
        ...commonOptions,
        {
          id: 'layout',
          name: '佈局模式',
          type: 'radio',
          options: ['grid', 'columns', 'scattered'],
          default: 'grid',
          description: '選擇配對項目的佈局方式'
        },
        {
          id: 'autoCheck',
          name: '自動檢查',
          type: 'checkbox',
          default: true,
          description: '拖拽後自動檢查配對是否正確'
        }
      ],
      'flashcards': [
        {
          id: 'autoAdvance',
          name: '自動翻頁',
          type: 'checkbox',
          default: false,
          description: '自動翻到下一張卡片'
        },
        {
          id: 'showProgress',
          name: '顯示進度',
          type: 'checkbox',
          default: true,
          description: '顯示學習進度條'
        }
      ],
      'spin-wheel': [
        {
          id: 'spinSpeed',
          name: '轉盤速度',
          type: 'slider',
          min: 1,
          max: 5,
          default: 3,
          description: '設置轉盤旋轉速度'
        },
        {
          id: 'soundEffects',
          name: '音效',
          type: 'checkbox',
          default: true,
          description: '啟用轉盤音效'
        }
      ],
      'whack-a-mole': [
        {
          id: 'gameSpeed',
          name: '遊戲速度',
          type: 'slider',
          min: 1,
          max: 5,
          default: 3,
          description: '設置地鼠出現速度'
        },
        {
          id: 'gameDuration',
          name: '遊戲時長',
          type: 'slider',
          min: 30,
          max: 180,
          default: 60,
          description: '設置遊戲時長（秒）'
        }
      ],
      'memory-cards': [
        {
          id: 'cardFlipSpeed',
          name: '翻牌速度',
          type: 'slider',
          min: 1,
          max: 5,
          default: 3,
          description: '設置卡片翻轉速度'
        },
        {
          id: 'maxAttempts',
          name: '最大嘗試次數',
          type: 'slider',
          min: 0,
          max: 20,
          default: 0,
          description: '限制最大嘗試次數（0表示無限制）'
        }
      ]
    };

    return templateSpecificOptions[templateId] || commonOptions;
  }

  /**
   * 創建模板配置
   */
  static createConfiguration(
    templateId: GameType,
    visualStyle: string = 'classic',
    gameOptions: Record<string, any> = {}
  ): TemplateConfiguration {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`未找到模板: ${templateId}`);
    }

    const availableOptions = this.getTemplateOptions(templateId);
    const defaultOptions: Record<string, any> = {};
    
    availableOptions.forEach(option => {
      defaultOptions[option.id] = option.default;
    });

    return {
      templateId,
      visualStyle,
      gameOptions: { ...defaultOptions, ...gameOptions }
    };
  }

  /**
   * 驗證模板配置
   */
  static validateConfiguration(config: TemplateConfiguration): boolean {
    const template = this.templates.find(t => t.id === config.templateId);
    if (!template) return false;

    const availableStyles = this.getTemplateStyles(config.templateId);
    const styleExists = availableStyles.some(style => style.id === config.visualStyle);
    if (!styleExists) return false;

    const availableOptions = this.getTemplateOptions(config.templateId);
    for (const [optionId, value] of Object.entries(config.gameOptions)) {
      const option = availableOptions.find(opt => opt.id === optionId);
      if (!option) continue;

      // 驗證選項值
      if (option.type === 'radio' && option.options && !option.options.includes(value)) {
        return false;
      }
      if (option.type === 'slider' && option.min !== undefined && option.max !== undefined) {
        if (value < option.min || value > option.max) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 獲取模板信息
   */
  static getTemplate(templateId: GameType): GameTemplate | undefined {
    return this.templates.find(t => t.id === templateId);
  }

  /**
   * 檢查內容是否兼容模板
   */
  static isContentCompatible(templateId: GameType, itemCount: number): boolean {
    const template = this.getTemplate(templateId);
    if (!template) return false;

    return itemCount >= template.minItems && 
           itemCount <= template.maxItems &&
           (!template.requiresEvenItems || itemCount % 2 === 0);
  }
}
