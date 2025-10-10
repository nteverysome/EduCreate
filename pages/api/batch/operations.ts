/**
 * 批量操作 API 端點
 * 處理批量操作的創建、查詢、取消等請求
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { batchOperationManager, BatchOperationRequest, BatchOperationType } from '../../../lib/batch/BatchOperationManager';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    // 驗證用戶認證
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: '需要用戶認證'
      });
    }

    const userId = session.user.id;

    switch (req.method) {
      case 'GET':
        return handleGetOperations(req, res, userId);
      case 'POST':
        return handleCreateOperation(req, res, userId);
      case 'PUT':
        return handleUpdateOperation(req, res, userId);
      case 'DELETE':
        return handleCancelOperation(req, res, userId);
      default:
        return res.status(405).json({
          success: false,
          error: 'METHOD_NOT_ALLOWED',
          message: `不支持的 HTTP 方法: ${req.method}`
        });
    }
  } catch (error) {
    console.error('批量操作 API 錯誤:', error);
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: '服務器內部錯誤'
    });
  }
}

/**
 * 獲取批量操作列表
 */
async function handleGetOperations(req: NextApiRequest, res: NextApiResponse<ApiResponse>, userId: string) {
  try {
    const { operationId, status, limit = '10', offset = '0' } = req.query;

    // 獲取特定操作
    if (operationId && typeof operationId === 'string') {
      const operation = batchOperationManager.getBatchOperation(operationId);
      
      if (!operation) {
        return res.status(404).json({
          success: false,
          error: 'OPERATION_NOT_FOUND',
          message: '找不到指定的批量操作'
        });
      }

      // 檢查權限
      if (operation.metadata.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: '無權限訪問此操作'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          operation
        }
      });
    }

    // 獲取用戶的所有操作
    let operations = batchOperationManager.getUserBatchOperations(userId);

    // 按狀態過濾
    if (status && typeof status === 'string') {
      operations = operations.filter(op => op.status === status);
    }

    // 分頁
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    const paginatedOperations = operations.slice(offsetNum, offsetNum + limitNum);

    return res.status(200).json({
      success: true,
      data: {
        operations: paginatedOperations,
        total: operations.length,
        limit: limitNum,
        offset: offsetNum
      }
    });
  } catch (error) {
    console.error('獲取批量操作錯誤:', error);
    return res.status(500).json({
      success: false,
      error: 'FETCH_OPERATIONS_ERROR',
      message: '獲取批量操作失敗'
    });
  }
}

/**
 * 創建批量操作
 */
async function handleCreateOperation(req: NextApiRequest, res: NextApiResponse<ApiResponse>, userId: string) {
  try {
    const { type, items, options } = req.body as BatchOperationRequest;

    // 驗證請求數據
    if (!type || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: '無效的請求數據：缺少操作類型或項目列表'
      });
    }

    // 驗證操作類型
    if (!Object.values(BatchOperationType).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_OPERATION_TYPE',
        message: `不支持的操作類型: ${type}`
      });
    }

    // 驗證項目數量限制
    if (items.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'TOO_MANY_ITEMS',
        message: '批量操作項目數量不能超過 1000 個'
      });
    }

    // 驗證項目格式
    for (const item of items) {
      if (!item.id || !item.type || !item.path || !item.name) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_ITEM_FORMAT',
          message: '項目格式無效：缺少必要字段'
        });
      }
    }

    // 創建批量操作
    const operationId = await batchOperationManager.createBatchOperation({
      type,
      items,
      options: {
        conflictResolution: 'skip',
        preserveMetadata: true,
        createBackup: false,
        notifyUsers: false,
        priority: 'normal',
        ...options
      }
    }, userId);

    return res.status(201).json({
      success: true,
      data: {
        operationId,
        message: '批量操作已創建並開始執行'
      }
    });
  } catch (error) {
    console.error('創建批量操作錯誤:', error);
    return res.status(500).json({
      success: false,
      error: 'CREATE_OPERATION_ERROR',
      message: '創建批量操作失敗'
    });
  }
}

/**
 * 更新批量操作（暫停/恢復）
 */
async function handleUpdateOperation(req: NextApiRequest, res: NextApiResponse<ApiResponse>, userId: string) {
  try {
    const { operationId, action } = req.body;

    if (!operationId || !action) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: '缺少操作 ID 或動作'
      });
    }

    // 檢查操作是否存在
    const operation = batchOperationManager.getBatchOperation(operationId);
    if (!operation) {
      return res.status(404).json({
        success: false,
        error: 'OPERATION_NOT_FOUND',
        message: '找不到指定的批量操作'
      });
    }

    // 檢查權限
    if (operation.metadata.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '無權限操作此批量操作'
      });
    }

    let success = false;
    let message = '';

    switch (action) {
      case 'pause':
        success = await batchOperationManager.pauseBatchOperation(operationId);
        message = success ? '操作已暫停' : '無法暫停操作';
        break;
      case 'resume':
        success = await batchOperationManager.resumeBatchOperation(operationId);
        message = success ? '操作已恢復' : '無法恢復操作';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'INVALID_ACTION',
          message: `不支持的動作: ${action}`
        });
    }

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'OPERATION_FAILED',
        message
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        operationId,
        action,
        message
      }
    });
  } catch (error) {
    console.error('更新批量操作錯誤:', error);
    return res.status(500).json({
      success: false,
      error: 'UPDATE_OPERATION_ERROR',
      message: '更新批量操作失敗'
    });
  }
}

/**
 * 取消批量操作
 */
async function handleCancelOperation(req: NextApiRequest, res: NextApiResponse<ApiResponse>, userId: string) {
  try {
    const { operationId } = req.query;

    if (!operationId || typeof operationId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: '缺少操作 ID'
      });
    }

    // 檢查操作是否存在
    const operation = batchOperationManager.getBatchOperation(operationId);
    if (!operation) {
      return res.status(404).json({
        success: false,
        error: 'OPERATION_NOT_FOUND',
        message: '找不到指定的批量操作'
      });
    }

    // 檢查權限
    if (operation.metadata.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: '無權限取消此批量操作'
      });
    }

    // 取消操作
    const success = await batchOperationManager.cancelBatchOperation(operationId);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: 'CANCEL_FAILED',
        message: '無法取消操作，可能操作已完成或不在運行狀態'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        operationId,
        message: '批量操作已取消'
      }
    });
  } catch (error) {
    console.error('取消批量操作錯誤:', error);
    return res.status(500).json({
      success: false,
      error: 'CANCEL_OPERATION_ERROR',
      message: '取消批量操作失敗'
    });
  }
}

// 定期清理完成的操作
setInterval(() => {
  try {
    batchOperationManager.cleanupCompletedOperations();
  } catch (error) {
    console.error('清理批量操作錯誤:', error);
  }
}, 60 * 60 * 1000); // 每小時清理一次
