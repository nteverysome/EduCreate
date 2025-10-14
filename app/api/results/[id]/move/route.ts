import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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

    const { folderId } = await request.json();
    const resultId = params.id;

    // 验证结果是否存在且属于当前用户
    const result = await prisma.assignmentResult.findFirst({
      where: {
        id: resultId,
        assignment: {
          userId: session.user.id
        }
      }
    });

    if (!result) {
      return NextResponse.json(
        { error: '结果不存在或无权限访问' },
        { status: 404 }
      );
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
        return NextResponse.json(
          { error: '资料夹不存在或无权限访问' },
          { status: 404 }
        );
      }
    }

    // 更新结果的 folderId
    const updatedResult = await prisma.assignmentResult.update({
      where: { id: resultId },
      data: { folderId: folderId || null },
      include: {
        assignment: {
          include: {
            activity: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      result: {
        id: updatedResult.id,
        title: updatedResult.title,
        activityName: updatedResult.assignment.activity.title,
        participantCount: updatedResult.participantCount,
        createdAt: updatedResult.createdAt.toISOString(),
        deadline: updatedResult.assignment.deadline?.toISOString(),
        status: updatedResult.assignment.deadline && new Date() > updatedResult.assignment.deadline 
          ? 'expired' 
          : updatedResult.assignment.isActive 
            ? 'active' 
            : 'completed',
        folderId: updatedResult.folderId,
        assignmentId: updatedResult.assignmentId,
        activityId: updatedResult.assignment.activityId
      }
    });

  } catch (error) {
    console.error('移动结果失败:', error);
    return NextResponse.json(
      { error: '移动结果失败' },
      { status: 500 }
    );
  }
}
