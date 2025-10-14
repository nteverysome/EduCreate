import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - 恢复项目
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const { id, type } = await request.json();

    if (!id || !type) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (type === 'folder') {
      // 恢复资料夹
      const folder = await prisma.folder.findFirst({
        where: {
          id,
          userId: session.user.id,
          deletedAt: {
            not: null
          }
        }
      });

      if (!folder) {
        return NextResponse.json({ error: '资料夹不存在或未删除' }, { status: 404 });
      }

      // 检查是否有同名资料夹存在
      const existingFolder = await prisma.folder.findFirst({
        where: {
          name: folder.name,
          userId: session.user.id,
          deletedAt: null
        }
      });

      if (existingFolder) {
        return NextResponse.json({ 
          error: `已存在名为"${folder.name}"的资料夹，请先重命名或删除现有资料夹` 
        }, { status: 409 });
      }

      // 恢复资料夹
      await prisma.folder.update({
        where: { id },
        data: { deletedAt: null }
      });

      // 同时恢复资料夹中的所有活动
      await prisma.activity.updateMany({
        where: {
          folderId: id,
          userId: session.user.id
        },
        data: { deletedAt: null }
      });

      return NextResponse.json({ 
        message: `资料夹"${folder.name}"已恢复`
      });

    } else if (type === 'activity') {
      // 恢复活动
      const activity = await prisma.activity.findFirst({
        where: {
          id,
          userId: session.user.id,
          deletedAt: {
            not: null
          }
        }
      });

      if (!activity) {
        return NextResponse.json({ error: '活动不存在或未删除' }, { status: 404 });
      }

      // 恢复活动
      await prisma.activity.update({
        where: { id },
        data: { deletedAt: null }
      });

      return NextResponse.json({ 
        message: `活动"${activity.title}"已恢复`
      });

    } else {
      return NextResponse.json({ error: '无效的项目类型' }, { status: 400 });
    }

  } catch (error) {
    console.error('恢复项目失败:', error);
    return NextResponse.json({ error: '恢复项目失败' }, { status: 500 });
  }
}
