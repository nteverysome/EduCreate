import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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
 * React hook用於檢查用戶的訂閱狀態
 * @returns 訂閱狀態信息
 */
export default function useSubscription(): SubscriptionStatus {
  const { data: session, status } = useSession();
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

  useEffect(() => {
    // 如果用戶未登入或會話正在加載，則不執行任何操作
    if (status === 'loading' || !session?.user) {
      return;
    }

    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/user/subscription-status');
        
        if (!response.ok) {
          throw new Error('獲取訂閱狀態失敗');
        }

        const data = await response.json();
        
        setSubscriptionStatus({
          hasSubscription: data.hasSubscription,
          isLoading: false,
          error: null,
          subscription: data.subscription,
          requiresUpgrade: data.requiresUpgrade || false,
          activityCount: data.activityCount || 0,
          activityLimit: data.activityLimit || 5,
          canCreateMore: data.canCreateMore || true
        });
      } catch (err) {
        setSubscriptionStatus({
          hasSubscription: false,
          isLoading: false,
          error: err instanceof Error ? err.message : '獲取訂閱狀態時發生錯誤',
          subscription: null,
          requiresUpgrade: false,
          activityCount: 0,
          activityLimit: 5,
          canCreateMore: true
        });
      }
    };

    fetchSubscriptionStatus();
  }, [session, status]);

  return subscriptionStatus;
}