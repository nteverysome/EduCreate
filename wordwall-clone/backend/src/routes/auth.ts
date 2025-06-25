import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  registerValidation,
  loginValidation,
} from '../controllers/authController';
import { authenticate, rateLimitByUser } from '../middleware/auth';

const router = Router();

// 認證相關的速率限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 最多 5 次嘗試
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 最多 100 次請求
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    用戶註冊
 * @access  Public
 * @body    { email, username, password, displayName, role? }
 */
router.post('/register', 
  authLimiter,
  registerValidation,
  register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    用戶登入
 * @access  Public
 * @body    { email, password }
 */
router.post('/login',
  authLimiter,
  loginValidation,
  login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    刷新訪問令牌
 * @access  Public
 * @body    { refreshToken }
 */
router.post('/refresh',
  generalLimiter,
  refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    用戶登出
 * @access  Private
 * @body    { refreshToken? }
 */
router.post('/logout',
  generalLimiter,
  authenticate,
  logout
);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    獲取當前用戶資料
 * @access  Private
 */
router.get('/profile',
  generalLimiter,
  authenticate,
  getProfile
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    更新用戶資料
 * @access  Private
 * @body    { displayName?, avatarUrl? }
 */
router.put('/profile',
  generalLimiter,
  authenticate,
  async (req, res) => {
    try {
      const { displayName, avatarUrl } = req.body;
      const userId = req.user!.id;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(displayName && { displayName }),
          ...(avatarUrl && { avatarUrl }),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          subscriptionType: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        data: { user: updatedUser },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    修改密碼
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.post('/change-password',
  authLimiter,
  authenticate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      // 驗證輸入
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required',
          code: 'MISSING_FIELDS',
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 8 characters long',
          code: 'WEAK_PASSWORD',
        });
      }

      // 獲取用戶當前密碼
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      // 驗證當前密碼
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD',
        });
      }

      // 加密新密碼
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // 更新密碼
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      // 刪除所有現有的 session（強制重新登入）
      await prisma.userSession.deleteMany({
        where: { userId },
      });

      res.json({
        success: true,
        message: 'Password changed successfully. Please log in again.',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    驗證電子郵件
 * @access  Private
 * @body    { verificationCode }
 */
router.post('/verify-email',
  generalLimiter,
  authenticate,
  async (req, res) => {
    try {
      // 這裡應該實現電子郵件驗證邏輯
      // 暫時直接標記為已驗證
      const userId = req.user!.id;

      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      });

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    獲取用戶的所有活躍會話
 * @access  Private
 */
router.get('/sessions',
  generalLimiter,
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user!.id;

      const sessions = await prisma.userSession.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: { sessions },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @desc    刪除指定會話
 * @access  Private
 */
router.delete('/sessions/:sessionId',
  generalLimiter,
  authenticate,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.id;

      await prisma.userSession.deleteMany({
        where: {
          id: sessionId,
          userId,
        },
      });

      res.json({
        success: true,
        message: 'Session deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

export default router;
