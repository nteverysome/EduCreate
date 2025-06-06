import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../lib/prisma';
import { SubStatus } from '@prisma/client';
import Stripe from 'stripe';


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
  const session = await getServerSession(req, res, authOptions);
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
    let stripeCustomerId = customerId;

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

      // 注意：如果需要存储Stripe客户ID，需要在User模型中添加相应字段
      // 暂时跳过存储客户ID到数据库
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
      items: [{ price: `price_${plan.id}` }], // 使用计划ID构建价格ID
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
    // 安全地获取client_secret
    let clientSecret = null;
    if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      if (invoice.payment_intent && typeof invoice.payment_intent === 'object') {
        const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
        clientSecret = paymentIntent.client_secret;
      }
    }

    return res.status(200).json({
      status: subscription.status,
      clientSecret,
      subscription: userSubscription,
    });
  } catch (error) {
    console.error('創建訂閱失敗:', error);
    return res.status(500).json({ error: '創建訂閱失敗' });
  }
}

function mapStripeStatusToDbStatus(status: string): SubStatus {
  const statusMap: Record<string, SubStatus> = {
    'active': SubStatus.ACTIVE,
    'past_due': SubStatus.PAST_DUE,
    'unpaid': SubStatus.UNPAID,
    'canceled': SubStatus.CANCELED,
    'incomplete': SubStatus.PAYMENT_FAILED,
    'incomplete_expired': SubStatus.EXPIRED,
    'trialing': SubStatus.ACTIVE
  };
  
  return statusMap[status] || SubStatus.ACTIVE;
}