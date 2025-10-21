/**
 * 用戶圖片列表 API 端點
 * 提供用戶上傳圖片的查詢和篩選功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * GET /api/images/list
 * 
 * Query Parameters:
 * - page: 頁碼（默認 1）
 * - perPage: 每頁數量（默認 20，最大 50）
 * - source: 圖片來源篩選（upload | unsplash）
 * - tag: 標籤篩選（可以多個，用逗號分隔）
 * - search: 搜索關鍵字（搜索文件名和 alt 文字）
 * - sortBy: 排序方式（createdAt | usageCount | lastUsedAt）
 * - sortOrder: 排序順序（asc | desc，默認 desc）
 */
export async function GET(request: NextRequest) {
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

    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const perPage = Math.min(Math.max(parseInt(searchParams.get('perPage') || '20'), 1), 50);
    const source = searchParams.get('source') as 'upload' | 'unsplash' | null;
    const tagParam = searchParams.get('tag');
    const tags = tagParam ? tagParam.split(',').map(t => t.trim()).filter(Boolean) : [];
    const search = searchParams.get('search');
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'usageCount' | 'lastUsedAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // 構建查詢條件
    const where: any = {
      userId,
    };

    // 來源篩選
    if (source) {
      where.source = source;
    }

    // 標籤篩選
    if (tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // 搜索關鍵字
    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 計算總數
    const total = await prisma.userImage.count({ where });

    // 計算總頁數
    const totalPages = Math.ceil(total / perPage);

    // 查詢圖片列表
    const images = await prisma.userImage.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        url: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        width: true,
        height: true,
        source: true,
        sourceId: true,
        alt: true,
        tags: true,
        usageCount: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      total,
      totalPages,
      page,
      perPage,
      images,
    });

  } catch (error) {
    console.error('圖片列表查詢錯誤:', error);
    return NextResponse.json(
      { error: '查詢失敗', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/images/list
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

