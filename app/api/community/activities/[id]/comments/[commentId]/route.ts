/**
 * 社區活動評論管理 API
 * 
 * DELETE /api/community/activities/[id]/comments/[commentId]
 * - 刪除評論（軟刪除）
 * - 只有評論作者可以刪除
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * DELETE - 刪除評論（軟刪除）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    // 驗證用戶登入
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const { id: activityId, commentId } = params;

    // 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 獲取評論
    const comment = await prisma.activityComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        activityId: true,
        parentId: true,
        deletedAt: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: '評論不存在' },
        { status: 404 }
      );
    }

    if (comment.deletedAt) {
      return NextResponse.json(
        { error: '評論已被刪除' },
        { status: 400 }
      );
    }

    if (comment.activityId !== activityId) {
      return NextResponse.json(
        { error: '評論不屬於此活動' },
        { status: 400 }
      );
    }

    // 檢查權限：只有評論作者可以刪除
    if (comment.userId !== user.id) {
      return NextResponse.json(
        { error: '無權刪除此評論' },
        { status: 403 }
      );
    }

    // 軟刪除評論並更新活動的評論數
    await prisma.$transaction([
      // 軟刪除評論
      prisma.activityComment.update({
        where: { id: commentId },
        data: {
          deletedAt: new Date(),
        },
      }),
      // 減少評論數（只有頂層評論才減少）
      ...(comment.parentId ? [] : [
        prisma.activity.update({
          where: { id: activityId },
          data: {
            communityComments: {
              decrement: 1,
            },
          },
        }),
      ]),
    ]);

    return NextResponse.json({
      success: true,
      message: '評論已刪除',
    });
  } catch (error) {
    console.error('刪除評論錯誤:', error);
    return NextResponse.json(
      { error: '操作失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

