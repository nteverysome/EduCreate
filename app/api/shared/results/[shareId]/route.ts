import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params;

    // shareId 就是 shareToken，直接查找
    const result = await prisma.assignmentResult.findUnique({
      where: {
        shareToken: shareId
      },
      include: {
        assignment: {
          include: {
            activity: true
          }
        },
        participants: true
      }
    });

    if (!result) {
      return NextResponse.json(
        { error: '分享的結果不存在或已被刪除' },
        { status: 404 }
      );
    }

    // 检查结果是否有分享 token（表示已公开分享）
    if (!result.shareToken) {
      return NextResponse.json(
        { error: '此結果未公開分享' },
        { status: 403 }
      );
    }
    
    // 计算统计数据
    const totalResponses = result.participants.length;
    const completedResponses = result.participants; // 所有参与者都是已完成的
    const completionRate = totalResponses > 0 ? 100 : 0; // 简化：所有参与者都完成了

    // 计算平均分数
    const scoresWithValues = completedResponses.filter(p => p.score !== null);
    const averageScore = scoresWithValues.length > 0
      ? scoresWithValues.reduce((sum, p) => sum + (p.score || 0), 0) / scoresWithValues.length
      : 0;

    // 获取活动的总题数（从参与者数据中获取）
    const totalQuestions = result.participants.length > 0 ? result.participants[0].totalQuestions : null;

    // 格式化参与者数据
    const participants = completedResponses.map((participant, index) => ({
      id: participant.id,
      name: participant.studentName || `參與者 ${index + 1}`,
      score: participant.score || 0,
      completedAt: participant.completedAt?.toISOString()
    }));

    // 确定结果状态
    let status: 'active' | 'completed' | 'expired' = 'active';
    
    if (result.assignment.deadline) {
      const now = new Date();
      const deadline = new Date(result.assignment.deadline);
      
      if (now > deadline) {
        status = 'expired';
      }
    }
    
    // 如果所有参与者都完成了，标记为已完成
    if (totalResponses > 0 && completedResponses.length === totalResponses) {
      status = 'completed';
    }

    // 构建响应数据
    const responseData = {
      id: result.id,
      title: result.customTitle || `${result.assignment.activity?.title || '無標題活動'} - 結果`,
      activityName: result.assignment.activity?.title || '無標題活動',
      participantCount: totalResponses,
      createdAt: result.createdAt.toISOString(),
      deadline: result.assignment.deadline?.toISOString(),
      status,
      isPublic: true, // 既然能访问到这里，就表示是公开的
      totalQuestions,
      averageScore: averageScore > 0 ? averageScore : null,
      completionRate: completionRate > 0 ? completionRate : null,
      participants: participants.length > 0 ? participants : null
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('獲取分享結果失敗:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// 支持 CORS，允许跨域访问
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
