import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';

/**
 * POST /api/visual-styles/upload
 * 上傳視覺風格資源（圖片或音效）到 Vercel Blob Storage
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const styleId = formData.get('styleId') as string;
    const resourceType = formData.get('resourceType') as string;
    const game = (formData.get('game') as string) || 'shimozurdo-game'; // 默認為 shimozurdo-game

    if (!file || !styleId || !resourceType) {
      return NextResponse.json(
        { error: '缺少必要參數' },
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

    // 根據遊戲類型驗證資源類型
    let validResourceTypes: string[];
    if (game === 'match-up-game') {
      validResourceTypes = ['background', 'card_background', 'card_border', 'colors', 'fonts', 'config'];
    } else {
      // shimozurdo-game
      validResourceTypes = ['spaceship', 'cloud1', 'cloud2', 'bg_layer', 'background', 'hit', 'success'];
    }

    if (!validResourceTypes.includes(resourceType)) {
      return NextResponse.json(
        { error: '無效的資源類型' },
        { status: 400 }
      );
    }

    // 獲取文件擴展名
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    // 驗證文件類型
    const imageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
    const audioExtensions = ['mp3', 'wav', 'ogg'];
    const jsonExtensions = ['json'];

    // 根據遊戲類型判斷資源類型
    let isImage = false;
    let isAudio = false;
    let isJson = false;

    if (game === 'match-up-game') {
      isImage = ['background', 'card_background', 'card_border'].includes(resourceType);
      isJson = ['colors', 'fonts', 'config'].includes(resourceType);
    } else {
      isImage = ['spaceship', 'cloud1', 'cloud2', 'bg_layer'].includes(resourceType);
      isAudio = ['background', 'hit', 'success'].includes(resourceType);
    }

    if (isImage && !imageExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: '圖片文件必須是 PNG, JPEG 或 WebP 格式' },
        { status: 400 }
      );
    }

    if (isAudio && !audioExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: '音效文件必須是 MP3, WAV 或 OGG 格式' },
        { status: 400 }
      );
    }

    if (isJson && !jsonExtensions.includes(fileExtension || '')) {
      return NextResponse.json(
        { error: '配置文件必須是 JSON 格式' },
        { status: 400 }
      );
    }

    // 構建 Blob 存儲路徑
    let blobPath: string;
    if (game === 'match-up-game') {
      blobPath = `visual-styles/${styleId}/${resourceType}.${fileExtension}`;
    } else {
      blobPath = isAudio
        ? `visual-styles/${styleId}/sounds/${resourceType}.${fileExtension}`
        : `visual-styles/${styleId}/${resourceType}.${fileExtension}`;
    }

    // 上傳到 Vercel Blob Storage
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false, // 不添加隨機後綴，保持文件名一致
      allowOverwrite: true,   // 允許覆蓋已存在的文件
    });

    console.log(`✅ 文件上傳成功到 Blob Storage: ${blob.url}`);

    return NextResponse.json({
      success: true,
      message: '文件上傳成功',
      url: blob.url,
      blobPath,
      styleId,
      resourceType,
      fileName: `${resourceType}.${fileExtension}`
    });

  } catch (error) {
    console.error('文件上傳錯誤:', error);
    return NextResponse.json(
      { error: '文件上傳失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/visual-styles/upload
 * 獲取已上傳的資源列表（從 Vercel Blob Storage）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const styleId = searchParams.get('styleId');
    const game = searchParams.get('game') || 'shimozurdo-game';

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

    // 根據遊戲類型初始化資源對象
    let resources: Record<string, { exists: boolean; url?: string }> = {};

    if (game === 'match-up-game') {
      resources = {
        background: { exists: false },
        card_background: { exists: false },
        card_border: { exists: false },
        colors: { exists: false },
        fonts: { exists: false },
        config: { exists: false }
      };
    } else {
      resources = {
        spaceship: { exists: false },
        cloud1: { exists: false },
        cloud2: { exists: false },
        bg_layer: { exists: false },
        background: { exists: false },
        hit: { exists: false },
        success: { exists: false }
      };
    }

    // 遍歷 Blob 列表，匹配資源類型
    const timestamp = Date.now();
    blobs.forEach((blob) => {
      const fileName = blob.pathname.split('/').pop() || '';
      const resourceType = fileName.split('.')[0];

      if (resources[resourceType]) {
        // 添加時間戳到 URL 以破壞緩存
        const urlWithTimestamp = `${blob.url}?v=${timestamp}`;
        resources[resourceType] = {
          exists: true,
          url: urlWithTimestamp
        };
      }
    });

    return NextResponse.json({
      success: true,
      styleId,
      resources,
      timestamp
    });

  } catch (error) {
    console.error('獲取資源列表錯誤:', error);
    return NextResponse.json(
      { error: '獲取資源列表失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/visual-styles/upload
 * 刪除指定的視覺風格資源（從 Vercel Blob Storage）
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const styleId = searchParams.get('styleId');
    const resourceType = searchParams.get('resourceType');
    const game = searchParams.get('game') || 'shimozurdo-game';

    if (!styleId || !resourceType) {
      return NextResponse.json(
        { error: '缺少必要參數' },
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

    // 根據遊戲類型驗證資源類型
    let validResourceTypes: string[];
    if (game === 'match-up-game') {
      validResourceTypes = ['background', 'card_background', 'card_border', 'colors', 'fonts', 'config'];
    } else {
      validResourceTypes = ['spaceship', 'cloud1', 'cloud2', 'bg_layer', 'background', 'hit', 'success'];
    }

    if (!validResourceTypes.includes(resourceType)) {
      return NextResponse.json(
        { error: '無效的資源類型' },
        { status: 400 }
      );
    }

    // 從 Blob Storage 列出所有文件，找到要刪除的文件
    const { blobs } = await list({
      prefix: `visual-styles/${styleId}/`,
    });

    // 找到匹配的文件
    const blobToDelete = blobs.find((blob) => {
      const fileName = blob.pathname.split('/').pop() || '';
      const fileResourceType = fileName.split('.')[0];
      return fileResourceType === resourceType;
    });

    if (!blobToDelete) {
      return NextResponse.json(
        { error: '找不到要刪除的資源' },
        { status: 404 }
      );
    }

    // 刪除文件
    await del(blobToDelete.url);

    console.log(`✅ 文件刪除成功: ${blobToDelete.url}`);

    return NextResponse.json({
      success: true,
      message: '文件刪除成功',
      deletedUrl: blobToDelete.url,
      styleId,
      resourceType
    });

  } catch (error) {
    console.error('文件刪除錯誤:', error);
    return NextResponse.json(
      { error: '文件刪除失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}
