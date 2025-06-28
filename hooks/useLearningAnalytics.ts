/**
 * 學習分析數據收集 Hook
 * 自動收集用戶學習行為數據
 */

import { useEffect, useCallback, useRef } from 'react';

interface LearningEvent {
  userId: string;
  activityId: string;
  eventType: 'start' | 'complete' | 'pause' | 'resume' | 'answer' | 'hint' | 'skip';
  duration?: number;
  score?: number;
  data?: any;
}

interface UseLearningAnalyticsOptions {
  userId: string;
  activityId: string;
  autoTrack?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

export function useLearningAnalytics({
  userId,
  activityId,
  autoTrack = true,
  batchSize = 10,
  flushInterval = 30000 // 30 秒
}: UseLearningAnalyticsOptions) {
  const eventQueue = useRef<LearningEvent[]>([]);
  const startTime = useRef<number>(Date.now());
  const lastActivity = useRef<number>(Date.now());
  const flushTimer = useRef<NodeJS.Timeout>();

  // 發送事件到服務器
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const eventsToSend = [...eventQueue.current];
    eventQueue.current = [];

    try {
      for (const event of eventsToSend) {
        await fetch('/api/analytics/learning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
      }
      console.log(`📊 已發送 ${eventsToSend.length} 個學習事件`);
    } catch (error) {
      console.error('發送學習事件失敗:', error);
      // 失敗的事件重新加入隊列
      eventQueue.current.unshift(...eventsToSend);
    }
  }, []);

  // 添加事件到隊列
  const trackEvent = useCallback((
    eventType: LearningEvent['eventType'],
    options: Partial<Pick<LearningEvent, 'duration' | 'score' | 'data'>> = {}
  ) => {
    const event: LearningEvent = {
      userId,
      activityId,
      eventType,
      ...options
    };

    eventQueue.current.push(event);
    lastActivity.current = Date.now();

    // 如果隊列滿了，立即發送
    if (eventQueue.current.length >= batchSize) {
      flushEvents();
    }
  }, [userId, activityId, batchSize, flushEvents]);

  // 開始活動
  const startActivity = useCallback(() => {
    startTime.current = Date.now();
    trackEvent('start');
  }, [trackEvent]);

  // 完成活動
  const completeActivity = useCallback((score?: number) => {
    const duration = Date.now() - startTime.current;
    trackEvent('complete', { duration, score });
  }, [trackEvent]);

  // 暫停活動
  const pauseActivity = useCallback(() => {
    const duration = Date.now() - startTime.current;
    trackEvent('pause', { duration });
  }, [trackEvent]);

  // 恢復活動
  const resumeActivity = useCallback(() => {
    startTime.current = Date.now();
    trackEvent('resume');
  }, [trackEvent]);

  // 回答問題
  const answerQuestion = useCallback((score?: number, data?: any) => {
    const duration = Date.now() - lastActivity.current;
    trackEvent('answer', { duration, score, data });
  }, [trackEvent]);

  // 使用提示
  const useHint = useCallback((data?: any) => {
    trackEvent('hint', { data });
  }, [trackEvent]);

  // 跳過問題
  const skipQuestion = useCallback((data?: any) => {
    trackEvent('skip', { data });
  }, [trackEvent]);

  // 自動追蹤頁面活動
  useEffect(() => {
    if (!autoTrack) return;

    // 頁面可見性變化追蹤
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseActivity();
      } else {
        resumeActivity();
      }
    };

    // 頁面離開前發送剩餘事件
    const handleBeforeUnload = () => {
      if (eventQueue.current.length > 0) {
        // 使用 sendBeacon 確保數據發送
        const events = [...eventQueue.current];
        eventQueue.current = [];
        
        for (const event of events) {
          navigator.sendBeacon(
            '/api/analytics/learning',
            JSON.stringify(event)
          );
        }
      }
    };

    // 鼠標和鍵盤活動追蹤
    const handleUserActivity = () => {
      lastActivity.current = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keypress', handleUserActivity);
    document.addEventListener('click', handleUserActivity);

    // 開始追蹤
    startActivity();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keypress', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
      
      // 完成活動
      const duration = Date.now() - startTime.current;
      trackEvent('complete', { duration });
      flushEvents();
    };
  }, [autoTrack, startActivity, pauseActivity, resumeActivity, trackEvent, flushEvents]);

  // 定期發送事件
  useEffect(() => {
    flushTimer.current = setInterval(flushEvents, flushInterval);
    
    return () => {
      if (flushTimer.current) {
        clearInterval(flushTimer.current);
      }
    };
  }, [flushEvents, flushInterval]);

  // 獲取學習洞察
  const getLearningInsights = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/learning?action=insights&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.insights;
      }
    } catch (error) {
      console.error('獲取學習洞察失敗:', error);
    }
    return null;
  }, [userId]);

  // 獲取學習儀表板
  const getLearningDashboard = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/learning?action=dashboard&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.dashboard;
      }
    } catch (error) {
      console.error('獲取學習儀表板失敗:', error);
    }
    return null;
  }, [userId]);

  return {
    // 手動追蹤方法
    trackEvent,
    startActivity,
    completeActivity,
    pauseActivity,
    resumeActivity,
    answerQuestion,
    useHint,
    skipQuestion,
    
    // 數據獲取方法
    getLearningInsights,
    getLearningDashboard,
    
    // 工具方法
    flushEvents,
    
    // 狀態
    queueSize: eventQueue.current.length
  };
}

// 全局學習分析管理器
class LearningAnalyticsManager {
  private static instance: LearningAnalyticsManager;
  private eventQueue: LearningEvent[] = [];
  private isOnline = navigator.onLine;

  static getInstance(): LearningAnalyticsManager {
    if (!LearningAnalyticsManager.instance) {
      LearningAnalyticsManager.instance = new LearningAnalyticsManager();
    }
    return LearningAnalyticsManager.instance;
  }

  constructor() {
    // 監聽網絡狀態
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushOfflineEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // 添加事件（支持離線）
  addEvent(event: LearningEvent) {
    if (this.isOnline) {
      this.sendEvent(event);
    } else {
      this.eventQueue.push(event);
      this.saveToLocalStorage();
    }
  }

  // 發送單個事件
  private async sendEvent(event: LearningEvent) {
    try {
      await fetch('/api/analytics/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('發送學習事件失敗:', error);
      // 失敗時保存到離線隊列
      this.eventQueue.push(event);
      this.saveToLocalStorage();
    }
  }

  // 發送離線事件
  private async flushOfflineEvents() {
    this.loadFromLocalStorage();
    
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of eventsToSend) {
      await this.sendEvent(event);
    }

    this.clearLocalStorage();
  }

  // 保存到本地存儲
  private saveToLocalStorage() {
    try {
      localStorage.setItem('learningAnalyticsQueue', JSON.stringify(this.eventQueue));
    } catch (error) {
      console.error('保存學習事件到本地存儲失敗:', error);
    }
  }

  // 從本地存儲加載
  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('learningAnalyticsQueue');
      if (saved) {
        this.eventQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('從本地存儲加載學習事件失敗:', error);
    }
  }

  // 清除本地存儲
  private clearLocalStorage() {
    try {
      localStorage.removeItem('learningAnalyticsQueue');
    } catch (error) {
      console.error('清除本地存儲失敗:', error);
    }
  }
}

// 導出全局管理器實例
export const learningAnalytics = LearningAnalyticsManager.getInstance();
