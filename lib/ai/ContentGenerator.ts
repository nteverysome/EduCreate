/**
 * AI 內容生成器 - 第三階段
 * 使用 AI 自動生成教育內容，包括問題、答案、提示等
 */

import { GameType } from '../content/UniversalContentManager';

export interface AIGenerationRequest {
  type: 'questions' | 'answers' | 'hints' | 'explanations' | 'content';
  gameType: GameType;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  count: number;
  language: string;
  targetAge?: string;
  learningObjectives?: string[];
  existingContent?: any[];
  customPrompt?: string;
}

export interface AIGeneratedContent {
  id: string;
  type: string;
  content: any;
  confidence: number;
  metadata: {
    generatedAt: Date;
    model: string;
    prompt: string;
    processingTime: number;
  };
  suggestions?: string[];
  alternatives?: any[];
}

export interface AIGenerationResult {
  success: boolean;
  items: AIGeneratedContent[];
  totalGenerated: number;
  processingTime: number;
  usage: {
    tokensUsed: number;
    cost: number;
  };
  errors?: string[];
  warnings?: string[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  isAvailable: boolean;
}

export class ContentGenerator {
  private static models: Map<string, AIModel> = new Map();
  private static defaultModel = 'gpt-4';
  private static apiKeys: Map<string, string> = new Map();

  // 初始化 AI 模型
  static initialize() {
    this.registerModels();
    this.loadAPIKeys();
  }

  // 註冊可用的 AI 模型
  private static registerModels() {
    const models: AIModel[] = [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        capabilities: ['text', 'questions', 'explanations', 'creative'],
        maxTokens: 8192,
        costPerToken: 0.00003,
        isAvailable: true
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        capabilities: ['text', 'questions', 'fast'],
        maxTokens: 4096,
        costPerToken: 0.000002,
        isAvailable: true
      },
      {
        id: 'claude-3',
        name: 'Claude 3',
        provider: 'anthropic',
        capabilities: ['text', 'analysis', 'educational'],
        maxTokens: 100000,
        costPerToken: 0.000015,
        isAvailable: true
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'google',
        capabilities: ['text', 'multimodal', 'reasoning'],
        maxTokens: 32768,
        costPerToken: 0.000001,
        isAvailable: true
      }
    ];

    models.forEach(model => this.models.set(model.id, model));
  }

  // 載入 API 金鑰
  private static loadAPIKeys() {
    this.apiKeys.set('openai', process.env.OPENAI_API_KEY || '');
    this.apiKeys.set('anthropic', process.env.ANTHROPIC_API_KEY || '');
    this.apiKeys.set('google', process.env.GOOGLE_AI_API_KEY || '');
  }

  // 生成內容
  static async generateContent(request: AIGenerationRequest): Promise<AIGenerationResult> {
    const startTime = Date.now();
    
    try {
      // 選擇最適合的模型
      const model = this.selectBestModel(request);
      
      // 構建提示詞
      const prompt = this.buildPrompt(request);
      
      // 調用 AI API
      const response = await this.callAI(model, prompt, request);
      
      // 處理響應
      const items = this.processResponse(response, request);
      
      // 後處理和驗證
      const validatedItems = await this.validateAndEnhance(items, request);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        items: validatedItems,
        totalGenerated: validatedItems.length,
        processingTime,
        usage: {
          tokensUsed: response.usage?.total_tokens || 0,
          cost: this.calculateCost(model, response.usage?.total_tokens || 0)
        }
      };
      
    } catch (error) {
      console.error('AI 內容生成失敗:', error);
      
      return {
        success: false,
        items: [],
        totalGenerated: 0,
        processingTime: Date.now() - startTime,
        usage: { tokensUsed: 0, cost: 0 },
        errors: [error instanceof Error ? error.message : '未知錯誤']
      };
    }
  }

  // 批量生成內容
  static async generateBatch(requests: AIGenerationRequest[]): Promise<AIGenerationResult[]> {
    const results: AIGenerationResult[] = [];
    
    // 並行處理多個請求
    const promises = requests.map(request => this.generateContent(request));
    const responses = await Promise.allSettled(promises);
    
    responses.forEach((response, index) => {
      if (response.status === 'fulfilled') {
        results.push(response.value);
      } else {
        results.push({
          success: false,
          items: [],
          totalGenerated: 0,
          processingTime: 0,
          usage: { tokensUsed: 0, cost: 0 },
          errors: [`批量請求 ${index + 1} 失敗: ${response.reason}`]
        });
      }
    });
    
    return results;
  }

  // 選擇最佳模型
  private static selectBestModel(request: AIGenerationRequest): AIModel {
    const availableModels = Array.from(this.models.values())
      .filter(model => model.isAvailable);
    
    // 根據請求類型選擇模型
    if (request.type === 'explanations' || request.difficulty === 'advanced') {
      return availableModels.find(m => m.id === 'gpt-4') || availableModels[0];
    }
    
    if (request.count > 20) {
      return availableModels.find(m => m.id === 'gpt-3.5-turbo') || availableModels[0];
    }
    
    return availableModels.find(m => m.id === this.defaultModel) || availableModels[0];
  }

  // 構建提示詞
  private static buildPrompt(request: AIGenerationRequest): string {
    const basePrompt = this.getBasePrompt(request.type, request.gameType);
    const contextPrompt = this.buildContextPrompt(request);
    const formatPrompt = this.getFormatPrompt(request.gameType);
    
    return `${basePrompt}\n\n${contextPrompt}\n\n${formatPrompt}`;
  }

  // 獲取基礎提示詞
  private static getBasePrompt(type: string, gameType: GameType): string {
    const prompts = {
      questions: {
        quiz: '你是一位專業的教育內容創作者。請為測驗遊戲生成高質量的問題。',
        matching: '你是一位專業的教育內容創作者。請為配對遊戲生成配對項目。',
        flashcards: '你是一位專業的教育內容創作者。請為單字卡生成學習內容。',
        'spin-wheel': '你是一位專業的教育內容創作者。請為轉盤遊戲生成選項。',
        'whack-a-mole': '你是一位專業的教育內容創作者。請為打地鼠遊戲生成目標項目。',
        'memory-cards': '你是一位專業的教育內容創作者。請為記憶卡遊戲生成配對內容。'
      },
      answers: '你是一位專業的教育內容創作者。請為給定的問題生成準確的答案。',
      hints: '你是一位專業的教育內容創作者。請為學習內容生成有用的提示。',
      explanations: '你是一位專業的教育內容創作者。請為學習內容生成詳細的解釋。',
      content: '你是一位專業的教育內容創作者。請生成教育內容。'
    };
    
    return prompts[type]?.[gameType] || prompts[type] || prompts.content;
  }

  // 構建上下文提示詞
  private static buildContextPrompt(request: AIGenerationRequest): string {
    let context = `主題: ${request.topic}\n`;
    context += `難度: ${request.difficulty}\n`;
    context += `語言: ${request.language}\n`;
    context += `數量: ${request.count}\n`;
    
    if (request.targetAge) {
      context += `目標年齡: ${request.targetAge}\n`;
    }
    
    if (request.learningObjectives?.length) {
      context += `學習目標: ${request.learningObjectives.join(', ')}\n`;
    }
    
    if (request.existingContent?.length) {
      context += `現有內容參考: ${JSON.stringify(request.existingContent.slice(0, 3))}\n`;
    }
    
    if (request.customPrompt) {
      context += `特殊要求: ${request.customPrompt}\n`;
    }
    
    return context;
  }

  // 獲取格式提示詞
  private static getFormatPrompt(gameType: GameType): string {
    const formats = {
      quiz: `
請以 JSON 格式返回，每個問題包含：
{
  "question": "問題內容",
  "options": ["選項A", "選項B", "選項C", "選項D"],
  "correctAnswer": 0,
  "explanation": "答案解釋",
  "difficulty": "難度級別",
  "tags": ["標籤1", "標籤2"]
}`,
      matching: `
請以 JSON 格式返回，每個配對包含：
{
  "left": "左側項目",
  "right": "右側項目",
  "category": "類別",
  "difficulty": "難度級別"
}`,
      flashcards: `
請以 JSON 格式返回，每張卡片包含：
{
  "front": "正面內容",
  "back": "背面內容",
  "hint": "提示",
  "category": "類別"
}`
    };
    
    return formats[gameType] || '請以 JSON 格式返回結構化內容。';
  }

  // 調用 AI API
  private static async callAI(model: AIModel, prompt: string, request: AIGenerationRequest): Promise<any> {
    const apiKey = this.apiKeys.get(model.provider);
    if (!apiKey) {
      throw new Error(`${model.provider} API 金鑰未配置`);
    }
    
    switch (model.provider) {
      case 'openai':
        return this.callOpenAI(model, prompt, apiKey);
      case 'anthropic':
        return this.callAnthropic(model, prompt, apiKey);
      case 'google':
        return this.callGoogle(model, prompt, apiKey);
      default:
        throw new Error(`不支持的 AI 提供商: ${model.provider}`);
    }
  }

  // OpenAI API 調用
  private static async callOpenAI(model: AIModel, prompt: string, apiKey: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: Math.min(model.maxTokens, 2000)
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API 錯誤: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Anthropic API 調用
  private static async callAnthropic(model: AIModel, prompt: string, apiKey: string): Promise<any> {
    // 實現 Anthropic API 調用
    throw new Error('Anthropic API 尚未實現');
  }

  // Google AI API 調用
  private static async callGoogle(model: AIModel, prompt: string, apiKey: string): Promise<any> {
    // 實現 Google AI API 調用
    throw new Error('Google AI API 尚未實現');
  }

  // 處理 AI 響應
  private static processResponse(response: any, request: AIGenerationRequest): AIGeneratedContent[] {
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI 響應為空');
    }
    
    try {
      // 嘗試解析 JSON
      const parsedContent = JSON.parse(content);
      const items = Array.isArray(parsedContent) ? parsedContent : [parsedContent];
      
      return items.map((item, index) => ({
        id: `ai_${Date.now()}_${index}`,
        type: request.type,
        content: item,
        confidence: 0.85, // 默認信心度
        metadata: {
          generatedAt: new Date(),
          model: response.model || 'unknown',
          prompt: request.customPrompt || '',
          processingTime: 0
        }
      }));
      
    } catch (error) {
      // 如果不是 JSON，作為純文本處理
      return [{
        id: `ai_${Date.now()}_0`,
        type: request.type,
        content: { text: content },
        confidence: 0.75,
        metadata: {
          generatedAt: new Date(),
          model: response.model || 'unknown',
          prompt: request.customPrompt || '',
          processingTime: 0
        }
      }];
    }
  }

  // 驗證和增強內容
  private static async validateAndEnhance(
    items: AIGeneratedContent[], 
    request: AIGenerationRequest
  ): Promise<AIGeneratedContent[]> {
    return items.map(item => {
      // 內容驗證
      const isValid = this.validateContent(item.content, request.gameType);
      if (!isValid) {
        item.confidence *= 0.5; // 降低信心度
      }
      
      // 添加建議
      item.suggestions = this.generateSuggestions(item.content, request);
      
      return item;
    });
  }

  // 驗證內容
  private static validateContent(content: any, gameType: GameType): boolean {
    switch (gameType) {
      case 'quiz':
        return content.question && content.options && Array.isArray(content.options) && 
               typeof content.correctAnswer === 'number';
      case 'matching':
        return content.left && content.right;
      case 'flashcards':
        return content.front && content.back;
      default:
        return true;
    }
  }

  // 生成建議
  private static generateSuggestions(content: any, request: AIGenerationRequest): string[] {
    const suggestions: string[] = [];
    
    if (request.difficulty === 'beginner' && content.explanation?.length > 100) {
      suggestions.push('考慮簡化解釋以適合初學者');
    }
    
    if (request.gameType === 'quiz' && content.options?.length < 4) {
      suggestions.push('建議增加更多選項以提高難度');
    }
    
    return suggestions;
  }

  // 計算成本
  private static calculateCost(model: AIModel, tokens: number): number {
    return tokens * model.costPerToken;
  }

  // 獲取可用模型
  static getAvailableModels(): AIModel[] {
    return Array.from(this.models.values()).filter(model => model.isAvailable);
  }

  // 設置默認模型
  static setDefaultModel(modelId: string): void {
    if (this.models.has(modelId)) {
      this.defaultModel = modelId;
    }
  }

  // 獲取使用統計
  static getUsageStats(): any {
    // 實現使用統計邏輯
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageProcessingTime: 0
    };
  }
}
