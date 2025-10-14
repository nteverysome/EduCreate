import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, createAuthResponse } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// 獲取用戶的活動列表
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return createAuthResponse(auth.error, auth.status!);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where = {
      userId: auth.user!.id,
      ...(status && { status })
    };

    const activities = await prisma.activity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        template: true,
        gameTemplate: true
      }
    });

    const total = await prisma.activity.count({ where });

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('獲取活動列表失敗:', error);
    return NextResponse.json(
      { error: '獲取活動列表失敗' },
      { status: 500 }
    );
  }
}

// 創建新活動
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return createAuthResponse(auth.error, auth.status!);
    }

    const body = await request.json();
    const {
      title,
      description,
      content,
      templateId,
      gameTemplateId,
      difficulty,
      tags = []
    } = body;

    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        content: content || {},
        userId: auth.user!.id,
        templateId,
        gameTemplateId,
        difficulty,
        tags,
        status: 'DRAFT'
      },
      include: {
        template: true,
        gameTemplate: true
      }
    });

    return NextResponse.json({
      message: '活動創建成功',
      activity
    }, { status: 201 });
  } catch (error) {
    console.error('創建活動失敗:', error);
    return NextResponse.json(
      { error: '創建活動失敗' },
      { status: 500 }
    );
  }
}
