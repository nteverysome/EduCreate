import { useEffect, useState } from 'react';
import { getPusherClient } from '@/lib/pusher';

/**
 * 截圖更新數據類型
 */
export interface ScreenshotUpdate {
  activityId: string;
  status: 'generating' | 'completed' | 'failed';
  thumbnailUrl?: string;
  error?: string;
  retryCount?: number;
  timestamp: string;
}

/**
 * 使用截圖實時更新的 Hook
 * 
 * @param userId - 用戶 ID
 * @param onUpdate - 更新回調函數
 */
export function useScreenshotUpdates(
  userId: string | undefined,
  onUpdate?: (update: ScreenshotUpdate) => void
) {
  const [updates, setUpdates] = useState<ScreenshotUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    // 訂閱用戶私有頻道
    const channel = pusher.subscribe(`private-user-${userId}`);

    // 監聽連接狀態
    pusher.connection.bind('connected', () => {
      console.log('[Pusher] Connected');
      setIsConnected(true);
    });

    pusher.connection.bind('disconnected', () => {
      console.log('[Pusher] Disconnected');
      setIsConnected(false);
    });

    // 監聽單個截圖更新事件
    channel.bind('screenshot-update', (data: ScreenshotUpdate) => {
      console.log('[Pusher] Screenshot update received:', data);
      
      setUpdates((prev) => [...prev, data]);
      
      if (onUpdate) {
        onUpdate(data);
      }
    });

    // 監聽批量截圖更新事件
    channel.bind('screenshot-batch-update', (data: { updates: ScreenshotUpdate[] }) => {
      console.log('[Pusher] Batch screenshot updates received:', data.updates);
      
      setUpdates((prev) => [...prev, ...data.updates]);
      
      if (onUpdate) {
        data.updates.forEach((update) => onUpdate(update));
      }
    });

    // 清理函數
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId, onUpdate]);

  return {
    updates,
    isConnected,
  };
}

/**
 * 使用單個活動的截圖更新 Hook
 * 
 * @param userId - 用戶 ID
 * @param activityId - 活動 ID
 */
export function useActivityScreenshotUpdate(
  userId: string | undefined,
  activityId: string
) {
  const [update, setUpdate] = useState<ScreenshotUpdate | null>(null);

  const handleUpdate = (newUpdate: ScreenshotUpdate) => {
    if (newUpdate.activityId === activityId) {
      setUpdate(newUpdate);
    }
  };

  const { isConnected } = useScreenshotUpdates(userId, handleUpdate);

  return {
    update,
    isConnected,
  };
}

