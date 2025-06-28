import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { sessionCache } from '../lib/cache/CacheManager';
import { useErrorHandler } from './useErrorHandler';

interface SubscriptionStatus {
  hasSubscription: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: any | null;
  requiresUpgrade: boolean;
  activityCount: number;
  activityLimit: number;
  canCreateMore: boolean;
}

/**
 * 優化的訂閱狀態檢查 Hook
 * 使用緩存、錯誤處理和防抖優化性能
 */
export default function useSubscription(): SubscriptionStatus & {
  refreshSubscription: () => Promise<void>;
  clearCache: () => void;
} {
  const { data: session, status } = useSession();
  const { executeWithErrorHandling, error, isLoading } = useErrorHandler();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasSubscription: false,
    isLoading: true,
    error: null,
    subscription: null,
    requiresUpgrade: false,
    activityCount: 0,
    activityLimit: 5,
    canCreateMore: true
  });

  // 緩存鍵
  const cacheKey = useMemo(() =>
    session?.user?.id ? `subscription:${session.user.id}` : null,
    [session?.user?.id]
  );

  // 獲取訂閱狀態的函數
  const fetchSubscriptionStatus = useCallback(async (): Promise<SubscriptionStatus> => {
    if (!cacheKey) {
      throw new Error('用戶未登入');
    }

    // 先檢查緩存
    const cached = sessionCache.get<SubscriptionStatus>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await fetch('/api/user/subscription-status');

    if (!response.ok) {
      throw new Error('獲取訂閱狀態失敗');
    }

    const data = await response.json();

    const result: SubscriptionStatus = {
      hasSubscription: data.hasSubscription,
      isLoading: false,
      error: null,
      subscription: data.subscription,
      requiresUpgrade: data.requiresUpgrade || false,
      activityCount: data.activityCount || 0,
      activityLimit: data.activityLimit || 5,
      canCreateMore: data.canCreateMore || true
    };

    // 緩存結果
    sessionCache.set(cacheKey, result, 5 * 60 * 1000); // 5 分鐘緩存

    return result;
  }, [cacheKey]);

  // 刷新訂閱狀態
  const refreshSubscription = useCallback(async () => {
    if (cacheKey) {
      sessionCache.delete(cacheKey); // 清除緩存
    }

    await executeWithErrorHandling(
      fetchSubscriptionStatus,
      (result) => {
        setSubscriptionStatus(result);
      }
    );
  }, [cacheKey, executeWithErrorHandling, fetchSubscriptionStatus]);

  // 清除緩存
  const clearCache = useCallback(() => {
    if (cacheKey) {
      sessionCache.delete(cacheKey);
    }
  }, [cacheKey]);

  useEffect(() => {
    if (status === 'loading' || !session?.user) {
      return;
    }

    executeWithErrorHandling(
      fetchSubscriptionStatus,
      (result) => {
        setSubscriptionStatus(result);
      }
    );
  }, [session, status, executeWithErrorHandling, fetchSubscriptionStatus]);

  return {
    ...subscriptionStatus,
    error: error || subscriptionStatus.error,
    isLoading: isLoading || subscriptionStatus.isLoading,
    refreshSubscription,
    clearCache,
  };
}