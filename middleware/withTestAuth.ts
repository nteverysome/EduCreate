import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import { verify } from 'jsonwebtoken';

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

/**
 * 測試認證中間件
 * 在開發環境中支持使用測試令牌進行認證
 * 在生產環境中僅使用正常的會話認證
 */
export function withTestAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // 首先嘗試獲取正常的會話
    const session = await getServerSession(req, res, authOptions);
    
    // 如果已經有正常的會話，直接繼續
    if (session?.user) {
      return handler(req, res);
    }
    
    // 在開發環境中檢查測試令牌
    if (process.env.NODE_ENV !== 'production') {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          // 驗證令牌
          const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'development-secret-key');
          
          // 將解碼後的用戶信息添加到請求中
          (req as any).testUser = decoded;
          
          // 繼續處理請求
          return handler(req, res);
        } catch (error) {
          console.warn('測試令牌驗證失敗:', error);
        }
      }
      
      // 在開發環境中，如果沒有令牌，檢查是否有存儲的測試令牌
      const testToken = req.headers['x-test-token'] as string;
      if (testToken) {
        try {
          const decoded = verify(testToken, process.env.NEXTAUTH_SECRET || 'development-secret-key');
          (req as any).testUser = decoded;
          return handler(req, res);
        } catch (error) {
          console.warn('X-Test-Token 驗證失敗:', error);
        }
      }
    }
    
    // 如果沒有有效的會話或測試令牌，返回未授權錯誤
    return res.status(401).json({ error: '未授權' });
  };
}