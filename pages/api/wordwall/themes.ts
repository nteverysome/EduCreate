/**
 * WordWall 主題 API 端點
 * 用於測試主題管理器功能
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { WordWallThemeManager } from '@/lib/wordwall/ThemeManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, id } = req.query;

    // 獲取特定主題
    if (id) {
      const theme = WordWallThemeManager.getThemeById(id as string);
      if (!theme) {
        return res.status(404).json({ error: 'Theme not found' });
      }
      return res.status(200).json({
        success: true,
        data: theme
      });
    }

    // 獲取主題列表
    let themes = WordWallThemeManager.getAllThemes();

    // 按分類過濾
    if (category && category !== 'ALL') {
      themes = WordWallThemeManager.getThemesByCategory(category as string);
    }

    res.status(200).json({
      success: true,
      data: themes,
      count: themes.length,
      metadata: {
        totalThemes: WordWallThemeManager.getAllThemes().length,
        categories: ['CLASSIC', 'THEMED', 'SEASONAL', 'EDUCATIONAL', 'MODERN'],
        defaultTheme: WordWallThemeManager.getDefaultTheme()
      }
    });

  } catch (error) {
    console.error('Themes API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
