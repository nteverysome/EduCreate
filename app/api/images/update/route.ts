/**
 * 圖片更新 API
 * PATCH /api/images/update
 * 
 * 功能：
 * - 更新圖片的 alt 文字
 * - 更新圖片的標籤
 * - 權限檢查
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    // 1. 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    // 2. 獲取請求數據
    const body = await request.json();
    const { imageId, alt, tags } = body;

    if (!imageId) {
      return NextResponse.json(
        { error: '缺少圖片 ID' },
        { status: 400 }
      );
    }

    // 3. 查詢圖片
    const image = await prisma.userImage.findUnique({
      where: { id: imageId },
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
        { error: '無權修改此圖片' },
        { status: 403 }
      );
    }

    // 5. 準備更新數據
    const updateData: any = {};

    if (alt !== undefined) {
      updateData.alt = alt;
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return NextResponse.json(
          { error: '標籤必須是數組' },
          { status: 400 }
        );
      }
      updateData.tags = tags;
    }

    // 6. 更新圖片
    const updatedImage = await prisma.userImage.update({
      where: { id: imageId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: '圖片已更新',
      image: {
        id: updatedImage.id,
        alt: updatedImage.alt,
        tags: updatedImage.tags,
        updatedAt: updatedImage.updatedAt,
      },
    });

  } catch (error) {
    console.error('更新圖片失敗:', error);
    return NextResponse.json(
      {
        error: '更新圖片失敗',
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
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

