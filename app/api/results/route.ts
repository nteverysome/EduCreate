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

    // 獲取用戶的所有結果
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

    // 格式化結果數據
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
  } catch (error) {
    console.error('獲取結果失敗:', error);
    return NextResponse.json({ error: '獲取結果失敗' }, { status: 500 });
  }
}

// POST /api/results - 創建新的結果記錄
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, activityId, studentName, gameData, score, timeSpent, correctAnswers, totalQuestions } = body;

    // 驗證必要參數
    if (!assignmentId || !activityId || !studentName) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
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
      // 計算結果編號
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
  } catch (error) {
    console.error('創建結果失敗:', error);
    return NextResponse.json({ error: '創建結果失敗' }, { status: 500 });
  }
}
