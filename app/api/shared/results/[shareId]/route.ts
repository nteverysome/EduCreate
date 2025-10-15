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

    // 格式化参与者数据 - 包含完整信息
    const participants = completedResponses.map((participant, index) => ({
      id: participant.id,
      studentName: participant.studentName || `參與者 ${index + 1}`,
      score: participant.score || 0,
      timeSpent: participant.timeSpent || 0,
      correctAnswers: participant.correctAnswers || 0,
      totalQuestions: participant.totalQuestions || 0,
      completedAt: participant.completedAt?.toISOString() || new Date().toISOString(),
      gameData: participant.gameData
    }));

    // 计算统计摘要
    const statistics = {
      totalStudents: totalResponses,
      averageScore: averageScore,
      highestScore: {
        score: Math.max(...participants.map(p => p.score)),
        studentName: participants.find(p => p.score === Math.max(...participants.map(p => p.score)))?.studentName || ''
      },
      fastestTime: {
        timeSpent: Math.min(...participants.filter(p => p.timeSpent > 0).map(p => p.timeSpent)),
        studentName: participants.find(p => p.timeSpent === Math.min(...participants.filter(p => p.timeSpent > 0).map(p => p.timeSpent)))?.studentName || ''
      }
    };

    // 计算问题统计
    const questionStats: { [key: number]: { correct: number; incorrect: number; text: string } } = {};

    participants.forEach(participant => {
      if (participant.gameData && participant.gameData.questions) {
        participant.gameData.questions.forEach((question: any, index: number) => {
          const questionNumber = index + 1;
          if (!questionStats[questionNumber]) {
            questionStats[questionNumber] = {
              correct: 0,
              incorrect: 0,
              text: question.text || question.question || `問題 ${questionNumber}`
            };
          }

          if (question.isCorrect || question.correct) {
            questionStats[questionNumber].correct++;
          } else {
            questionStats[questionNumber].incorrect++;
          }
        });
      }
    });

    const questionStatistics = Object.entries(questionStats).map(([number, stats]) => {
      const totalAttempts = stats.correct + stats.incorrect;
      return {
        questionNumber: parseInt(number),
        questionText: stats.text,
        correctCount: stats.correct,
        incorrectCount: stats.incorrect,
        totalAttempts,
        correctPercentage: totalAttempts > 0 ? (stats.correct / totalAttempts) * 100 : 0
      };
    }).sort((a, b) => a.questionNumber - b.questionNumber);

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

    // 构建响应数据 - 使用与 ResultDetailView 相同的格式
    const responseData = {
      id: result.id,
      title: result.customTitle || `${result.assignment.activity?.title || '無標題活動'}的結果`,
      activityName: result.assignment.activity?.title || '無標題活動',
      activityId: result.assignment.activityId,
      assignmentId: result.assignmentId,
      participantCount: totalResponses,
      createdAt: result.createdAt.toISOString(),
      deadline: result.assignment.deadline?.toISOString(),
      status,
      gameType: result.assignment.activity?.gameType || 'unknown',
      shareLink: `${process.env.NEXTAUTH_URL || 'https://edu-create.vercel.app'}/shared/results/${result.shareToken}`,
      shareToken: result.shareToken,
      participants,
      statistics,
      questionStatistics: questionStatistics.length > 0 ? questionStatistics : undefined,
      isSharedView: true // 标记为共享视图
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
