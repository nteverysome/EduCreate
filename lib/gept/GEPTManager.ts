/**
 * GEPTManager - GEPT分級和內容模板管理系統
 * 實現GEPT分級模板、內容驗證和錯誤檢查功能
 */

export type GEPTLevel = 'elementary' | 'intermediate' | 'high-intermediate';

export interface GEPTWord {
  word: string;
  level: GEPTLevel;
  partOfSpeech: string;
  definition: string;
  example: string;
  frequency: number; // 使用頻率 1-10
  difficulty: number; // 難度 1-10
}

export interface ContentTemplate {
  id: string;
  name: string;
  level: GEPTLevel;
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';
  description: string;
  template: string;
  variables: string[];
  examples: string[];
  createdAt: number;
  updatedAt: number;
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
  type: 'complexity' | 'vocabulary' | 'structure' | 'style';
  message: string;
  position?: { start: number; end: number };
  suggestion: string;
}

export interface GEPTStatistics {
  totalWords: number;
  levelDistribution: Record<GEPTLevel, number>;
  averageDifficulty: number;
  complexityScore: number;
  readabilityScore: number;
}

export class GEPTManager {
  private geptWords: Map<string, GEPTWord> = new Map();
  private templates: Map<string, ContentTemplate> = new Map();
  private validationRules: Map<GEPTLevel, ValidationRule[]> = new Map();

  // GEPT詞彙數據庫
  private readonly geptVocabulary: GEPTWord[] = [
    // 初級詞彙
    { word: 'hello', level: 'elementary', partOfSpeech: 'interjection', definition: '你好', example: 'Hello, how are you?', frequency: 10, difficulty: 1 },
    { word: 'good', level: 'elementary', partOfSpeech: 'adjective', definition: '好的', example: 'This is a good book.', frequency: 10, difficulty: 1 },
    { word: 'morning', level: 'elementary', partOfSpeech: 'noun', definition: '早晨', example: 'Good morning!', frequency: 9, difficulty: 1 },
    { word: 'school', level: 'elementary', partOfSpeech: 'noun', definition: '學校', example: 'I go to school every day.', frequency: 10, difficulty: 1 },
    { word: 'book', level: 'elementary', partOfSpeech: 'noun', definition: '書', example: 'I like reading books.', frequency: 10, difficulty: 1 },
    
    // 中級詞彙
    { word: 'important', level: 'intermediate', partOfSpeech: 'adjective', definition: '重要的', example: 'This is an important meeting.', frequency: 8, difficulty: 4 },
    { word: 'environment', level: 'intermediate', partOfSpeech: 'noun', definition: '環境', example: 'We need to protect the environment.', frequency: 7, difficulty: 5 },
    { word: 'technology', level: 'intermediate', partOfSpeech: 'noun', definition: '技術', example: 'Technology changes our lives.', frequency: 8, difficulty: 5 },
    { word: 'education', level: 'intermediate', partOfSpeech: 'noun', definition: '教育', example: 'Education is very important.', frequency: 8, difficulty: 4 },
    { word: 'experience', level: 'intermediate', partOfSpeech: 'noun', definition: '經驗', example: 'I have work experience.', frequency: 7, difficulty: 5 },
    
    // 中高級詞彙
    { word: 'sophisticated', level: 'high-intermediate', partOfSpeech: 'adjective', definition: '複雜的，精密的', example: 'This is a sophisticated system.', frequency: 4, difficulty: 8 },
    { word: 'phenomenon', level: 'high-intermediate', partOfSpeech: 'noun', definition: '現象', example: 'This is an interesting phenomenon.', frequency: 5, difficulty: 8 },
    { word: 'comprehensive', level: 'high-intermediate', partOfSpeech: 'adjective', definition: '全面的', example: 'We need a comprehensive plan.', frequency: 5, difficulty: 7 },
    { word: 'implementation', level: 'high-intermediate', partOfSpeech: 'noun', definition: '實施', example: 'The implementation was successful.', frequency: 4, difficulty: 8 },
    { word: 'methodology', level: 'high-intermediate', partOfSpeech: 'noun', definition: '方法論', example: 'We use a new methodology.', frequency: 3, difficulty: 9 }
  ];

  // 內容模板
  private readonly defaultTemplates: ContentTemplate[] = [
    {
      id: 'vocab-elementary-1',
      name: '初級詞彙練習',
      level: 'elementary',
      type: 'vocabulary',
      description: '基礎詞彙學習模板',
      template: '學習單字：{{word}}\n定義：{{definition}}\n例句：{{example}}\n練習：請用 "{{word}}" 造句。',
      variables: ['word', 'definition', 'example'],
      examples: ['學習單字：hello\n定義：你好\n例句：Hello, how are you?\n練習：請用 "hello" 造句。'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'grammar-intermediate-1',
      name: '中級語法練習',
      level: 'intermediate',
      type: 'grammar',
      description: '中級語法結構練習',
      template: '語法重點：{{grammar_point}}\n結構：{{structure}}\n例句：{{example}}\n練習：{{exercise}}',
      variables: ['grammar_point', 'structure', 'example', 'exercise'],
      examples: ['語法重點：現在完成式\n結構：have/has + past participle\n例句：I have finished my homework.\n練習：請用現在完成式造句。'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'reading-high-intermediate-1',
      name: '中高級閱讀理解',
      level: 'high-intermediate',
      type: 'reading',
      description: '中高級閱讀理解練習',
      template: '文章標題：{{title}}\n\n{{passage}}\n\n問題：\n{{questions}}\n\n詞彙提示：\n{{vocabulary_hints}}',
      variables: ['title', 'passage', 'questions', 'vocabulary_hints'],
      examples: ['文章標題：科技與教育\n\n科技在現代教育中扮演重要角色...\n\n問題：\n1. 科技如何改變教育？\n2. 文章中提到的主要優點是什麼？\n\n詞彙提示：\ntechnology - 技術\neducation - 教育'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];

  constructor() {
    this.initializeGEPTWords();
    this.initializeTemplates();
    this.initializeValidationRules();
  }

  /**
   * 初始化GEPT詞彙數據庫
   */
  private initializeGEPTWords(): void {
    this.geptVocabulary.forEach(word => {
      this.geptWords.set(word.word.toLowerCase(), word);
    });
  }

  /**
   * 初始化內容模板
   */
  private initializeTemplates(): void {
    this.defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * 初始化驗證規則
   */
  private initializeValidationRules(): void {
    // 初級驗證規則
    this.validationRules.set('elementary', [
      {
        type: 'vocabulary',
        check: (text: string) => this.checkVocabularyLevel(text, 'elementary'),
        message: '包含超出初級程度的詞彙'
      },
      {
        type: 'sentence_length',
        check: (text: string) => this.checkSentenceLength(text, 15),
        message: '句子過長，建議控制在15個單字以內'
      },
      {
        type: 'grammar_complexity',
        check: (text: string) => this.checkGrammarComplexity(text, 3),
        message: '語法結構過於複雜'
      }
    ]);

    // 中級驗證規則
    this.validationRules.set('intermediate', [
      {
        type: 'vocabulary',
        check: (text: string) => this.checkVocabularyLevel(text, 'intermediate'),
        message: '包含超出中級程度的詞彙'
      },
      {
        type: 'sentence_length',
        check: (text: string) => this.checkSentenceLength(text, 25),
        message: '句子過長，建議控制在25個單字以內'
      },
      {
        type: 'grammar_complexity',
        check: (text: string) => this.checkGrammarComplexity(text, 6),
        message: '語法結構過於複雜'
      }
    ]);

    // 中高級驗證規則
    this.validationRules.set('high-intermediate', [
      {
        type: 'vocabulary',
        check: (text: string) => this.checkVocabularyLevel(text, 'high-intermediate'),
        message: '包含超出中高級程度的詞彙'
      },
      {
        type: 'sentence_length',
        check: (text: string) => this.checkSentenceLength(text, 35),
        message: '句子過長，建議控制在35個單字以內'
      },
      {
        type: 'coherence',
        check: (text: string) => this.checkTextCoherence(text),
        message: '文章連貫性需要改善'
      }
    ]);
  }

  /**
   * 驗證內容
   */
  validateContent(text: string, targetLevel: GEPTLevel): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // 基本格式檢查
    const formatErrors = this.checkFormat(text);
    errors.push(...formatErrors);

    // 拼寫檢查
    const spellingErrors = this.checkSpelling(text);
    errors.push(...spellingErrors);

    // GEPT級別檢查
    const levelRules = this.validationRules.get(targetLevel) || [];
    levelRules.forEach(rule => {
      if (!rule.check(text)) {
        errors.push({
          type: 'gept-compliance',
          message: rule.message,
          severity: 'warning'
        });
      }
    });

    // 詞彙分析
    const vocabAnalysis = this.analyzeVocabulary(text);
    if (vocabAnalysis.overLevelWords.length > 0) {
      warnings.push({
        type: 'vocabulary',
        message: `發現超出${targetLevel}程度的詞彙: ${vocabAnalysis.overLevelWords.join(', ')}`,
        suggestion: '建議使用更簡單的同義詞'
      });
    }

    // 複雜度分析
    const complexity = this.calculateComplexity(text);
    if (complexity > this.getMaxComplexity(targetLevel)) {
      warnings.push({
        type: 'complexity',
        message: '內容複雜度過高',
        suggestion: '建議簡化句子結構和詞彙選擇'
      });
    }

    // GEPT合規性評分
    const geptCompliance = this.calculateGEPTCompliance(text, targetLevel);

    // 生成建議
    if (geptCompliance.score < 80) {
      suggestions.push('建議調整詞彙選擇以符合GEPT程度');
    }
    if (complexity > 7) {
      suggestions.push('建議簡化句子結構');
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      suggestions,
      geptCompliance
    };
  }

  /**
   * 獲取模板
   */
  getTemplate(id: string): ContentTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * 獲取指定級別的模板
   */
  getTemplatesByLevel(level: GEPTLevel): ContentTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.level === level);
  }

  /**
   * 獲取指定類型的模板
   */
  getTemplatesByType(type: ContentTemplate['type']): ContentTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.type === type);
  }

  /**
   * 創建新模板
   */
  createTemplate(template: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newTemplate: ContentTemplate = {
      ...template,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.templates.set(id, newTemplate);
    return id;
  }

  /**
   * 更新模板
   */
  updateTemplate(id: string, updates: Partial<ContentTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: Date.now()
    };

    this.templates.set(id, updatedTemplate);
    return true;
  }

  /**
   * 刪除模板
   */
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * 應用模板
   */
  applyTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    let result = template.template;
    
    // 替換變量
    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`;
      result = result.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    return result;
  }

  /**
   * 獲取GEPT詞彙
   */
  getGEPTWord(word: string): GEPTWord | undefined {
    return this.geptWords.get(word.toLowerCase());
  }

  /**
   * 搜索GEPT詞彙
   */
  searchGEPTWords(query: string, level?: GEPTLevel): GEPTWord[] {
    const results: GEPTWord[] = [];
    const queryLower = query.toLowerCase();

    this.geptWords.forEach(word => {
      if (level && word.level !== level) return;
      
      if (word.word.toLowerCase().includes(queryLower) ||
          word.definition.includes(query) ||
          word.example.toLowerCase().includes(queryLower)) {
        results.push(word);
      }
    });

    return results.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * 分析文本統計
   */
  analyzeText(text: string): GEPTStatistics {
    const words = this.extractWords(text);
    const geptWords = words.map(word => this.geptWords.get(word.toLowerCase())).filter(Boolean) as GEPTWord[];
    
    const levelDistribution: Record<GEPTLevel, number> = {
      'elementary': 0,
      'intermediate': 0,
      'high-intermediate': 0
    };

    let totalDifficulty = 0;
    
    geptWords.forEach(word => {
      levelDistribution[word.level]++;
      totalDifficulty += word.difficulty;
    });

    const averageDifficulty = geptWords.length > 0 ? totalDifficulty / geptWords.length : 0;
    const complexityScore = this.calculateComplexity(text);
    const readabilityScore = this.calculateReadability(text);

    return {
      totalWords: words.length,
      levelDistribution,
      averageDifficulty,
      complexityScore,
      readabilityScore
    };
  }

  /**
   * 檢查格式
   */
  private checkFormat(text: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // 檢查空內容
    if (!text.trim()) {
      errors.push({
        type: 'format',
        message: '內容不能為空',
        severity: 'error'
      });
    }

    // 檢查過長內容
    if (text.length > 10000) {
      errors.push({
        type: 'format',
        message: '內容過長，建議控制在10000字符以內',
        severity: 'warning'
      });
    }

    return errors;
  }

  /**
   * 檢查拼寫
   */
  private checkSpelling(text: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const words = this.extractWords(text);
    
    // 簡單的拼寫檢查（實際應用中可以使用更完善的拼寫檢查庫）
    const commonMisspellings = new Map([
      ['recieve', 'receive'],
      ['seperate', 'separate'],
      ['definately', 'definitely'],
      ['occured', 'occurred']
    ]);

    words.forEach(word => {
      const correction = commonMisspellings.get(word.toLowerCase());
      if (correction) {
        errors.push({
          type: 'spelling',
          message: `拼寫錯誤: "${word}"`,
          severity: 'error',
          suggestion: `建議改為: "${correction}"`
        });
      }
    });

    return errors;
  }

  /**
   * 檢查詞彙級別
   */
  private checkVocabularyLevel(text: string, targetLevel: GEPTLevel): boolean {
    const words = this.extractWords(text);
    const levelOrder: GEPTLevel[] = ['elementary', 'intermediate', 'high-intermediate'];
    const targetIndex = levelOrder.indexOf(targetLevel);
    
    for (const word of words) {
      const geptWord = this.geptWords.get(word.toLowerCase());
      if (geptWord) {
        const wordIndex = levelOrder.indexOf(geptWord.level);
        if (wordIndex > targetIndex) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * 檢查句子長度
   */
  private checkSentenceLength(text: string, maxLength: number): boolean {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    for (const sentence of sentences) {
      const words = this.extractWords(sentence);
      if (words.length > maxLength) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 檢查語法複雜度
   */
  private checkGrammarComplexity(text: string, maxComplexity: number): boolean {
    const complexity = this.calculateComplexity(text);
    return complexity <= maxComplexity;
  }

  /**
   * 檢查文本連貫性
   */
  private checkTextCoherence(text: string): boolean {
    // 簡化的連貫性檢查
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // 檢查連接詞的使用
    const connectors = ['however', 'therefore', 'moreover', 'furthermore', 'nevertheless'];
    let connectorCount = 0;
    
    sentences.forEach(sentence => {
      connectors.forEach(connector => {
        if (sentence.toLowerCase().includes(connector)) {
          connectorCount++;
        }
      });
    });
    
    // 如果句子數量超過3句但沒有連接詞，認為連貫性不足
    return sentences.length <= 3 || connectorCount > 0;
  }

  /**
   * 分析詞彙
   */
  private analyzeVocabulary(text: string): { overLevelWords: string[]; totalWords: number } {
    const words = this.extractWords(text);
    const overLevelWords: string[] = [];
    
    // 這裡簡化處理，實際應用中需要更複雜的邏輯
    words.forEach(word => {
      const geptWord = this.geptWords.get(word.toLowerCase());
      if (geptWord && geptWord.difficulty > 7) {
        overLevelWords.push(word);
      }
    });
    
    return { overLevelWords, totalWords: words.length };
  }

  /**
   * 計算複雜度
   */
  private calculateComplexity(text: string): number {
    const words = this.extractWords(text);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // 平均句子長度
    const avgSentenceLength = words.length / sentences.length;
    
    // 詞彙複雜度
    let totalDifficulty = 0;
    let geptWordCount = 0;
    
    words.forEach(word => {
      const geptWord = this.geptWords.get(word.toLowerCase());
      if (geptWord) {
        totalDifficulty += geptWord.difficulty;
        geptWordCount++;
      }
    });
    
    const avgWordDifficulty = geptWordCount > 0 ? totalDifficulty / geptWordCount : 5;
    
    // 綜合複雜度評分 (1-10)
    return Math.min(10, (avgSentenceLength / 5 + avgWordDifficulty) / 2);
  }

  /**
   * 計算可讀性
   */
  private calculateReadability(text: string): number {
    const words = this.extractWords(text);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // 簡化的可讀性計算（類似Flesch Reading Ease）
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length;
    
    // 可讀性評分 (0-100，越高越容易讀)
    return Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllables));
  }

  /**
   * 計算GEPT合規性
   */
  private calculateGEPTCompliance(text: string, targetLevel: GEPTLevel): { level: GEPTLevel; score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;
    
    // 詞彙檢查
    const vocabAnalysis = this.analyzeVocabulary(text);
    if (vocabAnalysis.overLevelWords.length > 0) {
      score -= vocabAnalysis.overLevelWords.length * 10;
      issues.push(`包含${vocabAnalysis.overLevelWords.length}個超出程度的詞彙`);
    }
    
    // 複雜度檢查
    const complexity = this.calculateComplexity(text);
    const maxComplexity = this.getMaxComplexity(targetLevel);
    if (complexity > maxComplexity) {
      score -= (complexity - maxComplexity) * 10;
      issues.push('內容複雜度過高');
    }
    
    return {
      level: targetLevel,
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * 獲取最大複雜度
   */
  private getMaxComplexity(level: GEPTLevel): number {
    switch (level) {
      case 'elementary': return 3;
      case 'intermediate': return 6;
      case 'high-intermediate': return 9;
      default: return 5;
    }
  }

  /**
   * 提取單詞
   */
  private extractWords(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * 計算音節數
   */
  private countSyllables(word: string): number {
    // 簡化的音節計算
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i].toLowerCase());
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // 處理silent e
    if (word.endsWith('e') && count > 1) {
      count--;
    }
    
    return Math.max(1, count);
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 獲取所有模板
   */
  getAllTemplates(): ContentTemplate[] {
    return Array.from(this.templates.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * 獲取所有GEPT詞彙
   */
  getAllGEPTWords(): GEPTWord[] {
    return Array.from(this.geptWords.values()).sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * 獲取級別名稱
   */
  getLevelName(level: GEPTLevel): string {
    switch (level) {
      case 'elementary': return '初級';
      case 'intermediate': return '中級';
      case 'high-intermediate': return '中高級';
      default: return '未知';
    }
  }

  /**
   * 獲取類型名稱
   */
  getTypeName(type: ContentTemplate['type']): string {
    switch (type) {
      case 'vocabulary': return '詞彙';
      case 'grammar': return '語法';
      case 'reading': return '閱讀';
      case 'listening': return '聽力';
      case 'writing': return '寫作';
      case 'speaking': return '口說';
      default: return '未知';
    }
  }
}

// 驗證規則接口
interface ValidationRule {
  type: string;
  check: (text: string) => boolean;
  message: string;
}
