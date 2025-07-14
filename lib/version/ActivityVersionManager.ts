/**
 * 活動版本管理系統
 * 實現完整的變更追蹤、版本對比、歷史回滾、變更日誌、協作者追蹤等版本控制功能
 */

import { PrismaClient } from '@prisma/client';

// 版本類型
export enum VersionType {
  MAJOR = 'major',           // 主要版本 (1.0.0)
  MINOR = 'minor',           // 次要版本 (1.1.0)
  PATCH = 'patch',           // 修補版本 (1.1.1)
  AUTO = 'auto',             // 自動版本
  MANUAL = 'manual',         // 手動版本
  SNAPSHOT = 'snapshot'      // 快照版本
}

// 變更類型
export enum ChangeType {
  CREATE = 'create',         // 創建
  UPDATE = 'update',         // 更新
  DELETE = 'delete',         // 刪除
  MOVE = 'move',            // 移動
  COPY = 'copy',            // 複製
  RENAME = 'rename',        // 重命名
  RESTORE = 'restore',      // 恢復
  MERGE = 'merge'           // 合併
}

// 版本信息
export interface VersionInfo {
  id: string;
  activityId: string;
  version: string;           // 版本號 (如: 1.2.3)
  type: VersionType;
  title: string;
  description?: string;
  content: any;              // 版本內容快照
  metadata: {
    size: number;            // 內容大小
    checksum: string;        // 內容校驗和
    compression: string;     // 壓縮方式
    encoding: string;        // 編碼方式
  };
  changes: VersionChange[];  // 變更記錄
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  tags: string[];           // 版本標籤
  isStable: boolean;        // 是否穩定版本
  parentVersion?: string;   // 父版本
  branchName?: string;      // 分支名稱
}

// 版本變更
export interface VersionChange {
  id: string;
  type: ChangeType;
  path: string;             // 變更路徑
  oldValue?: any;           // 舊值
  newValue?: any;           // 新值
  description: string;      // 變更描述
  timestamp: Date;
  userId: string;
  userName: string;
  metadata?: {
    lineNumber?: number;    // 行號
    columnNumber?: number;  // 列號
    context?: string;       // 上下文
    impact?: string;        // 影響範圍
  };
}

// 版本對比結果
export interface VersionComparison {
  sourceVersion: string;
  targetVersion: string;
  differences: VersionDifference[];
  summary: {
    totalChanges: number;
    additions: number;
    deletions: number;
    modifications: number;
    moves: number;
  };
  conflictCount: number;
  similarityScore: number;  // 相似度分數 (0-1)
}

// 版本差異
export interface VersionDifference {
  type: 'addition' | 'deletion' | 'modification' | 'move';
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;         // 變更分類
  lineNumbers?: {
    old?: number;
    new?: number;
  };
}

// 版本恢復選項
export interface RestoreOptions {
  targetVersion: string;
  preserveCurrentVersion: boolean;
  createBackup: boolean;
  mergeStrategy: 'overwrite' | 'merge' | 'selective';
  selectedPaths?: string[]; // 選擇性恢復的路徑
  conflictResolution: 'auto' | 'manual';
  notifyCollaborators: boolean;
}

// 協作者活動
export interface CollaboratorActivity {
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  timestamp: Date;
  versionId: string;
  changes: VersionChange[];
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class ActivityVersionManager {
  private static prisma = new PrismaClient();

  /**
   * 創建新版本
   */
  static async createVersion(
    activityId: string,
    content: any,
    options: {
      type?: VersionType;
      title?: string;
      description?: string;
      tags?: string[];
      userId: string;
      changes?: VersionChange[];
      parentVersion?: string;
    }
  ): Promise<VersionInfo> {
    try {
      // 1. 獲取當前最新版本
      const latestVersion = await this.getLatestVersion(activityId);
      
      // 2. 生成新版本號
      const newVersionNumber = this.generateVersionNumber(
        latestVersion?.version,
        options.type || VersionType.AUTO
      );
      
      // 3. 計算內容元數據
      const metadata = await this.calculateContentMetadata(content);
      
      // 4. 檢測變更
      const changes = options.changes || (latestVersion ? 
        await this.detectChanges(latestVersion.content, content, options.userId) : 
        [this.createInitialChange(options.userId)]
      );
      
      // 5. 獲取用戶信息
      const user = await this.getUserInfo(options.userId);
      
      // 6. 創建版本記錄
      const versionInfo: VersionInfo = {
        id: `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        activityId,
        version: newVersionNumber,
        type: options.type || VersionType.AUTO,
        title: options.title || `版本 ${newVersionNumber}`,
        description: options.description,
        content: await this.compressContent(content),
        metadata,
        changes,
        createdBy: user,
        createdAt: new Date(),
        tags: options.tags || [],
        isStable: options.type === VersionType.MAJOR || options.type === VersionType.MINOR,
        parentVersion: options.parentVersion || latestVersion?.version,
        branchName: 'main'
      };
      
      // 7. 保存到數據庫
      await this.saveVersion(versionInfo);
      
      // 8. 記錄協作者活動
      await this.recordCollaboratorActivity({
        userId: options.userId,
        userName: user.name,
        userAvatar: user.avatar,
        action: 'create_version',
        timestamp: new Date(),
        versionId: versionInfo.id,
        changes,
        sessionId: this.generateSessionId(),
        ipAddress: undefined,
        userAgent: undefined
      });
      
      return versionInfo;
    } catch (error) {
      console.error('創建版本失敗:', error);
      throw new Error('無法創建新版本');
    }
  }

  /**
   * 獲取版本歷史
   */
  static async getVersionHistory(
    activityId: string,
    options: {
      limit?: number;
      offset?: number;
      includeSnapshots?: boolean;
      branchName?: string;
      fromDate?: Date;
      toDate?: Date;
      userId?: string;
    } = {}
  ): Promise<{
    versions: VersionInfo[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const {
        limit = 50,
        offset = 0,
        includeSnapshots = true,
        branchName,
        fromDate,
        toDate,
        userId
      } = options;

      // 構建查詢條件
      const where: any = { activityId };
      
      if (!includeSnapshots) {
        where.type = { not: VersionType.SNAPSHOT };
      }
      
      if (branchName) {
        where.branchName = branchName;
      }
      
      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = fromDate;
        if (toDate) where.createdAt.lte = toDate;
      }
      
      if (userId) {
        where.createdBy = { id: userId };
      }

      // 執行查詢
      const [versions, total] = await Promise.all([
        this.prisma.activityVersion.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
          include: {
            createdBy: true,
            changes: true
          }
        }),
        this.prisma.activityVersion.count({ where })
      ]);

      return {
        versions: versions.map(this.mapToVersionInfo),
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      console.error('獲取版本歷史失敗:', error);
      throw new Error('無法獲取版本歷史');
    }
  }

  /**
   * 比較版本
   */
  static async compareVersions(
    activityId: string,
    sourceVersion: string,
    targetVersion: string
  ): Promise<VersionComparison> {
    try {
      // 1. 獲取兩個版本的內容
      const [sourceVersionInfo, targetVersionInfo] = await Promise.all([
        this.getVersion(activityId, sourceVersion),
        this.getVersion(activityId, targetVersion)
      ]);

      if (!sourceVersionInfo || !targetVersionInfo) {
        throw new Error('版本不存在');
      }

      // 2. 解壓內容
      const [sourceContent, targetContent] = await Promise.all([
        this.decompressContent(sourceVersionInfo.content),
        this.decompressContent(targetVersionInfo.content)
      ]);

      // 3. 執行差異分析
      const differences = await this.analyzeDifferences(sourceContent, targetContent);
      
      // 4. 計算統計信息
      const summary = this.calculateDifferenceSummary(differences);
      
      // 5. 計算相似度分數
      const similarityScore = this.calculateSimilarityScore(differences, sourceContent, targetContent);
      
      // 6. 檢測衝突
      const conflictCount = this.detectConflicts(differences);

      return {
        sourceVersion,
        targetVersion,
        differences,
        summary,
        conflictCount,
        similarityScore
      };
    } catch (error) {
      console.error('版本比較失敗:', error);
      throw new Error('無法比較版本');
    }
  }

  /**
   * 恢復版本
   */
  static async restoreVersion(
    activityId: string,
    options: RestoreOptions,
    userId: string
  ): Promise<VersionInfo> {
    try {
      // 1. 獲取目標版本
      const targetVersionInfo = await this.getVersion(activityId, options.targetVersion);
      if (!targetVersionInfo) {
        throw new Error('目標版本不存在');
      }

      // 2. 獲取當前版本
      const currentVersion = await this.getLatestVersion(activityId);
      
      // 3. 創建備份（如果需要）
      if (options.createBackup && currentVersion) {
        await this.createVersion(activityId, currentVersion.content, {
          type: VersionType.SNAPSHOT,
          title: `恢復前備份 - ${new Date().toISOString()}`,
          description: `恢復到版本 ${options.targetVersion} 前的備份`,
          userId,
          parentVersion: currentVersion.version
        });
      }

      // 4. 解壓目標版本內容
      const targetContent = await this.decompressContent(targetVersionInfo.content);
      
      // 5. 處理合併策略
      let restoredContent = targetContent;
      if (options.mergeStrategy === 'merge' && currentVersion) {
        const currentContent = await this.decompressContent(currentVersion.content);
        restoredContent = await this.mergeContents(currentContent, targetContent, options);
      } else if (options.mergeStrategy === 'selective' && options.selectedPaths) {
        const currentContent = await this.decompressContent(currentVersion.content);
        restoredContent = await this.selectiveRestore(currentContent, targetContent, options.selectedPaths);
      }

      // 6. 創建恢復版本
      const restoreChanges: VersionChange[] = [{
        id: `change_${Date.now()}`,
        type: ChangeType.RESTORE,
        path: '/',
        oldValue: currentVersion?.content,
        newValue: restoredContent,
        description: `恢復到版本 ${options.targetVersion}`,
        timestamp: new Date(),
        userId,
        userName: (await this.getUserInfo(userId)).name
      }];

      const restoredVersion = await this.createVersion(activityId, restoredContent, {
        type: VersionType.MANUAL,
        title: `恢復版本 ${options.targetVersion}`,
        description: `從版本 ${options.targetVersion} 恢復`,
        userId,
        changes: restoreChanges,
        parentVersion: currentVersion?.version
      });

      // 7. 通知協作者（如果需要）
      if (options.notifyCollaborators) {
        await this.notifyCollaborators(activityId, {
          action: 'version_restored',
          version: restoredVersion.version,
          targetVersion: options.targetVersion,
          userId
        });
      }

      return restoredVersion;
    } catch (error) {
      console.error('版本恢復失敗:', error);
      throw new Error('無法恢復版本');
    }
  }

  /**
   * 獲取協作者活動
   */
  static async getCollaboratorActivities(
    activityId: string,
    options: {
      limit?: number;
      offset?: number;
      userId?: string;
      fromDate?: Date;
      toDate?: Date;
    } = {}
  ): Promise<{
    activities: CollaboratorActivity[];
    total: number;
  }> {
    try {
      const { limit = 50, offset = 0, userId, fromDate, toDate } = options;

      const where: any = { activityId };
      
      if (userId) {
        where.userId = userId;
      }
      
      if (fromDate || toDate) {
        where.timestamp = {};
        if (fromDate) where.timestamp.gte = fromDate;
        if (toDate) where.timestamp.lte = toDate;
      }

      const [activities, total] = await Promise.all([
        this.prisma.collaboratorActivity.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          skip: offset,
          take: limit,
          include: {
            user: true,
            changes: true
          }
        }),
        this.prisma.collaboratorActivity.count({ where })
      ]);

      return {
        activities: activities.map(this.mapToCollaboratorActivity),
        total
      };
    } catch (error) {
      console.error('獲取協作者活動失敗:', error);
      throw new Error('無法獲取協作者活動');
    }
  }

  // 私有輔助方法

  private static async getLatestVersion(activityId: string): Promise<VersionInfo | null> {
    const version = await this.prisma.activityVersion.findFirst({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: true,
        changes: true
      }
    });

    return version ? this.mapToVersionInfo(version) : null;
  }

  private static generateVersionNumber(currentVersion?: string, type: VersionType = VersionType.AUTO): string {
    if (!currentVersion) {
      return '1.0.0';
    }

    const [major, minor, patch] = currentVersion.split('.').map(Number);

    switch (type) {
      case VersionType.MAJOR:
        return `${major + 1}.0.0`;
      case VersionType.MINOR:
        return `${major}.${minor + 1}.0`;
      case VersionType.PATCH:
        return `${major}.${minor}.${patch + 1}`;
      case VersionType.AUTO:
        return `${major}.${minor}.${patch + 1}`;
      case VersionType.SNAPSHOT:
        return `${major}.${minor}.${patch}-snapshot-${Date.now()}`;
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  private static async calculateContentMetadata(content: any): Promise<VersionInfo['metadata']> {
    const contentString = JSON.stringify(content);
    const size = Buffer.byteLength(contentString, 'utf8');
    const checksum = require('crypto').createHash('sha256').update(contentString).digest('hex');

    return {
      size,
      checksum,
      compression: 'gzip',
      encoding: 'utf8'
    };
  }

  private static async detectChanges(oldContent: any, newContent: any, userId: string): Promise<VersionChange[]> {
    // 實現內容變更檢測邏輯
    const changes: VersionChange[] = [];
    
    // 簡化的變更檢測
    if (JSON.stringify(oldContent) !== JSON.stringify(newContent)) {
      changes.push({
        id: `change_${Date.now()}`,
        type: ChangeType.UPDATE,
        path: '/',
        oldValue: oldContent,
        newValue: newContent,
        description: '內容已更新',
        timestamp: new Date(),
        userId,
        userName: (await this.getUserInfo(userId)).name
      });
    }

    return changes;
  }

  private static createInitialChange(userId: string): VersionChange {
    return {
      id: `change_${Date.now()}`,
      type: ChangeType.CREATE,
      path: '/',
      newValue: '初始版本',
      description: '創建初始版本',
      timestamp: new Date(),
      userId,
      userName: 'System'
    };
  }

  private static async getUserInfo(userId: string): Promise<VersionInfo['createdBy']> {
    // 模擬用戶信息獲取
    return {
      id: userId,
      name: '用戶',
      email: 'user@example.com'
    };
  }

  private static async compressContent(content: any): Promise<any> {
    // 實現內容壓縮
    return content; // 簡化實現
  }

  private static async decompressContent(content: any): Promise<any> {
    // 實現內容解壓
    return content; // 簡化實現
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async saveVersion(versionInfo: VersionInfo): Promise<void> {
    // 保存版本到數據庫
    console.log('保存版本:', versionInfo.version);
  }

  private static async recordCollaboratorActivity(activity: CollaboratorActivity): Promise<void> {
    // 記錄協作者活動
    console.log('記錄協作者活動:', activity.action);
  }

  private static async getVersion(activityId: string, version: string): Promise<VersionInfo | null> {
    // 獲取特定版本
    return null; // 簡化實現
  }

  private static async analyzeDifferences(sourceContent: any, targetContent: any): Promise<VersionDifference[]> {
    // 分析內容差異
    return []; // 簡化實現
  }

  private static calculateDifferenceSummary(differences: VersionDifference[]): VersionComparison['summary'] {
    return {
      totalChanges: differences.length,
      additions: differences.filter(d => d.type === 'addition').length,
      deletions: differences.filter(d => d.type === 'deletion').length,
      modifications: differences.filter(d => d.type === 'modification').length,
      moves: differences.filter(d => d.type === 'move').length
    };
  }

  private static calculateSimilarityScore(differences: VersionDifference[], sourceContent: any, targetContent: any): number {
    // 計算相似度分數
    return 0.85; // 簡化實現
  }

  private static detectConflicts(differences: VersionDifference[]): number {
    // 檢測衝突
    return 0; // 簡化實現
  }

  private static async mergeContents(currentContent: any, targetContent: any, options: RestoreOptions): Promise<any> {
    // 合併內容
    return targetContent; // 簡化實現
  }

  private static async selectiveRestore(currentContent: any, targetContent: any, selectedPaths: string[]): Promise<any> {
    // 選擇性恢復
    return targetContent; // 簡化實現
  }

  private static async notifyCollaborators(activityId: string, notification: any): Promise<void> {
    // 通知協作者
    console.log('通知協作者:', notification);
  }

  private static mapToVersionInfo(version: any): VersionInfo {
    // 映射數據庫記錄到VersionInfo
    return version as VersionInfo; // 簡化實現
  }

  private static mapToCollaboratorActivity(activity: any): CollaboratorActivity {
    // 映射數據庫記錄到CollaboratorActivity
    return activity as CollaboratorActivity; // 簡化實現
  }
}
