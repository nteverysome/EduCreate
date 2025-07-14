/**
 * 檔案夾權限管理系統
 * 實現四級權限控制：查看、編輯、分享、管理
 * 支持權限繼承和權限檢查機制
 */

import { PrismaClient } from '@prisma/client';

// 檔案夾權限級別
export enum FolderPermissionLevel {
  NONE = 'none',        // 無權限
  VIEW = 'view',        // 查看權限
  EDIT = 'edit',        // 編輯權限
  SHARE = 'share',      // 分享權限
  MANAGE = 'manage'     // 管理權限
}

// 檔案夾權限操作
export enum FolderPermissionAction {
  READ = 'read',
  write = 'write',
  delete = 'delete',
  share = 'share',
  manage_permissions = 'manage_permissions',
  create_subfolder = 'create_subfolder',
  move = 'move',
  copy = 'copy'
}

// 檔案夾權限詳細定義
export interface FolderPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
  canManagePermissions: boolean;
  canCreateSubfolder: boolean;
  canMove: boolean;
  canCopy: boolean;
}

// 用戶檔案夾權限
export interface UserFolderPermission {
  id: string;
  userId: string;
  folderId: string;
  permissionLevel: FolderPermissionLevel;
  permissions: FolderPermissions;
  inheritedFrom?: string; // 繼承來源檔案夾ID
  grantedBy: string; // 授權者ID
  grantedAt: Date;
  expiresAt?: Date;
}

// 權限繼承規則
export interface PermissionInheritanceRule {
  parentFolderId: string;
  childFolderId: string;
  inheritPermissions: boolean;
  overridePermissions?: Partial<FolderPermissions>;
}

export class FolderPermissionManager {
  private static prisma = new PrismaClient();

  // 權限級別對應的具體權限
  private static readonly PERMISSION_LEVELS: Record<FolderPermissionLevel, FolderPermissions> = {
    [FolderPermissionLevel.NONE]: {
      canRead: false,
      canWrite: false,
      canDelete: false,
      canShare: false,
      canManagePermissions: false,
      canCreateSubfolder: false,
      canMove: false,
      canCopy: false
    },
    [FolderPermissionLevel.VIEW]: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canShare: false,
      canManagePermissions: false,
      canCreateSubfolder: false,
      canMove: false,
      canCopy: false
    },
    [FolderPermissionLevel.EDIT]: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canShare: false,
      canManagePermissions: false,
      canCreateSubfolder: true,
      canMove: false,
      canCopy: true
    },
    [FolderPermissionLevel.SHARE]: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canShare: true,
      canManagePermissions: false,
      canCreateSubfolder: true,
      canMove: true,
      canCopy: true
    },
    [FolderPermissionLevel.MANAGE]: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canShare: true,
      canManagePermissions: true,
      canCreateSubfolder: true,
      canMove: true,
      canCopy: true
    }
  };

  /**
   * 檢查用戶對檔案夾的權限
   */
  static async checkPermission(
    userId: string, 
    folderId: string, 
    action: FolderPermissionAction
  ): Promise<boolean> {
    try {
      // 獲取檔案夾信息
      const folder = await this.prisma.folder.findUnique({
        where: { id: folderId },
        include: { user: true }
      });

      if (!folder) {
        return false;
      }

      // 檔案夾擁有者擁有所有權限
      if (folder.userId === userId) {
        return true;
      }

      // 管理員擁有所有權限
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (user?.role === 'ADMIN') {
        return true;
      }

      // 檢查直接權限
      const directPermission = await this.getUserFolderPermission(userId, folderId);
      if (directPermission) {
        return this.hasPermissionForAction(directPermission.permissions, action);
      }

      // 檢查繼承權限
      const inheritedPermission = await this.getInheritedPermission(userId, folderId);
      if (inheritedPermission) {
        return this.hasPermissionForAction(inheritedPermission, action);
      }

      return false;
    } catch (error) {
      console.error('檢查檔案夾權限失敗:', error);
      return false;
    }
  }

  /**
   * 授予用戶檔案夾權限
   */
  static async grantPermission(
    granterId: string,
    userId: string,
    folderId: string,
    permissionLevel: FolderPermissionLevel,
    expiresAt?: Date
  ): Promise<UserFolderPermission> {
    // 檢查授權者是否有管理權限
    const canManage = await this.checkPermission(granterId, folderId, FolderPermissionAction.manage_permissions);
    if (!canManage) {
      throw new Error('沒有權限授予檔案夾權限');
    }

    const permissions = this.PERMISSION_LEVELS[permissionLevel];
    
    const userPermission: UserFolderPermission = {
      id: this.generateId(),
      userId,
      folderId,
      permissionLevel,
      permissions,
      grantedBy: granterId,
      grantedAt: new Date(),
      expiresAt
    };

    // 保存到數據庫
    await this.saveUserFolderPermission(userPermission);

    return userPermission;
  }

  /**
   * 撤銷用戶檔案夾權限
   */
  static async revokePermission(
    revokerId: string,
    userId: string,
    folderId: string
  ): Promise<void> {
    // 檢查撤銷者是否有管理權限
    const canManage = await this.checkPermission(revokerId, folderId, FolderPermissionAction.manage_permissions);
    if (!canManage) {
      throw new Error('沒有權限撤銷檔案夾權限');
    }

    await this.removeUserFolderPermission(userId, folderId);
  }

  /**
   * 獲取檔案夾的所有權限
   */
  static async getFolderPermissions(folderId: string): Promise<UserFolderPermission[]> {
    return await this.getUserFolderPermissions(folderId);
  }

  /**
   * 獲取用戶的檔案夾權限
   */
  static async getUserPermissions(userId: string): Promise<UserFolderPermission[]> {
    return await this.getUserAllFolderPermissions(userId);
  }

  /**
   * 設置權限繼承
   */
  static async setPermissionInheritance(
    parentFolderId: string,
    childFolderId: string,
    inheritPermissions: boolean,
    overridePermissions?: Partial<FolderPermissions>
  ): Promise<void> {
    const rule: PermissionInheritanceRule = {
      parentFolderId,
      childFolderId,
      inheritPermissions,
      overridePermissions
    };

    await this.savePermissionInheritanceRule(rule);

    // 如果啟用繼承，更新子檔案夾的權限
    if (inheritPermissions) {
      await this.updateInheritedPermissions(childFolderId);
    }
  }

  /**
   * 批量設置權限
   */
  static async batchGrantPermissions(
    granterId: string,
    userIds: string[],
    folderIds: string[],
    permissionLevel: FolderPermissionLevel,
    expiresAt?: Date
  ): Promise<UserFolderPermission[]> {
    const results: UserFolderPermission[] = [];

    for (const userId of userIds) {
      for (const folderId of folderIds) {
        try {
          const permission = await this.grantPermission(
            granterId,
            userId,
            folderId,
            permissionLevel,
            expiresAt
          );
          results.push(permission);
        } catch (error) {
          console.error(`授予權限失敗 - 用戶: ${userId}, 檔案夾: ${folderId}`, error);
        }
      }
    }

    return results;
  }

  /**
   * 檢查權限是否過期
   */
  static async cleanupExpiredPermissions(): Promise<void> {
    const now = new Date();
    await this.removeExpiredPermissions(now);
  }

  // 私有輔助方法
  private static hasPermissionForAction(permissions: FolderPermissions, action: FolderPermissionAction): boolean {
    switch (action) {
      case FolderPermissionAction.read:
        return permissions.canRead;
      case FolderPermissionAction.write:
        return permissions.canWrite;
      case FolderPermissionAction.delete:
        return permissions.canDelete;
      case FolderPermissionAction.share:
        return permissions.canShare;
      case FolderPermissionAction.manage_permissions:
        return permissions.canManagePermissions;
      case FolderPermissionAction.create_subfolder:
        return permissions.canCreateSubfolder;
      case FolderPermissionAction.move:
        return permissions.canMove;
      case FolderPermissionAction.copy:
        return permissions.canCopy;
      default:
        return false;
    }
  }

  private static async getInheritedPermission(userId: string, folderId: string): Promise<FolderPermissions | null> {
    // 獲取檔案夾的父檔案夾路徑
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId }
    });

    if (!folder || !folder.path || folder.path.length === 0) {
      return null;
    }

    // 從最近的父檔案夾開始檢查權限
    for (let i = folder.path.length - 1; i >= 0; i--) {
      const parentFolderId = folder.path[i];
      const parentPermission = await this.getUserFolderPermission(userId, parentFolderId);
      
      if (parentPermission) {
        // 檢查是否有繼承規則
        const inheritanceRule = await this.getPermissionInheritanceRule(parentFolderId, folderId);
        
        if (inheritanceRule && inheritanceRule.inheritPermissions) {
          // 應用覆蓋權限
          if (inheritanceRule.overridePermissions) {
            return {
              ...parentPermission.permissions,
              ...inheritanceRule.overridePermissions
            };
          }
          return parentPermission.permissions;
        }
      }
    }

    return null;
  }

  // 數據庫操作方法（完整實現）
  private static async getUserFolderPermission(userId: string, folderId: string): Promise<UserFolderPermission | null> {
    try {
      const permission = await this.prisma.folderPermission.findFirst({
        where: {
          userId,
          folderId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      if (!permission) return null;

      return {
        id: permission.id,
        userId: permission.userId,
        folderId: permission.folderId,
        permissionLevel: permission.permissionLevel as FolderPermissionLevel,
        permissions: JSON.parse(permission.permissions),
        inheritedFrom: permission.inheritedFrom,
        grantedBy: permission.grantedBy,
        grantedAt: permission.grantedAt,
        expiresAt: permission.expiresAt
      };
    } catch (error) {
      console.error('獲取用戶檔案夾權限失敗:', error);
      return null;
    }
  }

  private static async saveUserFolderPermission(permission: UserFolderPermission): Promise<void> {
    try {
      await this.prisma.folderPermission.upsert({
        where: {
          userId_folderId: {
            userId: permission.userId,
            folderId: permission.folderId
          }
        },
        update: {
          permissionLevel: permission.permissionLevel,
          permissions: JSON.stringify(permission.permissions),
          inheritedFrom: permission.inheritedFrom,
          grantedBy: permission.grantedBy,
          grantedAt: permission.grantedAt,
          expiresAt: permission.expiresAt
        },
        create: {
          id: permission.id,
          userId: permission.userId,
          folderId: permission.folderId,
          permissionLevel: permission.permissionLevel,
          permissions: JSON.stringify(permission.permissions),
          inheritedFrom: permission.inheritedFrom,
          grantedBy: permission.grantedBy,
          grantedAt: permission.grantedAt,
          expiresAt: permission.expiresAt
        }
      });
    } catch (error) {
      console.error('保存用戶檔案夾權限失敗:', error);
      throw error;
    }
  }

  private static async removeUserFolderPermission(userId: string, folderId: string): Promise<void> {
    try {
      await this.prisma.folderPermission.deleteMany({
        where: {
          userId,
          folderId
        }
      });
    } catch (error) {
      console.error('刪除用戶檔案夾權限失敗:', error);
      throw error;
    }
  }

  private static async getUserFolderPermissions(folderId: string): Promise<UserFolderPermission[]> {
    try {
      const permissions = await this.prisma.folderPermission.findMany({
        where: {
          folderId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      });

      return permissions.map(p => ({
        id: p.id,
        userId: p.userId,
        folderId: p.folderId,
        permissionLevel: p.permissionLevel as FolderPermissionLevel,
        permissions: JSON.parse(p.permissions),
        inheritedFrom: p.inheritedFrom,
        grantedBy: p.grantedBy,
        grantedAt: p.grantedAt,
        expiresAt: p.expiresAt
      }));
    } catch (error) {
      console.error('獲取檔案夾權限列表失敗:', error);
      return [];
    }
  }

  private static async getUserAllFolderPermissions(userId: string): Promise<UserFolderPermission[]> {
    try {
      const permissions = await this.prisma.folderPermission.findMany({
        where: {
          userId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        include: {
          folder: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });

      return permissions.map(p => ({
        id: p.id,
        userId: p.userId,
        folderId: p.folderId,
        permissionLevel: p.permissionLevel as FolderPermissionLevel,
        permissions: JSON.parse(p.permissions),
        inheritedFrom: p.inheritedFrom,
        grantedBy: p.grantedBy,
        grantedAt: p.grantedAt,
        expiresAt: p.expiresAt
      }));
    } catch (error) {
      console.error('獲取用戶所有檔案夾權限失敗:', error);
      return [];
    }
  }

  private static async savePermissionInheritanceRule(rule: PermissionInheritanceRule): Promise<void> {
    try {
      await this.prisma.folderPermissionInheritance.upsert({
        where: {
          parentFolderId_childFolderId: {
            parentFolderId: rule.parentFolderId,
            childFolderId: rule.childFolderId
          }
        },
        update: {
          inheritPermissions: rule.inheritPermissions,
          overridePermissions: rule.overridePermissions ? JSON.stringify(rule.overridePermissions) : null
        },
        create: {
          id: this.generateId(),
          parentFolderId: rule.parentFolderId,
          childFolderId: rule.childFolderId,
          inheritPermissions: rule.inheritPermissions,
          overridePermissions: rule.overridePermissions ? JSON.stringify(rule.overridePermissions) : null
        }
      });
    } catch (error) {
      console.error('保存權限繼承規則失敗:', error);
      throw error;
    }
  }

  private static async getPermissionInheritanceRule(parentFolderId: string, childFolderId: string): Promise<PermissionInheritanceRule | null> {
    try {
      const rule = await this.prisma.folderPermissionInheritance.findFirst({
        where: {
          parentFolderId,
          childFolderId
        }
      });

      if (!rule) return null;

      return {
        parentFolderId: rule.parentFolderId,
        childFolderId: rule.childFolderId,
        inheritPermissions: rule.inheritPermissions,
        overridePermissions: rule.overridePermissions ? JSON.parse(rule.overridePermissions) : undefined
      };
    } catch (error) {
      console.error('獲取權限繼承規則失敗:', error);
      return null;
    }
  }

  private static async updateInheritedPermissions(folderId: string): Promise<void> {
    try {
      // 獲取所有子檔案夾
      const childFolders = await this.prisma.folder.findMany({
        where: {
          path: {
            array_contains: [folderId]
          }
        }
      });

      // 更新每個子檔案夾的繼承權限
      for (const childFolder of childFolders) {
        const inheritanceRule = await this.getPermissionInheritanceRule(folderId, childFolder.id);

        if (inheritanceRule && inheritanceRule.inheritPermissions) {
          // 獲取父檔案夾的所有權限
          const parentPermissions = await this.getUserFolderPermissions(folderId);

          // 為每個有權限的用戶創建繼承權限
          for (const parentPermission of parentPermissions) {
            const inheritedPermissions = inheritanceRule.overridePermissions
              ? { ...parentPermission.permissions, ...inheritanceRule.overridePermissions }
              : parentPermission.permissions;

            const inheritedPermission: UserFolderPermission = {
              id: this.generateId(),
              userId: parentPermission.userId,
              folderId: childFolder.id,
              permissionLevel: parentPermission.permissionLevel,
              permissions: inheritedPermissions,
              inheritedFrom: folderId,
              grantedBy: parentPermission.grantedBy,
              grantedAt: new Date(),
              expiresAt: parentPermission.expiresAt
            };

            await this.saveUserFolderPermission(inheritedPermission);
          }
        }
      }
    } catch (error) {
      console.error('更新繼承權限失敗:', error);
      throw error;
    }
  }

  private static async removeExpiredPermissions(now: Date): Promise<void> {
    try {
      await this.prisma.folderPermission.deleteMany({
        where: {
          expiresAt: {
            lt: now
          }
        }
      });
    } catch (error) {
      console.error('清理過期權限失敗:', error);
      throw error;
    }
  }

  private static generateId(): string {
    return `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
