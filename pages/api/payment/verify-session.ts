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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許GET請求' });
  }

  try {
    // 檢查用戶是否已登入
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: '請先登入' });
    }

    const { session_id } = req.query;
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ message: '請提供有效的會話ID' });
    }

    // 從Stripe獲取結帳會話
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!checkoutSession) {
      return res.status(404).json({ message: '找不到指定的結帳會話' });
    }

    // 檢查支付狀態
    if (checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({ message: '支付尚未完成' });
    }

    // 獲取訂閱ID
    const subscriptionId = checkoutSession.subscription as string;
    if (!subscriptionId) {
      return res.status(400).json({ message: '無效的訂閱信息' });
    }

    // 獲取訂閱詳情
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // 從會話元數據中獲取用戶ID和計劃ID
    const userId = checkoutSession.metadata?.userId;
    const planId = checkoutSession.metadata?.planId;

    if (!userId || !planId) {
      return res.status(400).json({ message: '會話元數據不完整' });
    }

    // 檢查用戶ID是否匹配當前登入用戶
    if (userId !== session.user.id) {
      return res.status(403).json({ message: '無權訪問此訂閱信息' });
    }

    // 檢查用戶是否已有訂閱
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: { plan: true }
    });

    let userSubscription;

    if (existingSubscription) {
      // 更新現有訂閱
      userSubscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId: planId,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        },
        include: { plan: true }
      });
    } else {
      // 創建新訂閱
      userSubscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          planId: planId,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        },
        include: { plan: true }
      });
    }

    // 更新用戶角色
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'PREMIUM_USER' }
    });

    return res.status(200).json({ 
      success: true, 
      subscription: userSubscription,
      stripeSubscriptionId: subscriptionId
    });
  } catch (error) {
    console.error('驗證支付會話錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}