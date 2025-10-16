import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/subscription
 * 獲取當前用戶的訂閱資訊
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 2. 查詢用戶
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 3. 查詢訂閱資訊
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: '無訂閱資訊' },
        { status: 404 }
      );
    }

    // 4. 返回訂閱資訊
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('獲取訂閱資訊失敗:', error);
    return NextResponse.json(
      { error: '獲取訂閱資訊失敗' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription
 * 創建訂閱
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
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: '方案 ID 為必填欄位' },
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 4. 查詢方案
    const plan = await prisma.plan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: '方案不存在' },
        { status: 404 }
      );
    }

    // 5. 檢查是否已有訂閱
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: '已有訂閱，請先取消現有訂閱' },
        { status: 400 }
      );
    }

    // 6. 創建訂閱
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'PENDING', // 等待付款
        startDate: new Date(),
      },
      include: {
        plan: true,
      },
    });

    // 7. 返回訂閱資訊
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('創建訂閱失敗:', error);
    return NextResponse.json(
      { error: '創建訂閱失敗' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/subscription
 * 更新訂閱
 */
export async function PATCH(request: NextRequest) {
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
    const { status, cancelAtPeriodEnd } = body;

    // 3. 查詢用戶
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 4. 更新訂閱
    const subscription = await prisma.subscription.update({
      where: {
        userId: user.id,
      },
      data: {
        ...(status && { status }),
        ...(cancelAtPeriodEnd !== undefined && { cancelAtPeriodEnd }),
        ...(status === 'CANCELLED' && { endDate: new Date() }),
      },
      include: {
        plan: true,
      },
    });

    // 5. 返回更新後的訂閱資訊
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('更新訂閱失敗:', error);
    return NextResponse.json(
      { error: '更新訂閱失敗' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscription
 * 取消訂閱
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 2. 查詢用戶
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 3. 更新訂閱狀態為取消
    const subscription = await prisma.subscription.update({
      where: {
        userId: user.id,
      },
      data: {
        status: 'CANCELLED',
        cancelAtPeriodEnd: true,
        endDate: new Date(),
      },
      include: {
        plan: true,
      },
    });

    // 4. 返回更新後的訂閱資訊
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('取消訂閱失敗:', error);
    return NextResponse.json(
      { error: '取消訂閱失敗' },
      { status: 500 }
    );
  }
}

