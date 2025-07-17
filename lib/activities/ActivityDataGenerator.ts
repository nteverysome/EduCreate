/**
 * ActivityDataGenerator.ts - 活動數據生成器
 * 用於生成大量測試活動數據，支持虛擬化列表性能測試
 */

// 活動類型定義
const ACTIVITY_TYPES = [
  'flashcard', 'quiz', 'matching', 'fill-blank', 'sequence', 
  'word-search', 'crossword', 'memory', 'drag-drop', 'true-false'
];

// GEPT 等級
const GEPT_LEVELS = ['elementary', 'intermediate', 'high-intermediate'] as const;

// 標籤池
const TAG_POOL = [
  'vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing',
  'gept', 'elementary', 'intermediate', 'advanced', 'beginner',
  'english', 'chinese', 'math', 'science', 'history', 'geography',
  'flashcard', 'quiz', 'game', 'interactive', 'multimedia',
  'memory', 'practice', 'test', 'review', 'study'
];

// 活動標題模板
const TITLE_TEMPLATES = [
  'GEPT {level} {subject} 練習',
  '{subject} 詞彙記憶遊戲',
  '互動式 {subject} 測驗',
  '{level} 級 {subject} 挑戰',
  '{subject} 配對遊戲',
  '快速 {subject} 複習',
  '{subject} 填空練習',
  '{level} {subject} 綜合測試',
  '{subject} 記憶卡片',
  '趣味 {subject} 問答'
];

// 學科列表
const SUBJECTS = [
  '英語', '數學', '科學', '歷史', '地理', '中文', '物理', '化學', '生物'
];

// 描述模板
const DESCRIPTION_TEMPLATES = [
  '這是一個專為 {level} 學習者設計的 {subject} 練習活動，包含豐富的互動元素。',
  '通過遊戲化的方式學習 {subject}，提高學習效果和記憶力。',
  '基於記憶科學原理設計的 {subject} 學習活動，適合 {level} 程度的學習者。',
  '互動式 {subject} 練習，結合視覺和聽覺元素，增強學習體驗。',
  '專業設計的 {subject} 測驗，幫助學習者檢測和提升學習成果。'
];

// 活動數據接口
export interface GeneratedActivity {
  id: string;
  title: string;
  description: string;
  type: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  size: number;
  isShared: boolean;
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  learningEffectiveness?: number;
  usageCount: number;
  tags: string[];
  thumbnail?: string;
}

export class ActivityDataGenerator {
  private static instance: ActivityDataGenerator;
  private generatedIds = new Set<string>();

  private constructor() {}

  static getInstance(): ActivityDataGenerator {
    if (!ActivityDataGenerator.instance) {
      ActivityDataGenerator.instance = new ActivityDataGenerator();
    }
    return ActivityDataGenerator.instance;
  }

  /**
   * 生成指定數量的活動數據
   */
  generateActivities(count: number, options?: {
    startDate?: Date;
    endDate?: Date;
    folderIds?: string[];
    includeShared?: boolean;
  }): GeneratedActivity[] {
    const activities: GeneratedActivity[] = [];
    const startDate = options?.startDate || new Date(2024, 0, 1);
    const endDate = options?.endDate || new Date();
    const folderIds = options?.folderIds || [];
    const includeShared = options?.includeShared ?? true;

    for (let i = 0; i < count; i++) {
      activities.push(this.generateSingleActivity(i, {
        startDate,
        endDate,
        folderIds,
        includeShared
      }));
    }

    return activities;
  }

  /**
   * 生成單個活動數據
   */
  private generateSingleActivity(index: number, options: {
    startDate: Date;
    endDate: Date;
    folderIds: string[];
    includeShared: boolean;
  }): GeneratedActivity {
    const id = this.generateUniqueId();
    const type = this.randomChoice(ACTIVITY_TYPES);
    const geptLevel = this.randomChoice(GEPT_LEVELS);
    const subject = this.randomChoice(SUBJECTS);
    const level = geptLevel === 'elementary' ? '初級' : 
                  geptLevel === 'intermediate' ? '中級' : '高級';

    // 生成標題
    const titleTemplate = this.randomChoice(TITLE_TEMPLATES);
    const title = titleTemplate
      .replace('{level}', level)
      .replace('{subject}', subject);

    // 生成描述
    const descTemplate = this.randomChoice(DESCRIPTION_TEMPLATES);
    const description = descTemplate
      .replace('{level}', level)
      .replace('{subject}', subject);

    // 生成時間
    const createdAt = this.randomDate(options.startDate, options.endDate);
    const updatedAt = this.randomDate(createdAt, options.endDate);
    const lastAccessedAt = Math.random() > 0.3 ? 
      this.randomDate(updatedAt, options.endDate) : undefined;

    // 生成標籤
    const tags = this.generateTags(type, geptLevel, subject);

    // 生成其他屬性
    const size = Math.floor(Math.random() * 500000) + 10000; // 10KB - 500KB
    const isShared = options.includeShared && Math.random() > 0.7;
    const learningEffectiveness = Math.random() * 0.4 + 0.6; // 60% - 100%
    const usageCount = Math.floor(Math.random() * 100);
    const folderId = options.folderIds.length > 0 && Math.random() > 0.5 ? 
      this.randomChoice(options.folderIds) : undefined;

    return {
      id,
      title,
      description,
      type,
      folderId,
      createdAt,
      updatedAt,
      lastAccessedAt,
      size,
      isShared,
      geptLevel,
      learningEffectiveness,
      usageCount,
      tags,
      thumbnail: this.generateThumbnail(type)
    };
  }

  /**
   * 生成唯一ID
   */
  private generateUniqueId(): string {
    let id: string;
    do {
      id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } while (this.generatedIds.has(id));
    
    this.generatedIds.add(id);
    return id;
  }

  /**
   * 從數組中隨機選擇一個元素
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 生成隨機日期
   */
  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /**
   * 生成標籤
   */
  private generateTags(type: string, geptLevel: string, subject: string): string[] {
    const tags = new Set<string>();
    
    // 必須包含的標籤
    tags.add(type);
    tags.add(geptLevel);
    
    // 根據學科添加相關標籤
    if (subject === '英語') {
      tags.add('english');
      tags.add('gept');
    }
    
    // 隨機添加其他標籤
    const additionalTagCount = Math.floor(Math.random() * 4) + 1;
    const availableTags = TAG_POOL.filter(tag => !tags.has(tag));
    
    for (let i = 0; i < additionalTagCount && availableTags.length > 0; i++) {
      const randomTag = this.randomChoice(availableTags);
      tags.add(randomTag);
      availableTags.splice(availableTags.indexOf(randomTag), 1);
    }
    
    return Array.from(tags);
  }

  /**
   * 生成縮圖URL
   */
  private generateThumbnail(type: string): string {
    const thumbnailMap: Record<string, string> = {
      'flashcard': '📚',
      'quiz': '❓',
      'matching': '🔗',
      'fill-blank': '📝',
      'sequence': '🔢',
      'word-search': '🔍',
      'crossword': '🧩',
      'memory': '🧠',
      'drag-drop': '🎯',
      'true-false': '✅'
    };

    // 這裡可以返回實際的縮圖URL，目前返回emoji作為佔位符
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="55" font-size="30" text-anchor="middle">${thumbnailMap[type] || '🎮'}</text></svg>`;
  }

  /**
   * 生成批量活動數據（分批生成，避免內存問題）
   */
  async generateLargeDataset(totalCount: number, batchSize: number = 1000): Promise<GeneratedActivity[]> {
    const activities: GeneratedActivity[] = [];
    const batches = Math.ceil(totalCount / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const currentBatchSize = Math.min(batchSize, totalCount - batch * batchSize);
      const batchActivities = this.generateActivities(currentBatchSize, {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(),
        folderIds: ['folder_1', 'folder_2', 'folder_3'],
        includeShared: true
      });

      activities.push(...batchActivities);

      // 模擬異步處理，避免阻塞UI
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return activities;
  }

  /**
   * 重置生成器狀態
   */
  reset(): void {
    this.generatedIds.clear();
  }

  /**
   * 獲取統計信息
   */
  getStats(): {
    generatedCount: number;
    availableTypes: string[];
    availableLevels: string[];
    availableTags: string[];
  } {
    return {
      generatedCount: this.generatedIds.size,
      availableTypes: [...ACTIVITY_TYPES],
      availableLevels: [...GEPT_LEVELS],
      availableTags: [...TAG_POOL]
    };
  }
}
