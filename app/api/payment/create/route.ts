import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/payment/create
 * 創建付款訂單
 * 
 * 注意: 這是 ECPay 整合的佔位符
 * 實際使用時需要:
 * 1. 註冊綠界科技 ECPay 帳號
 * 2. 安裝 ecpay_aio_nodejs SDK
 * 3. 設定環境變數 (ECPAY_MERCHANT_ID, ECPAY_HASH_KEY, ECPAY_HASH_IV)
 * 4. 實現完整的 ECPay 整合
 */

export async function POST(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 2. 解析請求數據
    const body = await request.json();
    const { planId, amount, paymentMethod } = body;

    if (!planId || !amount) {
      return NextResponse.json(
        { error: '方案 ID 和金額為必填欄位' },
        { status: 400 }
      );
    }

    // 3. 查詢用戶
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 4. 生成訂單編號
    const merchantTradeNo = `EC${Date.now()}`;

    // 5. 準備付款資訊
    const paymentData = {
      merchantTradeNo,
      amount,
      planId,
      paymentMethod,
      userId: user.id,
      userEmail: user.email,
      userName: user.name || 'EduCreate User',
    };

    // 6. TODO: 整合 ECPay
    // 這裡需要實現 ECPay 整合
    // 範例代碼:
    /*
    import ecpay_payment from 'ecpay_aio_nodejs';
    
    const options = {
      OperationMode: 'Production',
      MercProfile: {
        MerchantID: process.env.ECPAY_MERCHANT_ID!,
        HashKey: process.env.ECPAY_HASH_KEY!,
        HashIV: process.env.ECPAY_HASH_IV!,
      },
      IgnorePayment: [],
      IsProjectContractor: false,
    };

    const ecpay = new ecpay_payment(options);

    const base_param = {
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).replace(/\//g, '/'),
      TotalAmount: amount,
      TradeDesc: 'EduCreate Pro 訂閱',
      ItemName: 'EduCreate Pro',
      ReturnURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
      ClientBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe/success`,
      ChoosePayment: paymentMethod === 'credit' ? 'Credit' : paymentMethod === 'atm' ? 'ATM' : 'CVS',
      EncryptType: 1,
    };

    const html = ecpay.payment_client.aio_check_out_all(base_param);
    
    return NextResponse.json({ html });
    */

    // 7. 暫時返回模擬數據（開發階段）
    console.log('付款資訊:', paymentData);
    
    return NextResponse.json({
      success: true,
      message: '付款功能開發中',
      data: paymentData,
      note: '實際使用時需要整合綠界 ECPay',
      steps: [
        '1. 註冊綠界科技 ECPay 帳號 (https://www.ecpay.com.tw)',
        '2. 安裝 ecpay_aio_nodejs SDK: npm install ecpay_aio_nodejs',
        '3. 設定環境變數: ECPAY_MERCHANT_ID, ECPAY_HASH_KEY, ECPAY_HASH_IV',
        '4. 實現 ECPay 整合代碼',
        '5. 設定回調 URL: /api/payment/callback',
        '6. 測試付款流程',
      ],
    });
  } catch (error) {
    console.error('創建付款失敗:', error);
    return NextResponse.json(
      { error: '創建付款失敗' },
      { status: 500 }
    );
  }
}

