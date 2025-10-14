import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 獲取可共用結果詳情（無需登入）
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: '缺少分享 token' },
        { status: 400 }
      );
    }

    // 通過 shareToken 查找結果
    const result = await prisma.assignmentResult.findUnique({
      where: {
        shareToken: token,
      },
      include: {
        assignment: {
          include: {
            activity: {
              include: {
                vocabularyItems: true,
              },
            },
          },
        },
        participants: {
          orderBy: {
            completedAt: 'asc',
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: '找不到可共用的結果' },
        { status: 404 }
      );
    }

    // 檢查結果狀態
    if (result.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '此結果已不可用' },
        { status: 410 }
      );
    }

    // 獲取活動詞彙數量
    const activityVocabularyCount = result.assignment.activity.vocabularyItems.length;

    // 計算統計數據的函數（與私有 API 相同的邏輯）
    function calculateStatisticsWithCorrectedScores(participants: any[], activityVocabularyCount: number) {
      const participantsWithCorrectScores = participants.map(p => {
        let correctScore = 0;
        if (p.correctAnswers !== undefined && activityVocabularyCount > 0) {
          correctScore = Math.round((p.correctAnswers / activityVocabularyCount) * 100);
        } else if (p.gameData?.finalResult?.correctAnswers !== undefined && activityVocabularyCount > 0) {
          correctScore = Math.round((p.gameData.finalResult.correctAnswers / activityVocabularyCount) * 100);
        } else if (p.score !== undefined) {
          correctScore = p.score;
        }
        
        return {
          ...p,
          calculatedScore: correctScore
        };
      });

      // 計算統計數據
      const totalStudents = participantsWithCorrectScores.length;
      const scores = participantsWithCorrectScores.map(p => p.calculatedScore);
      const averageScore = totalStudents > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / totalStudents) : 0;
      
      const highestScoreValue = totalStudents > 0 ? Math.max(...scores) : 0;
      const highestScoreParticipant = participantsWithCorrectScores.find(p => p.calculatedScore === highestScoreValue);
      
      const fastestParticipant = participantsWithCorrectScores.reduce((fastest, current) => {
        return current.timeSpent < fastest.timeSpent ? current : fastest;
      }, participantsWithCorrectScores[0]);

      return {
        statistics: {
          totalStudents,
          averageScore,
          highestScore: {
            score: highestScoreValue,
            studentName: highestScoreParticipant?.studentName || '',
          },
          fastestTime: fastestParticipant ? {
            timeSpent: fastestParticipant.timeSpent,
            studentName: fastestParticipant.studentName,
          } : null,
        },
        correctedParticipants: participantsWithCorrectScores
      };
    }

    // 分析問題統計的函數
    async function analyzeQuestionStatistics(participants: any[], activityId: string) {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: { vocabularyItems: true }
      });

      if (!activity) return [];

      const questionStatsMap = new Map();
      
      // 初始化統計數據（基於活動詞彙）
      activity.vocabularyItems.forEach((item, index) => {
        questionStatsMap.set(item.chinese, {
          questionNumber: index + 1,
          questionText: item.chinese,
          correctCount: 0,
          incorrectCount: 0,
          totalAttempts: 0,
          correctPercentage: 0
        });
      });

      // 統計參與者的答題情況
      participants.forEach(participant => {
        if (participant.gameData?.finalResult?.questions) {
          participant.gameData.finalResult.questions.forEach((q: any) => {
            const questionText = q.questionText;
            if (questionStatsMap.has(questionText)) {
              const stats = questionStatsMap.get(questionText);
              stats.totalAttempts++;
              if (q.isCorrect) {
                stats.correctCount++;
              } else {
                stats.incorrectCount++;
              }
            }
          });
        }
      });

      // 計算正確率
      questionStatsMap.forEach(stats => {
        if (stats.totalAttempts > 0) {
          stats.correctPercentage = Math.round((stats.correctCount / stats.totalAttempts) * 100);
        }
      });

      return Array.from(questionStatsMap.values());
    }

    // 計算統計數據
    const statisticsResult = calculateStatisticsWithCorrectedScores(result.participants, activityVocabularyCount);
    const questionStatistics = await analyzeQuestionStatistics(result.participants, result.assignment.activityId);

    // 構建響應數據（移除敏感信息）
    const responseData = {
      id: result.id,
      title: `"${result.assignment.activity.title}"的結果${result.resultNumber}`,
      activityName: result.assignment.activity.title,
      activityId: result.assignment.activityId,
      assignmentId: result.assignmentId,
      participantCount: result.participants.length,
      createdAt: result.createdAt.toISOString(),
      status: 'ACTIVE',
      gameType: result.assignment.activity.type,
      participants: statisticsResult.correctedParticipants,
      statistics: statisticsResult.statistics,
      questionStatistics,
      isSharedView: true, // 標記這是共用視圖
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('獲取可共用結果失敗:', error);
    return NextResponse.json(
      { error: '獲取結果失敗' },
      { status: 500 }
    );
  }
}
