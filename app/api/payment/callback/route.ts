import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/payment/callback
 * ECPay 付款回調
 * 
 * 注意: 這是 ECPay 整合的佔位符
 * 實際使用時需要:
 * 1. 驗證 ECPay 回調簽名
 * 2. 更新訂閱狀態
 * 3. 創建發票記錄
 * 4. 發送通知給用戶
 */

export async function POST(request: NextRequest) {
  try {
    // 1. 解析 ECPay 回調數據
    const formData = await request.formData();
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('ECPay 回調數據:', data);

    // 2. TODO: 驗證 ECPay 簽名
    // 範例代碼:
    /*
    import crypto from 'crypto';
    
    const checkMacValue = data.CheckMacValue;
    delete data.CheckMacValue;
    
    // 排序參數
    const sortedKeys = Object.keys(data).sort();
    let checkStr = `HashKey=${process.env.ECPAY_HASH_KEY}`;
    
    sortedKeys.forEach(key => {
      checkStr += `&${key}=${data[key]}`;
    });
    
    checkStr += `&HashIV=${process.env.ECPAY_HASH_IV}`;
    
    // URL encode
    checkStr = encodeURIComponent(checkStr).toLowerCase();
    
    // 計算 MD5
    const calculatedMac = crypto
      .createHash('md5')
      .update(checkStr)
      .digest('hex')
      .toUpperCase();
    
    if (calculatedMac !== checkMacValue) {
      console.error('簽名驗證失敗');
      return NextResponse.json({ error: '簽名驗證失敗' }, { status: 400 });
    }
    */

    // 3. 檢查付款狀態
    const rtnCode = data.RtnCode || '0';
    const merchantTradeNo = data.MerchantTradeNo;
    const tradeNo = data.TradeNo;
    const tradeAmt = parseInt(data.TradeAmt || '0');
    const paymentDate = data.PaymentDate;
    const paymentType = data.PaymentType;

    if (rtnCode !== '1') {
      console.error('付款失敗:', data.RtnMsg);
      return NextResponse.json({ error: '付款失敗' }, { status: 400 });
    }

    // 4. TODO: 更新訂閱狀態
    // 範例代碼:
    /*
    // 從訂單編號提取用戶 ID 或查詢訂單記錄
    const order = await prisma.order.findUnique({
      where: { merchantTradeNo },
      include: { user: true },
    });

    if (!order) {
      console.error('訂單不存在:', merchantTradeNo);
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 更新訂閱狀態
    await prisma.subscription.update({
      where: { userId: order.userId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 天後
      },
    });

    // 創建發票記錄
    await prisma.invoice.create({
      data: {
        userId: order.userId,
        subscriptionId: order.subscriptionId,
        stripeInvoiceId: tradeNo,
        amount: tradeAmt,
        currency: 'TWD',
        status: 'PAID',
        paidAt: new Date(paymentDate),
      },
    });

    // 發送通知給用戶
    // TODO: 實現郵件通知
    */

    // 5. 返回成功響應給 ECPay
    // ECPay 要求返回 "1|OK"
    return new NextResponse('1|OK', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('處理付款回調失敗:', error);
    return new NextResponse('0|ERROR', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

/**
 * GET /api/payment/callback
 * 處理用戶從 ECPay 返回
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const merchantTradeNo = searchParams.get('MerchantTradeNo');
    const rtnCode = searchParams.get('RtnCode');

    console.log('用戶返回:', { merchantTradeNo, rtnCode });

    // 根據付款結果跳轉
    if (rtnCode === '1') {
      // 付款成功，跳轉到成功頁面
      return NextResponse.redirect(
        new URL('/subscribe/success', request.url)
      );
    } else {
      // 付款失敗，跳轉到失敗頁面
      return NextResponse.redirect(
        new URL('/subscribe/failed', request.url)
      );
    }
  } catch (error) {
    console.error('處理用戶返回失敗:', error);
    return NextResponse.redirect(
      new URL('/subscribe/failed', request.url)
    );
  }
}

