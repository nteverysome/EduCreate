/**
 * FolderManager 單元測試
 * 測試嵌套檔案夾結構的核心邏輯
 */

import { FolderManager, FolderItem, FolderTreeNode } from '../../lib/content/FolderManager';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    folder: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    activity: {
      count: jest.fn(),
      deleteMany: jest.fn()
    },
    $disconnect: jest.fn()
  }))
}));

describe('FolderManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFolder', () => {
    test('應該能創建根檔案夾', async () => {
      // Mock 私有方法
      jest.spyOn(FolderManager as any, 'getFoldersByParent').mockResolvedValue([]); // 沒有重複名稱
      jest.spyOn(FolderManager as any, 'saveFolderToDatabase').mockResolvedValue(undefined);
      jest.spyOn(FolderManager as any, 'generateFolderId').mockReturnValue('folder_123');
      jest.spyOn(FolderManager as any, 'getRandomColor').mockReturnValue('#3B82F6');
      jest.spyOn(FolderManager as any, 'getDefaultIcon').mockReturnValue('📁');
      jest.spyOn(FolderManager as any, 'calculatePath').mockResolvedValue([]);
      jest.spyOn(FolderManager as any, 'calculateDepth').mockResolvedValue(0);

      const result = await FolderManager.createFolder('測試檔案夾', undefined, {
        userId: 'user_123'
      });

      expect(result.name).toBe('測試檔案夾');
      expect(result.depth).toBe(0);
      expect(result.path).toEqual([]);
      expect(result.parentId).toBeUndefined();
    });

    test('應該能創建子檔案夾', async () => {
      const parentFolder: FolderItem = {
        id: 'parent_123',
        name: '父檔案夾',
        userId: 'user_123',
        activityCount: 0,
        subfolderCount: 0,
        totalActivityCount: 0,
        path: [],
        depth: 0,
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canShare: true,
          canManagePermissions: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock 數據庫操作
      jest.spyOn(FolderManager as any, 'getFolderById').mockResolvedValue(parentFolder);
      jest.spyOn(FolderManager as any, 'getFoldersByParent').mockResolvedValue([]); // 沒有重複名稱
      jest.spyOn(FolderManager as any, 'saveFolderToDatabase').mockResolvedValue(undefined);
      jest.spyOn(FolderManager as any, 'updateFolderStats').mockResolvedValue(undefined);
      jest.spyOn(FolderManager as any, 'generateFolderId').mockReturnValue('child_123');
      jest.spyOn(FolderManager as any, 'getRandomColor').mockReturnValue('#3B82F6');
      jest.spyOn(FolderManager as any, 'getDefaultIcon').mockReturnValue('📁');
      jest.spyOn(FolderManager as any, 'calculatePath').mockResolvedValue(['parent_123']);
      jest.spyOn(FolderManager as any, 'calculateDepth').mockResolvedValue(1);

      const result = await FolderManager.createFolder('子檔案夾', 'parent_123', {
        userId: 'user_123'
      });

      expect(result.name).toBe('子檔案夾');
      expect(result.parentId).toBe('parent_123');
      expect(result.depth).toBe(1);
      expect(result.path).toEqual(['parent_123']);
    });

    test('應該拒絕超過最大深度的檔案夾', async () => {
      const deepFolder: FolderItem = {
        id: 'deep_folder',
        name: '深層檔案夾',
        userId: 'user_123',
        activityCount: 0,
        subfolderCount: 0,
        totalActivityCount: 0,
        path: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        depth: 10, // 已經達到最大深度
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canShare: true,
          canManagePermissions: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(FolderManager as any, 'getFolderById').mockResolvedValue(deepFolder);

      await expect(
        FolderManager.createFolder('過深檔案夾', 'deep_folder', {
          userId: 'user_123'
        })
      ).rejects.toThrow('文件夾嵌套深度不能超過');
    });

    test('應該拒絕重複的檔案夾名稱', async () => {
      jest.spyOn(FolderManager as any, 'checkDuplicateName').mockRejectedValue(
        new Error('同一位置已存在相同名稱的文件夾')
      );

      await expect(
        FolderManager.createFolder('重複名稱', undefined, {
          userId: 'user_123'
        })
      ).rejects.toThrow('同一位置已存在相同名稱的文件夾');
    });
  });

  describe('moveFolder', () => {
    test('應該能移動檔案夾到新位置', async () => {
      const sourceFolder: FolderItem = {
        id: 'source_123',
        name: '源檔案夾',
        parentId: 'old_parent',
        userId: 'user_123',
        activityCount: 0,
        subfolderCount: 0,
        totalActivityCount: 0,
        path: ['old_parent'],
        depth: 1,
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canShare: true,
          canManagePermissions: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const targetFolder: FolderItem = {
        id: 'target_123',
        name: '目標檔案夾',
        userId: 'user_123',
        activityCount: 0,
        subfolderCount: 0,
        totalActivityCount: 0,
        path: [],
        depth: 0,
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canShare: true,
          canManagePermissions: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(FolderManager as any, 'getFolderById')
        .mockResolvedValueOnce(sourceFolder)
        .mockResolvedValueOnce(targetFolder);
      jest.spyOn(FolderManager as any, 'isDescendant').mockResolvedValue(false);
      jest.spyOn(FolderManager as any, 'calculateDepth').mockResolvedValue(1);
      jest.spyOn(FolderManager as any, 'getFolderMaxDepth').mockResolvedValue(0);
      jest.spyOn(FolderManager as any, 'checkDuplicateName').mockResolvedValue(undefined);
      jest.spyOn(FolderManager as any, 'calculatePath').mockResolvedValue(['target_123']);
      jest.spyOn(FolderManager as any, 'updateFolderInDatabase').mockResolvedValue(undefined);
      jest.spyOn(FolderManager as any, 'updateDescendantPaths').mockResolvedValue(undefined);
      jest.spyOn(FolderManager as any, 'updateFolderStats').mockResolvedValue(undefined);

      await FolderManager.moveFolder('source_123', 'target_123');

      expect(FolderManager['updateFolderInDatabase']).toHaveBeenCalled();
      expect(FolderManager['updateDescendantPaths']).toHaveBeenCalledWith('source_123');
    });

    test('應該拒絕移動到自己的子檔案夾', async () => {
      const folder: FolderItem = {
        id: 'folder_123',
        name: '檔案夾',
        userId: 'user_123',
        activityCount: 0,
        subfolderCount: 0,
        totalActivityCount: 0,
        path: [],
        depth: 0,
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canShare: true,
          canManagePermissions: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      jest.spyOn(FolderManager as any, 'getFolderById').mockResolvedValue(folder);
      jest.spyOn(FolderManager as any, 'isDescendant').mockResolvedValue(true);

      await expect(
        FolderManager.moveFolder('folder_123', 'child_123')
      ).rejects.toThrow('不能將文件夾移動到自己的子文件夾中');
    });
  });

  describe('buildFolderTree', () => {
    test('應該能構建正確的檔案夾樹結構', async () => {
      const folders: FolderItem[] = [
        {
          id: 'root_1',
          name: '根檔案夾1',
          userId: 'user_123',
          activityCount: 0,
          subfolderCount: 1,
          totalActivityCount: 0,
          path: [],
          depth: 0,
          permissions: {
            canRead: true,
            canWrite: true,
            canDelete: true,
            canShare: true,
            canManagePermissions: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'child_1',
          name: '子檔案夾1',
          parentId: 'root_1',
          userId: 'user_123',
          activityCount: 0,
          subfolderCount: 0,
          totalActivityCount: 0,
          path: ['root_1'],
          depth: 1,
          permissions: {
            canRead: true,
            canWrite: true,
            canDelete: true,
            canShare: true,
            canManagePermissions: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      jest.spyOn(FolderManager as any, 'getUserFolders').mockResolvedValue(folders);

      const tree = await FolderManager.buildFolderTree('user_123');

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('root_1');
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].id).toBe('child_1');
    });
  });

  describe('searchFolders', () => {
    test('應該能搜索檔案夾', async () => {
      const folders: FolderItem[] = [
        {
          id: 'folder_1',
          name: '數學檔案夾',
          userId: 'user_123',
          activityCount: 0,
          subfolderCount: 0,
          totalActivityCount: 0,
          path: [],
          depth: 0,
          permissions: {
            canRead: true,
            canWrite: true,
            canDelete: true,
            canShare: true,
            canManagePermissions: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'folder_2',
          name: '英語檔案夾',
          userId: 'user_123',
          activityCount: 0,
          subfolderCount: 0,
          totalActivityCount: 0,
          path: [],
          depth: 0,
          permissions: {
            canRead: true,
            canWrite: true,
            canDelete: true,
            canShare: true,
            canManagePermissions: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      jest.spyOn(FolderManager as any, 'getUserFolders').mockResolvedValue(folders);

      const results = await FolderManager.searchFolders('user_123', '數學');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('數學檔案夾');
    });
  });
});
