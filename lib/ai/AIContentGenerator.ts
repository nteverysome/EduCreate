/**
 * AIContentGenerator - AI輔助內容生成系統
 * 基於記憶科學原理實現AI內容生成，包含翻譯、本地化和多語言支持
 */

export type Language = 'zh-TW' | 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'es-ES' | 'fr-FR' | 'de-DE';
export type ContentType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking' | 'quiz' | 'exercise';
export type DifficultyLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';
export type MemoryTechnique = 'spaced-repetition' | 'active-recall' | 'elaborative-rehearsal' | 'mnemonics' | 'chunking' | 'interleaving';

export interface AIGenerationRequest {
  type: ContentType;
  topic: string;
  language: Language;
  targetLanguage?: Language;
  difficulty: DifficultyLevel;
  memoryTechniques: MemoryTechnique[];
  wordCount?: number;
  keywords?: string[];
  context?: string;
  learnerProfile?: LearnerProfile;
  customInstructions?: string;
}

export interface LearnerProfile {
  id: string;
  name: string;
  nativeLanguage: Language;
  targetLanguages: Language[];
  currentLevel: DifficultyLevel;
  learningGoals: string[];
  strengths: string[];
  weaknesses: string[];
  preferredMemoryTechniques: MemoryTechnique[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  attentionSpan: number; // 分鐘
  sessionFrequency: number; // 每週次數
  lastActivity: number;
}

export interface GeneratedContent {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  language: Language;
  difficulty: DifficultyLevel;
  memoryTechniques: MemoryTechnique[];
  metadata: {
    wordCount: number;
    readingTime: number; // 分鐘
    keywords: string[];
    topics: string[];
    cognitiveLoad: number; // 1-10
    memoryEffectiveness: number; // 1-10
  };
  exercises: Exercise[];
  translations?: Record<Language, string>;
  audioUrl?: string;
  createdAt: number;
  generatedBy: 'ai' | 'human' | 'hybrid';
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'ordering' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  memoryTechnique: MemoryTechnique;
  difficulty: DifficultyLevel;
  estimatedTime: number; // 秒
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  context?: string;
  preserveFormatting?: boolean;
  culturalAdaptation?: boolean;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  confidence: number; // 0-1
  alternatives: string[];
  culturalNotes?: string[];
  timestamp: number;
}

export interface PersonalizationSuggestion {
  type: 'content-adjustment' | 'difficulty-change' | 'technique-recommendation' | 'schedule-optimization';
  title: string;
  description: string;
  reasoning: string;
  implementation: string;
  expectedBenefit: string;
  priority: 'low' | 'medium' | 'high';
}

export class AIContentGenerator {
  private apiKey: string;
  private baseUrl: string;
  private memoryPrinciples: Map<MemoryTechnique, MemoryPrinciple> = new Map();
  private languageModels: Map<Language, LanguageModel> = new Map();
  private generationHistory: GeneratedContent[] = [];
  private learnerProfiles: Map<string, LearnerProfile> = new Map();

  constructor(apiKey: string = '', baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = baseUrl;
    this.initializeMemoryPrinciples();
    this.initializeLanguageModels();
  }

  /**
   * 初始化記憶科學原理
   */
  private initializeMemoryPrinciples(): void {
    this.memoryPrinciples.set('spaced-repetition', {
      name: '間隔重複',
      description: '根據遺忘曲線安排複習時間',
      intervals: [1, 3, 7, 14, 30, 90], // 天數
      effectiveness: 0.9,
      cognitiveLoad: 0.3
    });

    this.memoryPrinciples.set('active-recall', {
      name: '主動回憶',
      description: '通過測試和問答強化記憶',
      intervals: [0.5, 1, 2, 4, 8], // 小時
      effectiveness: 0.85,
      cognitiveLoad: 0.7
    });

    this.memoryPrinciples.set('elaborative-rehearsal', {
      name: '精緻化複述',
      description: '將新信息與已知知識建立聯繫',
      intervals: [1, 2, 5, 10, 20], // 分鐘
      effectiveness: 0.8,
      cognitiveLoad: 0.6
    });

    this.memoryPrinciples.set('mnemonics', {
      name: '記憶術',
      description: '使用記憶技巧和聯想',
      intervals: [5, 15, 30, 60, 120], // 分鐘
      effectiveness: 0.75,
      cognitiveLoad: 0.5
    });

    this.memoryPrinciples.set('chunking', {
      name: '組塊化',
      description: '將信息分組為有意義的單位',
      intervals: [2, 5, 10, 20, 40], // 分鐘
      effectiveness: 0.7,
      cognitiveLoad: 0.4
    });

    this.memoryPrinciples.set('interleaving', {
      name: '交錯練習',
      description: '混合不同類型的練習',
      intervals: [10, 20, 40, 80, 160], // 分鐘
      effectiveness: 0.8,
      cognitiveLoad: 0.8
    });
  }

  /**
   * 初始化語言模型
   */
  private initializeLanguageModels(): void {
    this.languageModels.set('zh-TW', {
      name: '繁體中文',
      code: 'zh-TW',
      direction: 'ltr',
      family: 'sino-tibetan',
      complexity: 0.9,
      supportedFeatures: ['traditional-characters', 'tone-marks', 'cultural-context']
    });

    this.languageModels.set('zh-CN', {
      name: '簡體中文',
      code: 'zh-CN',
      direction: 'ltr',
      family: 'sino-tibetan',
      complexity: 0.85,
      supportedFeatures: ['simplified-characters', 'pinyin', 'cultural-context']
    });

    this.languageModels.set('en-US', {
      name: 'English (US)',
      code: 'en-US',
      direction: 'ltr',
      family: 'indo-european',
      complexity: 0.6,
      supportedFeatures: ['phonetics', 'grammar-patterns', 'idioms']
    });

    this.languageModels.set('ja-JP', {
      name: '日本語',
      code: 'ja-JP',
      direction: 'ltr',
      family: 'japonic',
      complexity: 0.95,
      supportedFeatures: ['hiragana', 'katakana', 'kanji', 'honorifics']
    });

    this.languageModels.set('ko-KR', {
      name: '한국어',
      code: 'ko-KR',
      direction: 'ltr',
      family: 'koreanic',
      complexity: 0.8,
      supportedFeatures: ['hangul', 'honorifics', 'grammar-particles']
    });
  }

  /**
   * 生成AI內容
   */
  async generateContent(request: AIGenerationRequest): Promise<GeneratedContent> {
    try {
      // 構建提示詞
      const prompt = this.buildPrompt(request);
      
      // 調用AI API（模擬）
      const aiResponse = await this.callAIAPI(prompt, request);
      
      // 處理響應
      const content = this.processAIResponse(aiResponse, request);
      
      // 應用記憶科學原理
      const enhancedContent = this.applyMemoryPrinciples(content, request);
      
      // 生成練習
      const exercises = await this.generateExercises(enhancedContent, request);
      
      // 創建最終內容
      const generatedContent: GeneratedContent = {
        id: this.generateId(),
        type: request.type,
        title: this.generateTitle(request),
        content: enhancedContent,
        language: request.language,
        difficulty: request.difficulty,
        memoryTechniques: request.memoryTechniques,
        metadata: {
          wordCount: this.countWords(enhancedContent),
          readingTime: this.calculateReadingTime(enhancedContent),
          keywords: request.keywords || [],
          topics: [request.topic],
          cognitiveLoad: this.calculateCognitiveLoad(request),
          memoryEffectiveness: this.calculateMemoryEffectiveness(request)
        },
        exercises,
        createdAt: Date.now(),
        generatedBy: 'ai'
      };

      // 如果需要翻譯
      if (request.targetLanguage && request.targetLanguage !== request.language) {
        generatedContent.translations = await this.translateContent(
          enhancedContent,
          request.language,
          [request.targetLanguage]
        );
      }

      // 保存到歷史
      this.generationHistory.push(generatedContent);

      return generatedContent;
    } catch (error) {
      console.error('AI內容生成失敗:', error);
      throw new Error('AI內容生成失敗');
    }
  }

  /**
   * 翻譯內容
   */
  async translateText(request: TranslationRequest): Promise<TranslationResult> {
    try {
      // 構建翻譯提示詞
      const prompt = this.buildTranslationPrompt(request);
      
      // 調用翻譯API（模擬）
      const translationResponse = await this.callTranslationAPI(prompt, request);
      
      return {
        originalText: request.text,
        translatedText: translationResponse.translation,
        sourceLanguage: request.sourceLanguage,
        targetLanguage: request.targetLanguage,
        confidence: translationResponse.confidence,
        alternatives: translationResponse.alternatives || [],
        culturalNotes: translationResponse.culturalNotes,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('翻譯失敗:', error);
      throw new Error('翻譯失敗');
    }
  }

  /**
   * 生成個性化建議
   */
  generatePersonalizationSuggestions(learnerId: string): PersonalizationSuggestion[] {
    const profile = this.learnerProfiles.get(learnerId);
    if (!profile) {
      return [];
    }

    const suggestions: PersonalizationSuggestion[] = [];

    // 基於學習風格的建議
    if (profile.learningStyle === 'visual') {
      suggestions.push({
        type: 'content-adjustment',
        title: '增加視覺元素',
        description: '為您的學習內容添加更多圖片、圖表和視覺輔助',
        reasoning: '您的學習風格偏向視覺型，視覺元素能提高學習效果',
        implementation: '在內容中加入相關圖片、思維導圖和圖表',
        expectedBenefit: '提高記憶保持率20-30%',
        priority: 'high'
      });
    }

    // 基於弱點的建議
    if (profile.weaknesses.includes('grammar')) {
      suggestions.push({
        type: 'technique-recommendation',
        title: '語法強化練習',
        description: '建議增加語法相關的主動回憶練習',
        reasoning: '語法是您的薄弱環節，需要針對性強化',
        implementation: '每日進行15分鐘語法專項練習',
        expectedBenefit: '語法準確率提升15-25%',
        priority: 'high'
      });
    }

    // 基於注意力持續時間的建議
    if (profile.attentionSpan < 20) {
      suggestions.push({
        type: 'schedule-optimization',
        title: '短時間高頻學習',
        description: '建議採用短時間、高頻率的學習模式',
        reasoning: '您的注意力持續時間較短，短時間學習更有效',
        implementation: '將學習時間分割為10-15分鐘的小段',
        expectedBenefit: '學習效率提升25-35%',
        priority: 'medium'
      });
    }

    return suggestions;
  }

  /**
   * 構建提示詞
   */
  private buildPrompt(request: AIGenerationRequest): string {
    const memoryTechniquesDesc = request.memoryTechniques
      .map(tech => this.memoryPrinciples.get(tech)?.name)
      .join('、');

    return `
請基於記憶科學原理生成${this.getLanguageName(request.language)}學習內容。

要求：
- 內容類型：${this.getContentTypeName(request.type)}
- 主題：${request.topic}
- 難度級別：${this.getDifficultyName(request.difficulty)}
- 記憶技巧：${memoryTechniquesDesc}
- 字數：${request.wordCount || '適中'}
- 關鍵詞：${request.keywords?.join('、') || '無特定要求'}

學習者背景：
${request.learnerProfile ? this.formatLearnerProfile(request.learnerProfile) : '一般學習者'}

請確保內容：
1. 符合指定的難度級別
2. 有效運用指定的記憶技巧
3. 結構清晰，易於理解
4. 包含適當的例子和練習
5. 考慮認知負荷，避免信息過載

${request.customInstructions ? `額外要求：${request.customInstructions}` : ''}
`;
  }

  /**
   * 構建翻譯提示詞
   */
  private buildTranslationPrompt(request: TranslationRequest): string {
    return `
請將以下${this.getLanguageName(request.sourceLanguage)}文本翻譯為${this.getLanguageName(request.targetLanguage)}：

原文：
${request.text}

要求：
1. 保持原文的語調和風格
2. 確保翻譯的準確性和流暢性
3. ${request.preserveFormatting ? '保持原有格式' : '可適當調整格式'}
4. ${request.culturalAdaptation ? '進行文化適應性調整' : '直譯為主'}
5. 如有歧義，提供多個翻譯選項

${request.context ? `上下文：${request.context}` : ''}
`;
  }

  /**
   * 調用AI API（模擬）
   */
  private async callAIAPI(prompt: string, request: AIGenerationRequest): Promise<any> {
    // 模擬API調用延遲
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // 模擬AI響應
    return {
      content: this.generateMockContent(request),
      confidence: 0.85 + Math.random() * 0.1,
      tokens_used: 150 + Math.random() * 100
    };
  }

  /**
   * 調用翻譯API（模擬）
   */
  private async callTranslationAPI(prompt: string, request: TranslationRequest): Promise<any> {
    // 模擬API調用延遲
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // 模擬翻譯響應
    return {
      translation: this.generateMockTranslation(request),
      confidence: 0.9 + Math.random() * 0.05,
      alternatives: this.generateMockAlternatives(request),
      culturalNotes: request.culturalAdaptation ? ['注意文化差異'] : undefined
    };
  }

  /**
   * 生成模擬內容
   */
  private generateMockContent(request: AIGenerationRequest): string {
    const templates = {
      vocabulary: `學習主題：${request.topic}\n\n本課程將幫助您掌握與${request.topic}相關的重要詞彙。通過系統性的學習和練習，您將能夠：\n\n1. 理解核心概念\n2. 掌握關鍵詞彙\n3. 運用到實際情境中\n\n讓我們開始學習吧！`,
      grammar: `語法重點：${request.topic}\n\n本節課將深入探討${request.topic}的語法規則。我們將通過例句、練習和實際應用來幫助您：\n\n1. 理解語法結構\n2. 掌握使用規則\n3. 避免常見錯誤\n\n準備好開始語法學習之旅了嗎？`,
      reading: `閱讀理解：${request.topic}\n\n通過精心設計的閱讀材料，您將提升：\n\n1. 閱讀理解能力\n2. 詞彙量\n3. 語言感知力\n\n讓我們一起探索${request.topic}的世界！`,
      quiz: `測驗：${request.topic}\n\n這個測驗將幫助您檢驗對${request.topic}的掌握程度。通過多樣化的題型，您可以：\n\n1. 自我評估\n2. 發現薄弱環節\n3. 強化記憶\n\n準備接受挑戰了嗎？`
    };

    return templates[request.type] || `關於${request.topic}的學習內容正在為您精心準備...`;
  }

  /**
   * 生成模擬翻譯
   */
  private generateMockTranslation(request: TranslationRequest): string {
    // 簡化的翻譯邏輯
    if (request.sourceLanguage === 'zh-TW' && request.targetLanguage === 'en-US') {
      return `[English translation of: ${request.text}]`;
    } else if (request.sourceLanguage === 'en-US' && request.targetLanguage === 'zh-TW') {
      return `[中文翻譯：${request.text}]`;
    }
    return `[Translation from ${request.sourceLanguage} to ${request.targetLanguage}: ${request.text}]`;
  }

  /**
   * 生成模擬替代翻譯
   */
  private generateMockAlternatives(request: TranslationRequest): string[] {
    return [
      `[Alternative 1: ${request.text}]`,
      `[Alternative 2: ${request.text}]`
    ];
  }

  /**
   * 處理AI響應
   */
  private processAIResponse(response: any, request: AIGenerationRequest): string {
    return response.content;
  }

  /**
   * 應用記憶科學原理
   */
  private applyMemoryPrinciples(content: string, request: AIGenerationRequest): string {
    let enhancedContent = content;

    // 應用間隔重複
    if (request.memoryTechniques.includes('spaced-repetition')) {
      enhancedContent += '\n\n📅 複習提醒：建議在1天、3天、7天後複習此內容。';
    }

    // 應用主動回憶
    if (request.memoryTechniques.includes('active-recall')) {
      enhancedContent += '\n\n🧠 主動回憶：請嘗試不看內容，回憶剛才學到的重點。';
    }

    // 應用組塊化
    if (request.memoryTechniques.includes('chunking')) {
      enhancedContent += '\n\n📦 記憶提示：將內容分成小塊，每次專注學習一個部分。';
    }

    return enhancedContent;
  }

  /**
   * 生成練習
   */
  private async generateExercises(content: string, request: AIGenerationRequest): Promise<Exercise[]> {
    const exercises: Exercise[] = [];

    // 為每種記憶技巧生成對應的練習
    request.memoryTechniques.forEach((technique, index) => {
      exercises.push({
        id: `exercise_${index + 1}`,
        type: this.getExerciseTypeForTechnique(technique),
        question: `基於${technique}的練習題：請回答與${request.topic}相關的問題。`,
        correctAnswer: '示例答案',
        explanation: `這個練習運用了${this.memoryPrinciples.get(technique)?.name}技巧。`,
        memoryTechnique: technique,
        difficulty: request.difficulty,
        estimatedTime: 60 + Math.random() * 120
      });
    });

    return exercises;
  }

  /**
   * 翻譯內容到多種語言
   */
  private async translateContent(content: string, sourceLanguage: Language, targetLanguages: Language[]): Promise<Record<Language, string>> {
    const translations: Record<Language, string> = {};

    for (const targetLanguage of targetLanguages) {
      const result = await this.translateText({
        text: content,
        sourceLanguage,
        targetLanguage
      });
      translations[targetLanguage] = result.translatedText;
    }

    return translations;
  }

  // 輔助方法
  private getLanguageName(language: Language): string {
    const names = {
      'zh-TW': '繁體中文',
      'zh-CN': '簡體中文',
      'en-US': '英語',
      'ja-JP': '日語',
      'ko-KR': '韓語',
      'es-ES': '西班牙語',
      'fr-FR': '法語',
      'de-DE': '德語'
    };
    return names[language] || language;
  }

  private getContentTypeName(type: ContentType): string {
    const names = {
      vocabulary: '詞彙學習',
      grammar: '語法學習',
      reading: '閱讀理解',
      listening: '聽力練習',
      writing: '寫作練習',
      speaking: '口語練習',
      quiz: '測驗',
      exercise: '練習'
    };
    return names[type] || type;
  }

  private getDifficultyName(difficulty: DifficultyLevel): string {
    const names = {
      beginner: '初學者',
      elementary: '初級',
      intermediate: '中級',
      'upper-intermediate': '中高級',
      advanced: '高級'
    };
    return names[difficulty] || difficulty;
  }

  private formatLearnerProfile(profile: LearnerProfile): string {
    return `
學習者：${profile.name}
母語：${this.getLanguageName(profile.nativeLanguage)}
目標語言：${profile.targetLanguages.map(lang => this.getLanguageName(lang)).join('、')}
當前水平：${this.getDifficultyName(profile.currentLevel)}
學習風格：${profile.learningStyle}
注意力持續時間：${profile.attentionSpan}分鐘
`;
  }

  private getExerciseTypeForTechnique(technique: MemoryTechnique): Exercise['type'] {
    const mapping = {
      'spaced-repetition': 'multiple-choice',
      'active-recall': 'short-answer',
      'elaborative-rehearsal': 'fill-blank',
      'mnemonics': 'matching',
      'chunking': 'ordering',
      'interleaving': 'true-false'
    };
    return mapping[technique] || 'multiple-choice';
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateReadingTime(text: string): number {
    const wordsPerMinute = 200; // 平均閱讀速度
    return Math.ceil(this.countWords(text) / wordsPerMinute);
  }

  private calculateCognitiveLoad(request: AIGenerationRequest): number {
    let load = 5; // 基礎負荷

    // 根據難度調整
    const difficultyMultiplier = {
      beginner: 0.5,
      elementary: 0.7,
      intermediate: 1.0,
      'upper-intermediate': 1.3,
      advanced: 1.6
    };
    load *= difficultyMultiplier[request.difficulty];

    // 根據記憶技巧調整
    const avgTechniqueLoad = request.memoryTechniques
      .map(tech => this.memoryPrinciples.get(tech)?.cognitiveLoad || 0.5)
      .reduce((sum, load) => sum + load, 0) / request.memoryTechniques.length;
    
    load *= avgTechniqueLoad;

    return Math.min(10, Math.max(1, Math.round(load)));
  }

  private calculateMemoryEffectiveness(request: AIGenerationRequest): number {
    const avgEffectiveness = request.memoryTechniques
      .map(tech => this.memoryPrinciples.get(tech)?.effectiveness || 0.5)
      .reduce((sum, eff) => sum + eff, 0) / request.memoryTechniques.length;
    
    return Math.round(avgEffectiveness * 10);
  }

  private generateTitle(request: AIGenerationRequest): string {
    return `${this.getContentTypeName(request.type)}：${request.topic}`;
  }

  private generateId(): string {
    return `ai_content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 獲取生成歷史
   */
  getGenerationHistory(): GeneratedContent[] {
    return [...this.generationHistory];
  }

  /**
   * 添加學習者檔案
   */
  addLearnerProfile(profile: LearnerProfile): void {
    this.learnerProfiles.set(profile.id, profile);
  }

  /**
   * 獲取學習者檔案
   */
  getLearnerProfile(id: string): LearnerProfile | undefined {
    return this.learnerProfiles.get(id);
  }

  /**
   * 獲取支持的語言
   */
  getSupportedLanguages(): Language[] {
    return Array.from(this.languageModels.keys());
  }

  /**
   * 獲取支持的記憶技巧
   */
  getSupportedMemoryTechniques(): MemoryTechnique[] {
    return Array.from(this.memoryPrinciples.keys());
  }
}

// 輔助接口
interface MemoryPrinciple {
  name: string;
  description: string;
  intervals: number[];
  effectiveness: number;
  cognitiveLoad: number;
}

interface LanguageModel {
  name: string;
  code: string;
  direction: 'ltr' | 'rtl';
  family: string;
  complexity: number;
  supportedFeatures: string[];
}

// 導出單例實例
export const aiContentGenerator = new AIContentGenerator();
