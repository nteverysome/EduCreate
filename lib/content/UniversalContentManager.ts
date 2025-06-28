/**
 * 統一內容管理器 - 模仿 wordwall.net 的內容管理模式
 * 允許用戶輸入一組內容，然後適配到所有遊戲類型
 */

export interface UniversalContentItem {
  id: string;
  term: string;           // 主要詞彙/問題
  definition: string;     // 定義/答案
  image?: string;         // 可選圖片
  audio?: string;         // 可選音頻
  category?: string;      // 分類標籤
  difficulty?: 'easy' | 'medium' | 'hard';
  metadata?: Record<string, any>;
}

export interface UniversalContent {
  id: string;
  title: string;
  description?: string;
  items: UniversalContentItem[];
  tags: string[];
  language: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export type GameType = 
  | 'quiz' 
  | 'matching' 
  | 'flashcards' 
  | 'spin-wheel' 
  | 'whack-a-mole'
  | 'memory-cards'
  | 'word-search'
  | 'crossword'
  | 'fill-blank'
  | 'true-false'
  | 'drag-drop'
  | 'balloon-pop'
  | 'airplane'
  | 'maze-chase';

export interface GameConfig {
  type: GameType;
  name: string;
  description: string;
  icon: string;
  minItems: number;
  maxItems: number;
  supportedContentTypes: ('text' | 'image' | 'audio')[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  features: string[];
}

export class UniversalContentManager {
  private content: UniversalContent | null = null;
  private gameConfigs: Record<GameType, GameConfig> = {
    'quiz': {
      type: 'quiz',
      name: '測驗問答',
      description: '多選題測驗，測試知識掌握程度',
      icon: '❓',
      minItems: 1,
      maxItems: 50,
      supportedContentTypes: ['text', 'image'],
      difficulty: 'easy',
      estimatedTime: '5-15分鐘',
      features: ['多選題', '計時', '即時反饋', '分數統計']
    },
    'matching': {
      type: 'matching',
      name: '配對遊戲',
      description: '拖拽配對遊戲，連接相關的項目',
      icon: '🔗',
      minItems: 3,
      maxItems: 20,
      supportedContentTypes: ['text', 'image'],
      difficulty: 'medium',
      estimatedTime: '3-10分鐘',
      features: ['拖拽操作', '視覺配對', '多種佈局', '動畫效果']
    },
    'flashcards': {
      type: 'flashcards',
      name: '單字卡片',
      description: '翻轉學習卡片，記憶詞彙和概念',
      icon: '📚',
      minItems: 1,
      maxItems: 100,
      supportedContentTypes: ['text', 'image', 'audio'],
      difficulty: 'easy',
      estimatedTime: '5-20分鐘',
      features: ['翻轉動畫', '進度追蹤', '重複學習', '音頻支持']
    },
    'spin-wheel': {
      type: 'spin-wheel',
      name: '隨機轉盤',
      description: '旋轉轉盤隨機選擇項目',
      icon: '🎡',
      minItems: 2,
      maxItems: 20,
      supportedContentTypes: ['text'],
      difficulty: 'easy',
      estimatedTime: '2-5分鐘',
      features: ['隨機選擇', '動畫效果', '自定義顏色', '音效']
    },
    'whack-a-mole': {
      type: 'whack-a-mole',
      name: '打地鼠',
      description: '快速反應遊戲，點擊正確答案',
      icon: '🎯',
      minItems: 5,
      maxItems: 30,
      supportedContentTypes: ['text'],
      difficulty: 'hard',
      estimatedTime: '3-8分鐘',
      features: ['快速反應', '計時挑戰', '分數系統', '難度遞增']
    },
    'memory-cards': {
      type: 'memory-cards',
      name: '記憶卡片',
      description: '翻轉配對記憶遊戲',
      icon: '🧠',
      minItems: 4,
      maxItems: 24,
      supportedContentTypes: ['text', 'image'],
      difficulty: 'medium',
      estimatedTime: '5-15分鐘',
      features: ['記憶挑戰', '配對遊戲', '翻轉動畫', '計時器']
    },
    'word-search': {
      type: 'word-search',
      name: '單字搜尋',
      description: '在字母網格中找出隱藏的單字',
      icon: '🔍',
      minItems: 5,
      maxItems: 25,
      supportedContentTypes: ['text'],
      difficulty: 'medium',
      estimatedTime: '5-12分鐘',
      features: ['字母網格', '單字搜尋', '高亮顯示', '計時器']
    },
    'crossword': {
      type: 'crossword',
      name: '填字遊戲',
      description: '根據提示填入正確的單字',
      icon: '📝',
      minItems: 5,
      maxItems: 20,
      supportedContentTypes: ['text'],
      difficulty: 'hard',
      estimatedTime: '10-25分鐘',
      features: ['交叉填字', '提示系統', '自動檢查', '進度保存']
    },
    'fill-blank': {
      type: 'fill-blank',
      name: '填空題',
      description: '在句子中填入正確的詞彙',
      icon: '✏️',
      minItems: 3,
      maxItems: 30,
      supportedContentTypes: ['text'],
      difficulty: 'medium',
      estimatedTime: '5-15分鐘',
      features: ['句子填空', '多選選項', '即時反饋', '提示功能']
    },
    'true-false': {
      type: 'true-false',
      name: '是非題',
      description: '判斷陳述的真假',
      icon: '✅',
      minItems: 5,
      maxItems: 50,
      supportedContentTypes: ['text', 'image'],
      difficulty: 'easy',
      estimatedTime: '3-10分鐘',
      features: ['快速判斷', '計時挑戰', '分數統計', '解釋說明']
    },
    'drag-drop': {
      type: 'drag-drop',
      name: '拖拽排序',
      description: '拖拽項目到正確位置',
      icon: '🎯',
      minItems: 3,
      maxItems: 15,
      supportedContentTypes: ['text', 'image'],
      difficulty: 'medium',
      estimatedTime: '3-8分鐘',
      features: ['拖拽操作', '排序挑戰', '視覺反饋', '動畫效果']
    },
    'balloon-pop': {
      type: 'balloon-pop',
      name: '氣球爆破',
      description: '點擊正確的氣球獲得分數',
      icon: '🎈',
      minItems: 5,
      maxItems: 25,
      supportedContentTypes: ['text'],
      difficulty: 'easy',
      estimatedTime: '3-8分鐘',
      features: ['點擊遊戲', '動畫效果', '分數系統', '音效']
    },
    'airplane': {
      type: 'airplane',
      name: '飛機遊戲',
      description: '駕駛飛機收集正確答案',
      icon: '✈️',
      minItems: 5,
      maxItems: 30,
      supportedContentTypes: ['text'],
      difficulty: 'hard',
      estimatedTime: '5-12分鐘',
      features: ['飛行控制', '收集遊戲', '障礙物', '分數系統']
    },
    'maze-chase': {
      type: 'maze-chase',
      name: '迷宮追逐',
      description: '在迷宮中找到正確答案',
      icon: '🏃',
      minItems: 5,
      maxItems: 20,
      supportedContentTypes: ['text'],
      difficulty: 'hard',
      estimatedTime: '5-15分鐘',
      features: ['迷宮導航', '追逐遊戲', '時間限制', '關卡系統']
    }
  };

  /**
   * 設置內容
   */
  setContent(content: UniversalContent): void {
    this.content = content;
  }

  /**
   * 獲取內容
   */
  getContent(): UniversalContent | null {
    return this.content;
  }

  /**
   * 獲取所有可用的遊戲類型
   */
  getAvailableGames(): GameConfig[] {
    if (!this.content) return [];
    
    const itemCount = this.content.items.length;
    return Object.values(this.gameConfigs).filter(config => 
      itemCount >= config.minItems && itemCount <= config.maxItems
    );
  }

  /**
   * 獲取推薦的遊戲類型
   */
  getRecommendedGames(): GameConfig[] {
    if (!this.content) return [];
    
    const availableGames = this.getAvailableGames();
    const itemCount = this.content.items.length;
    
    // 根據內容數量和類型推薦遊戲
    const recommendations: GameConfig[] = [];
    
    if (itemCount <= 10) {
      recommendations.push(...availableGames.filter(g => 
        ['quiz', 'flashcards', 'matching'].includes(g.type)
      ));
    }
    
    if (itemCount >= 5 && itemCount <= 20) {
      recommendations.push(...availableGames.filter(g => 
        ['memory-cards', 'word-search', 'balloon-pop'].includes(g.type)
      ));
    }
    
    if (itemCount >= 10) {
      recommendations.push(...availableGames.filter(g => 
        ['crossword', 'whack-a-mole', 'airplane'].includes(g.type)
      ));
    }
    
    return recommendations.slice(0, 6); // 最多推薦6個遊戲
  }

  /**
   * 檢查內容是否適合特定遊戲
   */
  isContentSuitableForGame(gameType: GameType): boolean {
    if (!this.content) return false;
    
    const config = this.gameConfigs[gameType];
    const itemCount = this.content.items.length;
    
    return itemCount >= config.minItems && itemCount <= config.maxItems;
  }

  /**
   * 獲取遊戲配置
   */
  getGameConfig(gameType: GameType): GameConfig {
    return this.gameConfigs[gameType];
  }

  /**
   * 添加內容項目
   */
  addContentItem(item: Omit<UniversalContentItem, 'id'>): void {
    if (!this.content) return;
    
    const newItem: UniversalContentItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.content.items.push(newItem);
    this.content.updatedAt = new Date();
  }

  /**
   * 更新內容項目
   */
  updateContentItem(id: string, updates: Partial<UniversalContentItem>): void {
    if (!this.content) return;
    
    const index = this.content.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.content.items[index] = { ...this.content.items[index], ...updates };
      this.content.updatedAt = new Date();
    }
  }

  /**
   * 刪除內容項目
   */
  removeContentItem(id: string): void {
    if (!this.content) return;
    
    this.content.items = this.content.items.filter(item => item.id !== id);
    this.content.updatedAt = new Date();
  }

  /**
   * 批量導入內容
   */
  importContent(text: string, separator: string = '\n'): void {
    if (!this.content) return;
    
    const lines = text.split(separator).filter(line => line.trim());
    
    lines.forEach(line => {
      const parts = line.split('\t').map(part => part.trim());
      if (parts.length >= 2) {
        this.addContentItem({
          term: parts[0],
          definition: parts[1],
          category: parts[2] || undefined
        });
      }
    });
  }

  /**
   * 導出內容
   */
  exportContent(format: 'json' | 'csv' | 'txt' = 'json'): string {
    if (!this.content) return '';
    
    switch (format) {
      case 'json':
        return JSON.stringify(this.content, null, 2);
      
      case 'csv':
        const csvHeader = 'Term,Definition,Category\n';
        const csvRows = this.content.items.map(item => 
          `"${item.term}","${item.definition}","${item.category || ''}"`
        ).join('\n');
        return csvHeader + csvRows;
      
      case 'txt':
        return this.content.items.map(item => 
          `${item.term}\t${item.definition}${item.category ? '\t' + item.category : ''}`
        ).join('\n');
      
      default:
        return '';
    }
  }
}
