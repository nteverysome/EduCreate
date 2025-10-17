import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/activities/[id]/results
 * 獲取特定活動的所有結果（作業）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const activityId = params.id;

    // 查詢該活動的所有結果
    const results = await prisma.assignmentResult.findMany({
      where: {
        assignment: {
          activityId: activityId,
          activity: {
            userId: session.user.id  // 確保只返回用戶自己的活動結果
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

    // 格式化結果
    const formattedResults = results.map(result => {
      // 計算狀態
      let status: 'active' | 'completed' | 'expired' = 'active';

      if (result.assignment.status === 'COMPLETED') {
        status = 'completed';
      } else if (result.assignment.status === 'EXPIRED') {
        status = 'expired';
      } else if (result.assignment.deadline) {
        const now = new Date();
        const deadline = new Date(result.assignment.deadline);
        if (now > deadline) {
          status = 'expired';
        }
      }

      return {
        id: result.id,
        title: result.customTitle || `"${result.assignment.activity.title}"的結果${result.resultNumber}`,
        activityName: result.assignment.activity.title,
        participantCount: result.participants.length,
        createdAt: result.createdAt.toISOString(),
        deadline: result.assignment.deadline?.toISOString(),
        status: status,
        assignmentId: result.assignmentId,
        activityId: result.assignment.activityId
      };
    });

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('獲取活動結果失敗:', error);
    return NextResponse.json(
      { error: '獲取活動結果失敗' },
      { status: 500 }
    );
  }
}

