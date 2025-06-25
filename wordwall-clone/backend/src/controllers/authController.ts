import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, SubscriptionType } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { generateTokens, verifyToken } from '../middleware/auth';
import { trackUserBehavior, trackError } from '../utils/langfuse';

const prisma = new PrismaClient();

/**
 * 用戶註冊
 */
export const register = async (req: Request, res: Response) => {
  try {
    // 驗證輸入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, username, password, displayName, role = 'TEACHER' } = req.body;

    // 檢查用戶是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken',
        code: 'USER_EXISTS',
      });
    }

    // 加密密碼
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 創建用戶
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName,
        role: role as UserRole,
        subscriptionType: SubscriptionType.FREE,
        emailVerified: false,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        subscriptionType: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // 生成 tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // 保存 refresh token 到數據庫
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken: accessToken.substring(0, 32), // 簡化的 session token
        refreshToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 天
      },
    });

    // 追蹤用戶註冊
    await trackUserBehavior('register', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'register',
      body: { ...req.body, password: '[REDACTED]' },
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * 用戶登入
 */
export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        passwordHash: true,
        role: true,
        subscriptionType: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // 生成 tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // 更新最後登入時間
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 保存 session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken: accessToken.substring(0, 32),
        refreshToken,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // 追蹤用戶登入
    await trackUserBehavior('login', {
      userId: user.id,
      email: user.email,
      lastLoginAt: user.lastLoginAt,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'login',
      email: req.body.email,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * 刷新 Token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
        code: 'MISSING_REFRESH_TOKEN',
      });
    }

    // 驗證 refresh token
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE',
      });
    }

    // 檢查 session 是否存在
    const session = await prisma.userSession.findFirst({
      where: {
        refreshToken: token,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            role: true,
            subscriptionType: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || !session.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    // 生成新的 tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(session.userId);

    // 更新 session
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        user: session.user,
        accessToken,
        refreshToken: newRefreshToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'refresh_token',
    });

    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }
};

/**
 * 用戶登出
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      // 刪除 session
      await prisma.userSession.deleteMany({
        where: { refreshToken: token },
      });
    }

    // 追蹤用戶登出
    if (req.user) {
      await trackUserBehavior('logout', {
        userId: req.user.id,
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'logout',
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
 * 獲取當前用戶信息
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        subscriptionType: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    await trackError(error as Error, {
      action: 'get_profile',
      userId: req.user?.id,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

// 驗證規則
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('displayName')
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name is required and must be less than 100 characters'),
  body('role')
    .optional()
    .isIn(['STUDENT', 'TEACHER'])
    .withMessage('Role must be STUDENT or TEACHER'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export default {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  registerValidation,
  loginValidation,
};
