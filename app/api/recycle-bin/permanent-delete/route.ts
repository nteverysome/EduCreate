import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE - 永久删除项目
export async function DELETE(request: NextRequest) {
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
      // 永久删除资料夹
      const folder = await prisma.folder.findFirst({
        where: {
          id,
          userId: session.user.id,
          deletedAt: {
            not: null
          }
        },
        include: {
          activities: true
        }
      });

      if (!folder) {
        return NextResponse.json({ error: '资料夹不存在或未删除' }, { status: 404 });
      }

      // 先删除资料夹中的所有活动
      await prisma.activity.deleteMany({
        where: {
          folderId: id,
          userId: session.user.id
        }
      });

      // 然后删除资料夹
      await prisma.folder.delete({
        where: { id }
      });

      return NextResponse.json({ 
        message: `资料夹"${folder.name}"已永久删除`
      });

    } else if (type === 'activity') {
      // 永久删除活动
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

      // 删除活动
      await prisma.activity.delete({
        where: { id }
      });

      return NextResponse.json({ 
        message: `活动"${activity.title}"已永久删除`
      });

    } else {
      return NextResponse.json({ error: '无效的项目类型' }, { status: 400 });
    }

  } catch (error) {
    console.error('永久删除项目失败:', error);
    return NextResponse.json({ error: '永久删除项目失败' }, { status: 500 });
  }
}
