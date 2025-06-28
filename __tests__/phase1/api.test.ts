/**
 * API 端點集成測試
 * 測試自動保存、模板切換、文件夾管理等 API 功能
 */

import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import autosaveHandler from '../../pages/api/universal-content/[id]/autosave';
import switchTemplateHandler from '../../pages/api/universal-content/[id]/switch-template';
import foldersHandler from '../../pages/api/universal-content/folders';

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    activity: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}));

import { getServerSession } from 'next-auth/next';
import { prisma } from '../../lib/prisma';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrisma = prisma as any;

describe('API 端點測試', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession);
  });

  describe('自動保存 API (/api/universal-content/[id]/autosave)', () => {
    test('應該成功保存新的草稿', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'test-activity-id' },
        body: {
          title: '測試活動',
          description: '測試描述',
          items: [
            { id: '1', term: '測試詞彙', definition: '測試定義' }
          ],
          isAutoSave: true,
          lastModified: new Date().toISOString()
        }
      });

      // Mock 活動不存在，需要創建新的
      mockPrisma.activity.findFirst.mockResolvedValueOnce(null);
      mockPrisma.activity.create.mockResolvedValueOnce({
        id: 'test-activity-id',
        title: '測試活動',
        content: { items: [], autoSaveVersion: 1 },
        updatedAt: new Date()
      });

      await autosaveHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'test-activity-id',
          title: '測試活動',
          isDraft: true
        })
      });
    });

    test('應該更新現有活動的自動保存', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'existing-activity-id' },
        body: {
          title: '更新的活動',
          isAutoSave: true,
          lastModified: new Date().toISOString()
        }
      });

      // Mock 活動已存在
      mockPrisma.activity.findFirst.mockResolvedValueOnce({
        id: 'existing-activity-id',
        title: '原始活動',
        content: { autoSaveVersion: 1 }
      });
      mockPrisma.activity.update.mockResolvedValueOnce({
        id: 'existing-activity-id',
        title: '更新的活動',
        content: { autoSaveVersion: 2 },
        updatedAt: new Date()
      });

      await autosaveHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockPrisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'existing-activity-id' },
        data: expect.objectContaining({
          title: '更新的活動',
          isDraft: true
        })
      });
    });

    test('應該拒絕非 POST 請求', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: 'test-activity-id' }
      });

      await autosaveHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: '僅支持 POST 請求'
      });
    });

    test('應該拒絕未授權的請求', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'test-activity-id' },
        body: { isAutoSave: true }
      });

      await autosaveHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: '未授權訪問'
      });
    });

    test('應該拒絕無效的自動保存請求', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'test-activity-id' },
        body: {
          title: '測試活動',
          isAutoSave: false // 無效的自動保存標記
        }
      });

      await autosaveHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: '無效的自動保存請求'
      });
    });
  });

  describe('模板切換 API (/api/universal-content/[id]/switch-template)', () => {
    test('應該成功切換模板', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'test-activity-id' },
        body: {
          templateId: 'quiz',
          visualStyle: 'classic',
          gameOptions: {
            timer: 'countDown',
            lives: 3
          }
        }
      });

      // Mock 活動存在且有足夠的內容項目
      mockPrisma.activity.findFirst.mockResolvedValueOnce({
        id: 'test-activity-id',
        content: {
          items: [
            { id: '1', term: '測試1', definition: '定義1' },
            { id: '2', term: '測試2', definition: '定義2' }
          ]
        }
      });
      mockPrisma.activity.update.mockResolvedValueOnce({
        id: 'test-activity-id',
        templateType: 'QUIZ',
        updatedAt: new Date()
      });

      await switchTemplateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.newTemplate.id).toBe('quiz');
      expect(mockPrisma.activity.update).toHaveBeenCalled();
    });

    test('應該拒絕不兼容的模板切換', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'test-activity-id' },
        body: {
          templateId: 'whack-a-mole' // 需要至少 5 個項目
        }
      });

      // Mock 活動存在但項目不足
      mockPrisma.activity.findFirst.mockResolvedValueOnce({
        id: 'test-activity-id',
        content: {
          items: [
            { id: '1', term: '測試1', definition: '定義1' }
          ] // 只有 1 個項目
        }
      });

      await switchTemplateHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('不兼容');
      expect(responseData.details.currentItems).toBe(1);
      expect(responseData.details.requiredMin).toBe(5);
    });

    test('應該拒絕無效的模板 ID', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'test-activity-id' },
        body: {
          templateId: 'invalid-template'
        }
      });

      await switchTemplateHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: '無效的模板 ID'
      });
    });

    test('應該拒絕不存在的活動', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'non-existent-activity' },
        body: {
          templateId: 'quiz'
        }
      });

      mockPrisma.activity.findFirst.mockResolvedValueOnce(null);

      await switchTemplateHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: '活動不存在或無權限訪問'
      });
    });
  });

  describe('文件夾管理 API (/api/universal-content/folders)', () => {
    test('應該獲取用戶文件夾列表', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      await foldersHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.folders).toBeDefined();
      expect(Array.isArray(responseData.folders)).toBe(true);
      expect(responseData.total).toBeDefined();
    });

    test('應該創建新文件夾', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: '新文件夾',
          description: '測試文件夾'
        }
      });

      await foldersHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData.name).toBe('新文件夾');
      expect(responseData.activityCount).toBe(0);
    });

    test('應該拒絕空文件夾名稱', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: '',
          description: '測試文件夾'
        }
      });

      await foldersHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: '文件夾名稱是必需的'
      });
    });

    test('應該拒絕過長的文件夾名稱', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: 'a'.repeat(101), // 超過 100 字符
          description: '測試文件夾'
        }
      });

      await foldersHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: '文件夾名稱不能超過100個字符'
      });
    });

    test('應該更新文件夾', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        body: {
          id: 'folder-id',
          name: '更新的文件夾',
          description: '更新的描述'
        }
      });

      await foldersHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.name).toBe('更新的文件夾');
    });

    test('應該刪除文件夾', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: 'folder-id' }
      });

      await foldersHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        message: '文件夾已成功刪除'
      });
    });

    test('應該拒絕不支持的請求方法', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PATCH'
      });

      await foldersHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: '不支持的請求方法'
      });
    });

    test('應該拒絕未授權的請求', async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      await foldersHandler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: '未授權訪問'
      });
    });
  });

  describe('錯誤處理', () => {
    test('應該處理數據庫錯誤', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'test-activity-id' },
        body: {
          title: '測試活動',
          isAutoSave: true,
          lastModified: new Date().toISOString()
        }
      });

      mockPrisma.activity.findFirst.mockRejectedValueOnce(new Error('Database error'));

      await autosaveHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('自動保存失敗');
      expect(responseData.code).toBe('INTERNAL_ERROR');
    });

    test('應該處理唯一約束錯誤', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'test-activity-id' },
        body: {
          title: '測試活動',
          isAutoSave: true,
          lastModified: new Date().toISOString()
        }
      });

      const uniqueError = new Error('Unique constraint failed');
      mockPrisma.activity.findFirst.mockRejectedValueOnce(uniqueError);

      await autosaveHandler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('保存衝突');
      expect(responseData.code).toBe('CONFLICT');
    });

    test('應該處理超時錯誤', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { id: 'test-activity-id' },
        body: {
          title: '測試活動',
          isAutoSave: true,
          lastModified: new Date().toISOString()
        }
      });

      const timeoutError = new Error('Connection timeout');
      mockPrisma.activity.findFirst.mockRejectedValueOnce(timeoutError);

      await autosaveHandler(req, res);

      expect(res._getStatusCode()).toBe(408);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('保存超時');
      expect(responseData.code).toBe('TIMEOUT');
    });
  });
});
