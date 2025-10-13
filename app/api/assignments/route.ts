import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/assignments - 創建新的課業分配
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { activityId, title, registrationType, deadline, gameEndSettings } = body;

    // 驗證必要參數
    if (!activityId || !title) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // 檢查活動是否存在且屬於當前用戶
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: session.user.id
      }
    });

    if (!activity) {
      return NextResponse.json({ error: '活動不存在或無權限' }, { status: 404 });
    }

    // 創建課業分配
    const assignment = await prisma.assignment.create({
      data: {
        activityId,
        title,
        registrationType: registrationType || 'NAME',
        deadline: deadline ? new Date(deadline) : null,
        gameEndSettings: gameEndSettings || {},
        status: 'ACTIVE'
      }
    });

    // 自動創建對應的結果記錄
    const existingResults = await prisma.assignmentResult.count({
      where: {
        assignment: {
          activityId: activityId
        }
      }
    });

    const assignmentResult = await prisma.assignmentResult.create({
      data: {
        assignmentId: assignment.id,
        resultNumber: existingResults + 1,
        status: 'ACTIVE'
      }
    });

    console.log('✅ 課業分配和結果記錄創建成功:', {
      assignmentId: assignment.id,
      resultId: assignmentResult.id,
      resultNumber: assignmentResult.resultNumber
    });

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        activityId: assignment.activityId,
        title: assignment.title,
        registrationType: assignment.registrationType,
        deadline: assignment.deadline?.toISOString(),
        status: assignment.status,
        createdAt: assignment.createdAt.toISOString()
      },
      result: {
        id: assignmentResult.id,
        resultNumber: assignmentResult.resultNumber,
        status: assignmentResult.status
      }
    });
  } catch (error) {
    console.error('創建課業分配失敗:', error);
    return NextResponse.json({ error: '創建課業分配失敗' }, { status: 500 });
  }
}

// GET /api/assignments - 獲取用戶的所有課業分配
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        activity: {
          userId: session.user.email
        }
      },
      include: {
        activity: true,
        results: {
          include: {
            participants: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      activityId: assignment.activityId,
      activityName: assignment.activity.title,
      registrationType: assignment.registrationType,
      deadline: assignment.deadline?.toISOString(),
      status: assignment.status,
      createdAt: assignment.createdAt.toISOString(),
      resultCount: assignment.results.length,
      totalParticipants: assignment.results.reduce((total, result) => total + result.participants.length, 0)
    }));

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error('獲取課業分配失敗:', error);
    return NextResponse.json({ error: '獲取課業分配失敗' }, { status: 500 });
  }
}
