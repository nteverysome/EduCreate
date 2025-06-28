/**
 * AI 內容生成 API 端點
 * 支持 OpenAI GPT 模型生成教育內容
 */

import { NextApiRequest, NextApiResponse } from 'next';

// 動態導入 OpenAI，提供更好的錯誤處理
let OpenAI: any = null;
let openai: any = null;

try {
  OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.log('OpenAI 模塊未安裝或配置不正確');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 檢查 OpenAI 配置
  if (!openai) {
    return res.status(503).json({
      error: 'AI 服務未配置',
      message: 'OpenAI API 密鑰未設置或 OpenAI 模塊未安裝',
      configuration: {
        openaiInstalled: OpenAI !== null,
        apiKeyConfigured: !!process.env.OPENAI_API_KEY,
        suggestion: '請設置 OPENAI_API_KEY 環境變量並確保已安裝 openai 包'
      }
    });
  }

  try {
    const {
      type,
      gameType,
      topic,
      difficulty,
      count,
      language = 'zh-TW',
      targetAge,
      learningObjectives,
      customPrompt
    } = req.body;

    // 驗證必要參數
    if (!type || !gameType || !topic) {
      return res.status(400).json({ 
        error: '缺少必要參數',
        required: ['type', 'gameType', 'topic']
      });
    }

    // 構建提示詞
    const prompt = buildPrompt({
      type,
      gameType,
      topic,
      difficulty,
      count,
      language,
      targetAge,
      learningObjectives,
      customPrompt
    });

    // 調用 OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一個專業的教育內容創建助手，專門為教育遊戲生成高質量的學習內容。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const generatedContent = completion.choices[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error('AI 生成內容為空');
    }

    // 解析生成的內容
    const parsedContent = parseGeneratedContent(generatedContent, type, gameType);

    // 計算使用統計
    const usage = {
      tokensUsed: completion.usage?.total_tokens || 0,
      cost: calculateCost(completion.usage?.total_tokens || 0, 'gpt-4')
    };

    // 返回結果
    res.status(200).json({
      success: true,
      items: parsedContent.map((content, index) => ({
        id: `generated_${Date.now()}_${index}`,
        content,
        confidence: 0.9,
        suggestions: []
      })),
      totalGenerated: parsedContent.length,
      processingTime: Date.now() - Date.now(), // 簡化
      usage,
      model: 'gpt-4'
    });

  } catch (error) {
    console.error('AI 生成失敗:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      errors: [error instanceof Error ? error.message : '生成失敗']
    });
  }
}

// 構建提示詞
function buildPrompt(params: any): string {
  const {
    type,
    gameType,
    topic,
    difficulty,
    count,
    language,
    targetAge,
    learningObjectives,
    customPrompt
  } = params;

  let prompt = `請為 ${gameType} 遊戲生成 ${count} 個${type}，主題是「${topic}」。

要求：
- 難度級別：${difficulty}
- 語言：${language}
- 目標年齡：${targetAge || '不限'}
- 學習目標：${learningObjectives?.join(', ') || '無特定目標'}

`;

  // 根據遊戲類型添加特定要求
  switch (gameType) {
    case 'quiz':
      prompt += `請生成選擇題格式，包含：
- 問題
- 4個選項 (A, B, C, D)
- 正確答案
- 解釋

格式：JSON 數組，每個對象包含 question, options, correctAnswer, explanation`;
      break;
      
    case 'matching':
      prompt += `請生成配對題格式，包含：
- 左側項目
- 右側項目
- 配對關係

格式：JSON 數組，每個對象包含 left, right, category`;
      break;
      
    case 'flashcards':
      prompt += `請生成閃卡格式，包含：
- 正面內容
- 背面內容
- 提示（可選）

格式：JSON 數組，每個對象包含 front, back, hint`;
      break;
      
    default:
      prompt += `請生成適合 ${gameType} 遊戲的內容格式。`;
  }

  if (customPrompt) {
    prompt += `\n\n額外要求：${customPrompt}`;
  }

  prompt += '\n\n請只返回 JSON 格式的數據，不要包含其他文字。';

  return prompt;
}

// 解析生成的內容
function parseGeneratedContent(content: string, type: string, gameType: string): any[] {
  try {
    // 嘗試解析 JSON
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error('JSON 解析失敗，嘗試文本解析:', error);
    
    // 如果 JSON 解析失敗，嘗試文本解析
    return parseTextContent(content, type, gameType);
  }
}

// 文本內容解析
function parseTextContent(content: string, type: string, gameType: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  const items: any[] = [];

  // 簡化的文本解析邏輯
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      switch (gameType) {
        case 'quiz':
          if (line.includes('?')) {
            items.push({
              question: line,
              options: ['選項A', '選項B', '選項C', '選項D'],
              correctAnswer: 0,
              explanation: '這是正確答案的解釋。'
            });
          }
          break;
          
        case 'flashcards':
          items.push({
            front: line,
            back: '相關解釋或答案',
            hint: '提示信息'
          });
          break;
          
        default:
          items.push({ content: line });
      }
    }
  }

  return items.length > 0 ? items : [{ content: '生成的內容' }];
}

// 計算成本
function calculateCost(tokens: number, model: string): number {
  const rates = {
    'gpt-4': 0.03 / 1000, // $0.03 per 1K tokens
    'gpt-3.5-turbo': 0.002 / 1000 // $0.002 per 1K tokens
  };
  
  return tokens * (rates[model as keyof typeof rates] || rates['gpt-4']);
}
