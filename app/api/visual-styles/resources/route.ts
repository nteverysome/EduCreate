import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

// 🔥 CORS 头配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * GET /api/visual-styles/resources
 * 獲取指定視覺風格的所有資源 URL（從 Vercel Blob Storage）
 * 支持多種遊戲：shimozurdo-game, flying-fruit-game 等
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const styleId = searchParams.get('styleId');
    const game = searchParams.get('game') || 'shimozurdo-game';

    console.log('📡 [visual-styles/resources] GET 請求:', { styleId, game, url: request.url });

    if (!styleId) {
      console.error('❌ [visual-styles/resources] 缺少 styleId 參數');
      return NextResponse.json(
        { error: '缺少 styleId 參數' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // 根據遊戲類型驗證視覺風格 ID 和設置存儲路徑
    let validStyleIds: string[];
    let blobPrefix: string;

    if (game === 'flying-fruit-game') {
      validStyleIds = ['jungle', 'clouds', 'space', 'underwater', 'celebration', 'farm', 'candy', 'dinosaur', 'winter', 'rainbow'];
      blobPrefix = `flying-fruit-styles/${styleId}/`;
    } else if (game === 'speaking-cards') {
      validStyleIds = ['clouds', 'videogame', 'magiclibrary', 'underwater', 'pets', 'space', 'dinosaur'];
      blobPrefix = `speaking-cards-styles/${styleId}/`;
    } else {
      // shimozurdo-game 和其他遊戲
      validStyleIds = ['clouds', 'videogame', 'magiclibrary', 'underwater', 'pets', 'space', 'dinosaur'];
      blobPrefix = `visual-styles/${styleId}/`;
    }

    if (!validStyleIds.includes(styleId)) {
      console.error('❌ [visual-styles/resources] 無效的視覺風格 ID:', styleId, '遊戲:', game);
      return NextResponse.json(
        { error: '無效的視覺風格 ID', validIds: validStyleIds, game },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // 從 Blob Storage 列出所有文件
    console.log('📂 [visual-styles/resources] 從 Blob Storage 列出文件:', { styleId, game, blobPrefix });

    const { blobs } = await list({
      prefix: blobPrefix,
    });

    console.log('✅ [visual-styles/resources] 找到', blobs.length, '個文件');

    // 構建資源 URL 映射（格式：{ resourceType: url }）
    const resources: Record<string, string> = {};

    // 添加時間戳以破壞 CDN 緩存
    const timestamp = Date.now();

    blobs.forEach((blob) => {
      // 處理可能包含子目錄的路徑 (如 sounds/background.mp3)
      const pathParts = blob.pathname.replace(blobPrefix, '').split('/');
      const fileName = pathParts[pathParts.length - 1] || '';
      const resourceType = fileName.split('.')[0];
      // 在 URL 中添加時間戳參數以破壞緩存
      resources[resourceType] = `${blob.url}?v=${timestamp}`;
    });

    console.log('✅ [visual-styles/resources] 返回資源:', { styleId, game, resourceCount: Object.keys(resources).length, resourceKeys: Object.keys(resources) });

    return NextResponse.json({
      success: true,
      styleId,
      game,
      resources,
      timestamp // 返回時間戳供前端參考
    }, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('❌ [visual-styles/resources] 獲取資源 URL 錯誤:', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    const errorStack = error instanceof Error ? error.stack : '';

    return NextResponse.json(
      {
        error: '獲取資源 URL 失敗',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// 🔥 OPTIONS 处理 (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

