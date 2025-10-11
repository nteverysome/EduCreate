import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - 獲取回收桶中的活動
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('🗑️ GET /api/activities/trash 調用:', { userId });

    // 獲取已刪除的活動
    const deletedActivities = await prisma.activity.findMany({
      where: {
        userId: userId,
        deletedAt: {
          not: null  // 只獲取已刪除的活動
        }
      },
      orderBy: {
        deletedAt: 'desc'  // 按刪除時間排序
      },
      include: {
        vocabularyItems: true,
        _count: {
          select: {
            versions: true,
            vocabularyItems: true
          }
        }
      }
    });

    console.log(`✅ 回收桶中找到 ${deletedActivities.length} 個活動`);

    // 處理活動數據
    const activitiesWithVocabulary = deletedActivities.map((activity) => {
      const vocabularyInfo = {
        totalWords: activity.totalWords || activity._count.vocabularyItems || 0,
        geptLevel: activity.geptLevel || 'ELEMENTARY'
      };

      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        templateType: activity.templateType,
        published: activity.published,
        isPublic: activity.isPublic,
        isDraft: activity.isDraft,
        folderId: activity.folderId,
        lastPlayed: activity.lastPlayed,
        playCount: activity.playCount,
        shareCount: activity.shareCount,
        gameTemplateId: activity.gameTemplateId,
        aiGenerated: activity.aiGenerated,
        difficulty: activity.difficulty,
        estimatedTime: activity.estimatedTime,
        tags: activity.tags,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        deletedAt: activity.deletedAt,  // 包含刪除時間
        userId: activity.userId,
        content: activity.content,
        elements: activity.elements,
        vocabularyItems: activity.vocabularyItems,
        ...vocabularyInfo
      };
    });

    return NextResponse.json({
      activities: activitiesWithVocabulary,
      total: activitiesWithVocabulary.length
    });

  } catch (error) {
    console.error('獲取回收桶活動時出錯:', error);
    return NextResponse.json(
      { error: '獲取回收桶活動失敗' },
      { status: 500 }
    );
  }
}

// DELETE - 清空回收桶
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('🗑️ DELETE /api/activities/trash 調用 - 清空回收桶:', { userId });

    // 永久刪除所有已刪除的活動
    const result = await prisma.$transaction(async (tx) => {
      // 獲取要永久刪除的活動
      const activitiesToDelete = await tx.activity.findMany({
        where: {
          userId: userId,
          deletedAt: {
            not: null
          }
        },
        include: {
          versions: true
        }
      });

      console.log(`🗑️ 準備永久刪除 ${activitiesToDelete.length} 個活動`);

      // 刪除所有活動版本
      for (const activity of activitiesToDelete) {
        if (activity.versions.length > 0) {
          await tx.activityVersion.deleteMany({
            where: { activityId: activity.id }
          });
        }
      }

      // 永久刪除活動（會級聯刪除 VocabularyItem）
      const deleteResult = await tx.activity.deleteMany({
        where: {
          userId: userId,
          deletedAt: {
            not: null
          }
        }
      });

      return {
        deletedCount: deleteResult.count,
        activities: activitiesToDelete.map(a => ({ id: a.id, title: a.title }))
      };
    });

    console.log('✅ 回收桶已清空:', result);

    return NextResponse.json({
      message: '回收桶已清空',
      deletedCount: result.deletedCount,
      deletedActivities: result.activities
    });

  } catch (error) {
    console.error('清空回收桶時出錯:', error);
    return NextResponse.json(
      { error: '清空回收桶失敗' },
      { status: 500 }
    );
  }
}
