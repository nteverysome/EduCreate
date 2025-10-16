/**
 * 社區活動評論功能 API
 * 
 * GET /api/community/activities/[id]/comments
 * - 獲取活動的評論列表
 * - 支援分頁
 * - 支援回覆嵌套
 * 
 * POST /api/community/activities/[id]/comments
 * - 創建新評論或回覆
 * - 需要用戶登入
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET - 獲取評論列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id;
    const { searchParams } = new URL(request.url);
    
    // 分頁參數
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 檢查活動是否存在且已發布到社區
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        id: true,
        publishedToCommunityAt: true,
        communityComments: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }

    if (!activity.publishedToCommunityAt) {
      return NextResponse.json(
        { error: '此活動未發布到社區' },
        { status: 400 }
      );
    }

    // 獲取頂層評論（沒有 parentId 的評論）
    const comments = await prisma.activityComment.findMany({
      where: {
        activityId,
        parentId: null,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        replies: {
          where: {
            deletedAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // 獲取總數
    const total = await prisma.activityComment.count({
      where: {
        activityId,
        parentId: null,
        deletedAt: null,
      },
    });

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('獲取評論列表錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

/**
 * POST - 創建新評論或回覆
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 驗證用戶登入
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const activityId = params.id;
    const body = await request.json();
    const { content, parentId } = body;

    // 驗證內容
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '評論內容不能為空' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: '評論內容不能為空' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 1000) {
      return NextResponse.json(
        { error: '評論內容不能超過 1000 字' },
        { status: 400 }
      );
    }

    // 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 檢查活動是否存在且已發布到社區
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        id: true,
        publishedToCommunityAt: true,
        communityComments: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }

    if (!activity.publishedToCommunityAt) {
      return NextResponse.json(
        { error: '此活動未發布到社區' },
        { status: 400 }
      );
    }

    // 如果是回覆，檢查父評論是否存在
    if (parentId) {
      const parentComment = await prisma.activityComment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: '父評論不存在' },
          { status: 404 }
        );
      }

      if (parentComment.activityId !== activityId) {
        return NextResponse.json(
          { error: '父評論不屬於此活動' },
          { status: 400 }
        );
      }
    }

    // 創建評論並更新活動的評論數
    const [comment] = await prisma.$transaction([
      // 創建評論
      prisma.activityComment.create({
        data: {
          activityId,
          userId: user.id,
          content: trimmedContent,
          parentId: parentId || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
      // 增加評論數（只有頂層評論才增加）
      ...(parentId ? [] : [
        prisma.activity.update({
          where: { id: activityId },
          data: {
            communityComments: {
              increment: 1,
            },
          },
        }),
      ]),
    ]);

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('創建評論錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

