import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * 取消訂閱API
 * 允許用戶取消其當前的訂閱
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    // 獲取用戶的訂閱ID
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: '缺少訂閱ID' });
    }
    
    // 這裡應該有實際的取消訂閱邏輯
    // 例如調用Stripe API取消訂閱
    
    // 模擬成功響應
    return res.status(200).json({
      success: true,
      message: '訂閱已成功取消',
      cancelDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('取消訂閱失敗:', error);
    return res.status(500).json({ error: '取消訂閱過程中發生錯誤' });
  }
}