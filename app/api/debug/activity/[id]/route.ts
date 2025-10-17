import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug/activity/[id]
 * 調試端點 - 查看活動的完整數據結構
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id;

    // 獲取活動
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }

    // 分析數據結構
    const analysis = {
      基本信息: {
        id: activity.id,
        title: activity.title,
        type: activity.type,
        templateType: activity.templateType,
        userId: activity.userId,
        userName: activity.user.name,
        userEmail: activity.user.email,
      },
      content字段: {
        存在: !!activity.content,
        類型: typeof activity.content,
        是否為null: activity.content === null,
        內容: activity.content,
      },
      elements字段: {
        存在: !!activity.elements,
        類型: typeof activity.elements,
        是否為陣列: Array.isArray(activity.elements),
        長度: Array.isArray(activity.elements) ? activity.elements.length : 'N/A',
        是否為null: activity.elements === null,
        內容: activity.elements,
      },
      其他字段: {
        description: activity.description,
        tags: activity.tags,
        geptLevel: activity.geptLevel,
        difficulty: activity.difficulty,
        estimatedTime: activity.estimatedTime,
        totalWords: activity.totalWords,
        isPublicShared: activity.isPublicShared,
        shareToken: activity.shareToken,
      },
    };

    return NextResponse.json({
      success: true,
      activity: activity,
      analysis: analysis,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('❌ 調試活動時出錯:', error);
    return NextResponse.json(
      { error: '調試失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}

