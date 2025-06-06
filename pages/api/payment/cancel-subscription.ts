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

    if (userSubscription.status !== 'ACTIVE') {
      return res.status(400).json({ message: '只能取消有效的訂閱' });
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

    // 取消Stripe訂閱
    // 設置cancel_at_period_end為true，這樣訂閱將在當前計費週期結束時取消
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // 更新數據庫中的訂閱狀態
    const updatedSubscription = await prisma.subscription.update({
      where: { id: userSubscription.id },
      data: {
        status: 'CANCELED',
        // 設置結束日期為當前計費週期結束時間
        endDate: new Date(stripeSubscriptions.data[0].current_period_end * 1000),
      },

    });

    return res.status(200).json({
      success: true,
      message: '訂閱已成功取消',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('取消訂閱錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}