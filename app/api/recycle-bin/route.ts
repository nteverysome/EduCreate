import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - 获取回收桶内容
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 获取已删除的资料夹
    const deletedFolders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
        deletedAt: {
          not: null
        }
      },
      include: {
        activities: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        deletedAt: 'desc'
      }
    });

    // 获取已删除的活动（不在资料夹中的）
    const deletedActivities = await prisma.activity.findMany({
      where: {
        userId: session.user.id,
        deletedAt: {
          not: null
        },
        folderId: null // 只获取不在资料夹中的已删除活动
      },
      orderBy: {
        deletedAt: 'desc'
      }
    });

    // 格式化回收桶项目
    const recycleBinItems = [
      ...deletedFolders.map(folder => ({
        id: folder.id,
        name: folder.name,
        type: 'folder' as const,
        deletedAt: folder.deletedAt,
        itemCount: folder.activities.length,
        color: folder.color,
        icon: folder.icon
      })),
      ...deletedActivities.map(activity => ({
        id: activity.id,
        name: activity.title,
        type: 'activity' as const,
        deletedAt: activity.deletedAt,
        activityType: activity.type,
        templateType: activity.templateType
      }))
    ].sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());

    return NextResponse.json(recycleBinItems);
  } catch (error) {
    console.error('获取回收桶内容失败:', error);
    return NextResponse.json({ error: '获取回收桶内容失败' }, { status: 500 });
  }
}

// DELETE - 清空回收桶
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 永久删除所有已删除的资料夹
    await prisma.folder.deleteMany({
      where: {
        userId: session.user.id,
        deletedAt: {
          not: null
        }
      }
    });

    // 永久删除所有已删除的活动
    await prisma.activity.deleteMany({
      where: {
        userId: session.user.id,
        deletedAt: {
          not: null
        }
      }
    });

    return NextResponse.json({ 
      message: '回收桶已清空'
    });
  } catch (error) {
    console.error('清空回收桶失败:', error);
    return NextResponse.json({ error: '清空回收桶失败' }, { status: 500 });
  }
}
