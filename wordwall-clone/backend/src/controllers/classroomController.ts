import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { trackUserBehavior, trackError } from '../utils/langfuse';
import { aiAgentTracer } from '../tracing';

const prisma = new PrismaClient();

/**
 * 創建班級
 */
export const createClassroom = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, description, subject, grade } = req.body;
    const teacherId = req.user!.id;

    // 檢查用戶是否為教師
    if (req.user!.role !== 'TEACHER' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only teachers can create classrooms',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    // 生成班級代碼
    const classCode = await generateUniqueClassCode();

    const classroom = await aiAgentTracer.traceDatabase('create', 'Classroom', async () => {
      return prisma.classroom.create({
        data: {
          name,
          description,
          subject,
          grade,
          classCode,
          teacherId,
        },
        include: {
          teacher: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          _count: {
            select: {
              students: true,
              assignments: true,
            },
          },
        },
      });
    });

    // 追蹤班級創建
    await trackUserBehavior('create_classroom', {
      classroomId: classroom.id,
      teacherId,
      name,
      subject,
    });

    res.status(201).json({
      success: true,
      data: { classroom },
      message: 'Classroom created successfully',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'create_classroom',
      userId: req.user?.id,
      body: req.body,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * 獲取教師的班級列表
 */
export const getTeacherClassrooms = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.id;
    const { page = 1, limit = 10, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { teacherId };
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [classrooms, total] = await Promise.all([
      prisma.classroom.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              students: true,
              assignments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.classroom.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        classrooms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'get_teacher_classrooms',
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
 * 學生加入班級
 */
export const joinClassroom = async (req: Request, res: Response) => {
  try {
    const { classCode } = req.body;
    const studentId = req.user!.id;

    // 檢查班級是否存在
    const classroom = await prisma.classroom.findUnique({
      where: { classCode },
      include: {
        teacher: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: 'Classroom not found',
        code: 'CLASSROOM_NOT_FOUND',
      });
    }

    // 檢查學生是否已經在班級中
    const existingEnrollment = await prisma.classroomStudent.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: classroom.id,
          studentId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        error: 'Already enrolled in this classroom',
        code: 'ALREADY_ENROLLED',
      });
    }

    // 加入班級
    const enrollment = await prisma.classroomStudent.create({
      data: {
        classroomId: classroom.id,
        studentId,
      },
      include: {
        student: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        classroom: {
          select: {
            id: true,
            name: true,
            subject: true,
            teacher: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    // 追蹤學生加入班級
    await trackUserBehavior('join_classroom', {
      classroomId: classroom.id,
      studentId,
      classCode,
    });

    res.status(201).json({
      success: true,
      data: { enrollment },
      message: 'Successfully joined classroom',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'join_classroom',
      userId: req.user?.id,
      body: req.body,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * 創建作業
 */
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      instructions,
      activityId,
      classroomId,
      dueDate,
      maxAttempts,
      timeLimit,
      showResults,
      showCorrectAnswers,
      allowReview,
    } = req.body;

    const teacherId = req.user!.id;

    // 檢查班級是否屬於該教師
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId,
      },
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: 'Classroom not found or access denied',
        code: 'CLASSROOM_NOT_FOUND',
      });
    }

    // 檢查活動是否存在
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND',
      });
    }

    // 生成作業訪問代碼
    const accessCode = await generateUniqueAccessCode();

    const assignment = await aiAgentTracer.traceDatabase('create', 'Assignment', async () => {
      return prisma.assignment.create({
        data: {
          title,
          description,
          instructions,
          accessCode,
          activityId,
          classroomId,
          teacherId,
          dueDate: dueDate ? new Date(dueDate) : null,
          maxAttempts: maxAttempts || 1,
          timeLimit,
          showResults: showResults ?? true,
          showCorrectAnswers: showCorrectAnswers ?? false,
          allowReview: allowReview ?? true,
        },
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              template: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
          classroom: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    // 追蹤作業創建
    await trackUserBehavior('create_assignment', {
      assignmentId: assignment.id,
      classroomId,
      activityId,
      teacherId,
    });

    res.status(201).json({
      success: true,
      data: { assignment },
      message: 'Assignment created successfully',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'create_assignment',
      userId: req.user?.id,
      body: req.body,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * 獲取班級學生列表
 */
export const getClassroomStudents = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.params;
    const teacherId = req.user!.id;

    // 檢查班級是否屬於該教師
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId,
      },
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        error: 'Classroom not found or access denied',
        code: 'CLASSROOM_NOT_FOUND',
      });
    }

    const students = await prisma.classroomStudent.findMany({
      where: { classroomId },
      include: {
        student: {
          select: {
            id: true,
            displayName: true,
            email: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: {
        student: {
          displayName: 'asc',
        },
      },
    });

    res.json({
      success: true,
      data: { students },
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'get_classroom_students',
      userId: req.user?.id,
      classroomId: req.params.classroomId,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * 獲取作業結果統計
 */
export const getAssignmentResults = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user!.id;

    // 檢查作業是否屬於該教師
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        teacherId,
      },
      include: {
        activity: true,
        classroom: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found or access denied',
        code: 'ASSIGNMENT_NOT_FOUND',
      });
    }

    // 獲取所有結果
    const results = await prisma.gameResult.findMany({
      where: {
        session: {
          assignment: {
            id: assignmentId,
          },
        },
      },
      include: {
        session: {
          include: {
            player: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 計算統計數據
    const stats = await aiAgentTracer.traceDatabase('aggregate', 'GameResult', async () => {
      return calculateAssignmentStats(results);
    });

    res.json({
      success: true,
      data: {
        assignment,
        results,
        stats,
      },
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'get_assignment_results',
      userId: req.user?.id,
      assignmentId: req.params.assignmentId,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

// 輔助函數：生成唯一班級代碼
async function generateUniqueClassCode(): Promise<string> {
  let code: string;
  let exists: boolean;

  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await prisma.classroom.findUnique({
      where: { classCode: code },
    });
    exists = !!existing;
  } while (exists);

  return code;
}

// 輔助函數：生成唯一訪問代碼
async function generateUniqueAccessCode(): Promise<string> {
  let code: string;
  let exists: boolean;

  do {
    code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const existing = await prisma.assignment.findUnique({
      where: { accessCode: code },
    });
    exists = !!existing;
  } while (exists);

  return code;
}

// 輔助函數：計算作業統計
function calculateAssignmentStats(results: any[]) {
  if (results.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      averagePercentage: 0,
      averageTime: 0,
      completionRate: 0,
      highestScore: 0,
      lowestScore: 0,
    };
  }

  const totalSubmissions = results.length;
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
  const totalTime = results.reduce((sum, result) => sum + result.timeTaken, 0);

  return {
    totalSubmissions,
    averageScore: Math.round((totalScore / totalSubmissions) * 100) / 100,
    averagePercentage: Math.round((totalPercentage / totalSubmissions) * 100) / 100,
    averageTime: Math.round(totalTime / totalSubmissions),
    completionRate: 100, // 所有結果都是完成的
    highestScore: Math.max(...results.map(r => r.score)),
    lowestScore: Math.min(...results.map(r => r.score)),
  };
}

// 驗證規則
export const createClassroomValidation = [
  body('name').isLength({ min: 1, max: 100 }).withMessage('Classroom name is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('subject').isLength({ min: 1, max: 50 }).withMessage('Subject is required'),
  body('grade').optional().isLength({ max: 20 }).withMessage('Grade too long'),
];

export const createAssignmentValidation = [
  body('title').isLength({ min: 1, max: 100 }).withMessage('Assignment title is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('activityId').isUUID().withMessage('Valid activity ID is required'),
  body('classroomId').isUUID().withMessage('Valid classroom ID is required'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('maxAttempts').optional().isInt({ min: 1, max: 10 }).withMessage('Max attempts must be 1-10'),
  body('timeLimit').optional().isInt({ min: 60 }).withMessage('Time limit must be at least 60 seconds'),
];

export default {
  createClassroom,
  getTeacherClassrooms,
  joinClassroom,
  createAssignment,
  getClassroomStudents,
  getAssignmentResults,
  createClassroomValidation,
  createAssignmentValidation,
};
