import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

/**
 * 創建訂閱API
 * 處理用戶訂閱請求，創建Stripe訂閱並更新數據庫
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允許POST請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  // 獲取用戶會話
  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }

  try {
    const { paymentMethodId, planId, customerId } = req.body;

    if (!paymentMethodId || !planId) {
      return res.status(400).json({ error: '缺少必要參數' });
    }

    // 獲取用戶信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }

    // 獲取計劃信息
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ error: '訂閱計劃不存在' });
    }

    // 檢查用戶是否已有Stripe客戶ID
    let stripeCustomerId = customerId || user.stripeCustomerId;

    // 如果用戶沒有Stripe客戶ID，創建一個新的
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // 更新用戶的Stripe客戶ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // 將支付方式附加到客戶
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // 設置為默認支付方式
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // 創建訂閱
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    });

    // 更新或創建用戶訂閱記錄
    let userSubscription;
    if (user.subscription) {
      userSubscription = await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          planId: plan.id,
          stripeSubscriptionId: subscription.id,
          status: mapStripeStatusToDbStatus(subscription.status),
          startDate: new Date(subscription.created * 1000),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        include: { plan: true },
      });
    } else {
      userSubscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId,
          status: mapStripeStatusToDbStatus(subscription.status),
          startDate: new Date(subscription.created * 1000),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        include: { plan: true },
      });
    }

    // 返回訂閱信息
    return res.status(200).json({
      status: subscription.status,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || null,
      subscription: userSubscription,
    });
  } catch (error) {
    console.error('創建訂閱失敗:', error);
    return res.status(500).json({ error: '創建訂閱失敗' });
  }
}

// 將Stripe訂閱狀態映射到數據庫狀態
function mapStripeStatusToDbStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    trialing: 'ACTIVE',
    incomplete: 'PENDING',
    incomplete_expired: 'FAILED',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
  };

  return statusMap[status] || 'PENDING';
}