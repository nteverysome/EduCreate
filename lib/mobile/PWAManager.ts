/**
 * PWA 管理器 - 第三階段
 * 提供漸進式 Web 應用功能，包括離線支持、推送通知、安裝提示等
 */

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  startUrl: string;
  scope: string;
  icons: PWAIcon[];
  categories: string[];
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface OfflineData {
  id: string;
  type: 'activity' | 'progress' | 'content' | 'user_action';
  data: any;
  timestamp: Date;
  synced: boolean;
  retryCount: number;
}

export interface SyncConfig {
  backgroundSync: boolean;
  periodicSync: boolean;
  syncInterval: number; // 分鐘
  maxRetries: number;
  retryDelay: number; // 毫秒
}

export class PWAManager {
  private static instance: PWAManager;
  private static config: PWAConfig;
  private static installPrompt: InstallPromptEvent | null = null;
  private static isInstalled = false;
  private static isOnline = navigator.onLine;
  private static offlineQueue: OfflineData[] = [];
  private static syncConfig: SyncConfig = {
    backgroundSync: true,
    periodicSync: true,
    syncInterval: 15,
    maxRetries: 3,
    retryDelay: 5000
  };

  // 初始化 PWA
  static async initialize(config: PWAConfig): Promise<void> {
    this.config = config;
    
    // 註冊 Service Worker
    await this.registerServiceWorker();
    
    // 設置安裝提示
    this.setupInstallPrompt();
    
    // 設置網絡狀態監聽
    this.setupNetworkListeners();
    
    // 設置推送通知
    await this.setupPushNotifications();
    
    // 載入離線數據
    this.loadOfflineData();
    
    // 檢查是否已安裝
    this.checkInstallStatus();
    
    console.log('PWA 初始化完成');
  }

  // 註冊 Service Worker
  private static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: this.config.scope
        });
        
        console.log('Service Worker 註冊成功:', registration);
        
        // 監聽更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 有新版本可用
                this.notifyUpdate();
              }
            });
          }
        });
        
      } catch (error) {
        console.error('Service Worker 註冊失敗:', error);
      }
    }
  }

  // 設置安裝提示
  private static setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.installPrompt = e as InstallPromptEvent;
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallBanner();
      this.trackEvent('app_installed');
    });
  }

  // 設置網絡狀態監聽
  private static setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
      this.showNetworkStatus('已連接到網絡');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNetworkStatus('離線模式');
    });
  }

  // 設置推送通知
  private static async setupPushNotifications(): Promise<void> {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('推送通知權限已授予');
        
        // 註冊推送訂閱
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_KEY || '')
        });
        
        // 發送訂閱信息到服務器
        await this.sendSubscriptionToServer(subscription);
      }
    }
  }

  // 顯示安裝橫幅
  private static showInstallBanner(): void {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
    banner.innerHTML = `
      <div class="flex items-center">
        <div class="text-2xl mr-3">📱</div>
        <div>
          <div class="font-medium">安裝 ${this.config.name}</div>
          <div class="text-sm text-blue-100">獲得更好的體驗</div>
        </div>
      </div>
      <div class="flex space-x-2">
        <button id="pwa-install-dismiss" class="px-3 py-1 text-sm bg-blue-700 rounded hover:bg-blue-800">
          稍後
        </button>
        <button id="pwa-install-accept" class="px-3 py-1 text-sm bg-white text-blue-600 rounded hover:bg-gray-100">
          安裝
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    // 綁定事件
    document.getElementById('pwa-install-dismiss')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });

    document.getElementById('pwa-install-accept')?.addEventListener('click', () => {
      this.promptInstall();
    });

    // 自動隱藏
    setTimeout(() => {
      this.hideInstallBanner();
    }, 10000);
  }

  // 隱藏安裝橫幅
  private static hideInstallBanner(): void {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  // 提示安裝
  static async promptInstall(): Promise<boolean> {
    if (this.installPrompt) {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        this.trackEvent('install_accepted');
        return true;
      } else {
        this.trackEvent('install_dismissed');
        return false;
      }
    }
    return false;
  }

  // 檢查安裝狀態
  private static checkInstallStatus(): void {
    // 檢查是否在獨立模式下運行
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
    
    // 檢查是否從主屏幕啟動
    if ((navigator as any).standalone === true) {
      this.isInstalled = true;
    }
  }

  // 發送推送通知
  static async sendNotification(config: NotificationConfig): Promise<void> {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(config.title, {
        body: config.body,
        icon: config.icon || '/icons/icon-192x192.png',
        badge: config.badge || '/icons/badge-72x72.png',
        image: config.image,
        tag: config.tag,
        data: config.data,
        actions: config.actions,
        requireInteraction: config.requireInteraction,
        silent: config.silent,
        vibrate: config.vibrate
      });
    }
  }

  // 添加到離線隊列
  static addToOfflineQueue(data: Omit<OfflineData, 'id' | 'timestamp' | 'synced' | 'retryCount'>): void {
    const offlineData: OfflineData = {
      ...data,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      synced: false,
      retryCount: 0
    };

    this.offlineQueue.push(offlineData);
    this.saveOfflineData();
  }

  // 同步離線數據
  private static async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    const unsyncedData = this.offlineQueue.filter(item => !item.synced);
    
    for (const item of unsyncedData) {
      try {
        await this.syncSingleItem(item);
        item.synced = true;
        this.trackEvent('offline_sync_success', { type: item.type });
      } catch (error) {
        item.retryCount++;
        
        if (item.retryCount >= this.syncConfig.maxRetries) {
          console.error('離線數據同步失敗，已達最大重試次數:', item);
          this.trackEvent('offline_sync_failed', { type: item.type, error });
        } else {
          // 延遲重試
          setTimeout(() => {
            this.syncSingleItem(item);
          }, this.syncConfig.retryDelay * item.retryCount);
        }
      }
    }

    // 清理已同步的數據
    this.offlineQueue = this.offlineQueue.filter(item => !item.synced);
    this.saveOfflineData();
  }

  // 同步單個項目
  private static async syncSingleItem(item: OfflineData): Promise<void> {
    const endpoint = this.getEndpointForType(item.type);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) {
      throw new Error(`同步失敗: ${response.status}`);
    }
  }

  // 獲取類型對應的端點
  private static getEndpointForType(type: string): string {
    const endpoints = {
      'activity': '/api/activities/sync',
      'progress': '/api/progress/sync',
      'content': '/api/content/sync',
      'user_action': '/api/actions/sync'
    };
    
    return endpoints[type as keyof typeof endpoints] || '/api/sync';
  }

  // 保存離線數據
  private static saveOfflineData(): void {
    try {
      localStorage.setItem('pwa_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('保存離線數據失敗:', error);
    }
  }

  // 載入離線數據
  private static loadOfflineData(): void {
    try {
      const saved = localStorage.getItem('pwa_offline_queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('載入離線數據失敗:', error);
      this.offlineQueue = [];
    }
  }

  // 顯示網絡狀態
  private static showNetworkStatus(message: string): void {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      this.isOnline ? 'bg-green-600' : 'bg-orange-600'
    } text-white`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // 通知更新
  private static notifyUpdate(): void {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'fixed top-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50';
    updateBanner.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">新版本可用</div>
          <div class="text-sm text-blue-100">點擊重新載入以獲取最新功能</div>
        </div>
        <button id="pwa-update-reload" class="px-3 py-1 text-sm bg-white text-blue-600 rounded hover:bg-gray-100">
          重新載入
        </button>
      </div>
    `;

    document.body.appendChild(updateBanner);

    document.getElementById('pwa-update-reload')?.addEventListener('click', () => {
      window.location.reload();
    });
  }

  // 轉換 VAPID 密鑰
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 發送訂閱到服務器
  private static async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('發送推送訂閱失敗:', error);
    }
  }

  // 追蹤事件
  private static trackEvent(event: string, data?: any): void {
    // 這裡可以集成分析工具
    console.log('PWA 事件:', event, data);
  }

  // 獲取狀態
  static getStatus(): {
    isInstalled: boolean;
    isOnline: boolean;
    offlineQueueSize: number;
    canInstall: boolean;
  } {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      offlineQueueSize: this.offlineQueue.length,
      canInstall: this.installPrompt !== null
    };
  }

  // 清理離線數據
  static clearOfflineData(): void {
    this.offlineQueue = [];
    this.saveOfflineData();
  }

  // 獲取離線數據統計
  static getOfflineStats(): {
    total: number;
    synced: number;
    pending: number;
    failed: number;
  } {
    const total = this.offlineQueue.length;
    const synced = this.offlineQueue.filter(item => item.synced).length;
    const failed = this.offlineQueue.filter(item => item.retryCount >= this.syncConfig.maxRetries).length;
    const pending = total - synced - failed;

    return { total, synced, pending, failed };
  }
}
