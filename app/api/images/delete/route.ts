/**
 * 圖片刪除 API
 * DELETE /api/images/delete
 * 
 * 功能：
 * - 權限檢查（只能刪除自己的圖片）
 * - 刪除 Vercel Blob 文件
 * - 刪除數據庫記錄
 * - 檢查圖片是否被活動使用
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function DELETE(request: NextRequest) {
  try {
    // 1. 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    // 2. 獲取圖片 ID
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { error: '缺少圖片 ID' },
        { status: 400 }
      );
    }

    // 3. 查詢圖片
    const image = await prisma.userImage.findUnique({
      where: { id: imageId },
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

    if (!image) {
      return NextResponse.json(
        { error: '圖片不存在' },
        { status: 404 }
      );
    }

    // 4. 權限檢查
    if (image.userId !== session.user.id) {
      return NextResponse.json(
        { error: '無權刪除此圖片' },
        { status: 403 }
      );
    }

    // 5. 檢查圖片是否被活動使用
    if (image.activityImages.length > 0) {
      const activities = image.activityImages.map(ai => ai.activity.title);
      return NextResponse.json(
        {
          error: '圖片正在被使用，無法刪除',
          usedBy: activities,
          activityCount: image.activityImages.length,
        },
        { status: 400 }
      );
    }

    // 6. 刪除 Vercel Blob 文件（如果是上傳的圖片）
    if (image.source === 'upload' && image.blobPath) {
      try {
        await del(image.blobPath);
        console.log('Vercel Blob 文件已刪除:', image.blobPath);
      } catch (error) {
        console.error('刪除 Vercel Blob 文件失敗:', error);
        // 繼續刪除數據庫記錄，即使 Blob 刪除失敗
      }
    }

    // 7. 刪除數據庫記錄
    await prisma.userImage.delete({
      where: { id: imageId },
    });

    console.log('圖片已刪除:', imageId);

    return NextResponse.json({
      success: true,
      message: '圖片已成功刪除',
      deletedImage: {
        id: image.id,
        fileName: image.fileName,
        source: image.source,
      },
    });

  } catch (error) {
    console.error('刪除圖片失敗:', error);
    return NextResponse.json(
      {
        error: '刪除圖片失敗',
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

