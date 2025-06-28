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

  // 數據庫操作方法（需要實現）
  private static async saveFolderToDatabase(folder: FolderItem): Promise<void> {
    // 實現數據庫保存邏輯
  }

  private static async updateFolderInDatabase(folder: FolderItem): Promise<void> {
    // 實現數據庫更新邏輯
  }

  private static async getFolderById(id: string): Promise<FolderItem | null> {
    // 實現數據庫查詢邏輯
    return null;
  }

  private static async getUserFolders(userId: string): Promise<FolderItem[]> {
    // 實現用戶文件夾查詢邏輯
    return [];
  }

  private static async getFoldersByParent(parentId: string | undefined, userId: string): Promise<FolderItem[]> {
    // 實現父文件夾查詢邏輯
    return [];
  }

  private static async getFolderDescendants(folderId: string): Promise<FolderItem[]> {
    // 實現子文件夾查詢邏輯
    return [];
  }

  private static async updateFolderStats(folderId: string): Promise<void> {
    // 實現文件夾統計更新邏輯
  }

  private static async updateDescendantPaths(folderId: string): Promise<void> {
    // 實現子文件夾路徑更新邏輯
  }

  private static async bulkMove(itemIds: string[], targetFolderId: string): Promise<void> {
    // 實現批量移動邏輯
  }

  private static async bulkCopy(itemIds: string[], targetFolderId: string): Promise<void> {
    // 實現批量複製邏輯
  }

  private static async bulkDelete(itemIds: string[]): Promise<void> {
    // 實現批量刪除邏輯
  }

  private static async bulkShare(itemIds: string[], options: Record<string, any>): Promise<void> {
    // 實現批量分享邏輯
  }
}
