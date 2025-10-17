import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 公開 API - 學生訪問課業遊戲（無需身份驗證）
 * GET /api/play/[activityId]/[assignmentId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { activityId: string; assignmentId: string } }
) {
  try {
    const { activityId, assignmentId } = params;

    console.log('🎮 學生訪問課業遊戲:', { activityId, assignmentId });

    // 載入活動數據（不需要驗證用戶身份）
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        deletedAt: null  // 只載入未刪除的活動
      },
      include: {
        vocabularyItems: true
      }
    });

    if (!activity) {
      console.log('❌ 活動不存在或已刪除:', activityId);
      return NextResponse.json(
        { error: '活動不存在' },
        { status: 404 }
      );
    }

    // 載入課業分配數據
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        activityId: activityId
      }
    });

    if (!assignment) {
      console.log('❌ 課業分配不存在:', assignmentId);
      return NextResponse.json(
        { error: '課業分配不存在' },
        { status: 404 }
      );
    }

    console.log('✅ 成功載入活動和課業數據:', {
      activityId: activity.id,
      title: activity.title,
      vocabularyCount: activity.vocabularyItems.length,
      assignmentId: assignment.id,
      registrationType: assignment.registrationType
    });

    // 將 registrationType 轉換為小寫格式
    let registrationType: 'name' | 'anonymous' | 'google-classroom' = 'name';
    if (assignment.registrationType === 'ANONYMOUS') {
      registrationType = 'anonymous';
    } else if (assignment.registrationType === 'GOOGLE') {
      registrationType = 'google-classroom';
    }

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        vocabularyItems: activity.vocabularyItems,
        totalWords: activity.totalWords,
        geptLevel: activity.geptLevel
      },
      assignment: {
        id: assignment.id,
        activityId: assignment.activityId,
        title: assignment.title,
        registrationType: registrationType,
        deadline: assignment.deadline?.toISOString(),
        status: assignment.status.toLowerCase()
      }
    });

  } catch (error) {
    console.error('❌ 載入課業數據失敗:', error);
    return NextResponse.json(
      { error: '載入課業數據失敗' },
      { status: 500 }
    );
  }
}

