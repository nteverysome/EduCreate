import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    console.log('🔍 DELETE API 調用:', {
      activityId,
      userId,
      sessionUser: session.user
    });

    // 檢查活動是否存在且屬於該用戶
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId
      },
      include: {
        versions: true
      }
    });

    if (!activity) {
      console.log('❌ 活動不存在或無權限:', { activityId, userId });
      return NextResponse.json({ error: '活動不存在或無權限刪除' }, { status: 404 });
    }

    // 獲取關聯的詞彙集合 ID
    console.log('🔍 活動內容:', JSON.stringify(activity.content, null, 2));
    const vocabularySetId = activity.content?.vocabularySetId;
    console.log('🔍 詞彙集合 ID:', vocabularySetId);

    // 在事務中刪除活動和相關數據
    await prisma.$transaction(async (tx) => {
      // 刪除活動版本
      if (activity.versions.length > 0) {
        console.log('🗑️ 刪除活動版本:', activity.versions.length);
        await tx.activityVersion.deleteMany({
          where: { activityId: activityId }
        });
      }

      // 刪除活動
      console.log('🗑️ 刪除活動:', activityId);
      await tx.activity.delete({
        where: { id: activityId }
      });

      // 如果有關聯的詞彙集合，也刪除它
      if (vocabularySetId) {
        console.log('🗑️ 刪除詞彙集合:', vocabularySetId);

        // 先刪除詞彙項目
        const deletedItems = await tx.vocabularyItem.deleteMany({
          where: { setId: vocabularySetId }
        });
        console.log('🗑️ 刪除詞彙項目數量:', deletedItems.count);

        // 再刪除詞彙集合 - 使用 deleteMany 避免「記錄不存在」錯誤
        const deletedSets = await tx.vocabularySet.deleteMany({
          where: { id: vocabularySetId }
        });
        console.log(`✅ 刪除了 ${deletedSets.count} 個詞彙集合`);
      } else {
        console.log('⚠️ 沒有找到關聯的詞彙集合 ID');
      }
    });

    return NextResponse.json({ 
      message: '活動刪除成功',
      deletedActivityId: activityId 
    });

  } catch (error) {
    console.error('刪除活動時出錯:', error);
    return NextResponse.json(
      { error: '刪除活動失敗' },
      { status: 500 }
    );
  }
}

export async function GET(
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

    // 獲取活動詳情
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId
      },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            versions: true
          }
        }
      }
    });

    if (!activity) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 });
    }

    return NextResponse.json(activity);

  } catch (error) {
    console.error('獲取活動詳情時出錯:', error);
    return NextResponse.json(
      { error: '獲取活動詳情失敗' },
      { status: 500 }
    );
  }
}
