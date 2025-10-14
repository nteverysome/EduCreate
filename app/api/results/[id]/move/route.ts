import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PATCH - 移动结果到资料夹
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { folderId } = body;

    // 检查结果是否存在且属于当前用户
    const existingResult = await prisma.assignmentResult.findFirst({
      where: {
        id,
        assignment: {
          userId: session.user.id
        }
      },
      include: {
        assignment: true
      }
    });

    if (!existingResult) {
      return NextResponse.json(
        { error: '结果不存在' },
        { status: 404 }
      );
    }

    // 如果指定了资料夹ID，检查资料夹是否存在且属于当前用户
    if (folderId) {
      const existingFolder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id,
          deletedAt: null
        }
      });

      if (!existingFolder) {
        return NextResponse.json(
          { error: '目标资料夹不存在' },
          { status: 404 }
        );
      }
    }

    // 更新结果的资料夹ID
    const updatedResult = await prisma.assignmentResult.update({
      where: { id },
      data: {
        folderId: folderId || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      result: updatedResult,
      message: folderId ? '结果已移动到资料夹' : '结果已移出资料夹'
    });

  } catch (error) {
    console.error('移动结果失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
