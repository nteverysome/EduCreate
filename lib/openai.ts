// OpenAI API 集成
interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface GenerateContentRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gameType: string;
  questionCount: number;
  language: 'zh-TW' | 'en' | 'zh-CN';
  targetAge?: string;
  subject?: string;
}

interface GeneratedQuestion {
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: string;
  tags: string[];
}

interface GeneratedContent {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
  metadata: {
    topic: string;
    difficulty: string;
    gameType: string;
    generatedAt: string;
    estimatedTime: number;
  };
}

// 演示用的 AI 內容生成器（不需要真實的 OpenAI API）
export class AIContentGenerator {
  private config: OpenAIConfig;

  constructor(config?: Partial<OpenAIConfig>) {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || 'demo-key',
      model: 'gpt-3.5-turbo',
      maxTokens: 2000,
      temperature: 0.7,
      ...config
    };
  }

  async generateContent(request: GenerateContentRequest): Promise<GeneratedContent> {
    // 演示模式：生成模擬內容
    if (this.config.apiKey === 'demo-key') {
      return this.generateDemoContent(request);
    }

    // 真實 API 調用（需要有效的 API Key）
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: '你是一個專業的教育內容創作者，專門為不同年齡層的學生創建高質量的學習材料。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      
      return this.formatGeneratedContent(content, request);
    } catch (error) {
      console.error('AI 內容生成失敗:', error);
      // 降級到演示內容
      return this.generateDemoContent(request);
    }
  }

  private buildPrompt(request: GenerateContentRequest): string {
    const { topic, difficulty, gameType, questionCount, language, targetAge, subject } = request;
    
    return `
請為以下需求生成教育內容：

主題: ${topic}
難度: ${difficulty}
遊戲類型: ${gameType}
問題數量: ${questionCount}
語言: ${language}
目標年齡: ${targetAge || '不限'}
學科: ${subject || '通用'}

請生成一個包含以下結構的 JSON 對象：
{
  "title": "活動標題",
  "description": "活動描述",
  "questions": [
    {
      "question": "問題內容",
      "options": ["選項A", "選項B", "選項C", "選項D"],
      "correctAnswer": 0,
      "explanation": "答案解釋",
      "difficulty": "easy|medium|hard",
      "tags": ["標籤1", "標籤2"]
    }
  ]
}

要求：
1. 內容要符合指定的難度等級
2. 問題要有教育價值且有趣
3. 選項要合理且有挑戰性
4. 解釋要清楚易懂
5. 使用指定的語言
`;
  }

  private generateDemoContent(request: GenerateContentRequest): GeneratedContent {
    const { topic, difficulty, gameType, questionCount, language } = request;
    
    // 根據主題生成不同的演示內容
    const demoContents = this.getDemoContentByTopic(topic, difficulty, questionCount, language);
    
    return {
      title: demoContents.title,
      description: demoContents.description,
      questions: demoContents.questions,
      metadata: {
        topic,
        difficulty,
        gameType,
        generatedAt: new Date().toISOString(),
        estimatedTime: questionCount * 2 // 每題預估2分鐘
      }
    };
  }

  private getDemoContentByTopic(topic: string, difficulty: string, questionCount: number, language: string) {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('動物') || topicLower.includes('animal')) {
      return this.generateAnimalContent(difficulty, questionCount, language);
    } else if (topicLower.includes('數學') || topicLower.includes('math')) {
      return this.generateMathContent(difficulty, questionCount, language);
    } else if (topicLower.includes('歷史') || topicLower.includes('history')) {
      return this.generateHistoryContent(difficulty, questionCount, language);
    } else if (topicLower.includes('科學') || topicLower.includes('science')) {
      return this.generateScienceContent(difficulty, questionCount, language);
    } else {
      return this.generateGeneralContent(topic, difficulty, questionCount, language);
    }
  }

  private generateAnimalContent(difficulty: string, questionCount: number, language: string) {
    const animals = [
      { name: '貓', english: 'Cat', habitat: '家庭', sound: '喵喵' },
      { name: '狗', english: 'Dog', habitat: '家庭', sound: '汪汪' },
      { name: '獅子', english: 'Lion', habitat: '草原', sound: '吼叫' },
      { name: '大象', english: 'Elephant', habitat: '草原', sound: '嘟嘟' },
      { name: '企鵝', english: 'Penguin', habitat: '南極', sound: '嘎嘎' }
    ];

    const questions: GeneratedQuestion[] = [];
    
    for (let i = 0; i < Math.min(questionCount, animals.length); i++) {
      const animal = animals[i];
      questions.push({
        question: `${animal.name}的英文是什麼？`,
        options: [animal.english, 'Bird', 'Fish', 'Rabbit'],
        correctAnswer: 0,
        explanation: `${animal.name}的英文是 ${animal.english}，它們通常生活在${animal.habitat}。`,
        difficulty,
        tags: ['動物', '英語', '詞彙']
      });
    }

    return {
      title: '動物英語詞彙學習',
      description: '學習常見動物的英文名稱和特徵',
      questions
    };
  }

  private generateMathContent(difficulty: string, questionCount: number, language: string) {
    const questions: GeneratedQuestion[] = [];
    
    for (let i = 0; i < questionCount; i++) {
      let question: GeneratedQuestion;
      
      if (difficulty === 'easy') {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const answer = a + b;
        
        question = {
          question: `${a} + ${b} = ?`,
          options: [answer.toString(), (answer + 1).toString(), (answer - 1).toString(), (answer + 2).toString()],
          correctAnswer: 0,
          explanation: `${a} + ${b} = ${answer}`,
          difficulty,
          tags: ['數學', '加法', '基礎運算']
        };
      } else if (difficulty === 'medium') {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 50) + 10;
        const answer = a * b;
        
        question = {
          question: `${a} × ${b} = ?`,
          options: [answer.toString(), (answer + 10).toString(), (answer - 10).toString(), (answer + 20).toString()],
          correctAnswer: 0,
          explanation: `${a} × ${b} = ${answer}`,
          difficulty,
          tags: ['數學', '乘法', '運算']
        };
      } else {
        const a = Math.floor(Math.random() * 100) + 50;
        const b = Math.floor(Math.random() * 10) + 2;
        const answer = Math.floor(a / b);
        
        question = {
          question: `${a} ÷ ${b} = ? (取整數)`,
          options: [answer.toString(), (answer + 1).toString(), (answer - 1).toString(), (answer + 2).toString()],
          correctAnswer: 0,
          explanation: `${a} ÷ ${b} = ${answer} (餘數忽略)`,
          difficulty,
          tags: ['數學', '除法', '高級運算']
        };
      }
      
      questions.push(question);
    }

    return {
      title: '數學運算練習',
      description: '練習基礎數學運算能力',
      questions
    };
  }

  private generateScienceContent(difficulty: string, questionCount: number, language: string) {
    const scienceTopics = [
      {
        question: '地球上最大的海洋是？',
        options: ['太平洋', '大西洋', '印度洋', '北冰洋'],
        correctAnswer: 0,
        explanation: '太平洋是地球上最大的海洋，面積約為1.65億平方公里。'
      },
      {
        question: '光合作用需要哪些條件？',
        options: ['陽光、水、二氧化碳', '陽光、氧氣、水', '水、氧氣、土壤', '陽光、土壤、氧氣'],
        correctAnswer: 0,
        explanation: '光合作用需要陽光、水和二氧化碳，產生葡萄糖和氧氣。'
      },
      {
        question: '人體最大的器官是？',
        options: ['皮膚', '肝臟', '肺部', '心臟'],
        correctAnswer: 0,
        explanation: '皮膚是人體最大的器官，具有保護、調節體溫等功能。'
      }
    ];

    const questions = scienceTopics.slice(0, questionCount).map(topic => ({
      ...topic,
      difficulty,
      tags: ['科學', '自然', '知識']
    }));

    return {
      title: '科學知識問答',
      description: '探索有趣的科學知識',
      questions
    };
  }

  private generateHistoryContent(difficulty: string, questionCount: number, language: string) {
    const historyTopics = [
      {
        question: '中華民國成立於哪一年？',
        options: ['1911年', '1912年', '1949年', '1945年'],
        correctAnswer: 1,
        explanation: '中華民國成立於1912年1月1日。'
      },
      {
        question: '第二次世界大戰結束於哪一年？',
        options: ['1944年', '1945年', '1946年', '1947年'],
        correctAnswer: 1,
        explanation: '第二次世界大戰於1945年結束。'
      }
    ];

    const questions = historyTopics.slice(0, questionCount).map(topic => ({
      ...topic,
      difficulty,
      tags: ['歷史', '年代', '事件']
    }));

    return {
      title: '歷史知識測驗',
      description: '回顧重要的歷史事件',
      questions
    };
  }

  private generateGeneralContent(topic: string, difficulty: string, questionCount: number, language: string) {
    const questions: GeneratedQuestion[] = [];
    
    for (let i = 0; i < questionCount; i++) {
      questions.push({
        question: `關於「${topic}」的問題 ${i + 1}`,
        options: ['選項 A', '選項 B', '選項 C', '選項 D'],
        correctAnswer: 0,
        explanation: `這是關於${topic}的解釋。`,
        difficulty,
        tags: [topic, '通用', '學習']
      });
    }

    return {
      title: `${topic} 學習測驗`,
      description: `探索 ${topic} 相關知識`,
      questions
    };
  }

  private formatGeneratedContent(content: any, request: GenerateContentRequest): GeneratedContent {
    return {
      title: content.title || `${request.topic} 學習活動`,
      description: content.description || `關於 ${request.topic} 的學習內容`,
      questions: content.questions || [],
      metadata: {
        topic: request.topic,
        difficulty: request.difficulty,
        gameType: request.gameType,
        generatedAt: new Date().toISOString(),
        estimatedTime: request.questionCount * 2
      }
    };
  }
}

// 導出單例實例
export const aiContentGenerator = new AIContentGenerator();
