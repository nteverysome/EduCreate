import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

/**
 * 更新支付方式API
 * 允許用戶更新其支付方式
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
    // 獲取新的支付方式ID
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({ error: '缺少支付方式ID' });
    }
    
    // 這裡應該有實際的更新支付方式邏輯
    // 例如調用Stripe API更新客戶的默認支付方式
    
    // 模擬成功響應
    return res.status(200).json({
      success: true,
      message: '支付方式已成功更新',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('更新支付方式失敗:', error);
    return res.status(500).json({ error: '更新支付方式過程中發生錯誤' });
  }
}