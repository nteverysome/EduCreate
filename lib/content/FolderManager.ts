/**
 * 文件夾管理器 - 第二階段增強版
 * 實現嵌套文件夾、拖拽組織、批量操作等高級功能
 */

export interface FolderItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  userId: string;
  activityCount: number;
  subfolderCount: number;
  totalActivityCount: number; // 包含子文件夾的總活動數
  path: string[]; // 文件夾路徑
  depth: number; // 嵌套深度
  isShared?: boolean;
  shareSettings?: FolderShareSettings;
  permissions?: FolderPermissions;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface FolderShareSettings {
  isPublic: boolean;
  shareCode?: string;
  allowCopy?: boolean;
  allowEdit?: boolean;
  expiresAt?: Date;
  sharedWith?: string[]; // 用戶ID列表
}

export interface FolderPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
  canManagePermissions: boolean;
}

export interface FolderTreeNode extends FolderItem {
  children: FolderTreeNode[];
  isExpanded?: boolean;
  isSelected?: boolean;
  isDragOver?: boolean;
}

export interface BulkOperation {
  type: 'move' | 'copy' | 'delete' | 'share';
  itemIds: string[];
  targetFolderId?: string;
  options?: Record<string, any>;
}

export interface FolderStats {
  totalFolders: number;
  totalActivities: number;
  maxDepth: number;
  recentlyUsed: FolderItem[];
  mostUsed: FolderItem[];
  sharedFolders: FolderItem[];
}

export class FolderManager {
  private static readonly MAX_DEPTH = 10;
  private static readonly MAX_NAME_LENGTH = 100;
  private static readonly RESERVED_NAMES = ['root', 'trash', 'shared', 'recent'];

  // 創建文件夾
  static async createFolder(
    name: string,
    parentId?: string,
    options: {
      description?: string;
      color?: string;
      icon?: string;
      userId: string;
    } = { userId: '' }
  ): Promise<FolderItem> {
    // 驗證文件夾名稱
    this.validateFolderName(name);

    // 檢查父文件夾深度
    if (parentId) {
      const parentFolder = await this.getFolderById(parentId);
      if (parentFolder && parentFolder.depth >= this.MAX_DEPTH) {
        throw new Error(`文件夾嵌套深度不能超過 ${this.MAX_DEPTH} 層`);
      }
    }

    // 檢查同級文件夾名稱重複
    await this.checkDuplicateName(name, parentId, options.userId);

    const folder: FolderItem = {
      id: this.generateFolderId(),
      name: name.trim(),
      description: options.description?.trim(),
      color: options.color || this.getRandomColor(),
      icon: options.icon || this.getDefaultIcon(),
      parentId,
      userId: options.userId,
      activityCount: 0,
      subfolderCount: 0,
      totalActivityCount: 0,
      path: await this.calculatePath(parentId),
      depth: await this.calculateDepth(parentId),
      permissions: this.getDefaultPermissions(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 保存到數據庫
    await this.saveFolderToDatabase(folder);

    // 更新父文件夾統計
    if (parentId) {
      await this.updateFolderStats(parentId);
    }

    return folder;
  }

  // 移動文件夾
  static async moveFolder(folderId: string, targetParentId?: string): Promise<void> {
    const folder = await this.getFolderById(folderId);
    if (!folder) {
      throw new Error('文件夾不存在');
    }

    // 檢查是否移動到自己的子文件夾
    if (targetParentId && await this.isDescendant(targetParentId, folderId)) {
      throw new Error('不能將文件夾移動到自己的子文件夾中');
    }

    // 檢查目標深度
    if (targetParentId) {
      const targetDepth = await this.calculateDepth(targetParentId);
      const folderMaxDepth = await this.getFolderMaxDepth(folderId);
      if (targetDepth + folderMaxDepth > this.MAX_DEPTH) {
        throw new Error(`移動後的文件夾嵌套深度將超過 ${this.MAX_DEPTH} 層`);
      }
    }

    // 檢查目標位置名稱重複
    await this.checkDuplicateName(folder.name, targetParentId, folder.userId);

    const oldParentId = folder.parentId;

    // 更新文件夾信息
    folder.parentId = targetParentId;
    folder.path = await this.calculatePath(targetParentId);
    folder.depth = await this.calculateDepth(targetParentId);
    folder.updatedAt = new Date();

    // 更新數據庫
    await this.updateFolderInDatabase(folder);

    // 遞歸更新所有子文件夾的路徑和深度
    await this.updateDescendantPaths(folderId);

    // 更新統計信息
    if (oldParentId) {
      await this.updateFolderStats(oldParentId);
    }
    if (targetParentId) {
      await this.updateFolderStats(targetParentId);
    }
  }

  // 批量操作
  static async performBulkOperation(operation: BulkOperation): Promise<void> {
    switch (operation.type) {
      case 'move':
        await this.bulkMove(operation.itemIds, operation.targetFolderId!);
        break;
      case 'copy':
        await this.bulkCopy(operation.itemIds, operation.targetFolderId!);
        break;
      case 'delete':
        await this.bulkDelete(operation.itemIds);
        break;
      case 'share':
        await this.bulkShare(operation.itemIds, operation.options!);
        break;
      default:
        throw new Error('不支持的批量操作類型');
    }
  }

  // 構建文件夾樹
  static async buildFolderTree(userId: string, rootFolderId?: string): Promise<FolderTreeNode[]> {
    const folders = await this.getUserFolders(userId);
    const folderMap = new Map<string, FolderTreeNode>();

    // 創建節點映射
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        isExpanded: false,
        isSelected: false
      });
    });

    // 構建樹結構
    const rootNodes: FolderTreeNode[] = [];
    folders.forEach(folder => {
      const node = folderMap.get(folder.id)!;
      
      if (folder.parentId && folderMap.has(folder.parentId)) {
        const parent = folderMap.get(folder.parentId)!;
        parent.children.push(node);
      } else if (!rootFolderId || folder.id === rootFolderId) {
        rootNodes.push(node);
      }
    });

    // 排序子節點
    this.sortTreeNodes(rootNodes);

    return rootNodes;
  }

  // 搜索文件夾
  static async searchFolders(
    userId: string,
    query: string,
    options: {
      includeActivities?: boolean;
      folderId?: string;
      recursive?: boolean;
    } = {}
  ): Promise<FolderItem[]> {
    const folders = await this.getUserFolders(userId);
    const queryLower = query.toLowerCase();

    let filteredFolders = folders.filter(folder => {
      const nameMatch = folder.name.toLowerCase().includes(queryLower);
      const descMatch = folder.description?.toLowerCase().includes(queryLower);
      return nameMatch || descMatch;
    });

    // 按文件夾過濾
    if (options.folderId) {
      if (options.recursive) {
        const descendants = await this.getFolderDescendants(options.folderId);
        const descendantIds = new Set(descendants.map(f => f.id));
        filteredFolders = filteredFolders.filter(f => descendantIds.has(f.id));
      } else {
        filteredFolders = filteredFolders.filter(f => f.parentId === options.folderId);
      }
    }

    return filteredFolders.sort((a, b) => a.name.localeCompare(b.name));
  }

  // 獲取文件夾統計信息
  static async getFolderStats(userId: string): Promise<FolderStats> {
    const folders = await this.getUserFolders(userId);
    
    const totalFolders = folders.length;
    const totalActivities = folders.reduce((sum, f) => sum + f.totalActivityCount, 0);
    const maxDepth = Math.max(...folders.map(f => f.depth), 0);
    
    // 最近使用的文件夾
    const recentlyUsed = folders
      .filter(f => f.lastAccessedAt)
      .sort((a, b) => (b.lastAccessedAt?.getTime() || 0) - (a.lastAccessedAt?.getTime() || 0))
      .slice(0, 5);

    // 最常用的文件夾
    const mostUsed = folders
      .sort((a, b) => b.totalActivityCount - a.totalActivityCount)
      .slice(0, 5);

    // 共享文件夾
    const sharedFolders = folders.filter(f => f.isShared);

    return {
      totalFolders,
      totalActivities,
      maxDepth,
      recentlyUsed,
      mostUsed,
      sharedFolders
    };
  }

  // 文件夾分享
  static async shareFolder(
    folderId: string,
    shareSettings: Partial<FolderShareSettings>
  ): Promise<string> {
    const folder = await this.getFolderById(folderId);
    if (!folder) {
      throw new Error('文件夾不存在');
    }

    const shareCode = this.generateShareCode();
    
    folder.isShared = true;
    folder.shareSettings = {
      isPublic: shareSettings.isPublic || false,
      shareCode,
      allowCopy: shareSettings.allowCopy || false,
      allowEdit: shareSettings.allowEdit || false,
      expiresAt: shareSettings.expiresAt,
      sharedWith: shareSettings.sharedWith || []
    };
    folder.updatedAt = new Date();

    await this.updateFolderInDatabase(folder);

    return shareCode;
  }

  // 工具方法
  private static validateFolderName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('文件夾名稱不能為空');
    }

    if (name.trim().length > this.MAX_NAME_LENGTH) {
      throw new Error(`文件夾名稱不能超過 ${this.MAX_NAME_LENGTH} 個字符`);
    }

    if (this.RESERVED_NAMES.includes(name.toLowerCase().trim())) {
      throw new Error('文件夾名稱不能使用保留字');
    }

    // 檢查特殊字符
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name)) {
      throw new Error('文件夾名稱包含無效字符');
    }
  }

  private static async checkDuplicateName(
    name: string,
    parentId: string | undefined,
    userId: string
  ): Promise<void> {
    const siblings = await this.getFoldersByParent(parentId, userId);
    const duplicate = siblings.find(f => f.name.toLowerCase() === name.toLowerCase().trim());
    
    if (duplicate) {
      throw new Error('同一位置已存在相同名稱的文件夾');
    }
  }

  private static async calculatePath(parentId?: string): Promise<string[]> {
    if (!parentId) return [];
    
    const parent = await this.getFolderById(parentId);
    if (!parent) return [];
    
    return [...parent.path, parent.id];
  }

  private static async calculateDepth(parentId?: string): Promise<number> {
    if (!parentId) return 0;
    
    const parent = await this.getFolderById(parentId);
    return parent ? parent.depth + 1 : 0;
  }

  private static async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    const descendant = await this.getFolderById(descendantId);
    return descendant ? descendant.path.includes(ancestorId) : false;
  }

  private static async getFolderMaxDepth(folderId: string): Promise<number> {
    const descendants = await this.getFolderDescendants(folderId);
    const folder = await this.getFolderById(folderId);
    
    if (!folder) return 0;
    
    const maxDescendantDepth = descendants.length > 0 
      ? Math.max(...descendants.map(d => d.depth))
      : folder.depth;
    
    return maxDescendantDepth - folder.depth;
  }

  private static sortTreeNodes(nodes: FolderTreeNode[]): void {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => {
      if (node.children.length > 0) {
        this.sortTreeNodes(node.children);
      }
    });
  }

  private static generateFolderId(): string {
    return `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateShareCode(): string {
    return Math.random().toString(36).substr(2, 12).toUpperCase();
  }

  private static getRandomColor(): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private static getDefaultIcon(): string {
    const icons = ['📁', '📂', '🗂️', '📋', '📊', '🎯', '🎨', '🔧', '⚡', '🌟'];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  private static getDefaultPermissions(): FolderPermissions {
    return {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canShare: true,
      canManagePermissions: true
    };
  }

  // 數據庫操作方法（完整實現）
  private static async saveFolderToDatabase(folder: FolderItem): Promise<void> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      await prisma.folder.create({
        data: {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          color: folder.color,
          icon: folder.icon,
          parentId: folder.parentId,
          userId: folder.userId,
          activityCount: folder.activityCount,
          subfolderCount: folder.subfolderCount,
          totalActivityCount: folder.totalActivityCount,
          path: folder.path,
          depth: folder.depth,
          isShared: folder.isShared || false,
          shareSettings: folder.shareSettings ? JSON.stringify(folder.shareSettings) : null,
          permissions: folder.permissions ? JSON.stringify(folder.permissions) : null,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          lastAccessedAt: folder.lastAccessedAt
        }
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async updateFolderInDatabase(folder: FolderItem): Promise<void> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      await prisma.folder.update({
        where: { id: folder.id },
        data: {
          name: folder.name,
          description: folder.description,
          color: folder.color,
          icon: folder.icon,
          parentId: folder.parentId,
          activityCount: folder.activityCount,
          subfolderCount: folder.subfolderCount,
          totalActivityCount: folder.totalActivityCount,
          path: folder.path,
          depth: folder.depth,
          isShared: folder.isShared,
          shareSettings: folder.shareSettings ? JSON.stringify(folder.shareSettings) : null,
          permissions: folder.permissions ? JSON.stringify(folder.permissions) : null,
          updatedAt: folder.updatedAt,
          lastAccessedAt: folder.lastAccessedAt
        }
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async getFolderById(id: string): Promise<FolderItem | null> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const folder = await prisma.folder.findUnique({
        where: { id }
      });

      if (!folder) return null;

      return this.mapDatabaseToFolderItem(folder);
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async getUserFolders(userId: string): Promise<FolderItem[]> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const folders = await prisma.folder.findMany({
        where: { userId },
        orderBy: [
          { depth: 'asc' },
          { name: 'asc' }
        ]
      });

      return folders.map(folder => this.mapDatabaseToFolderItem(folder));
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async getFoldersByParent(parentId: string | undefined, userId: string): Promise<FolderItem[]> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const folders = await prisma.folder.findMany({
        where: {
          userId,
          parentId: parentId || null
        },
        orderBy: { name: 'asc' }
      });

      return folders.map(folder => this.mapDatabaseToFolderItem(folder));
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async getFolderDescendants(folderId: string): Promise<FolderItem[]> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // 使用路徑查詢所有子文件夾
      const folders = await prisma.folder.findMany({
        where: {
          path: {
            array_contains: [folderId]
          }
        },
        orderBy: [
          { depth: 'asc' },
          { name: 'asc' }
        ]
      });

      return folders.map(folder => this.mapDatabaseToFolderItem(folder));
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async updateFolderStats(folderId: string): Promise<void> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // 計算子文件夾數量
      const subfolderCount = await prisma.folder.count({
        where: { parentId: folderId }
      });

      // 計算直接活動數量
      const activityCount = await prisma.activity.count({
        where: { folderId }
      });

      // 計算總活動數量（包含子文件夾）
      const descendants = await this.getFolderDescendants(folderId);
      const descendantIds = descendants.map(f => f.id);
      const totalActivityCount = await prisma.activity.count({
        where: {
          folderId: {
            in: [folderId, ...descendantIds]
          }
        }
      });

      // 更新統計信息
      await prisma.folder.update({
        where: { id: folderId },
        data: {
          subfolderCount,
          activityCount,
          totalActivityCount,
          updatedAt: new Date()
        }
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async updateDescendantPaths(folderId: string): Promise<void> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const folder = await this.getFolderById(folderId);
      if (!folder) return;

      const descendants = await this.getFolderDescendants(folderId);

      // 批量更新所有子文件夾的路徑和深度
      for (const descendant of descendants) {
        const newPath = [...folder.path, folder.id, ...descendant.path.slice(folder.path.length + 1)];
        const newDepth = newPath.length;

        await prisma.folder.update({
          where: { id: descendant.id },
          data: {
            path: newPath,
            depth: newDepth,
            updatedAt: new Date()
          }
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async bulkMove(itemIds: string[], targetFolderId: string): Promise<void> {
    for (const itemId of itemIds) {
      await this.moveFolder(itemId, targetFolderId);
    }
  }

  private static async bulkCopy(itemIds: string[], targetFolderId: string): Promise<void> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      for (const itemId of itemIds) {
        const folder = await this.getFolderById(itemId);
        if (!folder) continue;

        // 創建副本
        const copyName = `${folder.name} - 副本`;
        await this.createFolder(copyName, targetFolderId, {
          description: folder.description,
          color: folder.color,
          icon: folder.icon,
          userId: folder.userId
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async bulkDelete(itemIds: string[]): Promise<void> {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // 遞歸刪除所有子文件夾和活動
      for (const itemId of itemIds) {
        const descendants = await this.getFolderDescendants(itemId);
        const allIds = [itemId, ...descendants.map(d => d.id)];

        // 刪除所有相關活動
        await prisma.activity.deleteMany({
          where: {
            folderId: { in: allIds }
          }
        });

        // 刪除文件夾（從最深層開始）
        const sortedIds = allIds.sort((a, b) => {
          const folderA = descendants.find(d => d.id === a);
          const folderB = descendants.find(d => d.id === b);
          return (folderB?.depth || 0) - (folderA?.depth || 0);
        });

        for (const id of sortedIds) {
          await prisma.folder.delete({
            where: { id }
          });
        }
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  private static async bulkShare(itemIds: string[], options: Record<string, any>): Promise<void> {
    for (const itemId of itemIds) {
      await this.shareFolder(itemId, options);
    }
  }

  // 輔助方法：將數據庫記錄映射為 FolderItem
  private static mapDatabaseToFolderItem(dbFolder: any): FolderItem {
    return {
      id: dbFolder.id,
      name: dbFolder.name,
      description: dbFolder.description,
      color: dbFolder.color,
      icon: dbFolder.icon,
      parentId: dbFolder.parentId,
      userId: dbFolder.userId,
      activityCount: dbFolder.activityCount || 0,
      subfolderCount: dbFolder.subfolderCount || 0,
      totalActivityCount: dbFolder.totalActivityCount || 0,
      path: dbFolder.path || [],
      depth: dbFolder.depth || 0,
      isShared: dbFolder.isShared || false,
      shareSettings: dbFolder.shareSettings ? JSON.parse(dbFolder.shareSettings) : undefined,
      permissions: dbFolder.permissions ? JSON.parse(dbFolder.permissions) : this.getDefaultPermissions(),
      createdAt: dbFolder.createdAt,
      updatedAt: dbFolder.updatedAt,
      lastAccessedAt: dbFolder.lastAccessedAt
    };
  }
}
