import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient, SubStatus } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// 配置郵件發送器
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: Boolean(process.env.EMAIL_SERVER_SECURE),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 處理Stripe Webhook事件
  if (req.method === 'POST' && req.headers['stripe-signature']) {
    return handleStripeWebhook(req, res);
  }
  
  const session = await getSession({ req });
  
  // 檢查用戶是否已登入
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  // 根據請求方法處理不同的操作
  switch (req.method) {
    case 'POST':
      return sendPaymentNotification(req, res, session);
    case 'GET':
      return getNotificationSettings(req, res, session);
    case 'PUT':
      return updateNotificationSettings(req, res, session);
    default:
      return res.status(405).json({ error: '方法不允許' });
  }
}

// 處理Stripe Webhook事件
async function handleStripeWebhook(req: NextApiRequest, res: NextApiResponse) {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const signature = req.headers['stripe-signature'] as string;
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // 處理不同的事件類型
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`未處理的事件類型: ${event.type}`);
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('處理Webhook事件失敗:', error);
    return res.status(500).json({ error: '處理Webhook事件失敗' });
  }
}

// 處理發票支付成功事件
async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    // 查找對應的用戶
    const subscription = await prisma.subscription.findFirst({
      where: { stripeCustomerId: invoice.customer },
      include: { user: true }
    });
    
    if (!subscription) {
      console.error('未找到對應的訂閱:', invoice.customer);
      return;
    }
    
    // 創建發票記錄
    await prisma.invoice.create({
      data: {
        stripeInvoiceId: invoice.id,
        amount: invoice.total / 100,
        currency: invoice.currency,
        status: invoice.status,
        invoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
        paidAt: new Date(),
        subscription: { connect: { id: subscription.id } },
        user: { connect: { id: subscription.userId } }
      }
    });
    
    // 發送支付成功通知郵件
    await sendPaymentSuccessEmail(subscription.user.email, {
      name: subscription.user.name || '用戶',
      amount: (invoice.total / 100).toFixed(2),
      currency: invoice.currency.toUpperCase(),
      invoiceUrl: invoice.hosted_invoice_url
    });
    
  } catch (error) {
    console.error('處理發票支付成功事件失敗:', error);
  }
}

// 處理發票支付失敗事件
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    // 查找對應的用戶
    const subscription = await prisma.subscription.findFirst({
      where: { stripeCustomerId: invoice.customer },
      include: { user: true }
    });
    
    if (!subscription) {
      console.error('未找到對應的訂閱:', invoice.customer);
      return;
    }
    
    // 發送支付失敗通知郵件
    await sendPaymentFailedEmail(subscription.user.email, {
      name: subscription.user.name || '用戶',
      amount: (invoice.total / 100).toFixed(2),
      currency: invoice.currency.toUpperCase(),
      invoiceUrl: invoice.hosted_invoice_url
    });
    
  } catch (error) {
    console.error('處理發票支付失敗事件失敗:', error);
  }
}

// 處理訂閱更新事件
async function handleSubscriptionUpdated(subscription: any) {
  try {
    // 查找對應的用戶訂閱
    const userSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: true }
    });
    
    if (!userSubscription) {
      console.error('未找到對應的訂閱:', subscription.id);
      return;
    }
    
    // 更新訂閱狀態
    await prisma.subscription.update({
      where: { id: userSubscription.id },
      data: {
        status: mapStripeStatusToDbStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
    
    // 如果訂閱計劃變更，發送通知
    if (subscription.plan && userSubscription.planId !== subscription.plan.id) {
      await sendSubscriptionChangedEmail(userSubscription.user.email, {
        name: userSubscription.user.name || '用戶',
        newPlan: subscription.plan.nickname || '新計劃',
        effectiveDate: new Date(subscription.current_period_start * 1000).toLocaleDateString('zh-TW')
      });
    }
    
  } catch (error) {
    console.error('處理訂閱更新事件失敗:', error);
  }
}

// 處理訂閱刪除事件
async function handleSubscriptionDeleted(subscription: any) {
  try {
    // 查找對應的用戶訂閱
    const userSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: true }
    });
    
    if (!userSubscription) {
      console.error('未找到對應的訂閱:', subscription.id);
      return;
    }
    
    // 更新訂閱狀態
    await prisma.subscription.update({
      where: { id: userSubscription.id },
      data: {
        status: 'CANCELED',
        endDate: new Date()
      }
    });
    
    // 發送訂閱取消通知
    await sendSubscriptionCanceledEmail(userSubscription.user.email, {
      name: userSubscription.user.name || '用戶',
      endDate: new Date(subscription.current_period_end * 1000).toLocaleDateString('zh-TW')
    });
    
  } catch (error) {
    console.error('處理訂閱刪除事件失敗:', error);
  }
}

// 將Stripe訂閱狀態映射到數據庫狀態
function mapStripeStatusToDbStatus(stripeStatus: string): SubStatus {
  const statusMap: Record<string, SubStatus> = {
    'active': SubStatus.ACTIVE,
    'past_due': SubStatus.PAST_DUE,
    'unpaid': SubStatus.UNPAID,
    'canceled': SubStatus.CANCELED,
    'incomplete': SubStatus.PAYMENT_FAILED,
    'incomplete_expired': SubStatus.EXPIRED,
    'trialing': SubStatus.ACTIVE
  };
  
  return statusMap[stripeStatus] || SubStatus.ACTIVE;
}

// 手動發送支付通知
async function sendPaymentNotification(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { type, invoiceId, message } = req.body;
    const userId = session.user.id;
    
    if (!type || !invoiceId) {
      return res.status(400).json({ error: '缺少必要參數' });
    }
    
    // 獲取發票信息
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true,
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });
    
    if (!invoice) {
      return res.status(404).json({ error: '未找到發票' });
    }
    
    // 檢查用戶是否有權限發送此通知
    if (invoice.userId !== userId && session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '無權發送此通知' });
    }
    
    // 根據通知類型發送不同的郵件
    switch (type) {
      case 'payment_reminder':
        await sendPaymentReminderEmail(invoice.user.email, {
          name: invoice.user.name || '用戶',
          amount: invoice.amount.toFixed(2),
          currency: invoice.currency.toUpperCase(),
          invoiceUrl: invoice.invoiceUrl || '',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-TW'),
          message: message || ''
        });
        break;
      case 'payment_confirmation':
        await sendPaymentConfirmationEmail(invoice.user.email, {
          name: invoice.user.name || '用戶',
          amount: invoice.amount.toFixed(2),
          currency: invoice.currency.toUpperCase(),
          invoiceUrl: invoice.invoiceUrl || '',
          planName: invoice.subscription.plan.name,
          message: message || ''
        });
        break;
      default:
        return res.status(400).json({ error: '不支持的通知類型' });
    }
    
    // 記錄通知發送
    await prisma.notificationLog.create({
      data: {
        type,
        recipient: invoice.user.email,
        content: message || '',
        sentBy: userId,
        relatedInvoiceId: invoiceId
      }
    });
    
    return res.status(200).json({ success: true, message: '通知已發送' });
  } catch (error) {
    console.error('發送支付通知失敗:', error);
    return res.status(500).json({ error: '發送支付通知失敗' });
  }
}

// 獲取通知設置
async function getNotificationSettings(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const userId = session.user.id;
    
    // 獲取用戶的通知設置
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId }
    });
    
    // 如果沒有設置，返回默認設置
    if (!settings) {
      return res.status(200).json({
        paymentSuccess: true,
        paymentFailed: true,
        subscriptionRenewal: true,
        subscriptionCancellation: true,
        promotions: false
      });
    }
    
    return res.status(200).json(settings);
  } catch (error) {
    console.error('獲取通知設置失敗:', error);
    return res.status(500).json({ error: '獲取通知設置失敗' });
  }
}

// 更新通知設置
async function updateNotificationSettings(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const userId = session.user.id;
    const { paymentSuccess, paymentFailed, subscriptionRenewal, subscriptionCancellation, promotions } = req.body;
    
    // 更新或創建用戶的通知設置
    const settings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        paymentSuccess: paymentSuccess !== undefined ? paymentSuccess : true,
        paymentFailed: paymentFailed !== undefined ? paymentFailed : true,
        subscriptionRenewal: subscriptionRenewal !== undefined ? subscriptionRenewal : true,
        subscriptionCancellation: subscriptionCancellation !== undefined ? subscriptionCancellation : true,
        promotions: promotions !== undefined ? promotions : false
      },
      create: {
        userId,
        paymentSuccess: paymentSuccess !== undefined ? paymentSuccess : true,
        paymentFailed: paymentFailed !== undefined ? paymentFailed : true,
        subscriptionRenewal: subscriptionRenewal !== undefined ? subscriptionRenewal : true,
        subscriptionCancellation: subscriptionCancellation !== undefined ? subscriptionCancellation : true,
        promotions: promotions !== undefined ? promotions : false
      }
    });
    
    return res.status(200).json(settings);
  } catch (error) {
    console.error('更新通知設置失敗:', error);
    return res.status(500).json({ error: '更新通知設置失敗' });
  }
}

// 發送支付成功郵件
async function sendPaymentSuccessEmail(email: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '付款成功 - EduCreate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>付款成功</h2>
        <p>親愛的 ${data.name}，</p>
        <p>我們已收到您的付款 ${data.amount} ${data.currency}。感謝您的支持！</p>
        <p>您可以在<a href="${data.invoiceUrl}">這裡</a>查看您的發票詳情。</p>
        <p>如有任何問題，請隨時聯繫我們的客戶支持團隊。</p>
        <p>祝您使用愉快！</p>
        <p>EduCreate 團隊</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// 發送支付失敗郵件
async function sendPaymentFailedEmail(email: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '付款失敗通知 - EduCreate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>付款失敗通知</h2>
        <p>親愛的 ${data.name}，</p>
        <p>我們嘗試處理您的付款 ${data.amount} ${data.currency} 時遇到了問題。</p>
        <p>請<a href="${data.invoiceUrl}">點擊這裡</a>更新您的付款信息或嘗試使用其他付款方式。</p>
        <p>如需幫助，請聯繫我們的客戶支持團隊。</p>
        <p>謝謝！</p>
        <p>EduCreate 團隊</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// 發送訂閱變更郵件
async function sendSubscriptionChangedEmail(email: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '訂閱計劃變更通知 - EduCreate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>訂閱計劃變更通知</h2>
        <p>親愛的 ${data.name}，</p>
        <p>您的訂閱計劃已更新為 ${data.newPlan}，變更將於 ${data.effectiveDate} 生效。</p>
        <p>如果您有任何疑問或需要幫助，請隨時聯繫我們的客戶支持團隊。</p>
        <p>謝謝！</p>
        <p>EduCreate 團隊</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// 發送訂閱取消郵件
async function sendSubscriptionCanceledEmail(email: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '訂閱取消確認 - EduCreate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>訂閱取消確認</h2>
        <p>親愛的 ${data.name}，</p>
        <p>我們已收到您取消訂閱的請求。您的訂閱將持續到 ${data.endDate}。</p>
        <p>在此之前，您仍可以使用所有訂閱功能。</p>
        <p>我們希望您能再次使用我們的服務。如果您改變主意，可以隨時重新訂閱。</p>
        <p>謝謝！</p>
        <p>EduCreate 團隊</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// 發送付款提醒郵件
async function sendPaymentReminderEmail(email: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '付款提醒 - EduCreate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>付款提醒</h2>
        <p>親愛的 ${data.name}，</p>
        <p>這是一個友善的提醒，您有一筆 ${data.amount} ${data.currency} 的付款即將到期，付款截止日期為 ${data.dueDate}。</p>
        <p>請<a href="${data.invoiceUrl}">點擊這裡</a>查看發票詳情並完成付款。</p>
        ${data.message ? `<p>${data.message}</p>` : ''}
        <p>如有任何問題，請隨時聯繫我們的客戶支持團隊。</p>
        <p>謝謝！</p>
        <p>EduCreate 團隊</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

// 發送付款確認郵件
async function sendPaymentConfirmationEmail(email: string, data: any) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '付款確認 - EduCreate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>付款確認</h2>
        <p>親愛的 ${data.name}，</p>
        <p>我們確認已收到您的付款 ${data.amount} ${data.currency}，用於 ${data.planName} 訂閱計劃。</p>
        <p>您可以在<a href="${data.invoiceUrl}">這裡</a>查看您的發票詳情。</p>
        ${data.message ? `<p>${data.message}</p>` : ''}
        <p>感謝您的支持！</p>
        <p>EduCreate 團隊</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
}