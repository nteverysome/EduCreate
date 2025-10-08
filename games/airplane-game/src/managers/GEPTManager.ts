/**
 * GEPTManager - GEPT分級和內容模板管理系統
 * 遷移到 Vite + Phaser 3 專案
 */

export type GEPTLevel = 'elementary' | 'intermediate' | 'high-intermediate';

export interface GEPTWord {
  id: string;
  english: string;
  chinese: string;
  level: GEPTLevel;
  frequency: number; // 使用頻率 1-100
  difficulty?: number; // 難度 1-10
  partOfSpeech?: string;
  pronunciation?: string;
  category?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  geptCompliance: {
    level: GEPTLevel;
    score: number; // 0-100
    issues: string[];
  };
}

export interface ValidationError {
  type: 'grammar' | 'spelling' | 'format' | 'gept-compliance';
  message: string;
  position?: { start: number; end: number };
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface ValidationWarning {
  type: 'complexity' | 'vocabulary' | 'structure';
  message: string;
  suggestion: string;
}

/**
 * GEPT 管理器類
 */
export class GEPTManager {
  private wordDatabase: Map<GEPTLevel, GEPTWord[]> = new Map();
  private currentLevel: GEPTLevel = 'elementary';

  constructor() {
    this.initializeWordDatabase();
  }

  /**
   * 初始化詞彙數據庫
   */
  private initializeWordDatabase(): void {
    // Elementary 級別詞彙
    const elementaryWords: GEPTWord[] = [
      { id: '1', english: 'hello', chinese: '你好', level: 'elementary', frequency: 100 },
      { id: '2', english: 'world', chinese: '世界', level: 'elementary', frequency: 95 },
      { id: '3', english: 'book', chinese: '書', level: 'elementary', frequency: 90 },
      { id: '4', english: 'school', chinese: '學校', level: 'elementary', frequency: 85 },
      { id: '5', english: 'friend', chinese: '朋友', level: 'elementary', frequency: 80 },
      { id: '6', english: 'family', chinese: '家庭', level: 'elementary', frequency: 85 },
      { id: '7', english: 'house', chinese: '房子', level: 'elementary', frequency: 82 },
      { id: '8', english: 'water', chinese: '水', level: 'elementary', frequency: 88 },
      { id: '9', english: 'food', chinese: '食物', level: 'elementary', frequency: 86 },
      { id: '10', english: 'time', chinese: '時間', level: 'elementary', frequency: 92 }
    ];

    // Intermediate 級別詞彙
    const intermediateWords: GEPTWord[] = [
      { id: '11', english: 'environment', chinese: '環境', level: 'intermediate', frequency: 75 },
      { id: '12', english: 'technology', chinese: '技術', level: 'intermediate', frequency: 78 },
      { id: '13', english: 'education', chinese: '教育', level: 'intermediate', frequency: 80 },
      { id: '14', english: 'government', chinese: '政府', level: 'intermediate', frequency: 72 },
      { id: '15', english: 'economy', chinese: '經濟', level: 'intermediate', frequency: 70 }
    ];

    // High-Intermediate 級別詞彙
    const highIntermediateWords: GEPTWord[] = [
      { id: '16', english: 'sophisticated', chinese: '複雜的', level: 'high-intermediate', frequency: 60 },
      { id: '17', english: 'phenomenon', chinese: '現象', level: 'high-intermediate', frequency: 58 },
      { id: '18', english: 'hypothesis', chinese: '假設', level: 'high-intermediate', frequency: 55 },
      { id: '19', english: 'methodology', chinese: '方法論', level: 'high-intermediate', frequency: 52 },
      { id: '20', english: 'comprehensive', chinese: '全面的', level: 'high-intermediate', frequency: 65 }
    ];

    this.wordDatabase.set('elementary', elementaryWords);
    this.wordDatabase.set('intermediate', intermediateWords);
    this.wordDatabase.set('high-intermediate', highIntermediateWords);

    console.log('📚 GEPT 詞彙數據庫初始化完成');
  }

  /**
   * 設置當前 GEPT 等級
   */
  setLevel(level: GEPTLevel): void {
    this.currentLevel = level;
    console.log(`📊 設置 GEPT 等級: ${level}`);
  }

  /**
   * 獲取當前等級
   */
  getCurrentLevel(): GEPTLevel {
    return this.currentLevel;
  }

  /**
   * 獲取指定等級的詞彙
   */
  getWordsForLevel(level: GEPTLevel): GEPTWord[] {
    return this.wordDatabase.get(level) || [];
  }

  /**
   * 獲取當前等級的詞彙
   */
  getCurrentLevelWords(): GEPTWord[] {
    return this.getWordsForLevel(this.currentLevel);
  }

  /**
   * 獲取隨機詞彙
   */
  getRandomWord(level?: GEPTLevel): GEPTWord | null {
    // 首先嘗試從 VocabularyIntegrationService 獲取詞彙
    const customVocabulary = this.getCustomVocabulary();
    if (customVocabulary.length > 0) {
      console.log('🎯 使用自定義詞彙:', customVocabulary.length, '個詞彙');
      return customVocabulary[Math.floor(Math.random() * customVocabulary.length)];
    }

    // 如果沒有自定義詞彙，使用預設詞彙
    const targetLevel = level || this.currentLevel;
    const words = this.getWordsForLevel(targetLevel);

    if (words.length === 0) {
      console.warn(`⚠️ 沒有找到 ${targetLevel} 等級的詞彙`);
      return null;
    }

    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }

  /**
   * 從 VocabularyIntegrationService 獲取自定義詞彙
   */
  private getCustomVocabulary(): GEPTWord[] {
    try {
      const vocabularyData = localStorage.getItem('vocabulary_integration_data');
      if (!vocabularyData) return [];

      const parsed = JSON.parse(vocabularyData);
      if (!parsed.vocabulary || !Array.isArray(parsed.vocabulary)) return [];

      // 轉換為 GEPTWord 格式
      return parsed.vocabulary.map((item: any, index: number) => ({
        id: (index + 1000).toString(), // 使用高 ID 避免衝突
        english: item.english,
        chinese: item.chinese,
        level: item.level || 'elementary',
        frequency: item.frequency || 80,
        difficulty: item.difficulty || 3,
        partOfSpeech: item.partOfSpeech || 'noun',
        category: item.category || 'custom'
      }));
    } catch (error) {
      console.warn('⚠️ 無法讀取自定義詞彙:', error);
      return [];
    }
  }

  /**
   * 獲取多個隨機詞彙
   */
  getRandomWords(count: number, level?: GEPTLevel): GEPTWord[] {
    // 首先嘗試從自定義詞彙獲取
    const customVocabulary = this.getCustomVocabulary();
    if (customVocabulary.length > 0) {
      console.log('🎯 使用自定義詞彙獲取多個詞彙:', customVocabulary.length, '個可用');
      const shuffled = [...customVocabulary].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, customVocabulary.length));
    }

    // 如果沒有自定義詞彙，使用預設詞彙
    const targetLevel = level || this.currentLevel;
    const words = this.getWordsForLevel(targetLevel);

    if (words.length === 0) return [];

    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, words.length));
  }

  /**
   * 根據 ID 查找詞彙
   */
  findWordById(id: string): GEPTWord | null {
    for (const [level, words] of this.wordDatabase) {
      const word = words.find(w => w.id === id);
      if (word) return word;
    }
    return null;
  }

  /**
   * 根據英文單字查找詞彙
   */
  findWordByEnglish(english: string): GEPTWord | null {
    for (const [level, words] of this.wordDatabase) {
      const word = words.find(w => w.english.toLowerCase() === english.toLowerCase());
      if (word) return word;
    }
    return null;
  }

  /**
   * 驗證詞彙是否符合 GEPT 標準
   */
  validateWord(word: string, level: GEPTLevel): ValidationResult {
    const foundWord = this.findWordByEnglish(word);
    
    if (!foundWord) {
      return {
        isValid: false,
        errors: [{
          type: 'gept-compliance',
          message: `詞彙 "${word}" 不在 GEPT ${level} 詞彙表中`,
          severity: 'error',
          suggestion: '請使用 GEPT 標準詞彙'
        }],
        warnings: [],
        suggestions: [],
        geptCompliance: {
          level,
          score: 0,
          issues: [`詞彙 "${word}" 未找到`]
        }
      };
    }

    const isCorrectLevel = foundWord.level === level;
    
    return {
      isValid: isCorrectLevel,
      errors: isCorrectLevel ? [] : [{
        type: 'gept-compliance',
        message: `詞彙 "${word}" 屬於 ${foundWord.level} 等級，不符合 ${level} 等級要求`,
        severity: 'warning',
        suggestion: `建議使用 ${level} 等級詞彙`
      }],
      warnings: [],
      suggestions: [],
      geptCompliance: {
        level: foundWord.level,
        score: isCorrectLevel ? 100 : 50,
        issues: isCorrectLevel ? [] : [`等級不匹配: ${foundWord.level} vs ${level}`]
      }
    };
  }

  /**
   * 獲取詞彙統計信息
   */
  getStatistics(): { [key in GEPTLevel]: number } {
    return {
      elementary: this.wordDatabase.get('elementary')?.length || 0,
      intermediate: this.wordDatabase.get('intermediate')?.length || 0,
      'high-intermediate': this.wordDatabase.get('high-intermediate')?.length || 0
    };
  }

  /**
   * 添加新詞彙
   */
  addWord(word: GEPTWord): boolean {
    const words = this.wordDatabase.get(word.level);
    if (!words) return false;

    // 檢查是否已存在
    const exists = words.some(w => w.english.toLowerCase() === word.english.toLowerCase());
    if (exists) {
      console.warn(`⚠️ 詞彙 "${word.english}" 已存在`);
      return false;
    }

    words.push(word);
    console.log(`✅ 添加詞彙: ${word.english} (${word.level})`);
    return true;
  }
}
