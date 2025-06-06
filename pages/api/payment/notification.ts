import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 暫時返回錯誤，因為缺少必要的 Stripe 字段和模型
  return res.status(501).json({ error: '通知功能暫未實現' });
}