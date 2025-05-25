import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from '../../lib/redis';

type VitalsData = {
  name: string;
  value: number;
  id: string;
  page: string;
  timestamp: number;
};

/**
 * Web Vitals數據收集API
 * 用於收集前端性能指標數據
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const vitals: VitalsData = req.body;
    
    // 驗證數據
    if (!vitals.name || typeof vitals.value !== 'number') {
      return res.status(400).json({ error: 'Invalid vitals data' });
    }

    // 將數據存儲到Redis中，用於實時監控
    const redis = getRedisClient();
    if (redis) {
      const key = `vitals:${vitals.name}:${new Date().toISOString().split('T')[0]}`;
      await redis.lpush(key, JSON.stringify(vitals));
      // 設置過期時間為30天
      await redis.expire(key, 60 * 60 * 24 * 30);
    }

    // 也可以在這裡實現將數據寫入數據庫或發送到監控系統
    // 例如Prometheus、Grafana等

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving vitals:', error);
    return res.status(500).json({ error: 'Failed to save vitals data' });
  }
}