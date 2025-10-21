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
import sharp from 'sharp';
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
    const alt = formData.get('alt') as string | null;
    const tagsStr = formData.get('tags') as string | null;

    // 收集所有文件
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);
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

        // 使用 sharp 處理圖片
        let imageBuffer = buffer;
        let metadata = await sharp(buffer).metadata();

        // 驗證圖片尺寸
        if (!metadata.width || !metadata.height) {
          result.failed.push({
            fileName: file.name,
            reason: '無法讀取圖片尺寸',
          });
          continue;
        }

        if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
          result.failed.push({
            fileName: file.name,
            reason: `圖片尺寸超過限制（最大 ${MAX_WIDTH}x${MAX_HEIGHT}）`,
          });
          continue;
        }

        // 壓縮圖片
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          imageBuffer = await sharp(buffer)
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
        } else if (file.type === 'image/png') {
          imageBuffer = await sharp(buffer)
            .png({ compressionLevel: 9 })
            .toBuffer();
        } else if (file.type === 'image/webp') {
          imageBuffer = await sharp(buffer)
            .webp({ quality: 85 })
            .toBuffer();
        }

        // 重新獲取元數據
        metadata = await sharp(imageBuffer).metadata();

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
            width: metadata.width || 0,
            height: metadata.height || 0,
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

