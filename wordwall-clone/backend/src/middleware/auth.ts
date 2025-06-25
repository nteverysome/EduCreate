import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { trackError, trackUserBehavior } from '../utils/langfuse';

const prisma = new PrismaClient();

// 擴展 Request 接口以包含用戶信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        displayName: string;
        role: UserRole;
        subscriptionType: string;
      };
    }
  }
}

// JWT 密鑰
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * 生成 JWT Token
 */
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

/**
 * 驗證 JWT Token
 */
export const verifyToken = (token: string): { userId: string; type: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * 認證中間件 - 驗證用戶身份
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前綴
    
    // 驗證 token
    const decoded = verifyToken(token);
    
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // 從數據庫獲取用戶信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        subscriptionType: true,
        isActive: true,
        emailVerified: true,
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // 將用戶信息添加到請求對象
    req.user = user;

    // 追蹤用戶行為
    await trackUserBehavior('authenticate', {
      userId: user.id,
      endpoint: req.path,
      method: req.method,
    });

    next();
  } catch (error) {
    await trackError(error as Error, {
      endpoint: req.path,
      method: req.method,
      headers: req.headers,
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * 可選認證中間件 - 如果有 token 則驗證，沒有則跳過
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // 沒有 token，繼續執行
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded.type === 'access') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          role: true,
          subscriptionType: true,
          isActive: true,
          emailVerified: true,
        }
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // 忽略錯誤，繼續執行
    next();
  }
};

/**
 * 角色授權中間件
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

/**
 * 訂閱類型檢查中間件
 */
export const requireSubscription = (...subscriptionTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!subscriptionTypes.includes(req.user.subscriptionType)) {
      return res.status(403).json({
        success: false,
        error: 'Premium subscription required',
        code: 'PREMIUM_REQUIRED'
      });
    }

    next();
  };
};

/**
 * 資源所有者檢查中間件
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        });
      }

      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: 'Resource ID required',
          code: 'RESOURCE_ID_REQUIRED'
        });
      }

      // 檢查資源是否屬於當前用戶
      // 這裡需要根據具體的資源類型來實現
      // 例如：檢查活動是否屬於當前用戶
      const activity = await prisma.activity.findFirst({
        where: {
          id: resourceId,
          userId: req.user.id,
        },
      });

      if (!activity && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this resource',
          code: 'ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      await trackError(error as Error, {
        userId: req.user?.id,
        resourceId: req.params[resourceIdParam],
        endpoint: req.path,
      });

      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * 速率限制中間件
 */
export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    
    const userLimit = userRequests.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
      });
    }

    userLimit.count++;
    next();
  };
};

export default {
  authenticate,
  optionalAuthenticate,
  authorize,
  requireSubscription,
  requireOwnership,
  rateLimitByUser,
  generateTokens,
  verifyToken,
};
