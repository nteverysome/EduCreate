import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

/**
 * GET /api/visual-styles/resources
 * 獲取指定視覺風格的所有資源 URL（從 Vercel Blob Storage）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const styleId = searchParams.get('styleId');

    if (!styleId) {
      return NextResponse.json(
        { error: '缺少 styleId 參數' },
        { status: 400 }
      );
    }

    // 驗證視覺風格 ID
    const validStyleIds = ['clouds', 'videogame', 'magiclibrary', 'underwater', 'pets', 'space', 'dinosaur'];
    if (!validStyleIds.includes(styleId)) {
      return NextResponse.json(
        { error: '無效的視覺風格 ID' },
        { status: 400 }
      );
    }

    // 從 Blob Storage 列出所有文件
    const { blobs } = await list({
      prefix: `visual-styles/${styleId}/`,
    });

    // 構建資源 URL 映射（格式：{ resourceType: url }）
    const resources: Record<string, string> = {};

    blobs.forEach((blob) => {
      const fileName = blob.pathname.split('/').pop() || '';
      const resourceType = fileName.split('.')[0];
      resources[resourceType] = blob.url;
    });

    return NextResponse.json({
      success: true,
      styleId,
      resources
    });

  } catch (error) {
    console.error('獲取資源 URL 錯誤:', error);
    return NextResponse.json(
      { error: '獲取資源 URL 失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}

