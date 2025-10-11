import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - 恢復活動
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const activityId = params.id;
    const userId = session.user.id;

    console.log('🔄 PATCH /api/activities/trash/[id] 調用 - 恢復活動:', {
      activityId,
      userId
    });

    // 檢查活動是否存在且已刪除
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId,
        deletedAt: {
          not: null  // 只能恢復已刪除的活動
        }
      }
    });

    if (!activity) {
      console.log('❌ 活動不存在、無權限或未刪除:', { activityId, userId });
      return NextResponse.json({ error: '活動不存在或無權限恢復' }, { status: 404 });
    }

    // 恢復活動 - 清除 deletedAt 時間戳
    const restoredActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        deletedAt: null  // 清除刪除時間戳
      }
    });

    console.log('✅ 活動已恢復:', restoredActivity.title);

    return NextResponse.json({
      message: '活動已恢復',
      activity: {
        id: restoredActivity.id,
        title: restoredActivity.title,
        restoredAt: new Date()
      }
    });

  } catch (error) {
    console.error('恢復活動時出錯:', error);
    return NextResponse.json(
      { error: '恢復活動失敗' },
      { status: 500 }
    );
  }
}

// DELETE - 永久刪除活動
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const activityId = params.id;
    const userId = session.user.id;

    console.log('🗑️ DELETE /api/activities/trash/[id] 調用 - 永久刪除:', {
      activityId,
      userId
    });

    // 檢查活動是否存在且已刪除
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId,
        deletedAt: {
          not: null  // 只能永久刪除已刪除的活動
        }
      },
      include: {
        versions: true
      }
    });

    if (!activity) {
      console.log('❌ 活動不存在、無權限或未刪除:', { activityId, userId });
      return NextResponse.json({ error: '活動不存在或無權限刪除' }, { status: 404 });
    }

    // 永久刪除活動和相關數據
    await prisma.$transaction(async (tx) => {
      // 刪除活動版本
      if (activity.versions.length > 0) {
        console.log('🗑️ 永久刪除活動版本:', activity.versions.length);
        await tx.activityVersion.deleteMany({
          where: { activityId: activityId }
        });
      }

      // 永久刪除活動（會自動級聯刪除關聯的 VocabularyItem）
      console.log('🗑️ 永久刪除活動:', activityId);
      await tx.activity.delete({
        where: { id: activityId }
      });

      console.log('✅ 活動已永久刪除');
    });

    return NextResponse.json({
      message: '活動已永久刪除',
      deletedActivity: {
        id: activity.id,
        title: activity.title,
        permanentlyDeletedAt: new Date()
      }
    });

  } catch (error) {
    console.error('永久刪除活動時出錯:', error);
    return NextResponse.json(
      { error: '永久刪除活動失敗' },
      { status: 500 }
    );
  }
}
