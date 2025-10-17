/**
 * 關注/取消關注作者 API
 * 
 * POST /api/community/authors/[authorId]/follow - 關注作者
 * DELETE /api/community/authors/[authorId]/follow - 取消關注作者
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { authorId: string } }
) {
  try {
    // 驗證用戶身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 獲取當前用戶
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    const { authorId } = params;

    // 不能關注自己
    if (currentUser.id === authorId) {
      return NextResponse.json(
        { error: '不能關注自己' },
        { status: 400 }
      );
    }

    // 檢查作者是否存在
    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    if (!author) {
      return NextResponse.json(
        { error: '作者不存在' },
        { status: 404 }
      );
    }

    // 檢查是否已關注
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: authorId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: '已經關注此作者' },
        { status: 400 }
      );
    }

    // 創建關注關係
    await prisma.userFollow.create({
      data: {
        followerId: currentUser.id,
        followingId: authorId,
      },
    });

    return NextResponse.json({
      success: true,
      message: '關注成功',
    });
  } catch (error) {
    console.error('關注作者錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { authorId: string } }
) {
  try {
    // 驗證用戶身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 獲取當前用戶
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    const { authorId } = params;

    // 刪除關注關係
    await prisma.userFollow.deleteMany({
      where: {
        followerId: currentUser.id,
        followingId: authorId,
      },
    });

    return NextResponse.json({
      success: true,
      message: '取消關注成功',
    });
  } catch (error) {
    console.error('取消關注作者錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

