import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // 檢查用戶是否已登入
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  // 根據請求方法處理不同的操作
  switch (req.method) {
    case 'GET':
      return getInvoices(req, res, session);
    case 'POST':
      return res.status(501).json({ error: '創建發票功能暫未實現' });
    default:
      return res.status(405).json({ error: '方法不允許' });
  }
}

// 獲取用戶的發票列表
async function getInvoices(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const userId = session.user.id;
    
    // 暫時返回錯誤，因為 Subscription 模型缺少 Stripe 字段
    return res.status(501).json({ error: '發票功能暫未實現' });
    
    // // 獲取用戶的訂閱信息
    // const subscription = await prisma.subscription.findUnique({
    //   where: { userId },
    //   select: { id: true, stripeSubscriptionId: true }
    // });
    
    // if (!subscription || !subscription.stripeSubscriptionId) {
    //   return res.status(404).json({ error: '未找到有效的訂閱' });
    // }
    
    // // 從數據庫獲取發票
    // const invoices = await prisma.invoice.findMany({
    //   where: { userId },
    //   orderBy: { createdAt: 'desc' },
    //   include: {
    //     subscription: {
    //       select: {
    //         planId: true,
    //         plan: {
    //           select: {
    //             name: true
    //           }
    //         }
    //       }
    //     }
    //   }
    // });
    
    // return res.status(200).json(invoices);
  } catch (error) {
    console.error('獲取發票失敗:', error);
    return res.status(500).json({ error: '獲取發票失敗' });
  }
}

// // 手動創建發票
// async function createInvoice(req: NextApiRequest, res: NextApiResponse, session: any) {
//   try {
//     const userId = session.user.id;
    
//     // 獲取用戶的訂閱信息
//     const subscription = await prisma.subscription.findUnique({
//       where: { userId },
//       select: { id: true, stripeCustomerId: true, stripeSubscriptionId: true }
//     });
    
//     if (!subscription || !subscription.stripeCustomerId || !subscription.stripeSubscriptionId) {
//       return res.status(404).json({ error: '未找到有效的訂閱' });
//     }
    
//     // 創建Stripe發票
//     const invoice = await stripe.invoices.create({
//       customer: subscription.stripeCustomerId,
//       subscription: subscription.stripeSubscriptionId,
//       auto_advance: true, // 自動完成發票
//       collection_method: 'charge_automatically',
//       description: '手動生成的發票'
//     });
    
//     // 完成發票
//     await stripe.invoices.finalizeInvoice(invoice.id);
    
//     // 將發票信息保存到數據庫
//     const newInvoice = await prisma.invoice.create({
//       data: {
//         stripeInvoiceId: invoice.id,
//         amount: invoice.total / 100, // 轉換為元
//         currency: invoice.currency,
//         status: invoice.status || 'unknown',
//         invoiceUrl: invoice.hosted_invoice_url || null,
//         invoicePdf: invoice.invoice_pdf || null,
//         paidAt: invoice.status === 'paid' ? new Date() : null,
//         subscription: { connect: { id: subscription.id } },
//         user: { connect: { id: userId } }
//       }
//     });
    
//     return res.status(201).json(newInvoice);
//   } catch (error) {
//     console.error('創建發票失敗:', error);
//     return res.status(500).json({ error: '創建發票失敗' });
//   }
// }