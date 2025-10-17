import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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
  shareToken?: string; // 🎯 添加 shareToken 字段
  participants: GameParticipant[];
  statistics: StatisticsSummary;
  questionStatistics: QuestionStatistic[];
}

/**
 * 計算統計數據總結
 */
function calculateStatistics(participants: GameParticipant[], activityVocabularyCount: number): StatisticsSummary {
  if (participants.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      highestScore: { score: 0, studentName: '' },
      fastestTime: { timeSpent: 0, studentName: '' }
    };
  }

  // 🎯 重新計算每個參與者的正確分數（基於活動詞彙數量，與 Wordwall 邏輯一致）
  const participantsWithCorrectScores = participants.map(p => {
    let correctScore = 0;

    // 🔥 關鍵修復：使用活動詞彙數量而非遊戲問題次數
    // 這與 Wordwall 的邏輯一致：正確答案數 ÷ 活動中的詞彙數量
    if (p.correctAnswers !== undefined && activityVocabularyCount > 0) {
      correctScore = Math.round((p.correctAnswers / activityVocabularyCount) * 100);
    }
    // 如果沒有 correctAnswers，嘗試從遊戲數據中計算
    else if (p.gameData && p.gameData.finalResult) {
      const finalResult = p.gameData.finalResult;
      if (finalResult.correctAnswers !== undefined && activityVocabularyCount > 0) {
        correctScore = Math.round((finalResult.correctAnswers / activityVocabularyCount) * 100);
      } else {
        // 使用原始分數作為後備
        correctScore = p.score || 0;
      }
    } else {
      correctScore = p.score || 0;
    }

    return {
      ...p,
      calculatedScore: correctScore
    };
  });

  // 計算平均分（基於重新計算的分數）
  const totalScore = participantsWithCorrectScores.reduce((sum, p) => sum + p.calculatedScore, 0);
  const averageScore = Math.round((totalScore / participants.length) * 100) / 100;

  // 找出最高分（基於重新計算的分數）
  const highestScoreParticipant = participantsWithCorrectScores.reduce((max, p) =>
    p.calculatedScore > max.calculatedScore ? p : max
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
      score: highestScoreParticipant.calculatedScore,
      studentName: highestScoreParticipant.studentName
    },
    fastestTime: {
      timeSpent: fastestTimeParticipant.timeSpent,
      studentName: fastestTimeParticipant.studentName
    }
  };
}

/**
 * 計算統計數據並返回修正後的參與者數據
 */
function calculateStatisticsWithCorrectedScores(participants: GameParticipant[], activityVocabularyCount: number): {
  statistics: StatisticsSummary;
  correctedParticipants: (GameParticipant & { calculatedScore: number })[];
} {
  if (participants.length === 0) {
    return {
      statistics: {
        totalStudents: 0,
        averageScore: 0,
        highestScore: { score: 0, studentName: '' },
        fastestTime: { timeSpent: 0, studentName: '' }
      },
      correctedParticipants: []
    };
  }

  // 🎯 重新計算每個參與者的正確分數（基於活動詞彙數量，與 Wordwall 邏輯一致）
  const participantsWithCorrectScores = participants.map(p => {
    let correctScore = 0;

    // 🔥 關鍵修復：使用活動詞彙數量而非遊戲問題次數
    // 這與 Wordwall 的邏輯一致：正確答案數 ÷ 活動中的詞彙數量
    if (p.correctAnswers !== undefined && activityVocabularyCount > 0) {
      correctScore = Math.round((p.correctAnswers / activityVocabularyCount) * 100);
    }
    // 如果沒有 correctAnswers，嘗試從遊戲數據中計算
    else if (p.gameData && p.gameData.finalResult) {
      const finalResult = p.gameData.finalResult;
      if (finalResult.correctAnswers !== undefined && activityVocabularyCount > 0) {
        correctScore = Math.round((finalResult.correctAnswers / activityVocabularyCount) * 100);
      } else {
        // 使用原始分數作為後備
        correctScore = p.score || 0;
      }
    } else {
      correctScore = p.score || 0;
    }

    return {
      ...p,
      calculatedScore: correctScore
    };
  });

  // 計算平均分（基於修正後的分數）
  const totalScore = participantsWithCorrectScores.reduce((sum, p) => sum + p.calculatedScore, 0);
  const averageScore = Math.round((totalScore / participants.length) * 100) / 100;

  // 找出最高分（基於修正後的分數）
  const highestScoreParticipant = participantsWithCorrectScores.reduce((max, p) =>
    p.calculatedScore > max.calculatedScore ? p : max
  );

  // 找出最快時間（排除0或無效時間）
  const validTimeParticipants = participants.filter(p => p.timeSpent > 0);
  const fastestTimeParticipant = validTimeParticipants.length > 0
    ? validTimeParticipants.reduce((min, p) =>
        p.timeSpent < min.timeSpent ? p : min
      )
    : participants[0];

  return {
    statistics: {
      totalStudents: participants.length,
      averageScore,
      highestScore: {
        score: highestScoreParticipant.calculatedScore,
        studentName: highestScoreParticipant.studentName
      },
      fastestTime: {
        timeSpent: fastestTimeParticipant.timeSpent,
        studentName: fastestTimeParticipant.studentName
      }
    },
    correctedParticipants: participantsWithCorrectScores
  };
}

/**
 * 分析問題統計數據 - 基於活動的詞彙列表
 */
async function analyzeQuestionStatistics(participants: GameParticipant[], activityId: string): Promise<QuestionStatistic[]> {
  if (participants.length === 0) {
    return [];
  }

  try {
    // 🎯 獲取活動的原始詞彙列表
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        vocabularyItems: true
      }
    });

    if (!activity || !activity.vocabularyItems.length) {
      console.log('⚠️ 活動沒有詞彙數據，使用舊邏輯');
      return analyzeQuestionStatisticsLegacy(participants);
    }

    // 🎯 基於活動詞彙創建統計映射
    const questionMap = new Map<string, {
      questionText: string;
      correct: number;
      incorrect: number;
    }>();

    // 初始化每個詞彙的統計
    activity.vocabularyItems.forEach((item, index) => {
      const questionText = item.chinese || item.english || `詞彙 ${index + 1}`;
      questionMap.set(questionText, {
        questionText,
        correct: 0,
        incorrect: 0
      });
    });

    // 🎯 統計每個學生對每個詞彙的答題情況
    participants.forEach(participant => {
      if (participant.gameData && participant.gameData.finalResult && participant.gameData.finalResult.questions) {
        participant.gameData.finalResult.questions.forEach((question: any) => {
          const questionText = question.questionText;
          if (questionMap.has(questionText)) {
            const stats = questionMap.get(questionText)!;
            if (question.isCorrect) {
              stats.correct++;
            } else {
              stats.incorrect++;
            }
          }
        });
      }
    });

    // 🎯 轉換為結果數組
    const results: QuestionStatistic[] = [];
    let index = 1;

    for (const [questionText, stats] of questionMap) {
      results.push({
        questionNumber: index++,
        questionText: stats.questionText,
        correctCount: stats.correct,
        incorrectCount: stats.incorrect,
        totalAttempts: stats.correct + stats.incorrect,
        correctPercentage: stats.correct + stats.incorrect > 0
          ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
          : 0
      });
    }

    console.log(`📊 基於活動詞彙統計完成: ${results.length} 個問題`);
    return results;

  } catch (error) {
    console.error('❌ 分析問題統計時出錯:', error);
    return analyzeQuestionStatisticsLegacy(participants);
  }
}

/**
 * 舊版問題統計邏輯（向後兼容）
 */
function analyzeQuestionStatisticsLegacy(participants: GameParticipant[]): QuestionStatistic[] {
  // 收集所有問題數據
  const questionMap = new Map<string, {
    questionText: string;
    correct: number;
    incorrect: number;
  }>();

  participants.forEach(participant => {
    // 🆕 檢查新的問題數據結構（從遊戲的finalResult.questions）
    if (participant.gameData && participant.gameData.finalResult && participant.gameData.finalResult.questions) {
      participant.gameData.finalResult.questions.forEach((question: any, index: number) => {
        const key = `${question.questionNumber || index + 1}`;
        const questionText = question.questionText || question.text || question.word || `問題 ${index + 1}`;

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
    }
    // 🆕 兼容舊的數據結構
    else if (participant.gameData && participant.gameData.questions) {
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

// 生成 shareToken 的函數
function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
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

    // 如果沒有 shareToken，生成一個
    let updatedResult = result;
    if (!result.shareToken) {
      const shareToken = generateShareToken();
      updatedResult = await prisma.assignmentResult.update({
        where: { id: resultId },
        data: { shareToken },
        include: {
          assignment: {
            include: {
              activity: true
            }
          },
          participants: true
        }
      });
    }

    // 檢查用戶權限
    if (result.assignment.activity.userId !== session.user.id) {
      return NextResponse.json({ error: '無權限訪問此結果' }, { status: 403 });
    }

    // 格式化參與者數據
    const participants: GameParticipant[] = updatedResult.participants.map((p: any) => ({
      id: p.id,
      studentName: p.studentName,
      score: p.score,
      timeSpent: p.timeSpent,
      correctAnswers: p.correctAnswers,
      totalQuestions: p.totalQuestions,
      completedAt: p.completedAt.toISOString(),
      gameData: p.gameData
    }));

    // 🎯 獲取活動詞彙數量用於分數計算
    const activity = await prisma.activity.findUnique({
      where: { id: result.assignment.activityId },
      include: {
        vocabularyItems: true
      }
    });
    const activityVocabularyCount = activity?.vocabularyItems.length || 3; // 默認3個詞彙

    // 🎯 計算統計數據和修正後的參與者分數（使用 Wordwall 邏輯：基於活動詞彙數量）
    const statisticsResult = calculateStatisticsWithCorrectedScores(participants, activityVocabularyCount);
    const questionStatistics = await analyzeQuestionStatistics(participants, result.assignment.activityId);

    // 使用修正後的參與者數據
    const correctedParticipants = statisticsResult.correctedParticipants;

    // 生成分享連結
    const shareLink = `https://edu-create.vercel.app/play/${result.assignment.activityId}/${result.assignmentId}`;

    // 從 activity 中獲取遊戲類型，映射到實際的遊戲 ID
    const getGameId = (activityType?: string): string => {
      // 根據活動類型返回對應的遊戲 ID
      switch (activityType) {
        case '飛機碰撞遊戲':
        case '詞彙遊戲':
        default:
          return 'shimozurdo-game';
      }
    };

    const formattedResult: AssignmentResult = {
      id: updatedResult.id,
      title: updatedResult.customTitle || `"${updatedResult.assignment.activity.title}"的結果${updatedResult.resultNumber}`,
      activityName: updatedResult.assignment.activity.title,
      activityId: updatedResult.assignment.activityId,
      assignmentId: updatedResult.assignmentId,
      participantCount: participants.length,
      createdAt: updatedResult.createdAt.toISOString(),
      deadline: updatedResult.assignment.deadline?.toISOString(),
      status: updatedResult.status as 'active' | 'completed' | 'expired',
      gameType: getGameId(updatedResult.assignment.activity.type), // 返回實際的遊戲 ID
      shareLink,
      shareToken: updatedResult.shareToken ?? undefined, // 🎯 將 null 轉換為 undefined
      participants: correctedParticipants, // 🎯 使用修正後的參與者數據（包含 calculatedScore）
      statistics: statisticsResult.statistics, // 🎯 使用修正後的統計數據
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

/**
 * 更新結果（重命名等）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params;
    const body = await request.json() as { title?: string };

    // 驗證用戶權限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    console.log('🔄 更新結果:', resultId, body);

    // 檢查結果是否存在並驗證權限
    const existingResult = await prisma.assignmentResult.findUnique({
      where: { id: resultId },
      include: {
        assignment: {
          include: {
            activity: true
          }
        }
      }
    });

    if (!existingResult) {
      return NextResponse.json({ error: '結果不存在' }, { status: 404 });
    }

    // 檢查用戶權限
    if (existingResult.assignment.activity.userId !== session.user.id) {
      return NextResponse.json({ error: '無權限修改此結果' }, { status: 403 });
    }

    // 準備更新數據
    const updateData: any = {};

    // 處理標題更新
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return NextResponse.json({ error: '標題不能為空' }, { status: 400 });
      }
      if (body.title.trim().length > 100) {
        return NextResponse.json({ error: '標題長度不能超過100個字符' }, { status: 400 });
      }
      updateData.customTitle = body.title.trim();
    }

    // 執行更新
    const updatedResult = await prisma.assignmentResult.update({
      where: { id: resultId },
      data: updateData,
      include: {
        assignment: {
          include: {
            activity: true
          }
        }
      }
    });

    console.log('✅ 結果更新成功:', {
      resultId,
      updatedFields: Object.keys(updateData)
    });

    // 返回更新後的基本信息
    return NextResponse.json({
      id: updatedResult.id,
      title: updatedResult.customTitle || `"${updatedResult.assignment.activity.title}"的結果${updatedResult.resultNumber}`,
      activityName: updatedResult.assignment.activity.title,
      updatedAt: updatedResult.updatedAt.toISOString()
    });

  } catch (error) {
    console.error('❌ 更新結果失敗:', error);
    return NextResponse.json(
      { error: '更新結果失敗' },
      { status: 500 }
    );
  }
}

/**
 * 刪除結果
 */
export async function DELETE(
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

    console.log('🗑️ 刪除結果:', resultId);

    // 檢查結果是否存在並驗證權限
    const existingResult = await prisma.assignmentResult.findUnique({
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

    if (!existingResult) {
      return NextResponse.json({ error: '結果不存在' }, { status: 404 });
    }

    // 檢查用戶權限
    if (existingResult.assignment.activity.userId !== session.user.id) {
      return NextResponse.json({ error: '無權限刪除此結果' }, { status: 403 });
    }

    // 使用事務刪除結果及其相關數據
    await prisma.$transaction(async (tx) => {
      // 1. 刪除所有參與者記錄
      await tx.gameParticipant.deleteMany({
        where: { resultId: resultId }
      });

      // 2. 刪除結果記錄
      await tx.assignmentResult.delete({
        where: { id: resultId }
      });
    });

    console.log('✅ 結果刪除成功:', {
      resultId,
      participantCount: existingResult.participants.length
    });

    return NextResponse.json({
      success: true,
      message: '結果已成功刪除',
      deletedResult: {
        id: existingResult.id,
        title: existingResult.customTitle || `"${existingResult.assignment.activity.title}"的結果${existingResult.resultNumber}`,
        participantCount: existingResult.participants.length
      }
    });

  } catch (error) {
    console.error('❌ 刪除結果失敗:', error);
    return NextResponse.json(
      { error: '刪除結果失敗' },
      { status: 500 }
    );
  }
}
