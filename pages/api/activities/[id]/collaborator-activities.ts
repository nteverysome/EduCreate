/**
 * 協作者活動API
 * 處理協作者活動記錄、查詢等操作
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { withTestAuth } from '../../../../middleware/withTestAuth';
import { ActivityVersionManager } from '../../../../lib/version/ActivityVersionManager';

async function collaboratorActivitiesHandler(req: NextApiRequest, res: NextApiResponse) {
  // 獲取用戶信息
  const session = await getSession({ req });
  const user = session?.user || (req as any).testUser;
  
  if (!session && !(req as any).testUser) {
    return res.status(401).json({ 
      error: '未授權訪問',
      message: '請先登入以查看協作者活動',
      code: 'UNAUTHORIZED'
    });
  }

  // 只允許GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }

  const { id: activityId } = req.query;
  const {
    limit = 50,
    offset = 0,
    userId,
    fromDate,
    toDate,
    actionType
  } = req.query;

  // 驗證參數
  if (!activityId || typeof activityId !== 'string') {
    return res.status(400).json({
      error: '無效的活動ID',
      message: '請提供有效的活動ID',
      code: 'INVALID_ACTIVITY_ID'
    });
  }

  try {
    const options = {
      limit: Number(limit),
      offset: Number(offset),
      userId: userId as string,
      fromDate: fromDate ? new Date(fromDate as string) : undefined,
      toDate: toDate ? new Date(toDate as string) : undefined
    };

    // 驗證日期範圍
    if (options.fromDate && options.toDate && options.fromDate > options.toDate) {
      return res.status(400).json({
        error: '無效的日期範圍',
        message: '開始日期不能晚於結束日期',
        code: 'INVALID_DATE_RANGE'
      });
    }

    const result = await ActivityVersionManager.getCollaboratorActivities(activityId, options);

    // 如果指定了動作類型，進行過濾
    let filteredActivities = result.activities;
    if (actionType && typeof actionType === 'string') {
      filteredActivities = result.activities.filter(activity => 
        activity.action.includes(actionType)
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        activities: filteredActivities,
        total: filteredActivities.length,
        originalTotal: result.total
      },
      meta: {
        activityId,
        requestedBy: user.id,
        timestamp: new Date().toISOString(),
        options: {
          ...options,
          actionType
        }
      }
    });
  } catch (error) {
    console.error('獲取協作者活動失敗:', error);
    return res.status(500).json({
      error: '獲取協作者活動失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
      code: 'GET_COLLABORATOR_ACTIVITIES_ERROR'
    });
  }
}

// 使用測試認證中間件包裝處理器
export default withTestAuth(collaboratorActivitiesHandler);
