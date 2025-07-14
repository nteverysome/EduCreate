/**
 * 活動版本管理API
 * 處理版本歷史、創建版本、版本查詢等操作
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withTestAuth } from '../../../../../middleware/withTestAuth';
import { ActivityVersionManager, VersionType } from '../../../../../lib/version/ActivityVersionManager';

async function versionsHandler(req: NextApiRequest, res: NextApiResponse) {
  // 獲取用戶信息
  const session = await getSession({ req });
  const user = session?.user || (req as any).testUser;
  
  if (!session && !(req as any).testUser) {
    return res.status(401).json({ 
      error: '未授權訪問',
      message: '請先登入以訪問版本管理功能',
      code: 'UNAUTHORIZED'
    });
  }

  const { method } = req;
  const { id: activityId } = req.query;

  if (!activityId || typeof activityId !== 'string') {
    return res.status(400).json({
      error: '無效的活動ID',
      message: '請提供有效的活動ID',
      code: 'INVALID_ACTIVITY_ID'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGetVersions(req, res, activityId, user);
      case 'POST':
        return await handleCreateVersion(req, res, activityId, user);
      default:
        return res.status(405).json({ error: '方法不允許' });
    }
  } catch (error) {
    console.error('版本管理API錯誤:', error);
    return res.status(500).json({
      error: '版本管理服務暫時不可用',
      message: error instanceof Error ? error.message : '未知錯誤',
      code: 'VERSION_SERVICE_ERROR'
    });
  }
}

/**
 * 獲取版本歷史
 */
async function handleGetVersions(
  req: NextApiRequest,
  res: NextApiResponse,
  activityId: string,
  user: any
) {
  const {
    limit = 50,
    offset = 0,
    includeSnapshots = 'true',
    branchName,
    fromDate,
    toDate,
    userId
  } = req.query;

  try {
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      includeSnapshots: includeSnapshots === 'true',
      branchName: branchName as string,
      fromDate: fromDate ? new Date(fromDate as string) : undefined,
      toDate: toDate ? new Date(toDate as string) : undefined,
      userId: userId as string
    };

    const result = await ActivityVersionManager.getVersionHistory(activityId, options);

    return res.status(200).json({
      success: true,
      data: result,
      meta: {
        activityId,
        requestedBy: user.id,
        timestamp: new Date().toISOString(),
        options
      }
    });
  } catch (error) {
    console.error('獲取版本歷史失敗:', error);
    return res.status(500).json({
      error: '獲取版本歷史失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
      code: 'GET_VERSIONS_ERROR'
    });
  }
}

/**
 * 創建新版本
 */
async function handleCreateVersion(
  req: NextApiRequest,
  res: NextApiResponse,
  activityId: string,
  user: any
) {
  const {
    content,
    type = VersionType.AUTO,
    title,
    description,
    tags = [],
    changes,
    parentVersion
  } = req.body;

  // 驗證必要參數
  if (!content) {
    return res.status(400).json({
      error: '缺少內容數據',
      message: '請提供要保存的內容',
      code: 'MISSING_CONTENT'
    });
  }

  try {
    const versionInfo = await ActivityVersionManager.createVersion(activityId, content, {
      type,
      title,
      description,
      tags,
      userId: user.id,
      changes,
      parentVersion
    });

    return res.status(201).json({
      success: true,
      data: versionInfo,
      message: '版本創建成功',
      meta: {
        activityId,
        createdBy: user.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('創建版本失敗:', error);
    return res.status(500).json({
      error: '創建版本失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
      code: 'CREATE_VERSION_ERROR'
    });
  }
}

// 使用測試認證中間件包裝處理器
export default withTestAuth(versionsHandler);
