import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { folderId } = await request.json();
    const resultId = params.resultId;

    // 验证结果是否存在且属于当前用户
    const result = await prisma.assignmentResult.findFirst({
      where: {
        id: resultId,
        assignment: {
          activity: {
            userId: session.user.id
          }
        }
      },
      include: {
        assignment: {
          include: {
            activity: true
          }
        }
      }
    });

    if (!result) {
      return NextResponse.json({ error: '结果不存在' }, { status: 404 });
    }

    // 如果指定了 folderId，验证资料夹是否存在且属于当前用户
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id,
          deletedAt: null
        }
      });

      if (!folder) {
        return NextResponse.json({ error: '资料夹不存在' }, { status: 404 });
      }
    }

    // 更新结果的 folderId
    const updatedResult = await prisma.assignmentResult.update({
      where: { id: resultId },
      data: { folderId: folderId || null }
    });

    return NextResponse.json({
      success: true,
      result: updatedResult
    });

  } catch (error) {
    console.error('移动结果失败:', error);
    return NextResponse.json(
      { error: '移动结果失败' },
      { status: 500 }
    );
  }
}
