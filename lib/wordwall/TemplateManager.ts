/**
 * WordWall 風格模板管理器
 * 提供模板選擇、配置和轉換功能
 */

import { GameCategory, DifficultyLevel, TemplateType } from '@prisma/client';

export interface GameTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: GameCategory;
  difficulty: DifficultyLevel;
  estimatedTime: string;
  features: string[];
  minItems: number;
  maxItems: number;
  requiresEvenItems: boolean;
  isActive: boolean;
  isPremium: boolean;
  sortOrder: number;
  templateType: TemplateType;
}

export interface TemplateConfig {
  title: string;
  description?: string;
  content: any;
  settings: GameSettings;
  theme: VisualTheme;
}

export interface GameSettings {
  timerType: 'NONE' | 'COUNT_UP' | 'COUNT_DOWN';
  timerDuration?: number;
  livesCount: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  autoProceed: boolean;
  showAnswers: boolean;
  answerLabels: 'ABC' | 'NUMBERS' | 'NONE';
  enableSounds: boolean;
  enableAnimations: boolean;
  allowRetry: boolean;
  showProgress: boolean;
  showScore: boolean;
}

export interface VisualTheme {
  id: string;
  name: string;
  displayName: string;
  category: 'CLASSIC' | 'THEMED' | 'SEASONAL' | 'EDUCATIONAL' | 'MODERN';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor?: string;
  borderColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  boxShadow?: string;
  backgroundImage?: string;
  customCSS?: string;
}

export class WordWallTemplateManager {
  private static templates: GameTemplate[] = [
    // 現有模板
    {
      id: 'quiz',
      name: 'quiz',
      displayName: '測驗問答',
      description: '多選題測驗，支持計時和即時反饋',
      icon: '❓',
      category: 'QUIZ',
      difficulty: 'EASY',
      estimatedTime: '5-15分鐘',
      features: ['多選題', '計時', '即時反饋', '分數統計'],
      minItems: 1,
      maxItems: 50,
      requiresEvenItems: false,
      isActive: true,
      isPremium: false,
      sortOrder: 1,
      templateType: 'QUIZ'
    },
    {
      id: 'matching',
      name: 'matching',
      displayName: '配對遊戲',
      description: '拖拽配對遊戲，訓練記憶和邏輯',
      icon: '🔗',
      category: 'MATCHING',
      difficulty: 'MEDIUM',
      estimatedTime: '3-10分鐘',
      features: ['拖拽操作', '視覺配對', '多種佈局'],
      minItems: 3,
      maxItems: 20,
      requiresEvenItems: false,
      isActive: true,
      isPremium: false,
      sortOrder: 2,
      templateType: 'MATCHING'
    },
    {
      id: 'flashcards',
      name: 'flashcards',
      displayName: '單字卡片',
      description: '翻轉學習卡片，適合詞彙記憶',
      icon: '📚',
      category: 'MEMORY',
      difficulty: 'EASY',
      estimatedTime: '5-20分鐘',
      features: ['翻轉動畫', '進度追蹤', '自動播放'],
      minItems: 1,
      maxItems: 100,
      requiresEvenItems: false,
      isActive: true,
      isPremium: false,
      sortOrder: 3,
      templateType: 'FLASHCARDS'
    },
    // WordWall 風格新模板
    {
      id: 'hangman',
      name: 'hangman',
      displayName: '猜字遊戲',
      description: '經典猜字遊戲，逐字母猜測單詞',
      icon: '🎯',
      category: 'WORD_GAMES',
      difficulty: 'MEDIUM',
      estimatedTime: '3-8分鐘',
      features: ['字母選擇', '視覺提示', '難度調整'],
      minItems: 1,
      maxItems: 30,
      requiresEvenItems: false,
      isActive: true,
      isPremium: false,
      sortOrder: 4,
      templateType: 'HANGMAN'
    },
    {
      id: 'image-quiz',
      name: 'image-quiz',
      displayName: '圖片問答',
      description: '基於圖片的問答遊戲，視覺化學習',
      icon: '🖼️',
      category: 'QUIZ',
      difficulty: 'EASY',
      estimatedTime: '5-12分鐘',
      features: ['圖片展示', '多選答案', '視覺學習'],
      minItems: 1,
      maxItems: 40,
      requiresEvenItems: false,
      isActive: true,
      isPremium: false,
      sortOrder: 5,
      templateType: 'IMAGE_QUIZ'
    },
    {
      id: 'true-false',
      name: 'true-false',
      displayName: '是非題',
      description: '簡單的是非判斷題，快速測驗',
      icon: '✅',
      category: 'QUIZ',
      difficulty: 'EASY',
      estimatedTime: '2-8分鐘',
      features: ['快速答題', '即時反饋', '計時挑戰'],
      minItems: 1,
      maxItems: 50,
      requiresEvenItems: false,
      isActive: true,
      isPremium: false,
      sortOrder: 6,
      templateType: 'TRUE_FALSE'
    },
    {
      id: 'whack-a-mole',
      name: 'whack-a-mole',
      displayName: '打地鼠',
      description: '快速反應遊戲，訓練注意力和反應速度',
      icon: '🔨',
      category: 'ACTION',
      difficulty: 'MEDIUM',
      estimatedTime: '2-5分鐘',
      features: ['快速反應', '動畫效果', '分數競賽'],
      minItems: 5,
      maxItems: 30,
      requiresEvenItems: false,
      isActive: true,
      isPremium: false,
      sortOrder: 7,
      templateType: 'WHACK_A_MOLE'
    },
    {
      id: 'balloon-pop',
      name: 'balloon-pop',
      displayName: '氣球爆破',
      description: '點擊氣球回答問題，視覺效果豐富',
      icon: '🎈',
      category: 'ACTION',
      difficulty: 'EASY',
      estimatedTime: '3-10分鐘',
      features: ['動畫效果', '音效反饋', '視覺獎勵'],
      minItems: 1,
      maxItems: 25,
      requiresEvenItems: false,
      isActive: true,
      isPremium: false,
      sortOrder: 8,
      templateType: 'BALLOON_POP'
    }
  ];

  /**
   * 獲取所有可用模板
   */
  static getAllTemplates(): GameTemplate[] {
    return this.templates.filter(template => template.isActive);
  }

  /**
   * 根據分類獲取模板
   */
  static getTemplatesByCategory(category: GameCategory): GameTemplate[] {
    return this.templates.filter(
      template => template.isActive && template.category === category
    );
  }

  /**
   * 根據難度獲取模板
   */
  static getTemplatesByDifficulty(difficulty: DifficultyLevel): GameTemplate[] {
    return this.templates.filter(
      template => template.isActive && template.difficulty === difficulty
    );
  }

  /**
   * 根據 ID 獲取模板
   */
  static getTemplateById(id: string): GameTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  /**
   * 搜索模板
   */
  static searchTemplates(query: string): GameTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return this.templates.filter(template => 
      template.isActive && (
        template.displayName.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.features.some(feature => 
          feature.toLowerCase().includes(lowercaseQuery)
        )
      )
    );
  }

  /**
   * 獲取免費模板
   */
  static getFreeTemplates(): GameTemplate[] {
    return this.templates.filter(
      template => template.isActive && !template.isPremium
    );
  }

  /**
   * 獲取高級模板
   */
  static getPremiumTemplates(): GameTemplate[] {
    return this.templates.filter(
      template => template.isActive && template.isPremium
    );
  }

  /**
   * 驗證內容是否符合模板要求
   */
  static validateContent(templateId: string, content: any): {
    isValid: boolean;
    errors: string[];
  } {
    const template = this.getTemplateById(templateId);
    if (!template) {
      return { isValid: false, errors: ['模板不存在'] };
    }

    const errors: string[] = [];
    
    // 檢查內容項目數量
    const itemCount = Array.isArray(content.items) ? content.items.length : 0;
    if (itemCount < template.minItems) {
      errors.push(`至少需要 ${template.minItems} 個項目`);
    }
    if (itemCount > template.maxItems) {
      errors.push(`最多只能有 ${template.maxItems} 個項目`);
    }

    // 檢查是否需要偶數項目
    if (template.requiresEvenItems && itemCount % 2 !== 0) {
      errors.push('此模板需要偶數個項目');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
