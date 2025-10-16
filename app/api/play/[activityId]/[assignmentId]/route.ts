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

    // TODO: 驗證 assignmentId 是否有效（當實現課業系統後）
    // 目前先返回活動數據

    console.log('✅ 成功載入活動數據:', {
      activityId: activity.id,
      title: activity.title,
      vocabularyCount: activity.vocabularyItems.length
    });

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
        id: assignmentId,
        activityId: activityId,
        title: `"${activity.title}"的結果`,
        registrationType: 'name',
        status: 'active'
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

