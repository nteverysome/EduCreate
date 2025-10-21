/**
 * 批量圖片上傳 API
 * POST /api/images/batch-upload
 * 
 * 功能：
 * - 批量上傳多張圖片（最多 10 張）
 * - 文件驗證
 * - 圖片壓縮
 * - 上傳到 Vercel Blob
 * - 保存元數據到數據庫
 * - 返回上傳進度和結果
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

// 允許的圖片類型
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// 最大文件大小（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 最大圖片尺寸
const MAX_WIDTH = 4096;
const MAX_HEIGHT = 4096;

// 最大批量上傳數量
const MAX_BATCH_SIZE = 10;

interface UploadResult {
  success: Array<{
    id: string;
    url: string;
    fileName: string;
    fileSize: number;
    width: number;
    height: number;
  }>;
  failed: Array<{
    fileName: string;
    reason: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // 1. 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. 檢查環境變量
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN 未設置');
      return NextResponse.json(
        { error: 'Blob Storage 配置錯誤' },
        { status: 500 }
      );
    }

    // 3. 獲取表單數據
    const formData = await request.formData();
    const files: File[] = [];
    const fileDimensions: Map<string, { width: number; height: number }> = new Map();
    const alt = formData.get('alt') as string | null;
    const tagsStr = formData.get('tags') as string | null;

    // 收集所有文件和尺寸信息
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);

        // 獲取對應的尺寸信息（格式：width_0, height_0, width_1, height_1, ...）
        const fileIndex = key.replace('file', '');
        const widthStr = formData.get(`width${fileIndex}`) as string | null;
        const heightStr = formData.get(`height${fileIndex}`) as string | null;

        if (widthStr && heightStr) {
          fileDimensions.set(value.name, {
            width: parseInt(widthStr, 10),
            height: parseInt(heightStr, 10),
          });
        }
      }
    }

    // 4. 驗證文件數量
    if (files.length === 0) {
      return NextResponse.json(
        { error: '缺少文件' },
        { status: 400 }
      );
    }

    if (files.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `一次最多上傳 ${MAX_BATCH_SIZE} 張圖片` },
        { status: 400 }
      );
    }

    // 5. 解析標籤
    let tags: string[] = [];
    if (tagsStr) {
      try {
        tags = JSON.parse(tagsStr);
        if (!Array.isArray(tags)) {
          throw new Error('標籤必須是數組');
        }
      } catch (error) {
        return NextResponse.json(
          { error: '標籤格式錯誤' },
          { status: 400 }
        );
      }
    }

    const result: UploadResult = {
      success: [],
      failed: [],
    };

    // 6. 處理每個文件
    for (const file of files) {
      try {
        // 驗證文件類型
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          result.failed.push({
            fileName: file.name,
            reason: `不支持的文件類型: ${file.type}`,
          });
          continue;
        }

        // 驗證文件大小
        if (file.size > MAX_FILE_SIZE) {
          result.failed.push({
            fileName: file.name,
            reason: `文件大小超過限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`,
          });
          continue;
        }

        // 讀取文件內容
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 前端已經處理好圖片（裁剪、旋轉、壓縮等）
        // 服務器端只需要接收並上傳到 Vercel Blob
        const imageBuffer = buffer;

        // 獲取圖片尺寸（從前端傳遞或使用默認值）
        const dimensions = fileDimensions.get(file.name);
        const width = dimensions?.width || 0;
        const height = dimensions?.height || 0;

        // 驗證圖片尺寸
        if (width === 0 || height === 0) {
          result.failed.push({
            fileName: file.name,
            reason: '缺少圖片尺寸信息',
          });
          continue;
        }

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          result.failed.push({
            fileName: file.name,
            reason: `圖片尺寸超過限制（最大 ${MAX_WIDTH}x${MAX_HEIGHT}）`,
          });
          continue;
        }

        // 生成唯一文件名
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop() || 'jpg';
        const fileName = `${timestamp}-${randomStr}.${extension}`;
        const blobPath = `user-uploads/${userId}/${fileName}`;

        // 上傳到 Vercel Blob
        const blob = await put(blobPath, imageBuffer, {
          access: 'public',
          contentType: file.type,
        });

        // 保存到數據庫
        const userImage = await prisma.userImage.create({
          data: {
            userId,
            url: blob.url,
            blobPath: blob.pathname,
            fileName: file.name,
            fileSize: imageBuffer.length,
            mimeType: file.type,
            width,
            height,
            source: 'upload',
            alt: alt || null,
            tags,
          },
        });

        result.success.push({
          id: userImage.id,
          url: userImage.url,
          fileName: userImage.fileName,
          fileSize: userImage.fileSize,
          width: userImage.width || 0,
          height: userImage.height || 0,
        });

      } catch (error) {
        result.failed.push({
          fileName: file.name,
          reason: error instanceof Error ? error.message : '上傳失敗',
        });
      }
    }

    console.log('批量上傳結果:', {
      total: files.length,
      success: result.success.length,
      failed: result.failed.length,
    });

    return NextResponse.json({
      success: true,
      message: `成功上傳 ${result.success.length} 張圖片`,
      result: {
        total: files.length,
        successCount: result.success.length,
        failedCount: result.failed.length,
        details: result,
      },
    });

  } catch (error) {
    console.error('批量上傳失敗:', error);
    return NextResponse.json(
      {
        error: '批量上傳失敗',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// OPTIONS 處理（CORS）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

