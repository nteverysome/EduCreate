import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許POST請求' });
  }

  try {
    // 檢查用戶是否已登入
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: '請先登入' });
    }

    // 獲取用戶的訂閱信息
    const userSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!userSubscription) {
      return res.status(404).json({ message: '找不到有效的訂閱' });
    }

    // 獲取Stripe訂閱ID
    // 注意：在實際應用中，您應該在數據庫中存儲Stripe訂閱ID
    // 這裡我們假設可以通過API調用獲取
    const stripeSubscriptions = await stripe.subscriptions.list({
      limit: 1,
      customer: session.user.id, // 假設用戶ID與Stripe客戶ID相同，實際應用中可能需要額外映射
    });

    if (stripeSubscriptions.data.length === 0) {
      return res.status(404).json({ message: '找不到Stripe訂閱' });
    }

    const stripeSubscriptionId = stripeSubscriptions.data[0].id;

    // 創建更新支付方式的會話
    const session_url = await stripe.billingPortal.sessions.create({
      customer: session.user.id, // 假設用戶ID與Stripe客戶ID相同
      return_url: `${process.env.NEXTAUTH_URL}/subscription`,
    });

    return res.status(200).json({ url: session_url.url });
  } catch (error) {
    console.error('創建更新支付方式會話錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}