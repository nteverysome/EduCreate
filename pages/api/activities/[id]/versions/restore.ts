/**
 * 版本恢復API
 * 處理版本恢復、回滾等操作
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withTestAuth } from '../../../../../middleware/withTestAuth';
import { ActivityVersionManager, RestoreOptions } from '../../../../../lib/version/ActivityVersionManager';

async function restoreVersionHandler(req: NextApiRequest, res: NextApiResponse) {
  // 獲取用戶信息
  const session = await getSession({ req });
  const user = session?.user || (req as any).testUser;
  
  if (!session && !(req as any).testUser) {
    return res.status(401).json({ 
      error: '未授權訪問',
      message: '請先登入以使用版本恢復功能',
      code: 'UNAUTHORIZED'
    });
  }

  // 只允許POST請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  const { id: activityId } = req.query;
  const {
    targetVersion,
    preserveCurrentVersion = true,
    createBackup = true,
    mergeStrategy = 'overwrite',
    selectedPaths,
    conflictResolution = 'auto',
    notifyCollaborators = true
  } = req.body;

  // 驗證參數
  if (!activityId || typeof activityId !== 'string') {
    return res.status(400).json({
      error: '無效的活動ID',
      message: '請提供有效的活動ID',
      code: 'INVALID_ACTIVITY_ID'
    });
  }

  if (!targetVersion) {
    return res.status(400).json({
      error: '缺少目標版本',
      message: '請提供要恢復的目標版本',
      code: 'MISSING_TARGET_VERSION'
    });
  }

  // 驗證合併策略
  const validMergeStrategies = ['overwrite', 'merge', 'selective'];
  if (!validMergeStrategies.includes(mergeStrategy)) {
    return res.status(400).json({
      error: '無效的合併策略',
      message: `合併策略必須是: ${validMergeStrategies.join(', ')}`,
      code: 'INVALID_MERGE_STRATEGY'
    });
  }

  // 驗證衝突解決策略
  const validConflictResolutions = ['auto', 'manual'];
  if (!validConflictResolutions.includes(conflictResolution)) {
    return res.status(400).json({
      error: '無效的衝突解決策略',
      message: `衝突解決策略必須是: ${validConflictResolutions.join(', ')}`,
      code: 'INVALID_CONFLICT_RESOLUTION'
    });
  }

  // 如果是選擇性恢復，必須提供路徑
  if (mergeStrategy === 'selective' && (!selectedPaths || selectedPaths.length === 0)) {
    return res.status(400).json({
      error: '缺少選擇路徑',
      message: '選擇性恢復需要提供要恢復的路徑',
      code: 'MISSING_SELECTED_PATHS'
    });
  }

  try {
    const restoreOptions: RestoreOptions = {
      targetVersion,
      preserveCurrentVersion,
      createBackup,
      mergeStrategy,
      selectedPaths,
      conflictResolution,
      notifyCollaborators
    };

    const restoredVersion = await ActivityVersionManager.restoreVersion(
      activityId,
      restoreOptions,
      user.id
    );

    return res.status(200).json({
      success: true,
      data: restoredVersion,
      message: '版本恢復成功',
      meta: {
        activityId,
        targetVersion,
        restoredVersion: restoredVersion.version,
        restoreOptions,
        restoredBy: user.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('版本恢復失敗:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('目標版本不存在')) {
        return res.status(404).json({
          error: '目標版本不存在',
          message: '指定的目標版本不存在',
          code: 'TARGET_VERSION_NOT_FOUND'
        });
      }
      
      if (error.message.includes('權限不足')) {
        return res.status(403).json({
          error: '權限不足',
          message: '您沒有權限恢復此版本',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }
      
      if (error.message.includes('衝突')) {
        return res.status(409).json({
          error: '版本衝突',
          message: '恢復過程中發現衝突，請手動解決',
          code: 'VERSION_CONFLICT'
        });
      }
    }

    return res.status(500).json({
      error: '版本恢復失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
      code: 'RESTORE_VERSION_ERROR'
    });
  }
}

// 使用測試認證中間件包裝處理器
export default withTestAuth(restoreVersionHandler);
