import { NextApiRequest, NextApiResponse } from 'next';
import { aiContentGenerator } from '../../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      topic,
      difficulty = 'medium',
      gameType = 'quiz',
      questionCount = 5,
      language = 'zh-TW',
      targetAge,
      subject
    } = req.body;

    // 驗證必要參數
    if (!topic) {
      return res.status(400).json({ 
        success: false,
        message: '主題是必需的參數' 
      });
    }

    // 驗證參數值
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ 
        success: false,
        message: '難度必須是 easy, medium, 或 hard' 
      });
    }

    if (questionCount < 1 || questionCount > 20) {
      return res.status(400).json({ 
        success: false,
        message: '問題數量必須在 1-20 之間' 
      });
    }

    // 生成內容
    const generatedContent = await aiContentGenerator.generateContent({
      topic,
      difficulty,
      gameType,
      questionCount,
      language,
      targetAge,
      subject
    });

    // 記錄生成統計
    const stats = {
      topic,
      difficulty,
      gameType,
      questionCount,
      generatedAt: new Date().toISOString(),
      success: true
    };

    // 這裡可以保存到數據庫或日誌系統
    console.log('AI 內容生成統計:', stats);

    res.status(200).json({
      success: true,
      data: generatedContent,
      message: '內容生成成功'
    });

  } catch (error) {
    console.error('AI 內容生成錯誤:', error);
    
    res.status(500).json({
      success: false,
      message: '內容生成失敗',
      error: process.env.NODE_ENV === 'development' ? error.message : '內部服務器錯誤'
    });
  }
}
