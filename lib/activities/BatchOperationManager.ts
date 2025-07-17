/**
 * BatchOperationManager.ts - 批量操作管理器
 * 處理活動的批量操作邏輯，包含移動、複製、刪除、分享、標籤、導出等功能
 */

// 活動數據接口
interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  size: number;
  isShared: boolean;
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  learningEffectiveness?: number;
  usageCount: number;
  tags: string[];
  thumbnail?: string;
  status?: 'draft' | 'published' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  templateType?: string;
  learningState?: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  difficulty?: 1 | 2 | 3 | 4 | 5;
  subject?: string;
  author?: string;
  content?: any;
}

// 批量操作類型
type BatchOperationType = 
  | 'move' 
  | 'copy' 
  | 'delete' 
  | 'share' 
  | 'tag' 
  | 'export' 
  | 'archive' 
  | 'publish' 
  | 'duplicate';

// 批量操作選項
interface BatchOperationOptions {
  selectedIds: string[];
  targetFolderId?: string;
  tags?: string[];
  shareSettings?: {
    isPublic: boolean;
    allowComments: boolean;
    allowDownload: boolean;
    expiresAt?: Date;
  };
  exportFormat?: 'json' | 'csv' | 'xlsx' | 'pdf' | 'zip';
  onProgress?: (progress: number) => void;
}

// 批量操作結果
interface BatchOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: string[];
  details: {
    operation: BatchOperationType;
    selectedIds: string[];
    timestamp: Date;
    duration: number;
  };
}

export class BatchOperationManager {
  private activities: Activity[];
  private onActivitiesChange: (activities: Activity[]) => void;

  constructor(
    activities: Activity[], 
    onActivitiesChange: (activities: Activity[]) => void
  ) {
    this.activities = activities;
    this.onActivitiesChange = onActivitiesChange;
  }

  // 執行批量操作
  async executeBatchOperation(
    operation: BatchOperationType,
    options: BatchOperationOptions
  ): Promise<BatchOperationResult> {
    const startTime = Date.now();
    const { selectedIds, onProgress } = options;
    
    let processedCount = 0;
    let failedCount = 0;
    let errors: string[] = [];

    try {
      // 驗證選中的活動
      const selectedActivities = this.activities.filter(activity => 
        selectedIds.includes(activity.id)
      );

      if (selectedActivities.length === 0) {
        throw new Error('沒有選中的活動');
      }

      // 根據操作類型執行相應的處理
      switch (operation) {
        case 'move':
          ({ processedCount, failedCount, errors: errors } = 
            await this.handleMoveOperation(selectedActivities, options));
          break;
          
        case 'copy':
          ({ processedCount, failedCount, errors: errors } = 
            await this.handleCopyOperation(selectedActivities, options));
          break;
          
        case 'duplicate':
          ({ processedCount, failedCount, errors: errors } = 
            await this.handleDuplicateOperation(selectedActivities, options));
          break;
          
        case 'delete':
          ({ processedCount, failedCount, errors: errors } = 
            await this.handleDeleteOperation(selectedActivities, options));
          break;
          
        case 'share':
          ({ processedCount, failedCount, errors: errors } = 
            await this.handleShareOperation(selectedActivities, options));
          break;
          
        case 'tag':
          ({ processedCount, failedCount, errors: errors } = 
            await this.handleTagOperation(selectedActivities, options));
          break;
          
        case 'export':
          ({ processedCount, failedCount, errors: errors } = 
            await this.handleExportOperation(selectedActivities, options));
          break;
          
        case 'archive':
          ({ processedCount, failedCount, errors: errors } = 
            await this.handleArchiveOperation(selectedActivities, options));
          break;
          
        case 'publish':
          ({ processedCount, failedCount, errors: errors } = 
            await this.handlePublishOperation(selectedActivities, options));
          break;
          
        default:
          throw new Error(`不支持的操作類型: ${operation}`);
      }

      const duration = Date.now() - startTime;
      
      return {
        success: failedCount === 0,
        processedCount,
        failedCount,
        errors,
        details: {
          operation,
          selectedIds,
          timestamp: new Date(),
          duration
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        processedCount,
        failedCount: selectedIds.length,
        errors: [error instanceof Error ? error.message : '未知錯誤'],
        details: {
          operation,
          selectedIds,
          timestamp: new Date(),
          duration
        }
      };
    }
  }

  // 處理移動操作
  private async handleMoveOperation(
    selectedActivities: Activity[],
    options: BatchOperationOptions
  ) {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedActivities.length; i++) {
      const activity = selectedActivities[i];
      
      try {
        // 模擬移動操作
        await this.simulateAsyncOperation(100);
        
        // 更新活動的文件夾ID
        const updatedActivity = {
          ...activity,
          folderId: options.targetFolderId,
          updatedAt: new Date()
        };

        // 更新活動列表
        this.updateActivity(updatedActivity);
        processedCount++;
        
        // 更新進度
        options.onProgress?.(((i + 1) / selectedActivities.length) * 100);
        
      } catch (error) {
        failedCount++;
        errors.push(`移動活動 "${activity.title}" 失敗: ${error}`);
      }
    }

    return { processedCount, failedCount, errors };
  }

  // 處理複製操作
  private async handleCopyOperation(
    selectedActivities: Activity[],
    options: BatchOperationOptions
  ) {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedActivities.length; i++) {
      const activity = selectedActivities[i];
      
      try {
        // 模擬複製操作
        await this.simulateAsyncOperation(150);
        
        // 創建複製的活動
        const copiedActivity: Activity = {
          ...activity,
          id: this.generateId(),
          title: `${activity.title} (複製)`,
          folderId: options.targetFolderId || activity.folderId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isShared: false,
          usageCount: 0
        };

        // 添加到活動列表
        this.addActivity(copiedActivity);
        processedCount++;
        
        // 更新進度
        options.onProgress?.(((i + 1) / selectedActivities.length) * 100);
        
      } catch (error) {
        failedCount++;
        errors.push(`複製活動 "${activity.title}" 失敗: ${error}`);
      }
    }

    return { processedCount, failedCount, errors };
  }

  // 處理複製操作
  private async handleDuplicateOperation(
    selectedActivities: Activity[],
    options: BatchOperationOptions
  ) {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedActivities.length; i++) {
      const activity = selectedActivities[i];
      
      try {
        // 模擬複製操作
        await this.simulateAsyncOperation(120);
        
        // 創建複製的活動
        const duplicatedActivity: Activity = {
          ...activity,
          id: this.generateId(),
          title: `${activity.title} (副本)`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isShared: false,
          usageCount: 0
        };

        // 添加到活動列表
        this.addActivity(duplicatedActivity);
        processedCount++;
        
        // 更新進度
        options.onProgress?.(((i + 1) / selectedActivities.length) * 100);
        
      } catch (error) {
        failedCount++;
        errors.push(`複製活動 "${activity.title}" 失敗: ${error}`);
      }
    }

    return { processedCount, failedCount, errors };
  }

  // 處理刪除操作
  private async handleDeleteOperation(
    selectedActivities: Activity[],
    options: BatchOperationOptions
  ) {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedActivities.length; i++) {
      const activity = selectedActivities[i];
      
      try {
        // 模擬刪除操作
        await this.simulateAsyncOperation(80);
        
        // 從活動列表中移除
        this.removeActivity(activity.id);
        processedCount++;
        
        // 更新進度
        options.onProgress?.(((i + 1) / selectedActivities.length) * 100);
        
      } catch (error) {
        failedCount++;
        errors.push(`刪除活動 "${activity.title}" 失敗: ${error}`);
      }
    }

    return { processedCount, failedCount, errors };
  }

  // 處理分享操作
  private async handleShareOperation(
    selectedActivities: Activity[],
    options: BatchOperationOptions
  ) {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedActivities.length; i++) {
      const activity = selectedActivities[i];
      
      try {
        // 模擬分享操作
        await this.simulateAsyncOperation(200);
        
        // 更新分享狀態
        const updatedActivity = {
          ...activity,
          isShared: true,
          updatedAt: new Date()
        };

        this.updateActivity(updatedActivity);
        processedCount++;
        
        // 更新進度
        options.onProgress?.(((i + 1) / selectedActivities.length) * 100);
        
      } catch (error) {
        failedCount++;
        errors.push(`分享活動 "${activity.title}" 失敗: ${error}`);
      }
    }

    return { processedCount, failedCount, errors };
  }

  // 處理標籤操作
  private async handleTagOperation(
    selectedActivities: Activity[],
    options: BatchOperationOptions
  ) {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedActivities.length; i++) {
      const activity = selectedActivities[i];
      
      try {
        // 模擬標籤操作
        await this.simulateAsyncOperation(60);
        
        // 添加標籤
        const newTags = [...new Set([...activity.tags, ...(options.tags || [])])];
        const updatedActivity = {
          ...activity,
          tags: newTags,
          updatedAt: new Date()
        };

        this.updateActivity(updatedActivity);
        processedCount++;
        
        // 更新進度
        options.onProgress?.(((i + 1) / selectedActivities.length) * 100);
        
      } catch (error) {
        failedCount++;
        errors.push(`標籤活動 "${activity.title}" 失敗: ${error}`);
      }
    }

    return { processedCount, failedCount, errors };
  }

  // 處理導出操作
  private async handleExportOperation(
    selectedActivities: Activity[],
    options: BatchOperationOptions
  ) {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      // 模擬導出操作
      await this.simulateAsyncOperation(500);
      
      const exportData = selectedActivities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        geptLevel: activity.geptLevel,
        tags: activity.tags.join(', '),
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString()
      }));

      // 根據格式導出
      const format = options.exportFormat || 'json';
      let exportContent: string;
      let mimeType: string;
      let filename: string;

      switch (format) {
        case 'json':
          exportContent = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `activities_export_${Date.now()}.json`;
          break;
          
        case 'csv':
          const headers = Object.keys(exportData[0] || {});
          const csvRows = [
            headers.join(','),
            ...exportData.map(row => 
              headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
            )
          ];
          exportContent = csvRows.join('\n');
          mimeType = 'text/csv';
          filename = `activities_export_${Date.now()}.csv`;
          break;
          
        default:
          exportContent = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `activities_export_${Date.now()}.json`;
      }

      // 觸發下載
      this.downloadFile(exportContent, filename, mimeType);
      
      processedCount = selectedActivities.length;
      options.onProgress?.(100);
      
    } catch (error) {
      failedCount = selectedActivities.length;
      errors.push(`導出失敗: ${error}`);
    }

    return { processedCount, failedCount, errors };
  }

  // 處理歸檔操作
  private async handleArchiveOperation(
    selectedActivities: Activity[],
    options: BatchOperationOptions
  ) {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedActivities.length; i++) {
      const activity = selectedActivities[i];
      
      try {
        // 模擬歸檔操作
        await this.simulateAsyncOperation(90);
        
        // 更新狀態為歸檔
        const updatedActivity = {
          ...activity,
          status: 'archived' as const,
          updatedAt: new Date()
        };

        this.updateActivity(updatedActivity);
        processedCount++;
        
        // 更新進度
        options.onProgress?.(((i + 1) / selectedActivities.length) * 100);
        
      } catch (error) {
        failedCount++;
        errors.push(`歸檔活動 "${activity.title}" 失敗: ${error}`);
      }
    }

    return { processedCount, failedCount, errors };
  }

  // 處理發布操作
  private async handlePublishOperation(
    selectedActivities: Activity[],
    options: BatchOperationOptions
  ) {
    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < selectedActivities.length; i++) {
      const activity = selectedActivities[i];
      
      try {
        // 只處理草稿狀態的活動
        if (activity.status !== 'draft') {
          continue;
        }
        
        // 模擬發布操作
        await this.simulateAsyncOperation(150);
        
        // 更新狀態為已發布
        const updatedActivity = {
          ...activity,
          status: 'published' as const,
          updatedAt: new Date()
        };

        this.updateActivity(updatedActivity);
        processedCount++;
        
        // 更新進度
        options.onProgress?.(((i + 1) / selectedActivities.length) * 100);
        
      } catch (error) {
        failedCount++;
        errors.push(`發布活動 "${activity.title}" 失敗: ${error}`);
      }
    }

    return { processedCount, failedCount, errors };
  }

  // 輔助方法：模擬異步操作
  private async simulateAsyncOperation(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // 輔助方法：生成ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // 輔助方法：更新活動
  private updateActivity(updatedActivity: Activity): void {
    const index = this.activities.findIndex(a => a.id === updatedActivity.id);
    if (index !== -1) {
      this.activities[index] = updatedActivity;
      this.onActivitiesChange([...this.activities]);
    }
  }

  // 輔助方法：添加活動
  private addActivity(newActivity: Activity): void {
    this.activities.push(newActivity);
    this.onActivitiesChange([...this.activities]);
  }

  // 輔助方法：移除活動
  private removeActivity(activityId: string): void {
    this.activities = this.activities.filter(a => a.id !== activityId);
    this.onActivitiesChange([...this.activities]);
  }

  // 輔助方法：下載文件
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
