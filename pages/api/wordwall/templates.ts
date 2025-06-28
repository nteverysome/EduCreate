/**
 * WordWall 模板 API 端點
 * 用於測試模板管理器功能
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { WordWallTemplateManager } from '@/lib/wordwall/TemplateManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, difficulty, search } = req.query;

    let templates = WordWallTemplateManager.getAllTemplates();

    // 按分類過濾
    if (category && category !== 'ALL') {
      templates = WordWallTemplateManager.getTemplatesByCategory(category as any);
    }

    // 按難度過濾
    if (difficulty && difficulty !== 'ALL') {
      templates = WordWallTemplateManager.getTemplatesByDifficulty(difficulty as any);
    }

    // 搜索過濾
    if (search) {
      templates = WordWallTemplateManager.searchTemplates(search as string);
    }

    res.status(200).json({
      success: true,
      data: templates,
      count: templates.length,
      metadata: {
        totalTemplates: WordWallTemplateManager.getAllTemplates().length,
        freeTemplates: WordWallTemplateManager.getFreeTemplates().length,
        premiumTemplates: WordWallTemplateManager.getPremiumTemplates().length
      }
    });

  } catch (error) {
    console.error('Templates API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
