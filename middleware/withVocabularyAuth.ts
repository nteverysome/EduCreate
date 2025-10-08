import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import { hasPermission } from '../lib/permissions';
import prisma from '../lib/prisma';

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// 中間件：檢查詞彙集合所有權
export function withVocabularySetOwnership(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user?.id) {
        return res.status(401).json({ message: '請先登入' });
      }

      const setId = req.query.id as string;
      if (!setId) {
        return res.status(400).json({ message: '詞彙集合ID是必需的' });
      }

      // 查找詞彙集合
      const vocabularySet = await prisma.vocabularySet.findUnique({
        where: { id: setId },
        select: { userId: true, isPublic: true }
      });

      if (!vocabularySet) {
        return res.status(404).json({ message: '詞彙集合不存在' });
      }

      // 檢查權限：用戶是所有者、管理員，或者是公開的詞彙集合（僅讀取）
      const isOwner = vocabularySet.userId === session.user.id;
      const isAdmin = session.user.role === 'ADMIN';
      const isPublicRead = vocabularySet.isPublic && req.method === 'GET';

      if (!isOwner && !isAdmin && !isPublicRead) {
        return res.status(403).json({ message: '權限不足' });
      }

      // 對於非所有者的寫操作，需要管理員權限
      if (!isOwner && !isAdmin && req.method !== 'GET') {
        return res.status(403).json({ message: '只有所有者或管理員可以修改詞彙集合' });
      }

      return handler(req, res);
    } catch (error) {
      console.error('詞彙集合所有權檢查錯誤:', error);
      return res.status(500).json({ message: '服務器錯誤' });
    }
  };
}

// 中間件：檢查詞彙創建權限和限制
export function withVocabularyCreationLimit(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user?.id) {
        return res.status(401).json({ message: '請先登入' });
      }

      // 檢查創建權限
      const userRole = session.user.role || 'USER';
      if (!hasPermission(userRole, 'create:vocabulary')) {
        return res.status(403).json({ 
          message: '需要升級到高級會員才能創建詞彙集合',
          requiresUpgrade: true
        });
      }

      // 管理員無限制
      if (session.user.role === 'ADMIN') {
        return handler(req, res);
      }

      // 檢查用戶是否有有效訂閱
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
      });

      const hasActiveSubscription = 
        user?.subscription && user.subscription.status === 'ACTIVE';

      if (hasActiveSubscription) {
        // 高級用戶無限制
        return handler(req, res);
      }

      // 免費用戶限制
      const vocabularySetCount = await prisma.vocabularySet.count({
        where: { userId: session.user.id }
      });

      const FREE_VOCABULARY_SET_LIMIT = 3;
      if (vocabularySetCount >= FREE_VOCABULARY_SET_LIMIT) {
        return res.status(403).json({
          message: `免費用戶最多只能創建${FREE_VOCABULARY_SET_LIMIT}個詞彙集合`,
          requiresUpgrade: true,
          currentCount: vocabularySetCount,
          limit: FREE_VOCABULARY_SET_LIMIT
        });
      }

      return handler(req, res);
    } catch (error) {
      console.error('詞彙創建限制檢查錯誤:', error);
      return res.status(500).json({ message: '服務器錯誤' });
    }
  };
}

// 中間件：檢查詞彙項目數量限制
export function withVocabularyItemLimit(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user?.id) {
        return res.status(401).json({ message: '請先登入' });
      }

      // 管理員無限制
      if (session.user.role === 'ADMIN') {
        return handler(req, res);
      }

      // 檢查用戶是否有有效訂閱
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
      });

      const hasActiveSubscription = 
        user?.subscription && user.subscription.status === 'ACTIVE';

      if (hasActiveSubscription) {
        // 高級用戶無限制
        return handler(req, res);
      }

      // 檢查詞彙項目數量
      const { items } = req.body;
      if (items && Array.isArray(items)) {
        const FREE_VOCABULARY_ITEM_LIMIT = 50;
        if (items.length > FREE_VOCABULARY_ITEM_LIMIT) {
          return res.status(403).json({
            message: `免費用戶每個詞彙集合最多只能包含${FREE_VOCABULARY_ITEM_LIMIT}個詞彙`,
            requiresUpgrade: true,
            currentCount: items.length,
            limit: FREE_VOCABULARY_ITEM_LIMIT
          });
        }
      }

      return handler(req, res);
    } catch (error) {
      console.error('詞彙項目限制檢查錯誤:', error);
      return res.status(500).json({ message: '服務器錯誤' });
    }
  };
}

// 中間件：檢查分析功能權限
export function withAnalyticsPermission(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session?.user?.id) {
        return res.status(401).json({ message: '請先登入' });
      }

      // 檢查分析權限
      const userRole = session.user.role || 'USER';
      if (!hasPermission(userRole, 'view:analytics')) {
        return res.status(403).json({ 
          message: '需要升級到高級會員才能查看學習分析',
          requiresUpgrade: true
        });
      }

      return handler(req, res);
    } catch (error) {
      console.error('分析權限檢查錯誤:', error);
      return res.status(500).json({ message: '服務器錯誤' });
    }
  };
}

// 組合中間件：詞彙集合的完整權限檢查
export function withFullVocabularySetPermission(handler: NextApiHandler): NextApiHandler {
  return withVocabularySetOwnership(
    withVocabularyCreationLimit(
      withVocabularyItemLimit(handler)
    )
  );
}
