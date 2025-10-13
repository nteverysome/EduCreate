import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface GameParticipant {
  id: string;
  studentName: string;
  score: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  gameData?: any;
}

interface StatisticsSummary {
  totalStudents: number;
  averageScore: number;
  highestScore: {
    score: number;
    studentName: string;
  };
  fastestTime: {
    timeSpent: number;
    studentName: string;
  };
}

interface QuestionStatistic {
  questionNumber: number;
  questionText: string;
  correctCount: number;
  incorrectCount: number;
  totalAttempts: number;
  correctPercentage: number;
}

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  activityId: string;
  assignmentId: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  gameType: string;
  shareLink: string;
  participants: GameParticipant[];
  statistics: StatisticsSummary;
  questionStatistics: QuestionStatistic[];
}

/**
 * 計算統計數據總結
 */
function calculateStatistics(participants: GameParticipant[]): StatisticsSummary {
  if (participants.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      highestScore: { score: 0, studentName: '' },
      fastestTime: { timeSpent: 0, studentName: '' }
    };
  }

  // 計算平均分
  const totalScore = participants.reduce((sum, p) => sum + p.score, 0);
  const averageScore = Math.round((totalScore / participants.length) * 100) / 100;

  // 找出最高分
  const highestScoreParticipant = participants.reduce((max, p) =>
    p.score > max.score ? p : max
  );

  // 找出最快時間（排除0或無效時間）
  const validTimeParticipants = participants.filter(p => p.timeSpent > 0);
  const fastestTimeParticipant = validTimeParticipants.length > 0
    ? validTimeParticipants.reduce((min, p) =>
        p.timeSpent < min.timeSpent ? p : min
      )
    : participants[0];

  return {
    totalStudents: participants.length,
    averageScore,
    highestScore: {
      score: highestScoreParticipant.score,
      studentName: highestScoreParticipant.studentName
    },
    fastestTime: {
      timeSpent: fastestTimeParticipant.timeSpent,
      studentName: fastestTimeParticipant.studentName
    }
  };
}

/**
 * 分析問題統計數據
 */
function analyzeQuestionStatistics(participants: GameParticipant[]): QuestionStatistic[] {
  if (participants.length === 0) {
    return [];
  }

  // 收集所有問題數據
  const questionMap = new Map<string, {
    questionText: string;
    correct: number;
    incorrect: number;
  }>();

  participants.forEach(participant => {
    if (participant.gameData && participant.gameData.questions) {
      participant.gameData.questions.forEach((question: any, index: number) => {
        const key = `${index + 1}`;
        const questionText = question.text || question.word || `問題 ${index + 1}`;

        if (!questionMap.has(key)) {
          questionMap.set(key, {
            questionText,
            correct: 0,
            incorrect: 0
          });
        }

        const stats = questionMap.get(key)!;
        if (question.isCorrect || question.correct) {
          stats.correct++;
        } else {
          stats.incorrect++;
        }
      });
    } else {
      // 如果沒有詳細的問題數據，使用總體統計
      const totalQuestions = participant.totalQuestions || 1;
      const correctAnswers = participant.correctAnswers || 0;
      const incorrectAnswers = totalQuestions - correctAnswers;

      for (let i = 1; i <= totalQuestions; i++) {
        const key = `${i}`;
        if (!questionMap.has(key)) {
          questionMap.set(key, {
            questionText: `問題 ${i}`,
            correct: 0,
            incorrect: 0
          });
        }

        const stats = questionMap.get(key)!;
        // 平均分配正確和錯誤答案
        if (i <= correctAnswers) {
          stats.correct++;
        } else {
          stats.incorrect++;
        }
      }
    }
  });

  // 轉換為數組並計算百分比
  return Array.from(questionMap.entries()).map(([key, stats]) => {
    const totalAttempts = stats.correct + stats.incorrect;
    const correctPercentage = totalAttempts > 0
      ? Math.round((stats.correct / totalAttempts) * 100)
      : 0;

    return {
      questionNumber: parseInt(key),
      questionText: stats.questionText,
      correctCount: stats.correct,
      incorrectCount: stats.incorrect,
      totalAttempts,
      correctPercentage
    };
  }).sort((a, b) => a.questionNumber - b.questionNumber);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params;

    // 驗證用戶權限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    console.log('📊 獲取結果詳情:', resultId);

    // 從數據庫查詢真實數據
    const result = await prisma.assignmentResult.findUnique({
      where: { id: resultId },
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
      return NextResponse.json({ error: '結果不存在' }, { status: 404 });
    }

    // 檢查用戶權限
    if (result.assignment.activity.userId !== session.user.id) {
      return NextResponse.json({ error: '無權限訪問此結果' }, { status: 403 });
    }

    // 格式化參與者數據
    const participants: GameParticipant[] = result.participants.map(p => ({
      id: p.id,
      studentName: p.studentName,
      score: p.score,
      timeSpent: p.timeSpent,
      correctAnswers: p.correctAnswers,
      totalQuestions: p.totalQuestions,
      completedAt: p.completedAt.toISOString(),
      gameData: p.gameData
    }));

    // 計算統計數據
    const statistics = calculateStatistics(participants);
    const questionStatistics = analyzeQuestionStatistics(participants);

    // 生成分享連結
    const shareLink = `https://edu-create.vercel.app/play/${result.assignment.activityId}/${result.assignmentId}`;

    const formattedResult: AssignmentResult = {
      id: result.id,
      title: `"${result.assignment.activity.title}"的結果${result.resultNumber}`,
      activityName: result.assignment.activity.title,
      activityId: result.assignment.activityId,
      assignmentId: result.assignmentId,
      participantCount: participants.length,
      createdAt: result.createdAt.toISOString(),
      deadline: result.assignment.deadline?.toISOString(),
      status: result.status as 'active' | 'completed' | 'expired',
      gameType: '詞彙遊戲', // 可以從 activity 中獲取具體的遊戲類型
      shareLink,
      participants,
      statistics,
      questionStatistics
    };

    console.log('✅ 結果詳情查詢成功:', {
      resultId,
      participantCount: participants.length,
      statisticsCalculated: true,
      questionStatsCount: questionStatistics.length
    });

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error('❌ 獲取結果詳情失敗:', error);
    return NextResponse.json(
      { error: '獲取結果詳情失敗' },
      { status: 500 }
    );
  }
}
