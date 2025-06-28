/**
 * WordWall 風格 AI 內容生成器
 * 模仿 WordWall 的 AI 內容生成功能
 */

import { TemplateType } from '@prisma/client';

export interface AIGenerationRequest {
  description: string;
  templateType: TemplateType;
  questionCount?: number;
  answerCount?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  language?: string;
  targetAge?: string;
}

export interface QuizContent {
  title: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  answers: QuizAnswer[];
  explanation?: string;
}

export interface QuizAnswer {
  text: string;
  isCorrect: boolean;
}

export interface MatchingContent {
  title: string;
  pairs: MatchingPair[];
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface FlashcardContent {
  title: string;
  cards: FlashcardItem[];
}

export interface FlashcardItem {
  front: string;
  back: string;
  hint?: string;
}

export interface HangmanContent {
  title: string;
  words: HangmanWord[];
}

export interface HangmanWord {
  word: string;
  hint: string;
  category?: string;
}

export interface TrueFalseContent {
  title: string;
  statements: TrueFalseStatement[];
}

export interface TrueFalseStatement {
  statement: string;
  isTrue: boolean;
  explanation?: string;
}

export class AIContentGenerator {
  private static readonly API_KEY = process.env.OPENAI_API_KEY;
  private static readonly BASE_URL = 'https://api.openai.com/v1/chat/completions';

  /**
   * 生成測驗內容
   */
  static async generateQuizContent(request: AIGenerationRequest): Promise<QuizContent> {
    const prompt = this.buildQuizPrompt(request);
    const response = await this.callOpenAI(prompt);
    return this.parseQuizResponse(response);
  }

  /**
   * 生成配對內容
   */
  static async generateMatchingContent(request: AIGenerationRequest): Promise<MatchingContent> {
    const prompt = this.buildMatchingPrompt(request);
    const response = await this.callOpenAI(prompt);
    return this.parseMatchingResponse(response);
  }

  /**
   * 生成單字卡內容
   */
  static async generateFlashcardContent(request: AIGenerationRequest): Promise<FlashcardContent> {
    const prompt = this.buildFlashcardPrompt(request);
    const response = await this.callOpenAI(prompt);
    return this.parseFlashcardResponse(response);
  }

  /**
   * 生成猜字遊戲內容
   */
  static async generateHangmanContent(request: AIGenerationRequest): Promise<HangmanContent> {
    const prompt = this.buildHangmanPrompt(request);
    const response = await this.callOpenAI(prompt);
    return this.parseHangmanResponse(response);
  }

  /**
   * 生成是非題內容
   */
  static async generateTrueFalseContent(request: AIGenerationRequest): Promise<TrueFalseContent> {
    const prompt = this.buildTrueFalsePrompt(request);
    const response = await this.callOpenAI(prompt);
    return this.parseTrueFalseResponse(response);
  }

  /**
   * 通用內容生成方法
   */
  static async generateContent(request: AIGenerationRequest): Promise<any> {
    switch (request.templateType) {
      case 'QUIZ':
        return this.generateQuizContent(request);
      case 'MATCHING':
        return this.generateMatchingContent(request);
      case 'FLASHCARDS':
        return this.generateFlashcardContent(request);
      case 'HANGMAN':
        return this.generateHangmanContent(request);
      case 'TRUE_FALSE':
        return this.generateTrueFalseContent(request);
      default:
        throw new Error(`不支持的模板類型: ${request.templateType}`);
    }
  }

  /**
   * 構建測驗提示詞
   */
  private static buildQuizPrompt(request: AIGenerationRequest): string {
    const { description, questionCount = 10, answerCount = 4, difficulty = 'MEDIUM', language = '繁體中文', targetAge } = request;
    
    return `
請根據以下描述創建一個測驗：

描述：${description}
問題數量：${questionCount}
每題答案數量：${answerCount}
難度：${difficulty}
語言：${language}
${targetAge ? `目標年齡：${targetAge}` : ''}

請以 JSON 格式回應，包含：
1. title: 測驗標題
2. questions: 問題陣列，每個問題包含：
   - question: 問題文字
   - answers: 答案陣列，每個答案包含 text（答案文字）和 isCorrect（是否正確）
   - explanation: 解釋（可選）

確保：
- 只有一個正確答案
- 干擾項要合理且具有挑戰性
- 問題清晰明確
- 適合指定的難度和年齡層

範例格式：
{
  "title": "基礎英語詞彙測驗",
  "questions": [
    {
      "question": "Which animal says 'meow'?",
      "answers": [
        {"text": "Cat", "isCorrect": true},
        {"text": "Dog", "isCorrect": false},
        {"text": "Bird", "isCorrect": false},
        {"text": "Fish", "isCorrect": false}
      ],
      "explanation": "Cats make the 'meow' sound."
    }
  ]
}
`;
  }

  /**
   * 構建配對提示詞
   */
  private static buildMatchingPrompt(request: AIGenerationRequest): string {
    const { description, questionCount = 8, difficulty = 'MEDIUM', language = '繁體中文' } = request;
    
    return `
請根據以下描述創建配對遊戲內容：

描述：${description}
配對數量：${questionCount}
難度：${difficulty}
語言：${language}

請以 JSON 格式回應，包含：
1. title: 遊戲標題
2. pairs: 配對陣列，每個配對包含 left（左側項目）和 right（右側項目）

確保配對項目相關且有教育意義。

範例格式：
{
  "title": "動物與聲音配對",
  "pairs": [
    {"left": "貓", "right": "喵喵"},
    {"left": "狗", "right": "汪汪"}
  ]
}
`;
  }

  /**
   * 構建單字卡提示詞
   */
  private static buildFlashcardPrompt(request: AIGenerationRequest): string {
    const { description, questionCount = 10, difficulty = 'MEDIUM', language = '繁體中文' } = request;
    
    return `
請根據以下描述創建單字卡內容：

描述：${description}
卡片數量：${questionCount}
難度：${difficulty}
語言：${language}

請以 JSON 格式回應，包含：
1. title: 卡片組標題
2. cards: 卡片陣列，每張卡片包含：
   - front: 正面內容
   - back: 背面內容
   - hint: 提示（可選）

範例格式：
{
  "title": "基礎英語單字",
  "cards": [
    {"front": "Apple", "back": "蘋果", "hint": "一種紅色水果"}
  ]
}
`;
  }

  /**
   * 構建猜字遊戲提示詞
   */
  private static buildHangmanPrompt(request: AIGenerationRequest): string {
    const { description, questionCount = 10, difficulty = 'MEDIUM', language = '繁體中文' } = request;
    
    return `
請根據以下描述創建猜字遊戲內容：

描述：${description}
單字數量：${questionCount}
難度：${difficulty}
語言：${language}

請以 JSON 格式回應，包含：
1. title: 遊戲標題
2. words: 單字陣列，每個單字包含：
   - word: 要猜的單字（只包含字母，無空格或特殊字符）
   - hint: 提示
   - category: 分類（可選）

範例格式：
{
  "title": "動物猜字遊戲",
  "words": [
    {"word": "ELEPHANT", "hint": "大型哺乳動物，有長鼻子", "category": "動物"}
  ]
}
`;
  }

  /**
   * 構建是非題提示詞
   */
  private static buildTrueFalsePrompt(request: AIGenerationRequest): string {
    const { description, questionCount = 10, difficulty = 'MEDIUM', language = '繁體中文' } = request;
    
    return `
請根據以下描述創建是非題內容：

描述：${description}
題目數量：${questionCount}
難度：${difficulty}
語言：${language}

請以 JSON 格式回應，包含：
1. title: 測驗標題
2. statements: 陳述陣列，每個陳述包含：
   - statement: 陳述內容
   - isTrue: 是否為真
   - explanation: 解釋（可選）

範例格式：
{
  "title": "科學常識是非題",
  "statements": [
    {"statement": "太陽是一顆恆星", "isTrue": true, "explanation": "太陽是太陽系中心的恆星"}
  ]
}
`;
  }

  /**
   * 調用 OpenAI API
   */
  private static async callOpenAI(prompt: string): Promise<string> {
    if (!this.API_KEY) {
      throw new Error('OpenAI API key 未設置');
    }

    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一個專業的教育內容創建助手，專門創建高質量的互動教學內容。請始終以 JSON 格式回應。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 錯誤: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * 解析測驗回應
   */
  private static parseQuizResponse(response: string): QuizContent {
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error('無法解析 AI 生成的測驗內容');
    }
  }

  /**
   * 解析配對回應
   */
  private static parseMatchingResponse(response: string): MatchingContent {
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error('無法解析 AI 生成的配對內容');
    }
  }

  /**
   * 解析單字卡回應
   */
  private static parseFlashcardResponse(response: string): FlashcardContent {
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error('無法解析 AI 生成的單字卡內容');
    }
  }

  /**
   * 解析猜字遊戲回應
   */
  private static parseHangmanResponse(response: string): HangmanContent {
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error('無法解析 AI 生成的猜字遊戲內容');
    }
  }

  /**
   * 解析是非題回應
   */
  private static parseTrueFalseResponse(response: string): TrueFalseContent {
    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error('無法解析 AI 生成的是非題內容');
    }
  }
}
