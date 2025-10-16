import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/user/profile
 * 獲取當前用戶的個人資料
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

    // 2. 查詢用戶資料
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 3. 返回用戶資料
    return NextResponse.json(user);
  } catch (error) {
    console.error('獲取個人資料失敗:', error);
    return NextResponse.json(
      { error: '獲取個人資料失敗' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * 更新當前用戶的個人資料
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
    const { name, email, country, image } = body;

    // 3. 驗證必填欄位
    if (!email) {
      return NextResponse.json(
        { error: '電子郵件為必填欄位' },
        { status: 400 }
      );
    }

    // 4. 檢查電子郵件是否已被其他用戶使用
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: '此電子郵件已被使用' },
          { status: 400 }
        );
      }
    }

    // 5. 更新用戶資料
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        name: name || null,
        email,
        country: country || 'TW',
        image: image || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 6. 返回更新後的用戶資料
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新個人資料失敗:', error);
    return NextResponse.json(
      { error: '更新個人資料失敗' },
      { status: 500 }
    );
  }
}

