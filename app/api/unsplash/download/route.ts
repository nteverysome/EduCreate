/**
 * Unsplash 圖片下載 API 端點
 * 從 Unsplash 下載圖片並保存到用戶圖片庫
 * 重要：必須觸發 Unsplash 的 download endpoint 以符合 API 使用條款
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApi } from 'unsplash-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// 創建 Unsplash API 實例
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
});

/**
 * POST /api/unsplash/download
 * 
 * Body:
 * - photoId: Unsplash 圖片 ID（必需）
 * - downloadLocation: Unsplash download location URL（必需）
 * - alt: 替代文字（可選）
 * - tags: 標籤數組（可選）
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 檢查環境變量
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY 未設置');
      return NextResponse.json(
        { error: 'Unsplash API 配置錯誤' },
        { status: 500 }
      );
    }

    // 獲取請求體
    const body = await request.json();
    const { photoId, downloadLocation, alt, tags = [] } = body;

    // 驗證必需參數
    if (!photoId) {
      return NextResponse.json(
        { error: '缺少 photoId' },
        { status: 400 }
      );
    }

    if (!downloadLocation) {
      return NextResponse.json(
        { error: '缺少 downloadLocation' },
        { status: 400 }
      );
    }

    // 檢查圖片是否已經存在
    const existingImage = await prisma.userImage.findFirst({
      where: {
        userId,
        source: 'unsplash',
        sourceId: photoId,
      },
    });

    if (existingImage) {
      // 圖片已存在，更新使用次數
      const updatedImage = await prisma.userImage.update({
        where: { id: existingImage.id },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });

      // 仍然需要觸發 Unsplash download endpoint
      try {
        await fetch(downloadLocation);
      } catch (error) {
        console.error('觸發 Unsplash download endpoint 失敗:', error);
      }

      return NextResponse.json({
        success: true,
        image: {
          id: updatedImage.id,
          url: updatedImage.url,
          fileName: updatedImage.fileName,
          fileSize: updatedImage.fileSize,
          mimeType: updatedImage.mimeType,
          width: updatedImage.width,
          height: updatedImage.height,
          alt: updatedImage.alt,
          tags: updatedImage.tags,
          source: updatedImage.source,
          sourceId: updatedImage.sourceId,
          usageCount: updatedImage.usageCount,
          createdAt: updatedImage.createdAt,
        },
        alreadyExists: true,
      });
    }

    // 獲取圖片詳情
    const photoResult = await unsplash.photos.get({ photoId });

    if (photoResult.errors) {
      console.error('Unsplash API 錯誤:', photoResult.errors);
      return NextResponse.json(
        { error: 'Unsplash API 調用失敗', details: photoResult.errors },
        { status: 500 }
      );
    }

    const photo = photoResult.response;
    if (!photo) {
      return NextResponse.json(
        { error: '找不到圖片' },
        { status: 404 }
      );
    }

    // 觸發 Unsplash download endpoint（重要！符合 API 使用條款）
    try {
      await fetch(downloadLocation);
    } catch (error) {
      console.error('觸發 Unsplash download endpoint 失敗:', error);
      // 不中斷流程，繼續保存圖片
    }

    // 保存到數據庫（不下載實際文件，使用 Unsplash URL）
    const userImage = await prisma.userImage.create({
      data: {
        userId,
        url: photo.urls.regular, // 使用 regular 尺寸作為默認
        blobPath: '', // Unsplash 圖片不存儲在 Blob
        fileName: `unsplash-${photoId}.jpg`,
        fileSize: 0, // Unsplash 不提供文件大小
        mimeType: 'image/jpeg',
        width: photo.width,
        height: photo.height,
        source: 'unsplash',
        sourceId: photoId,
        alt: alt || photo.description || photo.alt_description || '',
        tags: tags.length > 0 ? tags : [],
        usageCount: 1,
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      image: {
        id: userImage.id,
        url: userImage.url,
        fileName: userImage.fileName,
        fileSize: userImage.fileSize,
        mimeType: userImage.mimeType,
        width: userImage.width,
        height: userImage.height,
        alt: userImage.alt,
        tags: userImage.tags,
        source: userImage.source,
        sourceId: userImage.sourceId,
        usageCount: userImage.usageCount,
        createdAt: userImage.createdAt,
        photographer: {
          name: photo.user.name,
          username: photo.user.username,
          profileUrl: photo.user.links.html,
        },
      },
      alreadyExists: false,
    });

  } catch (error) {
    console.error('Unsplash 下載錯誤:', error);
    return NextResponse.json(
      { error: '下載失敗', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/unsplash/download
 * 處理 CORS 預檢請求
 */
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

