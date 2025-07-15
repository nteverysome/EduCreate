/**
 * 增強自動保存 API - 基於 Wordwall 深度分析結果
 * 實現 2 秒間隔、GUID 追蹤、數據壓縮等功能
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/prisma';
import pako from 'pako';
import crypto from 'crypto';

interface EnhancedAutoSavePayload {
  guid: string; // 活動 GUID (基於 Wordwall 模式)
  sessionId: string; // Session 追蹤
  version: number; // 版本號追蹤
  content: any; // 活動內容
  contentHash: string; // 內容哈希
  changeType: 'typing' | 'paste' | 'delete' | 'template-switch'; // 變更類型
  changeCount: number; // 變更計數
  isCompressed: boolean; // 是否壓縮
  templateId?: number; // 模板 ID
  folderId?: number; // 檔案夾 ID
  lastModified: string; // 最後修改時間
  isAutoSave: boolean; // 是否為自動保存
  metadata: {
    userAgent: string;
    timestamp: string;
    saveReason: 'interval' | 'change' | 'manual' | 'page-switch'; // 保存原因
    compressionRatio?: number; // 壓縮比例
    responseTime?: number; // 響應時間
  };
}

interface AutoSaveResponse {
  success: boolean;
  guid: string;
  sessionId: string;
  version: number; // 版本號
  lastSaved: string;
  saveCount: number;
  nextSaveIn: number; // 下次保存倒計時 (毫秒)
  compressionRatio?: number; // 壓縮比例
  responseTime: number; // 響應時間
  conflictDetected?: boolean; // 是否檢測到衝突
  conflictResolved?: boolean; // 衝突是否已解決
  performanceMetrics?: {
    targetResponseTime: number;
    targetSuccessRate: number;
    currentResponseTime: number;
    performanceOk: boolean;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AutoSaveResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      guid: '',
      sessionId: '',
      lastSaved: '',
      saveCount: 0,
      nextSaveIn: 2000,
      error: 'Method not allowed'
    });
  }

  try {
    // 驗證用戶身份
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        guid: '',
        sessionId: '',
        lastSaved: '',
        saveCount: 0,
        nextSaveIn: 2000,
        error: 'Unauthorized'
      });
    }

    const { id } = req.query;
    const payload: EnhancedAutoSavePayload = req.body;

    // 驗證必要字段
    if (!payload.guid || !payload.sessionId || !payload.content) {
      return res.status(400).json({
        success: false,
        guid: payload.guid || '',
        sessionId: payload.sessionId || '',
        lastSaved: '',
        saveCount: 0,
        nextSaveIn: 2000,
        error: 'Missing required fields'
      });
    }

    // 獲取用戶信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        guid: payload.guid,
        sessionId: payload.sessionId,
        lastSaved: '',
        saveCount: 0,
        nextSaveIn: 2000,
        error: 'User not found'
      });
    }

    // 處理數據壓縮 (基於 Wordwall ZIP 壓縮模式)
    let processedContent = payload.content;
    let compressionRatio = 1;

    if (payload.isCompressed) {
      try {
        const originalSize = JSON.stringify(payload.content).length;
        const compressed = pako.gzip(JSON.stringify(payload.content));
        const compressedSize = compressed.length;
        compressionRatio = originalSize / compressedSize;
        
        // 存儲壓縮數據
        processedContent = {
          compressed: true,
          data: Array.from(compressed), // 轉換為數組以便 JSON 序列化
          originalSize,
          compressedSize
        };
      } catch (compressionError) {
        console.error('壓縮失敗:', compressionError);
        // 壓縮失敗時使用原始數據
      }
    }

    // 檢查是否為新活動或現有活動
    let activity;
    const activityId = id as string;

    if (activityId === 'new' || activityId === '0') {
      // 創建新活動 (基於 Wordwall 的創建模式)
      activity = await prisma.universalContent.create({
        data: {
          title: payload.content.title || 'Untitled Activity',
          content: processedContent,
          contentType: payload.content.type || 'mixed',
          geptLevel: payload.content.geptLevel || 'elementary',
          userId: user.id,
          guid: payload.guid, // 存儲 GUID
          sessionId: payload.sessionId, // 存儲 Session ID
          templateId: payload.templateId,
          folderId: payload.folderId,
          metadata: {
            ...payload.metadata,
            contentHash: payload.contentHash,
            changeCount: payload.changeCount,
            compressionRatio,
            autoSaveVersion: '2.0' // 標記為增強版自動保存
          },
          isAutoSave: true,
          lastModified: new Date()
        }
      });
    } else {
      // 更新現有活動
      activity = await prisma.universalContent.findFirst({
        where: {
          id: parseInt(activityId),
          userId: user.id
        }
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          guid: payload.guid,
          sessionId: payload.sessionId,
          lastSaved: '',
          saveCount: 0,
          nextSaveIn: 2000,
          error: 'Activity not found'
        });
      }

      // 檢查內容是否真的有變更 (基於哈希比較)
      const currentHash = crypto
        .createHash('md5')
        .update(JSON.stringify(activity.content))
        .digest('hex');

      if (currentHash === payload.contentHash && payload.changeType !== 'manual') {
        // 內容沒有變更，返回成功但不實際保存
        return res.status(200).json({
          success: true,
          guid: payload.guid,
          sessionId: payload.sessionId,
          lastSaved: activity.lastModified.toISOString(),
          saveCount: (activity.metadata as any)?.saveCount || 0,
          nextSaveIn: 2000,
          compressionRatio
        });
      }

      // 更新活動
      activity = await prisma.universalContent.update({
        where: { id: activity.id },
        data: {
          title: payload.content.title || activity.title,
          content: processedContent,
          sessionId: payload.sessionId,
          metadata: {
            ...(activity.metadata as any),
            ...payload.metadata,
            contentHash: payload.contentHash,
            changeCount: payload.changeCount,
            compressionRatio,
            saveCount: ((activity.metadata as any)?.saveCount || 0) + 1,
            lastChangeType: payload.changeType
          },
          isAutoSave: true,
          lastModified: new Date()
        }
      });
    }

    // 記錄自動保存事件 (用於分析和優化)
    await prisma.autoSaveEvent.create({
      data: {
        activityId: activity.id,
        userId: user.id,
        guid: payload.guid,
        sessionId: payload.sessionId,
        changeType: payload.changeType,
        changeCount: payload.changeCount,
        saveReason: payload.metadata.saveReason,
        compressionRatio,
        responseTime: Date.now() - new Date(payload.metadata.timestamp).getTime(),
        metadata: payload.metadata
      }
    }).catch(error => {
      // 記錄事件失敗不應影響主要保存流程
      console.error('記錄自動保存事件失敗:', error);
    });

    // 返回成功響應 (基於 Wordwall 響應格式)
    return res.status(200).json({
      success: true,
      guid: payload.guid,
      sessionId: payload.sessionId,
      lastSaved: activity.lastModified.toISOString(),
      saveCount: (activity.metadata as any)?.saveCount || 1,
      nextSaveIn: 2000, // 基於測試結果的 2 秒間隔
      compressionRatio: compressionRatio > 1 ? compressionRatio : undefined
    });

  } catch (error) {
    console.error('增強自動保存失敗:', error);
    
    return res.status(500).json({
      success: false,
      guid: req.body.guid || '',
      sessionId: req.body.sessionId || '',
      lastSaved: '',
      saveCount: 0,
      nextSaveIn: 2000,
      error: 'Internal server error'
    });
  }
}

/**
 * 生成 GUID (基於 Wordwall 格式)
 */
export function generateGUID(): string {
  return crypto.randomUUID();
}

/**
 * 生成 Session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 計算內容哈希
 */
export function calculateContentHash(content: any): string {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(content))
    .digest('hex');
}
