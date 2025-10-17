/**
 * 檢查關注狀態 API
 * 
 * GET /api/community/authors/[authorId]/follow-status
 * - 檢查當前用戶是否關注指定作者
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
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

    // 檢查是否已關注
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: authorId,
        },
      },
    });

    return NextResponse.json({
      isFollowing: !!follow,
    });
  } catch (error) {
    console.error('檢查關注狀態錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

