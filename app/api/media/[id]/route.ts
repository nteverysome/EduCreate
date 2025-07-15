/**
 * 媒體文件管理 API 端點
 * 處理單個媒體文件的獲取、更新和刪除
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 在實際應用中，這裡會從數據庫獲取文件信息
    // 現在我們模擬返回文件信息
    const mockFile = {
      id,
      name: `file_${id}.jpg`,
      type: 'image',
      mimeType: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      url: `https://example.com/media/${id}/file_${id}.jpg`,
      uploadedAt: new Date().toISOString(),
      metadata: {
        title: `文件 ${id}`,
        description: '示例文件',
        tags: ['示例', '測試']
      }
    };

    return NextResponse.json({
      success: true,
      file: mockFile
    });

  } catch (error) {
    console.error('獲取文件信息錯誤:', error);
    return NextResponse.json(
      { error: '獲取文件信息失敗' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 模擬刪除延遲
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // 在實際應用中，這裡會從存儲中刪除文件並更新數據庫
    console.log(`模擬刪除文件: ${id}`);

    return NextResponse.json({
      success: true,
      message: '文件已成功刪除',
      deletedId: id
    });

  } catch (error) {
    console.error('刪除文件錯誤:', error);
    return NextResponse.json(
      { error: '刪除文件失敗' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // 模擬更新延遲
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    // 在實際應用中，這裡會更新數據庫中的文件元數據
    console.log(`模擬更新文件元數據: ${id}`, body);

    return NextResponse.json({
      success: true,
      message: '文件元數據已更新',
      updatedId: id,
      metadata: body.metadata
    });

  } catch (error) {
    console.error('更新文件元數據錯誤:', error);
    return NextResponse.json(
      { error: '更新文件元數據失敗' },
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
