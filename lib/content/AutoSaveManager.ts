/**
 * 自動保存管理器 - 模仿 wordwall.net 的自動保存機制
 * 提供實時自動保存、草稿管理和錯誤恢復功能
 */

import React from 'react';
import { UniversalContent } from './UniversalContentManager';

export interface AutoSaveState {
  activityId: string;
  title: string;
  lastSaved: Date;
  isAutoSave: boolean;
  hasUnsavedChanges: boolean;
}

export interface AutoSaveOptions {
  saveDelay?: number; // 自動保存延遲時間（毫秒）
  maxRetries?: number; // 最大重試次數
  enableOfflineMode?: boolean; // 是否啟用離線模式
}

export class AutoSaveManager {
  private saveTimer: NodeJS.Timeout | null = null;
  private readonly saveDelay: number;
  private readonly maxRetries: number;
  private readonly enableOfflineMode: boolean;
  private retryCount = 0;
  private isOnline = true;
  private listeners: Set<(state: AutoSaveState) => void> = new Set();

  constructor(
    private activityId: string,
    private options: AutoSaveOptions = {}
  ) {
    this.saveDelay = options.saveDelay || 2000; // 默認 2 秒
    this.maxRetries = options.maxRetries || 3;
    this.enableOfflineMode = options.enableOfflineMode || true;

    // 監聽網絡狀態
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  /**
   * 觸發自動保存
   */
  triggerAutoSave(data: Partial<UniversalContent>): void {
    // 清除之前的定時器
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    // 立即更新 UI 狀態
    this.notifyListeners({
      activityId: this.activityId,
      title: data.title || 'Untitled',
      lastSaved: new Date(),
      isAutoSave: true,
      hasUnsavedChanges: true
    });

    // 設置新的自動保存定時器
    this.saveTimer = setTimeout(() => {
      this.performAutoSave(data);
    }, this.saveDelay);
  }

  /**
   * 執行自動保存
   */
  private async performAutoSave(data: Partial<UniversalContent>): Promise<void> {
    try {
      // 如果離線且啟用離線模式，保存到本地存儲
      if (!this.isOnline && this.enableOfflineMode) {
        this.saveToLocalStorage(data);
        return;
      }

      // 在線保存到服務器
      const response = await fetch(`/api/universal-content/${this.activityId}/autosave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          lastModified: new Date().toISOString(),
          isAutoSave: true
        })
      });

      if (!response.ok) {
        throw new Error(`自動保存失敗: ${response.status}`);
      }

      // 重置重試計數
      this.retryCount = 0;

      // 更新保存狀態
      this.notifyListeners({
        activityId: this.activityId,
        title: data.title || 'Untitled',
        lastSaved: new Date(),
        isAutoSave: true,
        hasUnsavedChanges: false
      });

      // 更新自動保存指示器
      this.updateAutoSaveIndicator(data.title || 'Untitled');

    } catch (error) {
      console.error('自動保存失敗:', error);
      
      // 重試機制
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => {
          this.performAutoSave(data);
        }, 1000 * this.retryCount); // 遞增延遲重試
      } else {
        // 達到最大重試次數，保存到本地存儲
        if (this.enableOfflineMode) {
          this.saveToLocalStorage(data);
        }
        this.notifyError(error as Error);
      }
    }
  }

  /**
   * 保存到本地存儲
   */
  private saveToLocalStorage(data: Partial<UniversalContent>): void {
    try {
      const autoSaveData = {
        activityId: this.activityId,
        data,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(
        `autosave_${this.activityId}`, 
        JSON.stringify(autoSaveData)
      );

      this.notifyListeners({
        activityId: this.activityId,
        title: data.title || 'Untitled',
        lastSaved: new Date(),
        isAutoSave: true,
        hasUnsavedChanges: false
      });

    } catch (error) {
      console.error('本地存儲保存失敗:', error);
    }
  }

  /**
   * 從本地存儲恢復數據
   */
  restoreFromLocalStorage(): Partial<UniversalContent> | null {
    try {
      const saved = localStorage.getItem(`autosave_${this.activityId}`);
      if (saved) {
        const autoSaveData = JSON.parse(saved);
        return autoSaveData.data;
      }
    } catch (error) {
      console.error('本地存儲恢復失敗:', error);
    }
    return null;
  }

  /**
   * 清除本地存儲的自動保存數據
   */
  clearLocalStorage(): void {
    try {
      localStorage.removeItem(`autosave_${this.activityId}`);
    } catch (error) {
      console.error('清除本地存儲失敗:', error);
    }
  }

  /**
   * 強制保存（不等待延遲）
   */
  async forceSave(data: Partial<UniversalContent>): Promise<void> {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    await this.performAutoSave(data);
  }

  /**
   * 更新自動保存指示器
   */
  private updateAutoSaveIndicator(title: string): void {
    const indicator = document.getElementById('autosave-indicator');
    if (indicator) {
      indicator.innerHTML = `
        <a href="/universal-game?autosave=true&id=${this.activityId}" 
           class="text-blue-600 hover:text-blue-800 text-sm">
          Continue editing: ${title}?
        </a>
      `;
      indicator.style.display = 'block';
    }
  }

  /**
   * 處理網絡連接恢復
   */
  private handleOnline(): void {
    this.isOnline = true;
    console.log('網絡連接已恢復，嘗試同步本地數據...');
    
    // 嘗試同步本地保存的數據
    const localData = this.restoreFromLocalStorage();
    if (localData) {
      this.performAutoSave(localData).then(() => {
        this.clearLocalStorage();
      });
    }
  }

  /**
   * 處理網絡連接斷開
   */
  private handleOffline(): void {
    this.isOnline = false;
    console.log('網絡連接已斷開，切換到離線模式...');
  }

  /**
   * 添加狀態監聽器
   */
  addListener(listener: (state: AutoSaveState) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除狀態監聽器
   */
  removeListener(listener: (state: AutoSaveState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 通知所有監聽器
   */
  private notifyListeners(state: AutoSaveState): void {
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * 通知錯誤
   */
  private notifyError(error: Error): void {
    // 可以通過事件系統或回調通知錯誤
    console.error('AutoSave Error:', error);
    
    // 顯示用戶友好的錯誤消息
    const errorElement = document.getElementById('autosave-error');
    if (errorElement) {
      errorElement.textContent = '自動保存失敗，數據已保存到本地';
      errorElement.style.display = 'block';
      
      // 3秒後隱藏錯誤消息
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * 清理資源
   */
  destroy(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
    
    this.listeners.clear();
  }
}

/**
 * 生成唯一的活動 ID
 */
export function generateActivityId(): string {
  return 'activity_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

/**
 * 創建自動保存管理器的 Hook
 */
export function useAutoSave(activityId: string, options?: AutoSaveOptions) {
  const [autoSaveManager] = React.useState(() => new AutoSaveManager(activityId, options));
  const [autoSaveState, setAutoSaveState] = React.useState<AutoSaveState | null>(null);

  React.useEffect(() => {
    const handleStateChange = (state: AutoSaveState) => {
      setAutoSaveState(state);
    };

    autoSaveManager.addListener(handleStateChange);

    return () => {
      autoSaveManager.removeListener(handleStateChange);
      autoSaveManager.destroy();
    };
  }, [autoSaveManager]);

  return {
    triggerAutoSave: autoSaveManager.triggerAutoSave.bind(autoSaveManager),
    forceSave: autoSaveManager.forceSave.bind(autoSaveManager),
    restoreFromLocalStorage: autoSaveManager.restoreFromLocalStorage.bind(autoSaveManager),
    autoSaveState
  };
}
