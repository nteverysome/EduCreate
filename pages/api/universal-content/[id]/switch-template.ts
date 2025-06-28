/**
 * 模板切換 API - 模仿 wordwall.net 的模板切換功能
 * 支持遊戲模板切換、視覺樣式更新和遊戲選項配置
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/prisma';
import { TemplateManager, TemplateConfiguration } from '../../../../lib/content/TemplateManager';
import { GameType } from '../../../../lib/content/UniversalContentManager';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支持 POST 請求' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: '未授權訪問' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '無效的活動 ID' });
  }

  try {
    const { templateId, visualStyle, gameOptions } = req.body;

    // 驗證請求數據
    if (!templateId) {
      return res.status(400).json({ error: '模板 ID 是必需的' });
    }

    // 檢查模板是否存在
    const template = TemplateManager.getTemplate(templateId as GameType);
    if (!template) {
      return res.status(400).json({ error: '無效的模板 ID' });
    }

    // 檢查活動是否存在且屬於當前用戶
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!activity) {
      return res.status(404).json({ error: '活動不存在或無權限訪問' });
    }

    // 檢查內容兼容性
    const currentContent = activity.content as any;
    const itemCount = currentContent?.items?.length || 0;
    
    if (!TemplateManager.isContentCompatible(templateId, itemCount)) {
      return res.status(400).json({ 
        error: `當前內容不兼容 ${template.name} 模板`,
        details: {
          currentItems: itemCount,
          requiredMin: template.minItems,
          requiredMax: template.maxItems,
          requiresEvenItems: template.requiresEvenItems
        }
      });
    }

    // 創建模板配置
    const configuration = TemplateManager.createConfiguration(
      templateId,
      visualStyle || 'classic',
      gameOptions || {}
    );

    // 驗證配置
    if (!TemplateManager.validateConfiguration(configuration)) {
      return res.status(400).json({ error: '無效的模板配置' });
    }

    // 更新活動的模板配置
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        templateType: templateId.toUpperCase(),
        content: {
          ...currentContent,
          templateConfiguration: configuration,
          lastTemplateSwitch: new Date().toISOString()
        },
        updatedAt: new Date()
      }
    });

    // 獲取新模板的可用樣式和選項
    const availableStyles = TemplateManager.getTemplateStyles(templateId);
    const availableOptions = TemplateManager.getTemplateOptions(templateId);

    // 返回切換結果
    const result = {
      success: true,
      activityId: updatedActivity.id,
      newTemplate: {
        id: templateId,
        name: template.name,
        icon: template.icon,
        description: template.description
      },
      configuration,
      availableStyles,
      availableOptions,
      message: `已成功切換到 ${template.name} 模板`
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error('模板切換失敗:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({ 
          error: '模板切換衝突，請刷新頁面重試',
          code: 'CONFLICT'
        });
      }
      
      if (error.message.includes('timeout')) {
        return res.status(408).json({ 
          error: '模板切換超時，請檢查網絡連接',
          code: 'TIMEOUT'
        });
      }
    }

    return res.status(500).json({ 
      error: '模板切換失敗，請稍後重試',
      code: 'INTERNAL_ERROR'
    });
  }
}
