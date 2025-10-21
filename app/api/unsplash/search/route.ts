/**
 * Unsplash 圖片搜索 API 端點
 * 提供 Unsplash 圖片搜索功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApi } from 'unsplash-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 創建 Unsplash API 實例
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
});

/**
 * GET /api/unsplash/search
 * 
 * Query Parameters:
 * - query: 搜索關鍵字（必需）
 * - page: 頁碼（默認 1）
 * - perPage: 每頁數量（默認 20，最大 30）
 * - orientation: 圖片方向（landscape | portrait | squarish）
 * - color: 顏色篩選（black_and_white | black | white | yellow | orange | red | purple | magenta | green | teal | blue）
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    // 檢查環境變量
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.error('UNSPLASH_ACCESS_KEY 未設置');
      return NextResponse.json(
        { error: 'Unsplash API 配置錯誤' },
        { status: 500 }
      );
    }

    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('perPage') || '20'), 30);
    const orientation = searchParams.get('orientation') as 'landscape' | 'portrait' | 'squarish' | undefined;
    const color = searchParams.get('color') as 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue' | undefined;

    // 驗證必需參數
    if (!query) {
      return NextResponse.json(
        { error: '缺少搜索關鍵字' },
        { status: 400 }
      );
    }

    // 驗證頁碼
    if (page < 1) {
      return NextResponse.json(
        { error: '頁碼必須大於 0' },
        { status: 400 }
      );
    }

    // 調用 Unsplash API
    const result = await unsplash.search.getPhotos({
      query,
      page,
      perPage,
      orientation,
      color,
    });

    // 檢查 API 錯誤
    if (result.errors) {
      console.error('Unsplash API 錯誤:', result.errors);
      return NextResponse.json(
        { error: 'Unsplash API 調用失敗', details: result.errors },
        { status: 500 }
      );
    }

    // 格式化返回數據
    const photos = result.response?.results.map(photo => ({
      id: photo.id,
      description: photo.description || photo.alt_description || '',
      urls: {
        raw: photo.urls.raw,
        full: photo.urls.full,
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb,
      },
      width: photo.width,
      height: photo.height,
      color: photo.color,
      likes: photo.likes,
      user: {
        id: photo.user.id,
        username: photo.user.username,
        name: photo.user.name,
        profileImage: photo.user.profile_image.medium,
        profileUrl: photo.user.links.html,
      },
      links: {
        html: photo.links.html,
        download: photo.links.download,
        downloadLocation: photo.links.download_location,
      },
      createdAt: photo.created_at,
    }));

    return NextResponse.json({
      success: true,
      total: result.response?.total || 0,
      totalPages: result.response?.total_pages || 0,
      page,
      perPage,
      photos: photos || [],
    });

  } catch (error) {
    console.error('Unsplash 搜索錯誤:', error);
    return NextResponse.json(
      { error: '搜索失敗', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/unsplash/search
 * 處理 CORS 預檢請求
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

