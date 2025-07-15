/**
 * 媒體文件上傳 API 端點
 * 處理多媒體文件的上傳和存儲
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileId = formData.get('fileId') as string;

    if (!file) {
      return NextResponse.json(
        { error: '沒有找到文件' },
        { status: 400 }
      );
    }

    // 驗證文件類型
    const allowedTypes = [
      // 圖片
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'image/svg+xml', 'image/bmp', 'image/tiff',
      // 音頻
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a',
      'audio/flac', 'audio/webm',
      // 視頻
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
      'video/wmv', 'video/flv', 'video/mkv',
      // 動畫
      'application/json' // Lottie
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件類型: ${file.type}` },
        { status: 400 }
      );
    }

    // 驗證文件大小 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超過限制 (50MB)' },
        { status: 400 }
      );
    }

    // 模擬文件處理延遲
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // 在實際應用中，這裡會將文件保存到雲存儲或本地存儲
    // 現在我們模擬返回一個 URL
    const mockUrl = `https://example.com/media/${fileId}/${encodeURIComponent(file.name)}`;

    return NextResponse.json({
      success: true,
      url: mockUrl,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('文件上傳錯誤:', error);
    return NextResponse.json(
      { error: '文件上傳失敗' },
      { status: 500 }
    );
  }
}

// 處理 OPTIONS 請求 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
