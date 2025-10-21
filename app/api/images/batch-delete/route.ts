/**
 * 批量刪除圖片 API
 * POST /api/images/batch-delete
 * 
 * 功能：
 * - 批量刪除多張圖片
 * - 權限檢查
 * - 刪除 Vercel Blob 文件
 * - 刪除數據庫記錄
 * - 返回刪除結果統計
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

interface DeleteResult {
  success: string[];
  failed: Array<{
    id: string;
    reason: string;
  }>;
  skipped: Array<{
    id: string;
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

    // 2. 獲取圖片 ID 列表
    const body = await request.json();
    const { imageIds } = body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: '缺少圖片 ID 列表' },
        { status: 400 }
      );
    }

    // 限制批量刪除數量
    if (imageIds.length > 50) {
      return NextResponse.json(
        { error: '一次最多刪除 50 張圖片' },
        { status: 400 }
      );
    }

    const result: DeleteResult = {
      success: [],
      failed: [],
      skipped: [],
    };

    // 3. 查詢所有圖片
    const images = await prisma.userImage.findMany({
      where: {
        id: { in: imageIds },
      },
      include: {
        activityImages: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // 4. 處理每張圖片
    for (const imageId of imageIds) {
      const image = images.find(img => img.id === imageId);

      // 圖片不存在
      if (!image) {
        result.failed.push({
          id: imageId,
          reason: '圖片不存在',
        });
        continue;
      }

      // 權限檢查
      if (image.userId !== session.user.id) {
        result.failed.push({
          id: imageId,
          reason: '無權刪除此圖片',
        });
        continue;
      }

      // 檢查是否被活動使用
      if (image.activityImages.length > 0) {
        result.skipped.push({
          id: imageId,
          reason: `正在被 ${image.activityImages.length} 個活動使用`,
        });
        continue;
      }

      try {
        // 刪除 Vercel Blob 文件
        if (image.source === 'upload' && image.blobPath) {
          try {
            await del(image.blobPath);
          } catch (error) {
            console.error('刪除 Vercel Blob 文件失敗:', error);
            // 繼續刪除數據庫記錄
          }
        }

        // 刪除數據庫記錄
        await prisma.userImage.delete({
          where: { id: imageId },
        });

        result.success.push(imageId);
      } catch (error) {
        result.failed.push({
          id: imageId,
          reason: error instanceof Error ? error.message : '刪除失敗',
        });
      }
    }

    console.log('批量刪除結果:', {
      total: imageIds.length,
      success: result.success.length,
      failed: result.failed.length,
      skipped: result.skipped.length,
    });

    return NextResponse.json({
      success: true,
      message: `成功刪除 ${result.success.length} 張圖片`,
      result: {
        total: imageIds.length,
        successCount: result.success.length,
        failedCount: result.failed.length,
        skippedCount: result.skipped.length,
        details: result,
      },
    });

  } catch (error) {
    console.error('批量刪除圖片失敗:', error);
    return NextResponse.json(
      {
        error: '批量刪除圖片失敗',
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

