/**
 * 檔案夾權限管理系統單元測試
 * 驗證四級權限控制和權限繼承機制
 */

import { FolderPermissionManager, FolderPermissionLevel, FolderPermissionAction } from '../../lib/permissions/FolderPermissionManager';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    folder: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    },
    folderPermission: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn()
    },
    folderPermissionInheritance: {
      findFirst: jest.fn(),
      upsert: jest.fn()
    },
    $disconnect: jest.fn()
  }))
}));

describe('FolderPermissionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPermission', () => {
    test('檔案夾擁有者應該擁有所有權限', async () => {
      const mockFolder = {
        id: 'folder_123',
        userId: 'user_123',
        user: { id: 'user_123' }
      };

      jest.spyOn(FolderPermissionManager as any, 'prisma', 'get').mockReturnValue({
        folder: {
          findUnique: jest.fn().mockResolvedValue(mockFolder)
        }
      });

      const hasPermission = await FolderPermissionManager.checkPermission(
        'user_123',
        'folder_123',
        FolderPermissionAction.delete
      );

      expect(hasPermission).toBe(true);
    });

    test('管理員應該擁有所有權限', async () => {
      const mockFolder = {
        id: 'folder_123',
        userId: 'owner_123',
        user: { id: 'owner_123' }
      };

      const mockUser = {
        id: 'admin_123',
        role: 'ADMIN'
      };

      jest.spyOn(FolderPermissionManager as any, 'prisma', 'get').mockReturnValue({
        folder: {
          findUnique: jest.fn().mockResolvedValue(mockFolder)
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser)
        }
      });

      const hasPermission = await FolderPermissionManager.checkPermission(
        'admin_123',
        'folder_123',
        FolderPermissionAction.delete
      );

      expect(hasPermission).toBe(true);
    });

    test('有查看權限的用戶應該能讀取檔案夾', async () => {
      const mockFolder = {
        id: 'folder_123',
        userId: 'owner_123',
        user: { id: 'owner_123' }
      };

      const mockUser = {
        id: 'user_123',
        role: 'USER'
      };

      const mockPermission = {
        id: 'perm_123',
        userId: 'user_123',
        folderId: 'folder_123',
        permissionLevel: FolderPermissionLevel.VIEW,
        permissions: JSON.stringify({
          canRead: true,
          canWrite: false,
          canDelete: false,
          canShare: false,
          canManagePermissions: false,
          canCreateSubfolder: false,
          canMove: false,
          canCopy: false
        }),
        grantedBy: 'owner_123',
        grantedAt: new Date(),
        expiresAt: null
      };

      jest.spyOn(FolderPermissionManager as any, 'prisma', 'get').mockReturnValue({
        folder: {
          findUnique: jest.fn().mockResolvedValue(mockFolder)
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser)
        }
      });

      jest.spyOn(FolderPermissionManager as any, 'getUserFolderPermission').mockResolvedValue({
        ...mockPermission,
        permissions: JSON.parse(mockPermission.permissions)
      });

      const hasPermission = await FolderPermissionManager.checkPermission(
        'user_123',
        'folder_123',
        FolderPermissionAction.read
      );

      expect(hasPermission).toBe(true);
    });

    test('有查看權限的用戶不應該能刪除檔案夾', async () => {
      const mockFolder = {
        id: 'folder_123',
        userId: 'owner_123',
        user: { id: 'owner_123' }
      };

      const mockUser = {
        id: 'user_123',
        role: 'USER'
      };

      jest.spyOn(FolderPermissionManager as any, 'prisma', 'get').mockReturnValue({
        folder: {
          findUnique: jest.fn().mockResolvedValue(mockFolder)
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser)
        }
      });

      jest.spyOn(FolderPermissionManager as any, 'getUserFolderPermission').mockResolvedValue({
        permissions: {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canShare: false,
          canManagePermissions: false,
          canCreateSubfolder: false,
          canMove: false,
          canCopy: false
        }
      });

      const hasPermission = await FolderPermissionManager.checkPermission(
        'user_123',
        'folder_123',
        FolderPermissionAction.delete
      );

      expect(hasPermission).toBe(false);
    });

    test('沒有權限的用戶不應該能訪問檔案夾', async () => {
      const mockFolder = {
        id: 'folder_123',
        userId: 'owner_123',
        user: { id: 'owner_123' }
      };

      const mockUser = {
        id: 'user_123',
        role: 'USER'
      };

      jest.spyOn(FolderPermissionManager as any, 'prisma', 'get').mockReturnValue({
        folder: {
          findUnique: jest.fn().mockResolvedValue(mockFolder)
        },
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser)
        }
      });

      jest.spyOn(FolderPermissionManager as any, 'getUserFolderPermission').mockResolvedValue(null);
      jest.spyOn(FolderPermissionManager as any, 'getInheritedPermission').mockResolvedValue(null);

      const hasPermission = await FolderPermissionManager.checkPermission(
        'user_123',
        'folder_123',
        FolderPermissionAction.read
      );

      expect(hasPermission).toBe(false);
    });
  });

  describe('grantPermission', () => {
    test('應該能授予檔案夾權限', async () => {
      jest.spyOn(FolderPermissionManager, 'checkPermission').mockResolvedValue(true);
      jest.spyOn(FolderPermissionManager as any, 'saveUserFolderPermission').mockResolvedValue(undefined);
      jest.spyOn(FolderPermissionManager as any, 'generateId').mockReturnValue('perm_123');

      const permission = await FolderPermissionManager.grantPermission(
        'granter_123',
        'user_123',
        'folder_123',
        FolderPermissionLevel.EDIT
      );

      expect(permission.userId).toBe('user_123');
      expect(permission.folderId).toBe('folder_123');
      expect(permission.permissionLevel).toBe(FolderPermissionLevel.EDIT);
      expect(permission.permissions.canRead).toBe(true);
      expect(permission.permissions.canWrite).toBe(true);
      expect(permission.permissions.canDelete).toBe(false);
    });

    test('沒有管理權限的用戶不應該能授予權限', async () => {
      jest.spyOn(FolderPermissionManager, 'checkPermission').mockResolvedValue(false);

      await expect(
        FolderPermissionManager.grantPermission(
          'granter_123',
          'user_123',
          'folder_123',
          FolderPermissionLevel.EDIT
        )
      ).rejects.toThrow('沒有權限授予檔案夾權限');
    });
  });

  describe('revokePermission', () => {
    test('應該能撤銷檔案夾權限', async () => {
      jest.spyOn(FolderPermissionManager, 'checkPermission').mockResolvedValue(true);
      jest.spyOn(FolderPermissionManager as any, 'removeUserFolderPermission').mockResolvedValue(undefined);

      await expect(
        FolderPermissionManager.revokePermission('revoker_123', 'user_123', 'folder_123')
      ).resolves.not.toThrow();
    });

    test('沒有管理權限的用戶不應該能撤銷權限', async () => {
      jest.spyOn(FolderPermissionManager, 'checkPermission').mockResolvedValue(false);

      await expect(
        FolderPermissionManager.revokePermission('revoker_123', 'user_123', 'folder_123')
      ).rejects.toThrow('沒有權限撤銷檔案夾權限');
    });
  });

  describe('batchGrantPermissions', () => {
    test('應該能批量授予權限', async () => {
      jest.spyOn(FolderPermissionManager, 'grantPermission').mockResolvedValue({
        id: 'perm_123',
        userId: 'user_123',
        folderId: 'folder_123',
        permissionLevel: FolderPermissionLevel.EDIT,
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canShare: false,
          canManagePermissions: false,
          canCreateSubfolder: true,
          canMove: false,
          canCopy: true
        },
        grantedBy: 'granter_123',
        grantedAt: new Date()
      });

      const results = await FolderPermissionManager.batchGrantPermissions(
        'granter_123',
        ['user_123', 'user_456'],
        ['folder_123', 'folder_456'],
        FolderPermissionLevel.EDIT
      );

      expect(results).toHaveLength(4); // 2 users × 2 folders
      expect(FolderPermissionManager.grantPermission).toHaveBeenCalledTimes(4);
    });
  });

  describe('權限級別測試', () => {
    test('VIEW權限應該只允許讀取', () => {
      const permissions = (FolderPermissionManager as any).PERMISSION_LEVELS[FolderPermissionLevel.VIEW];
      
      expect(permissions.canRead).toBe(true);
      expect(permissions.canWrite).toBe(false);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canShare).toBe(false);
      expect(permissions.canManagePermissions).toBe(false);
    });

    test('EDIT權限應該允許讀取和寫入', () => {
      const permissions = (FolderPermissionManager as any).PERMISSION_LEVELS[FolderPermissionLevel.EDIT];
      
      expect(permissions.canRead).toBe(true);
      expect(permissions.canWrite).toBe(true);
      expect(permissions.canCreateSubfolder).toBe(true);
      expect(permissions.canCopy).toBe(true);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canShare).toBe(false);
    });

    test('SHARE權限應該允許分享', () => {
      const permissions = (FolderPermissionManager as any).PERMISSION_LEVELS[FolderPermissionLevel.SHARE];
      
      expect(permissions.canRead).toBe(true);
      expect(permissions.canWrite).toBe(true);
      expect(permissions.canShare).toBe(true);
      expect(permissions.canMove).toBe(true);
      expect(permissions.canDelete).toBe(false);
      expect(permissions.canManagePermissions).toBe(false);
    });

    test('MANAGE權限應該允許所有操作', () => {
      const permissions = (FolderPermissionManager as any).PERMISSION_LEVELS[FolderPermissionLevel.MANAGE];
      
      expect(permissions.canRead).toBe(true);
      expect(permissions.canWrite).toBe(true);
      expect(permissions.canDelete).toBe(true);
      expect(permissions.canShare).toBe(true);
      expect(permissions.canManagePermissions).toBe(true);
      expect(permissions.canCreateSubfolder).toBe(true);
      expect(permissions.canMove).toBe(true);
      expect(permissions.canCopy).toBe(true);
    });
  });
});
