import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/results - 獲取用戶的所有結果
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 暫時返回模擬數據，直到數據庫遷移完成
    // TODO: 數據庫遷移後啟用真實查詢
    console.log('📊 返回模擬結果數據 (數據庫遷移待完成)');

    const mockResults = [
      {
        id: 'result1',
        title: '"無標題活動"的結果1',
        activityName: '無標題活動',
        participantCount: 1,
        createdAt: new Date().toISOString(),
        deadline: null,
        status: 'active',
        assignmentId: 'assignment1',
        activityId: 'cmgman4s00004jj04qwxdfwu1'
      },
      {
        id: 'result2',
        title: '"國小南一三年級英文第2課"的結果3',
        activityName: '國小南一三年級英文第2課',
        participantCount: 0,
        createdAt: '2025-10-13T00:52:00Z',
        deadline: null,
        status: 'active',
        assignmentId: 'assignment2',
        activityId: 'activity2'
      },
      {
        id: 'result3',
        title: '"複製無標題43"的結果1',
        activityName: '複製無標題43',
        participantCount: 1,
        createdAt: '2025-10-13T00:10:00Z',
        deadline: null,
        status: 'active',
        assignmentId: 'assignment3',
        activityId: 'activity3'
      }
    ];

    return NextResponse.json(mockResults);

    /*
    // 真實數據庫查詢 (數據庫遷移後啟用)
    const results = await prisma.assignmentResult.findMany({
      where: {
        assignment: {
          activity: {
            userId: session.user.email
          }
        }
      },
      include: {
        assignment: {
          include: {
            activity: true
          }
        },
        participants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedResults = results.map(result => ({
      id: result.id,
      title: `"${result.assignment.activity.title}"的結果${result.resultNumber}`,
      activityName: result.assignment.activity.title,
      participantCount: result.participants.length,
      createdAt: result.createdAt.toISOString(),
      deadline: result.assignment.deadline?.toISOString(),
      status: result.status,
      assignmentId: result.assignmentId,
      activityId: result.assignment.activityId
    }));

    return NextResponse.json(formattedResults);
    */
  } catch (error) {
    console.error('獲取結果失敗:', error);
    return NextResponse.json({ error: '獲取結果失敗' }, { status: 500 });
  }
}

// POST /api/results - 創建新的結果記錄
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, activityId, studentName, gameData, score, timeSpent, correctAnswers, totalQuestions } = body;

    // 驗證必要參數
    if (!assignmentId || !activityId || !studentName) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // 暫時記錄結果數據到控制台，直到數據庫遷移完成
    console.log('🎮 收到遊戲結果提交:', {
      assignmentId,
      activityId,
      studentName,
      score,
      timeSpent,
      correctAnswers,
      totalQuestions,
      gameDataSize: JSON.stringify(gameData || {}).length
    });

    // 模擬成功響應
    return NextResponse.json({
      success: true,
      resultId: `result_${Date.now()}`,
      participantId: `participant_${Date.now()}`,
      message: '結果記錄成功 (模擬模式)'
    });

    /*
    // 真實數據庫操作 (數據庫遷移後啟用)
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 檢查課業分配是否存在
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { activity: true }
    });

    if (!assignment) {
      return NextResponse.json({ error: '課業分配不存在' }, { status: 404 });
    }

    // 檢查是否已有該課業分配的結果記錄
    let assignmentResult = await prisma.assignmentResult.findFirst({
      where: { assignmentId }
    });

    // 如果沒有結果記錄，創建一個
    if (!assignmentResult) {
      const existingResults = await prisma.assignmentResult.count({
        where: {
          assignment: {
            activityId: assignment.activityId
          }
        }
      });

      assignmentResult = await prisma.assignmentResult.create({
        data: {
          assignmentId,
          resultNumber: existingResults + 1,
          status: 'active',
          createdAt: new Date()
        }
      });
    }

    // 創建參與者記錄
    const participant = await prisma.gameParticipant.create({
      data: {
        resultId: assignmentResult.id,
        studentName,
        score: score || 0,
        timeSpent: timeSpent || 0,
        correctAnswers: correctAnswers || 0,
        totalQuestions: totalQuestions || 0,
        gameData: gameData || {},
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      resultId: assignmentResult.id,
      participantId: participant.id,
      message: '結果記錄成功'
    });
    */
  } catch (error) {
    console.error('創建結果失敗:', error);
    return NextResponse.json({ error: '創建結果失敗' }, { status: 500 });
  }
}
