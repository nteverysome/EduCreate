import { NextApiRequest, NextApiResponse } from 'next';
import { aiImageGenerator } from '../../../lib/imageGenerator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      prompt,
      style = 'educational',
      size = '512x512',
      count = 1,
      subject,
      ageGroup
    } = req.body;

    // 驗證必要參數
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: '圖片描述是必需的參數' 
      });
    }

    // 驗證參數值
    const validStyles = ['realistic', 'cartoon', 'illustration', 'educational'];
    if (!validStyles.includes(style)) {
      return res.status(400).json({ 
        success: false,
        message: '風格必須是 realistic, cartoon, illustration, 或 educational' 
      });
    }

    const validSizes = ['256x256', '512x512', '1024x1024'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({ 
        success: false,
        message: '尺寸必須是 256x256, 512x512, 或 1024x1024' 
      });
    }

    if (count < 1 || count > 4) {
      return res.status(400).json({ 
        success: false,
        message: '圖片數量必須在 1-4 之間' 
      });
    }

    // 生成圖片
    const result = await aiImageGenerator.generateImages({
      prompt: prompt.trim(),
      style,
      size,
      count,
      subject,
      ageGroup
    });

    // 記錄生成統計
    const stats = {
      prompt,
      style,
      size,
      count,
      subject,
      ageGroup,
      generatedAt: new Date().toISOString(),
      success: result.success,
      imageCount: result.images.length
    };

    console.log('AI 圖片生成統計:', stats);

    res.status(200).json({
      success: true,
      data: result,
      message: result.message || '圖片生成成功'
    });

  } catch (error) {
    console.error('AI 圖片生成錯誤:', error);
    
    res.status(500).json({
      success: false,
      message: '圖片生成失敗',
      error: process.env.NODE_ENV === 'development' ? error.message : '內部服務器錯誤'
    });
  }
}
