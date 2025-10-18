import Pusher from 'pusher';
import PusherClient from 'pusher-js';

/**
 * Pusher 配置
 * 
 * 用於實時推送截圖生成狀態更新
 */

// 服務端 Pusher 實例（用於發送事件）
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// 客戶端 Pusher 實例（用於接收事件）
export const getPusherClient = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth', // 私有頻道認證端點
  });
};

/**
 * 推送截圖狀態更新事件
 * 
 * @param userId - 用戶 ID
 * @param activityId - 活動 ID
 * @param status - 截圖狀態
 * @param data - 額外數據
 */
export async function pushScreenshotUpdate(
  userId: string,
  activityId: string,
  status: 'generating' | 'completed' | 'failed',
  data?: {
    thumbnailUrl?: string;
    error?: string;
    retryCount?: number;
  }
) {
  try {
    await pusherServer.trigger(
      `private-user-${userId}`, // 私有頻道，只有該用戶能接收
      'screenshot-update', // 事件名稱
      {
        activityId,
        status,
        ...data,
        timestamp: new Date().toISOString(),
      }
    );

    console.log(`[Pusher] Screenshot update pushed for activity ${activityId}, status: ${status}`);
  } catch (error) {
    console.error('[Pusher] Failed to push screenshot update:', error);
  }
}

/**
 * 推送批量截圖更新事件
 * 
 * @param userId - 用戶 ID
 * @param updates - 更新列表
 */
export async function pushBatchScreenshotUpdates(
  userId: string,
  updates: Array<{
    activityId: string;
    status: 'generating' | 'completed' | 'failed';
    thumbnailUrl?: string;
    error?: string;
  }>
) {
  try {
    await pusherServer.trigger(
      `private-user-${userId}`,
      'screenshot-batch-update',
      {
        updates,
        timestamp: new Date().toISOString(),
      }
    );

    console.log(`[Pusher] Batch screenshot updates pushed for ${updates.length} activities`);
  } catch (error) {
    console.error('[Pusher] Failed to push batch screenshot updates:', error);
  }
}

