import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/visual-styles/upload
 * 上傳視覺風格資源（圖片或音效）
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const styleId = formData.get('styleId') as string;
    const resourceType = formData.get('resourceType') as string;

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

    // 驗證資源類型
    const validResourceTypes = ['spaceship', 'cloud1', 'cloud2', 'background', 'hit', 'success'];
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
    
    const isImage = ['spaceship', 'cloud1', 'cloud2'].includes(resourceType);
    const isAudio = ['background', 'hit', 'success'].includes(resourceType);
    
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

    // 確定文件名和路徑
    let fileName: string;
    let targetDir: string;
    
    if (isImage) {
      fileName = `${resourceType}.${fileExtension}`;
      targetDir = join(process.cwd(), 'public', 'games', 'shimozurdo-game', 'assets', 'themes', styleId);
    } else {
      fileName = `${resourceType}.${fileExtension}`;
      targetDir = join(process.cwd(), 'public', 'games', 'shimozurdo-game', 'assets', 'themes', styleId, 'sounds');
    }

    // 確保目錄存在
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    // 讀取文件內容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 寫入文件
    const filePath = join(targetDir, fileName);
    await writeFile(filePath, buffer);

    console.log(`✅ 文件上傳成功: ${filePath}`);

    return NextResponse.json({
      success: true,
      message: '文件上傳成功',
      filePath: `/games/shimozurdo-game/assets/themes/${styleId}/${isAudio ? 'sounds/' : ''}${fileName}`,
      styleId,
      resourceType,
      fileName
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
 * 獲取已上傳的資源列表
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

    const basePath = join(process.cwd(), 'public', 'games', 'shimozurdo-game', 'assets', 'themes', styleId);
    const soundsPath = join(basePath, 'sounds');

    // 檢查資源是否存在
    const resources = {
      spaceship: existsSync(join(basePath, 'spaceship.png')) || existsSync(join(basePath, 'spaceship.jpg')) || existsSync(join(basePath, 'spaceship.webp')),
      cloud1: existsSync(join(basePath, 'cloud1.png')) || existsSync(join(basePath, 'cloud1.jpg')) || existsSync(join(basePath, 'cloud1.webp')),
      cloud2: existsSync(join(basePath, 'cloud2.png')) || existsSync(join(basePath, 'cloud2.jpg')) || existsSync(join(basePath, 'cloud2.webp')),
      background: existsSync(join(soundsPath, 'background.mp3')) || existsSync(join(soundsPath, 'background.wav')) || existsSync(join(soundsPath, 'background.ogg')),
      hit: existsSync(join(soundsPath, 'hit.mp3')) || existsSync(join(soundsPath, 'hit.wav')) || existsSync(join(soundsPath, 'hit.ogg')),
      success: existsSync(join(soundsPath, 'success.mp3')) || existsSync(join(soundsPath, 'success.wav')) || existsSync(join(soundsPath, 'success.ogg')),
    };

    return NextResponse.json({
      success: true,
      styleId,
      resources
    });

  } catch (error) {
    console.error('獲取資源列表錯誤:', error);
    return NextResponse.json(
      { error: '獲取資源列表失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}

