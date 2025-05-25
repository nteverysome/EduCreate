import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import { hasAnyPermission } from '../lib/permissions';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

/**
 * 權限中間件
 * 用於保護API端點，只允許具有特定權限的用戶訪問
 * @param handler API處理函數
 * @param requiredPermissions 所需權限列表（用戶只需擁有其中一個權限即可訪問）
 * @returns 包裝後的API處理函數
 */
export function withPermission(handler: ApiHandler, requiredPermissions: string[] = []) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // 獲取用戶會話
      const session = await getServerSession(req, res, authOptions);

      // 如果用戶未登入，返回未授權錯誤
      if (!session || !session.user) {
        return res.status(401).json({ message: '未授權' });
      }

      // 如果沒有指定權限要求，則允許訪問
      if (requiredPermissions.length === 0) {
        return handler(req, res);
      }

      const userRole = session.user.role || 'USER';

      // 檢查用戶是否有所需的任一權限
      const hasPermission = hasAnyPermission(userRole, requiredPermissions);

      // 如果用戶沒有所需的權限，返回禁止訪問錯誤
      if (!hasPermission) {
        return res.status(403).json({ message: '禁止訪問' });
      }

      // 將用戶信息添加到請求對象中，以便處理函數使用
      req.session = { user: session.user };

      // 調用原始處理函數
      return handler(req, res);
    } catch (error) {
      console.error('權限檢查失敗:', error);
      return res.status(500).json({ message: '服務器錯誤' });
    }
  };
}

// 擴展NextApiRequest類型，添加session屬性
declare module 'next' {
  interface NextApiRequest {
    session?: {
      user: {
        id: string;
        name?: string;
        email?: string;
        image?: string;
        role?: string;
      };
    };
  }
}