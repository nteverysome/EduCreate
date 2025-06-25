import express from 'express';
import {
  createGameResult,
  getGameResults,
  getGameResult,
  getUserStats,
} from '../controllers/gameResultController';
import { authenticateToken, optionalAuth, rateLimitByUser } from '../middleware/auth';

const router = express.Router();

/**
 * 公開路由（不需要認證）
 */

// 獲取公開遊戲結果列表
router.get('/public', optionalAuth, getGameResults);

// 獲取單個遊戲結果（支持公開和私有）
router.get('/:id', optionalAuth, getGameResult);

/**
 * 需要認證的路由
 */

// 獲取所有遊戲結果（包括用戶私有結果）
router.get('/', authenticateToken, getGameResults);

// 創建遊戲結果（限制每分鐘最多20個請求）
router.post('/', 
  authenticateToken, 
  rateLimitByUser(20, 60 * 1000), // 每分鐘最多20個請求
  createGameResult
);

/**
 * 用戶統計路由
 */

// 獲取當前用戶統計
router.get('/users/me/stats', authenticateToken, getUserStats);

// 獲取指定用戶統計
router.get('/users/:userId/stats', authenticateToken, getUserStats);

export default router;
