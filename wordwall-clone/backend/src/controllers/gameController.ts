import { Request, Response } from 'express';
import { PrismaClient, SessionType } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { trackGameExecution, trackError } from '../utils/langfuse';
import { aiAgentTracer } from '../tracing';
import SpinWheelEngine from '../game-engines/spinWheelEngine';
import GroupSortEngine from '../game-engines/groupSortEngine';
import FlashCardsEngine from '../game-engines/flashCardsEngine';

const prisma = new PrismaClient();

// 遊戲引擎實例
const spinWheelEngine = new SpinWheelEngine();
const groupSortEngine = new GroupSortEngine();
const flashCardsEngine = new FlashCardsEngine();

/**
 * 開始遊戲會話
 */
export const startGameSession = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { activityId, playerName, playerEmail, sessionType = 'SINGLE' } = req.body;
    const playerId = req.user?.id;

    // 檢查活動是否存在
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND',
      });
    }

    // 檢查活動是否為公開或用戶有權限訪問
    if (!activity.isPublic && activity.userId !== playerId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this activity',
        code: 'ACCESS_DENIED',
      });
    }

    // 創建遊戲會話
    const gameSession = await aiAgentTracer.traceDatabase('create', 'GameSession', async () => {
      return prisma.gameSession.create({
        data: {
          activityId,
          playerName,
          playerEmail,
          playerId,
          sessionType: sessionType as SessionType,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
        include: {
          activity: {
            include: {
              template: true,
            },
          },
        },
      });
    });

    // 增加活動播放次數
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        playCount: { increment: 1 },
      },
    });

    // 追蹤遊戲開始
    await trackGameExecution(
      activity.template.type,
      'start_session',
      {
        activityId,
        playerName,
        sessionType,
      },
      {
        sessionId: gameSession.id,
        activityTitle: activity.title,
      },
      {
        duration: 0,
      }
    );

    res.status(201).json({
      success: true,
      data: {
        session: gameSession,
        activity: {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          content: activity.content,
          settings: activity.settings,
          template: activity.template,
        },
      },
      message: 'Game session started successfully',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'start_game_session',
      activityId: req.body.activityId,
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * 提交遊戲答案
 */
export const submitGameAnswer = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { sessionId } = req.params;
    const { questionId, answer, timeSpent } = req.body;

    // 檢查會話是否存在
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        activity: {
          include: {
            template: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    if (session.isCompleted) {
      return res.status(400).json({
        success: false,
        error: 'Game session is already completed',
        code: 'SESSION_COMPLETED',
      });
    }

    // 驗證答案並計算分數
    const result = await aiAgentTracer.traceGameLogic(
      session.activity.template.type,
      'validate_answer',
      async () => {
        switch (session.activity.template.type) {
          case 'QUIZ':
            return validateQuizAnswer(session.activity.content, questionId, answer);
          case 'MATCH_UP':
            return validateMatchUpAnswer(session.activity.content, questionId, answer);
          case 'SPIN_WHEEL':
            return validateSpinWheelAnswer(session.activity.content, questionId, answer);
          case 'GROUP_SORT':
            return validateGroupSortAnswer(session.activity.content, questionId, answer);
          case 'FLASH_CARDS':
            return validateFlashCardsAnswer(session.activity.content, questionId, answer);
          default:
            throw new Error(`Unsupported game type: ${session.activity.template.type}`);
        }
      }
    );

    // 追蹤答案提交
    await trackGameExecution(
      session.activity.template.type,
      'submit_answer',
      {
        sessionId,
        questionId,
        answer,
        timeSpent,
      },
      result,
      {
        duration: timeSpent,
        score: result.isCorrect ? 1 : 0,
        accuracy: result.isCorrect ? 100 : 0,
      }
    );

    res.json({
      success: true,
      data: {
        result: {
          isCorrect: result.isCorrect,
          correctAnswer: result.correctAnswer,
          explanation: result.explanation,
          score: result.score,
        },
      },
      message: 'Answer submitted successfully',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'submit_game_answer',
      sessionId: req.params.sessionId,
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * 完成遊戲會話
 */
export const completeGameSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { answers, finalScore, timeTaken } = req.body;

    // 檢查會話是否存在
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        activity: {
          include: {
            template: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
        code: 'SESSION_NOT_FOUND',
      });
    }

    if (session.isCompleted) {
      return res.status(400).json({
        success: false,
        error: 'Game session is already completed',
        code: 'SESSION_COMPLETED',
      });
    }

    // 計算最終結果
    const gameResult = await aiAgentTracer.traceGameLogic(
      session.activity.template.type,
      'calculate_final_result',
      async () => {
        switch (session.activity.template.type) {
          case 'QUIZ':
            return calculateQuizResult(session.activity.content, answers, timeTaken);
          case 'MATCH_UP':
            return calculateMatchUpResult(session.activity.content, answers, timeTaken);
          case 'SPIN_WHEEL':
            return calculateSpinWheelResult(session.activity.content, answers, timeTaken);
          case 'GROUP_SORT':
            return calculateGroupSortResult(session.activity.content, answers, timeTaken);
          case 'FLASH_CARDS':
            return calculateFlashCardsResult(session.activity.content, answers, timeTaken);
          default:
            throw new Error(`Unsupported game type: ${session.activity.template.type}`);
        }
      }
    );

    // 更新會話狀態
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // 保存遊戲結果
    const result = await prisma.gameResult.create({
      data: {
        sessionId,
        activityId: session.activityId,
        playerName: session.playerName,
        playerEmail: session.playerEmail,
        score: gameResult.score,
        maxScore: gameResult.maxScore,
        percentage: gameResult.percentage,
        timeTaken,
        answers: answers,
        metadata: {
          correctAnswers: gameResult.correctAnswers,
          incorrectAnswers: gameResult.incorrectAnswers,
          skippedQuestions: gameResult.skippedQuestions,
          averageTime: gameResult.averageTime,
        },
      },
    });

    // 追蹤遊戲完成
    await trackGameExecution(
      session.activity.template.type,
      'complete_session',
      {
        sessionId,
        answers,
        finalScore,
        timeTaken,
      },
      gameResult,
      {
        duration: timeTaken,
        score: gameResult.score,
        accuracy: gameResult.percentage,
      }
    );

    res.json({
      success: true,
      data: {
        session: updatedSession,
        result: {
          ...gameResult,
          id: result.id,
        },
      },
      message: 'Game completed successfully',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'complete_game_session',
      sessionId: req.params.sessionId,
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * 獲取遊戲結果
 */
export const getGameResult = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const result = await prisma.gameResult.findFirst({
      where: { sessionId },
      include: {
        session: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Game result not found',
        code: 'RESULT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: { result },
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'get_game_result',
      sessionId: req.params.sessionId,
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

// 輔助函數：驗證 Quiz 答案
function validateQuizAnswer(activityContent: any, questionId: string, answer: string) {
  const questions = activityContent.questions || [];
  const question = questions.find((q: any) => q.id === questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  const correctOption = question.options.find((opt: any) => opt.isCorrect);
  const isCorrect = correctOption?.id === answer;

  return {
    isCorrect,
    correctAnswer: correctOption?.id,
    explanation: question.explanation,
    score: isCorrect ? (question.points || 1) : 0,
  };
}

// 輔助函數：計算 Quiz 最終結果
function calculateQuizResult(activityContent: any, answers: Record<string, any>, timeTaken: number) {
  const questions = activityContent.questions || [];
  let score = 0;
  let maxScore = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let skippedQuestions = 0;

  questions.forEach((question: any) => {
    const questionPoints = question.points || 1;
    maxScore += questionPoints;

    const playerAnswer = answers[question.id];

    if (!playerAnswer) {
      skippedQuestions++;
      return;
    }

    const correctOption = question.options.find((opt: any) => opt.isCorrect);
    if (correctOption?.id === playerAnswer.answer) {
      score += questionPoints;
      correctAnswers++;
    } else {
      incorrectAnswers++;
    }
  });

  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const averageTime = questions.length > 0 ? timeTaken / questions.length : 0;

  return {
    score,
    maxScore,
    percentage: Math.round(percentage * 100) / 100, // 保留兩位小數
    correctAnswers,
    incorrectAnswers,
    skippedQuestions,
    averageTime: Math.round(averageTime),
  };
}

// 輔助函數：驗證 Match Up 答案
function validateMatchUpAnswer(activityContent: any, leftId: string, rightId: string) {
  const pairs = activityContent.pairs || [];
  const correctPair = pairs.find((pair: any) => pair.left.id === leftId);

  if (!correctPair) {
    throw new Error('Left item not found');
  }

  const isCorrect = correctPair.right.id === rightId;

  return {
    isCorrect,
    correctAnswer: correctPair.right.id,
    explanation: correctPair.explanation,
    score: isCorrect ? 1 : 0,
  };
}

// 輔助函數：計算 Match Up 最終結果
function calculateMatchUpResult(activityContent: any, answers: Record<string, any>, timeTaken: number) {
  const pairs = activityContent.pairs || [];
  let score = 0;
  let maxScore = pairs.length;
  let correctMatches = 0;
  let incorrectMatches = 0;
  let skippedMatches = 0;

  pairs.forEach((pair: any) => {
    const playerAnswer = answers[pair.left.id];

    if (!playerAnswer) {
      skippedMatches++;
      return;
    }

    if (pair.right.id === playerAnswer.answer) {
      score++;
      correctMatches++;
    } else {
      incorrectMatches++;
    }
  });

  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const averageTime = pairs.length > 0 ? timeTaken / pairs.length : 0;

  return {
    score,
    maxScore,
    percentage: Math.round(percentage * 100) / 100,
    correctAnswers: correctMatches,
    incorrectAnswers: incorrectMatches,
    skippedQuestions: skippedMatches,
    averageTime: Math.round(averageTime),
  };
}

// 驗證規則
export const startGameValidation = [
  body('activityId').isUUID().withMessage('Valid activity ID is required'),
  body('playerName').isLength({ min: 1, max: 100 }).withMessage('Player name is required'),
  body('playerEmail').optional().isEmail().withMessage('Valid email is required'),
  body('sessionType').optional().isIn(['SINGLE', 'MULTIPLAYER', 'ASSIGNMENT']).withMessage('Invalid session type'),
];

export const submitAnswerValidation = [
  body('questionId').notEmpty().withMessage('Question ID is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  body('timeSpent').isInt({ min: 0 }).withMessage('Time spent must be a positive integer'),
];

// Spin Wheel 遊戲驗證和計算函數
async function validateSpinWheelAnswer(content: any, questionId: string, answer: any) {
  return await spinWheelEngine.validateAnswer(content, questionId, answer);
}

async function calculateSpinWheelResult(content: any, answers: any, timeTaken: number) {
  return await spinWheelEngine.calculateResult(content, answers, timeTaken);
}

// Group Sort 遊戲驗證和計算函數
async function validateGroupSortAnswer(content: any, questionId: string, answer: any) {
  return await groupSortEngine.validateAnswer(content, questionId, answer);
}

async function calculateGroupSortResult(content: any, answers: any, timeTaken: number) {
  return await groupSortEngine.calculateResult(content, answers, timeTaken);
}

// Flash Cards 遊戲驗證和計算函數
async function validateFlashCardsAnswer(content: any, questionId: string, answer: any) {
  return await flashCardsEngine.validateAnswer(content, questionId, answer);
}

async function calculateFlashCardsResult(content: any, answers: any, timeTaken: number) {
  return await flashCardsEngine.calculateResult(content, answers, timeTaken);
}

export default {
  startGameSession,
  submitGameAnswer,
  completeGameSession,
  getGameResult,
  startGameValidation,
  submitAnswerValidation,
};
