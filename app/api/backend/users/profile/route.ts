import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, createAuthResponse } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// 獲取用戶資料
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return createAuthResponse(auth.error, auth.status!);
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('獲取用戶資料失敗:', error);
    return NextResponse.json(
      { error: '獲取用戶資料失敗' },
      { status: 500 }
    );
  }
}

// 更新用戶資料
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return createAuthResponse(auth.error, auth.status!);
    }

    const body = await request.json();
    const { name, image } = body;
    
    const updatedUser = await prisma.user.update({
      where: { id: auth.user!.id },
      data: {
        ...(name && { name }),
        ...(image && { image })
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: '用戶資料更新成功',
      user: updatedUser
    });
  } catch (error) {
    console.error('更新用戶資料失敗:', error);
    return NextResponse.json(
      { error: '更新用戶資料失敗' },
      { status: 500 }
    );
  }
}
