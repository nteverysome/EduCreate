import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// 錯誤類型定義
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// 自定義錯誤類
export class ValidationError extends Error implements ApiError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error implements ApiError {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';
  
  constructor(message: string = '請先登入') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements ApiError {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';
  
  constructor(message: string = '權限不足') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements ApiError {
  statusCode = 404;
  code = 'NOT_FOUND_ERROR';
  
  constructor(message: string = '資源不存在') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error implements ApiError {
  statusCode = 409;
  code = 'CONFLICT_ERROR';
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error implements ApiError {
  statusCode = 429;
  code = 'RATE_LIMIT_ERROR';
  
  constructor(message: string = '請求過於頻繁，請稍後再試') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends Error implements ApiError {
  statusCode = 500;
  code = 'INTERNAL_SERVER_ERROR';
  
  constructor(message: string = '服務器內部錯誤', public details?: any) {
    super(message);
    this.name = 'InternalServerError';
  }
}

// 錯誤處理函數
export function handleApiError(error: any): {
  statusCode: number;
  message: string;
  code?: string;
  details?: any;
} {
  console.error('API錯誤:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code
  });

  // 自定義錯誤
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode || 500,
      message: error.message,
      code: error.code,
      details: error.details
    };
  }

  // Prisma 錯誤
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          statusCode: 409,
          message: '數據已存在，違反唯一約束',
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          details: error.meta
        };
      case 'P2025':
        return {
          statusCode: 404,
          message: '記錄不存在',
          code: 'RECORD_NOT_FOUND',
          details: error.meta
        };
      case 'P2003':
        return {
          statusCode: 400,
          message: '外鍵約束失敗',
          code: 'FOREIGN_KEY_CONSTRAINT_FAILED',
          details: error.meta
        };
      case 'P2014':
        return {
          statusCode: 400,
          message: '關聯記錄不存在',
          code: 'REQUIRED_RELATION_VIOLATION',
          details: error.meta
        };
      default:
        return {
          statusCode: 500,
          message: '數據庫操作失敗',
          code: 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.meta : undefined
        };
    }
  }

  // 數據庫連接錯誤
  if (error.message?.includes('connect') || 
      error.message?.includes('ECONNREFUSED') || 
      error.message?.includes('timeout')) {
    return {
      statusCode: 503,
      message: '數據庫連接失敗，請稍後再試',
      code: 'DATABASE_CONNECTION_ERROR'
    };
  }

  // JWT 錯誤
  if (error.name === 'JsonWebTokenError') {
    return {
      statusCode: 401,
      message: '無效的認證令牌',
      code: 'INVALID_TOKEN'
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      message: '認證令牌已過期',
      code: 'TOKEN_EXPIRED'
    };
  }

  // 驗證錯誤
  if (error.name === 'ValidationError') {
    return {
      statusCode: 400,
      message: error.message || '輸入數據無效',
      code: 'VALIDATION_ERROR',
      details: error.details
    };
  }

  // 默認錯誤
  return {
    statusCode: 500,
    message: '服務器內部錯誤',
    code: 'INTERNAL_SERVER_ERROR',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
}

// 錯誤處理中間件
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      const errorResponse = handleApiError(error);
      
      // 記錄錯誤（可以集成到日誌系統）
      console.error('API請求失敗:', {
        method: req.method,
        url: req.url,
        error: errorResponse,
        timestamp: new Date().toISOString()
      });

      // 返回錯誤響應
      return res.status(errorResponse.statusCode).json({
        success: false,
        error: {
          message: errorResponse.message,
          code: errorResponse.code,
          details: errorResponse.details
        }
      });
    }
  };
}

// 異步錯誤處理包裝器
export function asyncHandler(
  fn: (req: NextApiRequest, res: NextApiResponse) => Promise<any>
) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return Promise.resolve(fn(req, res)).catch((error) => {
      const errorResponse = handleApiError(error);
      return res.status(errorResponse.statusCode).json({
        success: false,
        error: {
          message: errorResponse.message,
          code: errorResponse.code,
          details: errorResponse.details
        }
      });
    });
  };
}

// 驗證輸入數據的輔助函數
export function validateRequired(data: any, fields: string[]): void {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(`缺少必填欄位: ${missing.join(', ')}`, { missing });
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('電子郵件格式無效');
  }
}

export function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new ValidationError('密碼必須至少8個字符');
  }
}

export function validateUUID(id: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new ValidationError('無效的ID格式');
  }
}
