import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
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

    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ message: '請提供計劃ID' });
    }

    // 暫時返回錯誤，因為 Plan 模型不存在
    return res.status(501).json({ message: '付款功能暫未實現' });
    
    // // 獲取計劃詳情
    // const plan = await prisma.plan.findUnique({
    //   where: { id: planId }
    // });

    // if (!plan) {
    //   return res.status(404).json({ message: '找不到指定的計劃' });
    // }

    // // 創建Stripe結帳會話
    // const checkoutSession = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: 'usd',
    //         product_data: {
    //           name: `EduCreate ${plan.name} 訂閱`,
    //           description: plan.description || undefined,
    //         },
    //         unit_amount: Math.round(plan.price * 100), // Stripe使用最小貨幣單位（分）
    //         recurring: {
    //           interval: plan.interval.toLowerCase() as 'month' | 'year',
    //         },
    //       },
    //       quantity: 1,
    //     },
    //   ],
    //   mode: 'subscription',
    //   success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    //   customer_email: session.user.email || undefined,
    //   metadata: {
    //     userId: session.user.id,
    //     planId: plan.id,
    //   },
    // });

    // return res.status(200).json({ url: checkoutSession.url });
  } catch (error) {
    console.error('創建結帳會話錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}