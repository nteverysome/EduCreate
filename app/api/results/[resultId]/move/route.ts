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

    // 使用事务确保数据一致性，并返回更新后的资料夹数据
    const { updatedResult, updatedFolders } = await prisma.$transaction(async (tx) => {
      // 更新结果的 folderId
      const result = await tx.assignmentResult.update({
        where: { id: resultId },
        data: { folderId: folderId || null }
      });

      // 强制等待一小段时间确保事务完全提交
      await new Promise(resolve => setTimeout(resolve, 100));

      // 获取更新后的所有资料夹数据
      const folders = await tx.folder.findMany({
        where: {
          userId: session.user.id,
          deletedAt: null
        },
        include: {
          activities: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // 计算每个资料夹的结果数量
      const foldersWithCount = await Promise.all(folders.map(async folder => {
        const resultCount = await tx.assignmentResult.count({
          where: {
            folderId: folder.id
          }
        });

        return {
          id: folder.id,
          name: folder.name,
          description: folder.description,
          color: folder.color,
          icon: folder.icon,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          activityCount: folder.activities.length,
          resultCount: resultCount
        };
      }));

      return { updatedResult: result, updatedFolders: foldersWithCount };
    });

    return NextResponse.json({
      success: true,
      result: updatedResult,
      folders: updatedFolders // 返回更新后的资料夹数据
    });

  } catch (error) {
    console.error('移动结果失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      resultId,
      folderId,
      userId: session?.user?.id
    });
    return NextResponse.json(
      {
        error: '移动结果失败',
        details: error.message,
        debug: {
          resultId,
          folderId,
          userId: session?.user?.id
        }
      },
      { status: 500 }
    );
  }
}
