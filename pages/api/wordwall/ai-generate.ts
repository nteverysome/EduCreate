/**
 * WordWall 風格 AI 內容生成 API
 * 模仿 WordWall 的 AI 內容生成功能
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { AIContentGenerator, AIGenerationRequest } from '@/lib/wordwall/AIContentGenerator';
import { TemplateType } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 驗證用戶身份
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 驗證請求數據
    const {
      description,
      templateType,
      questionCount = 10,
      answerCount = 4,
      difficulty = 'MEDIUM',
      language = '繁體中文',
      targetAge
    } = req.body;

    if (!description || !templateType) {
      return res.status(400).json({ 
        error: 'Missing required fields: description and templateType' 
      });
    }

    // 驗證模板類型
    const validTemplateTypes: TemplateType[] = [
      'QUIZ', 'MATCHING', 'FLASHCARDS', 'HANGMAN', 'TRUE_FALSE'
    ];
    
    if (!validTemplateTypes.includes(templateType)) {
      return res.status(400).json({ 
        error: `Invalid template type. Supported types: ${validTemplateTypes.join(', ')}` 
      });
    }

    // 驗證參數範圍
    if (questionCount < 1 || questionCount > 50) {
      return res.status(400).json({ 
        error: 'Question count must be between 1 and 50' 
      });
    }

    if (answerCount < 2 || answerCount > 6) {
      return res.status(400).json({ 
        error: 'Answer count must be between 2 and 6' 
      });
    }

    // 構建 AI 生成請求
    const aiRequest: AIGenerationRequest = {
      description,
      templateType,
      questionCount,
      answerCount,
      difficulty,
      language,
      targetAge
    };

    // 生成內容
    const generatedContent = await AIContentGenerator.generateContent(aiRequest);

    // 返回生成的內容
    res.status(200).json({
      success: true,
      data: generatedContent,
      metadata: {
        templateType,
        questionCount,
        answerCount,
        difficulty,
        language,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI content generation error:', error);
    
    // 處理不同類型的錯誤
    if (error instanceof Error) {
      if (error.message.includes('OpenAI API key')) {
        return res.status(500).json({ 
          error: 'AI service configuration error' 
        });
      }
      
      if (error.message.includes('OpenAI API 錯誤')) {
        return res.status(503).json({ 
          error: 'AI service temporarily unavailable' 
        });
      }
      
      if (error.message.includes('無法解析')) {
        return res.status(500).json({ 
          error: 'Failed to parse AI generated content' 
        });
      }
    }

    res.status(500).json({ 
      error: 'Internal server error during content generation' 
    });
  }
}

// 配置 API 路由
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
