import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 暫時返回錯誤，因為缺少必要的 Plan 模型和 Stripe 字段
  return res.status(501).json({ message: '會話驗證功能暫未實現' });
}