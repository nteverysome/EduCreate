/**
 * 版本比較API
 * 處理版本對比、差異分析等操作
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withTestAuth } from '../../../../../middleware/withTestAuth';
import { ActivityVersionManager } from '../../../../../lib/version/ActivityVersionManager';

async function compareVersionsHandler(req: NextApiRequest, res: NextApiResponse) {
  // 獲取用戶信息
  const session = await getSession({ req });
  const user = session?.user || (req as any).testUser;
  
  if (!session && !(req as any).testUser) {
    return res.status(401).json({ 
      error: '未授權訪問',
      message: '請先登入以使用版本比較功能',
      code: 'UNAUTHORIZED'
    });
  }

  // 只允許POST請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  const { id: activityId } = req.query;
  const { sourceVersion, targetVersion } = req.body;

  // 驗證參數
  if (!activityId || typeof activityId !== 'string') {
    return res.status(400).json({
      error: '無效的活動ID',
      message: '請提供有效的活動ID',
      code: 'INVALID_ACTIVITY_ID'
    });
  }

  if (!sourceVersion || !targetVersion) {
    return res.status(400).json({
      error: '缺少版本參數',
      message: '請提供要比較的源版本和目標版本',
      code: 'MISSING_VERSION_PARAMS'
    });
  }

  if (sourceVersion === targetVersion) {
    return res.status(400).json({
      error: '版本相同',
      message: '不能比較相同的版本',
      code: 'SAME_VERSION'
    });
  }

  try {
    const comparison = await ActivityVersionManager.compareVersions(
      activityId,
      sourceVersion,
      targetVersion
    );

    return res.status(200).json({
      success: true,
      data: comparison,
      meta: {
        activityId,
        sourceVersion,
        targetVersion,
        requestedBy: user.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('版本比較失敗:', error);
    
    if (error instanceof Error && error.message.includes('版本不存在')) {
      return res.status(404).json({
        error: '版本不存在',
        message: '指定的版本不存在',
        code: 'VERSION_NOT_FOUND'
      });
    }

    return res.status(500).json({
      error: '版本比較失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
      code: 'COMPARE_VERSIONS_ERROR'
    });
  }
}

// 使用測試認證中間件包裝處理器
export default withTestAuth(compareVersionsHandler);
