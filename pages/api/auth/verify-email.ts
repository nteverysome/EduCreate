import { NextApiRequest, NextApiResponse } from 'next';

// 重定向到新的驗證端點，完全避開 NextAuth.js 路由
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔄 舊驗證端點被調用，重定向中...');

  const { token } = req.query;

  if (!token) {
    console.log('❌ 缺少驗證令牌');
    return res.status(400).json({ message: '無效的驗證令牌' });
  }

  console.log('🔄 重定向到新的驗證端點:', `/api/email/verify?token=${token}`);

  // 重定向到完全獨立的驗證端點
  return res.redirect(`/api/email/verify?token=${token}`);
}
