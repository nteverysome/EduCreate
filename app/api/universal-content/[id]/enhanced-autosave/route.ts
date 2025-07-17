/**
 * EduCreate Enhanced AutoSave API
 * 基於 EDUCREAT_COMPREHENSIVE_ANALYSIS_AND_ROADMAP.md A.1 規範實現
 * 支持壓縮數據、性能監控、版本控制和衝突解決
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';

// 請求驗證 Schema
const EnhancedAutoSaveRequestSchema = z.object({
  guid: z.string().uuid('無效的 GUID 格式'),
  sessionId: z.string().min(1, 'Session ID 不能為空'),
  content: z.object({
    id: z.string().optional(),
    title: z.string().min(1, '標題不能為空'),
    description: z.string().optional(),
    content: z.string().optional(),
    gameType: z.string().optional(),
    settings: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
  }),
  contentHash: z.string().min(1, '內容哈希不能為空'),
  changeType: z.enum(['typing', 'paste', 'delete', 'template-switch', 'manual']),
  changeCount: z.number().min(0).optional().default(1),
  isCompressed: z.boolean().optional().default(false),
  templateId: z.number().optional(),
  folderId: z.number().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

// 響應類型定義
interface EnhancedAutoSaveResponse {
  success: boolean;
  guid: string;
  sessionId: string;
  savedAt: string;
  version: number;
  saveCount: number;
  nextSaveIn: number;
  compressionRatio?: number;
  responseTime: number;
  conflictStatus: 'none' | 'resolved' | 'pending';
  error?: string;
  metadata?: Record<string, any>;
}

// 模擬數據庫連接 (實際項目中應使用真實數據庫)
class AutoSaveDatabase {
  private static saveCount = new Map<string, number>();
  private static versionCount = new Map<string, number>();

  static async saveEvent(data: any): Promise<void> {
    // 實際實現中應該插入到 autosave_events 表
    console.log('保存自動保存事件到數據庫:', {
      activity_guid: data.guid,
      user_id: data.userId || 1,
      change_type: data.changeType,
      save_reason: 'interval',
      response_time: data.responseTime,
      compression_ratio: data.compressionRatio,
      content_hash: data.contentHash,
      session_id: data.sessionId,
      version_number: data.version,
      success: true,
      metadata: data.metadata,
    });
  }

  static getSaveCount(guid: string): number {
    return this.saveCount.get(guid) || 0;
  }

  static incrementSaveCount(guid: string): number {
    const current = this.getSaveCount(guid);
    const newCount = current + 1;
    this.saveCount.set(guid, newCount);
    return newCount;
  }

  static getVersion(guid: string): number {
    return this.versionCount.get(guid) || 1;
  }

  static incrementVersion(guid: string): number {
    const current = this.getVersion(guid);
    const newVersion = current + 1;
    this.versionCount.set(guid, newVersion);
    return newVersion;
  }
}

// 壓縮處理函數
function processCompressedData(data: string, isCompressed: boolean): {
  decompressed: any;
  compressionRatio: number;
} {
  if (!isCompressed) {
    return {
      decompressed: JSON.parse(data),
      compressionRatio: 1.0
    };
  }

  try {
    // 實際實現中應該使用真實的解壓縮算法 (如 zlib, gzip)
    // 這裡模擬解壓縮過程
    const decompressed = JSON.parse(data);
    const originalSize = JSON.stringify(decompressed).length;
    const compressedSize = data.length;
    const compressionRatio = originalSize / compressedSize;

    return {
      decompressed,
      compressionRatio: Math.round(compressionRatio * 100) / 100
    };
  } catch (error) {
    throw new Error('解壓縮數據失敗');
  }
}

// 內容哈希驗證
function validateContentHash(content: any, providedHash: string): boolean {
  const contentString = JSON.stringify(content);
  const calculatedHash = createHash('sha256').update(contentString).digest('hex');
  return calculatedHash === providedHash;
}

// 衝突檢測和解決
function detectAndResolveConflicts(
  guid: string,
  sessionId: string,
  version: number
): 'none' | 'resolved' | 'pending' {
  // 實際實現中應該檢查數據庫中的版本衝突
  // 這裡模擬衝突檢測邏輯
  const currentVersion = AutoSaveDatabase.getVersion(guid);
  
  if (version < currentVersion) {
    // 檢測到版本衝突，嘗試自動解決
    console.log(`檢測到版本衝突: 提供版本 ${version}, 當前版本 ${currentVersion}`);
    return 'resolved'; // 模擬自動解決
  }
  
  return 'none';
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<EnhancedAutoSaveResponse>> {
  const startTime = Date.now();
  
  try {
    // 1. 解析請求參數
    const activityId = params.id;
    if (!activityId) {
      return NextResponse.json({
        success: false,
        guid: '',
        sessionId: '',
        savedAt: new Date().toISOString(),
        version: 0,
        saveCount: 0,
        nextSaveIn: 2000,
        responseTime: Date.now() - startTime,
        conflictStatus: 'none',
        error: '缺少活動 ID'
      }, { status: 400 });
    }

    // 2. 解析請求體
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json({
        success: false,
        guid: '',
        sessionId: '',
        savedAt: new Date().toISOString(),
        version: 0,
        saveCount: 0,
        nextSaveIn: 2000,
        responseTime: Date.now() - startTime,
        conflictStatus: 'none',
        error: '無效的 JSON 格式'
      }, { status: 400 });
    }

    // 3. 驗證請求數據
    const validationResult = EnhancedAutoSaveRequestSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        guid: requestBody.guid || '',
        sessionId: requestBody.sessionId || '',
        savedAt: new Date().toISOString(),
        version: 0,
        saveCount: 0,
        nextSaveIn: 2000,
        responseTime: Date.now() - startTime,
        conflictStatus: 'none',
        error: `驗證失敗: ${validationResult.error.errors.map(e => e.message).join(', ')}`
      }, { status: 400 });
    }

    const {
      guid,
      sessionId,
      content,
      contentHash,
      changeType,
      changeCount,
      isCompressed,
      templateId,
      folderId,
      metadata
    } = validationResult.data;

    // 4. 處理壓縮數據
    const { decompressed, compressionRatio } = processCompressedData(
      JSON.stringify(content),
      isCompressed || false
    );

    // 5. 驗證內容哈希
    if (!validateContentHash(decompressed, contentHash)) {
      return NextResponse.json({
        success: false,
        guid,
        sessionId,
        savedAt: new Date().toISOString(),
        version: 0,
        saveCount: 0,
        nextSaveIn: 2000,
        responseTime: Date.now() - startTime,
        conflictStatus: 'none',
        error: '內容哈希驗證失敗'
      }, { status: 400 });
    }

    // 6. 獲取當前版本和保存計數
    const currentVersion = AutoSaveDatabase.getVersion(guid);
    const newVersion = AutoSaveDatabase.incrementVersion(guid);
    const saveCount = AutoSaveDatabase.incrementSaveCount(guid);

    // 7. 檢測和解決衝突
    const conflictStatus = detectAndResolveConflicts(guid, sessionId, currentVersion);

    // 8. 保存到數據庫
    const responseTime = Date.now() - startTime;
    await AutoSaveDatabase.saveEvent({
      guid,
      sessionId,
      changeType,
      contentHash,
      compressionRatio,
      responseTime,
      version: newVersion,
      metadata: {
        ...metadata,
        activityId,
        templateId,
        folderId,
        changeCount,
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
      }
    });

    // 9. 返回成功響應
    const response: EnhancedAutoSaveResponse = {
      success: true,
      guid,
      sessionId,
      savedAt: new Date().toISOString(),
      version: newVersion,
      saveCount,
      nextSaveIn: 2000, // 2秒間隔
      compressionRatio: isCompressed ? compressionRatio : undefined,
      responseTime,
      conflictStatus,
      metadata: {
        activityId,
        changeType,
        changeCount,
        templateId,
        folderId
      }
    };

    // 10. 設置性能相關的響應頭
    const headers = new Headers();
    headers.set('X-Response-Time', responseTime.toString());
    headers.set('X-Save-Count', saveCount.toString());
    headers.set('X-Version', newVersion.toString());
    headers.set('X-Compression-Ratio', compressionRatio.toString());
    headers.set('X-Conflict-Status', conflictStatus);

    return NextResponse.json(response, { 
      status: 200,
      headers 
    });

  } catch (error) {
    console.error('Enhanced AutoSave API 錯誤:', error);
    
    const responseTime = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      guid: '',
      sessionId: '',
      savedAt: new Date().toISOString(),
      version: 0,
      saveCount: 0,
      nextSaveIn: 2000,
      responseTime,
      conflictStatus: 'none',
      error: error instanceof Error ? error.message : '內部服務器錯誤'
    }, { status: 500 });
  }
}

// 支持 OPTIONS 請求 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Compression-Enabled, X-Compression-Algorithm, X-Compression-Ratio, X-Content-Hash, X-Session-ID, X-Content-Version, X-Original-Size, X-Compressed-Size',
    },
  });
}
