import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { hasPermission } from '../permissions';
import { performanceMonitor } from '../utils/performanceMonitor';
import { globalCache } from '../cache/CacheManager';

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

interface MiddlewareOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  cache?: {
    ttl: number;
    key?: (req: NextApiRequest) => string;
  };
  validation?: {
    body?: any;
    query?: any;
  };
}

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * API 中間件工廠函數
 * 提供認證、權限檢查、速率限制、緩存等功能
 */
export function withMiddleware(
  handler: ApiHandler,
  options: MiddlewareOptions = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    const endpoint = req.url || 'unknown';
    const method = req.method || 'GET';

    try {
      // 性能監控開始
      performanceMonitor.startTimer('api_request', {
        endpoint,
        method,
      });

      // 1. CORS 處理
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.status(200).end();
        return;
      }

      // 2. 速率限制
      if (options.rateLimit) {
        const rateLimitResult = await checkRateLimit(req, options.rateLimit);
        if (!rateLimitResult.allowed) {
          throw createApiError('請求過於頻繁，請稍後再試', 429, 'RATE_LIMIT_EXCEEDED');
        }
      }

      // 3. 認證檢查
      let session = null;
      if (options.requireAuth) {
        session = await getSession({ req });
        if (!session) {
          throw createApiError('未授權訪問', 401, 'UNAUTHORIZED');
        }
      }

      // 4. 權限檢查
      if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        if (!session) {
          session = await getSession({ req });
        }
        
        if (!session) {
          throw createApiError('未授權訪問', 401, 'UNAUTHORIZED');
        }

        const userRole = session.user?.role || 'USER';
        const hasRequiredPermissions = options.requiredPermissions.every(permission =>
          hasPermission(userRole, permission)
        );

        if (!hasRequiredPermissions) {
          throw createApiError('權限不足', 403, 'FORBIDDEN');
        }
      }

      // 5. 請求驗證
      if (options.validation) {
        validateRequest(req, options.validation);
      }

      // 6. 緩存檢查（僅 GET 請求）
      if (method === 'GET' && options.cache) {
        const cacheKey = options.cache.key 
          ? options.cache.key(req)
          : `${endpoint}:${JSON.stringify(req.query)}`;
        
        const cached = globalCache.get(cacheKey);
        if (cached) {
          performanceMonitor.increment('cache_hit', 1, { endpoint });
          res.status(200).json(cached);
          return;
        }
      }

      // 7. 執行處理器
      await handler(req, res);

      // 8. 緩存響應（僅成功的 GET 請求）
      if (method === 'GET' && options.cache && res.statusCode === 200) {
        const cacheKey = options.cache.key 
          ? options.cache.key(req)
          : `${endpoint}:${JSON.stringify(req.query)}`;
        
        // 注意：這裡需要在實際項目中實現響應攔截
        performanceMonitor.increment('cache_miss', 1, { endpoint });
      }

      // 記錄成功的 API 調用
      const duration = Date.now() - startTime;
      performanceMonitor.recordApiCall(endpoint, method, res.statusCode, duration);

    } catch (error) {
      // 錯誤處理
      const apiError = error as ApiError;
      const statusCode = apiError.statusCode || 500;
      const message = apiError.message || '內部服務器錯誤';
      const code = apiError.code || 'INTERNAL_ERROR';

      // 記錄錯誤
      performanceMonitor.recordError(apiError, endpoint, {
        method,
        statusCode: statusCode.toString(),
      });

      // 返回錯誤響應
      res.status(statusCode).json({
        error: message,
        code,
        timestamp: new Date().toISOString(),
      });

      // 記錄失敗的 API 調用
      const duration = Date.now() - startTime;
      performanceMonitor.recordApiCall(endpoint, method, statusCode, duration);

    } finally {
      // 結束性能監控
      performanceMonitor.endTimer('api_request', {
        endpoint,
        method,
        status: res.statusCode.toString(),
      });
    }
  };
}

/**
 * 創建 API 錯誤
 */
function createApiError(message: string, statusCode: number, code: string): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/**
 * 速率限制檢查
 */
async function checkRateLimit(
  req: NextApiRequest,
  rateLimit: { windowMs: number; maxRequests: number }
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const identifier = getClientIdentifier(req);
  const window = Math.floor(Date.now() / rateLimit.windowMs);
  const key = `rate_limit:${identifier}:${window}`;

  const current = globalCache.get<number>(key) || 0;
  const remaining = Math.max(0, rateLimit.maxRequests - current - 1);
  const allowed = current < rateLimit.maxRequests;

  if (allowed) {
    globalCache.set(key, current + 1, rateLimit.windowMs);
  }

  return {
    allowed,
    remaining,
    resetTime: (window + 1) * rateLimit.windowMs,
  };
}

/**
 * 獲取客戶端標識符
 */
function getClientIdentifier(req: NextApiRequest): string {
  // 優先使用用戶 ID，其次使用 IP 地址
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0] 
    : req.socket.remoteAddress || 'unknown';
  
  return ip;
}

/**
 * 請求驗證
 */
function validateRequest(
  req: NextApiRequest,
  validation: { body?: any; query?: any }
): void {
  // 簡化的驗證實現
  // 在實際項目中，建議使用 Joi、Yup 或 Zod 等驗證庫
  
  if (validation.body && req.method !== 'GET') {
    if (!req.body) {
      throw createApiError('請求體不能為空', 400, 'INVALID_BODY');
    }
    
    // 這裡可以添加更詳細的驗證邏輯
  }

  if (validation.query) {
    // 驗證查詢參數
    // 這裡可以添加查詢參數驗證邏輯
  }
}

/**
 * 便捷的中間件組合函數
 */
export const withAuth = (handler: ApiHandler) =>
  withMiddleware(handler, { requireAuth: true });

export const withPermissions = (permissions: string[]) => (handler: ApiHandler) =>
  withMiddleware(handler, { requireAuth: true, requiredPermissions: permissions });

export const withRateLimit = (windowMs: number, maxRequests: number) => (handler: ApiHandler) =>
  withMiddleware(handler, { rateLimit: { windowMs, maxRequests } });

export const withCache = (ttl: number, keyFn?: (req: NextApiRequest) => string) => (handler: ApiHandler) =>
  withMiddleware(handler, { cache: { ttl, key: keyFn } });

/**
 * 組合多個中間件
 */
export function compose(...middlewares: Array<(handler: ApiHandler) => ApiHandler>) {
  return (handler: ApiHandler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}

export default withMiddleware;
