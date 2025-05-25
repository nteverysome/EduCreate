import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// 禁用Next.js的請求體解析，因為我們需要原始請求體來驗證Stripe簽名
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許POST請求' });
  }

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ message: '缺少Stripe簽名' });
    }

    // 驗證事件
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      console.error(`Webhook簽名驗證失敗:`, err);
      return res.status(400).json({ message: `Webhook錯誤: ${err.message}` });
    }

    // 處理不同類型的事件
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`未處理的事件類型: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook處理錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}

// 處理訂閱變更
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    // 從訂閱元數據中獲取用戶ID和計劃ID
    const userId = subscription.metadata.userId;
    const planId = subscription.metadata.planId;

    if (!userId || !planId) {
      console.error('訂閱元數據不完整:', subscription.id);
      return;
    }

    // 檢查用戶是否已有訂閱
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription) {
      // 更新現有訂閱
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId,
          status: 'ACTIVE',
          endDate: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        },
      });
    } else {
      // 創建新訂閱
      await prisma.subscription.create({
        data: {
          userId,
          planId,
          status: 'ACTIVE',
          startDate: new Date(subscription.created * 1000),
          endDate: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        },
      });

      // 更新用戶角色
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'PREMIUM_USER' },
      });
    }
  } catch (error) {
    console.error('處理訂閱變更錯誤:', error);
  }
}

// 處理訂閱取消
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata.userId;

    if (!userId) {
      console.error('訂閱元數據不完整:', subscription.id);
      return;
    }

    // 更新訂閱狀態
    await prisma.subscription.updateMany({
      where: { userId },
      data: {
        status: 'CANCELED',
        endDate: new Date(subscription.cancel_at || subscription.current_period_end * 1000),
      },
    });

    // 檢查是否已過期
    const now = new Date();
    const endDate = new Date(subscription.cancel_at || subscription.current_period_end * 1000);

    if (endDate <= now) {
      // 如果已過期，將用戶角色恢復為普通用戶
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'USER' },
      });
    }
  } catch (error) {
    console.error('處理訂閱取消錯誤:', error);
  }
}

// 處理支付失敗
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) return;

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata.userId;

    if (!userId) {
      console.error('訂閱元數據不完整:', subscription.id);
      return;
    }

    // 更新訂閱狀態為支付失敗
    await prisma.subscription.updateMany({
      where: { userId },
      data: {
        status: 'PAYMENT_FAILED',
      },
    });

    // 可以在這裡添加發送支付失敗通知的邏輯
  } catch (error) {
    console.error('處理支付失敗錯誤:', error);
  }
}