import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 公開 API - 獲取課業排行榜（無需身份驗證）
 * GET /api/leaderboard/[assignmentId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;

    console.log('🏆 獲取排行榜數據:', { assignmentId });

    // 查詢該課業的所有結果和參與者
    const results = await prisma.assignmentResult.findMany({
      where: {
        assignmentId: assignmentId,
        status: 'ACTIVE'
      },
      include: {
        participants: true,
        assignment: {
          include: {
            activity: true
          }
        }
      }
    });

    if (results.length === 0) {
      console.log('⚠️ 沒有找到結果數據');
      return NextResponse.json({
        success: true,
        leaderboard: [],
        totalParticipants: 0
      });
    }

    // 收集所有參與者
    const allParticipants = results.flatMap(result => 
      result.participants.map(p => ({
        studentName: p.studentName,
        score: p.score,
        timeSpent: p.timeSpent,
        correctAnswers: p.correctAnswers,
        totalQuestions: p.totalQuestions,
        completedAt: p.completedAt
      }))
    );

    // 按分數排序（分數高的在前），如果分數相同則按時間排序（時間短的在前）
    const sortedParticipants = allParticipants.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // 分數高的在前
      }
      return a.timeSpent - b.timeSpent; // 時間短的在前
    });

    // 格式化排行榜數據
    const leaderboard = sortedParticipants.map((participant, index) => ({
      rank: index + 1,
      studentName: participant.studentName,
      score: participant.score,
      timeSpent: participant.timeSpent,
      correctAnswers: participant.correctAnswers,
      totalQuestions: participant.totalQuestions,
      completedAt: participant.completedAt.toISOString()
    }));

    console.log('✅ 排行榜數據查詢成功:', {
      assignmentId,
      totalParticipants: leaderboard.length,
      topScore: leaderboard[0]?.score || 0
    });

    return NextResponse.json({
      success: true,
      leaderboard,
      totalParticipants: leaderboard.length,
      activityTitle: results[0].assignment.activity.title
    });

  } catch (error) {
    console.error('❌ 獲取排行榜數據失敗:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '獲取排行榜數據失敗',
        leaderboard: [],
        totalParticipants: 0
      },
      { status: 500 }
    );
  }
}

