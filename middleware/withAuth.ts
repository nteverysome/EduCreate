import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import { hasPermission, hasAnyPermission } from '../lib/permissions';

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// 中間件：檢查用戶是否已認證
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: '請先登入' });
    }

    return handler(req, res);
  };
}

// 中間件：檢查用戶是否具有特定權限
export function withPermission(permission: string, handler: NextApiHandler): NextApiHandler {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    const userRole = session?.user?.role || 'USER';

    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ error: '權限不足' });
    }

    return handler(req, res);
  });
}

// 中間件：檢查用戶是否具有多個權限中的任意一個
export function withAnyPermission(permissions: string[], handler: NextApiHandler): NextApiHandler {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    const userRole = session?.user?.role || 'USER';

    if (!hasAnyPermission(userRole, permissions)) {
      return res.status(403).json({ error: '權限不足' });
    }

    return handler(req, res);
  });
}

// 中間件：檢查資源所有權（例如，用戶只能編輯自己創建的活動）
export function withOwnership(
  resourceFetcher: (req: NextApiRequest) => Promise<{ userId: string } | null>,
  handler: NextApiHandler
): NextApiHandler {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    const resource = await resourceFetcher(req);

    // 如果資源不存在
    if (!resource) {
      return res.status(404).json({ error: '資源不存在' });
    }

    // 檢查用戶是否為資源擁有者或管理員
    if (resource.userId !== session?.user?.id && session?.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: '權限不足' });
    }

    return handler(req, res);
  });
}