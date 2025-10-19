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

    // 檢查活動是否存在且屬於該用戶（排除已刪除的活動）
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId,
        deletedAt: null  // 只能刪除未刪除的活動
      }
    });

    if (!activity) {
      console.log('❌ 活動不存在、無權限或已刪除:', { activityId, userId });
      return NextResponse.json({ error: '活動不存在或無權限刪除' }, { status: 404 });
    }

    // 軟刪除 - 設置 deletedAt 時間戳，並同步取消社區發布
    console.log('🗑️ 軟刪除活動:', activityId);

    // 檢查活動是否已發布到社區
    if (activity.isPublicShared) {
      console.log('📢 活動已發布到社區，將同步取消發布');
    }

    const deletedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        deletedAt: new Date(),  // 設置刪除時間戳
        // 如果活動已發布到社區，同步取消發布
        ...(activity.isPublicShared ? {
          isPublicShared: false,
          publishedToCommunityAt: null,
          communityCategory: null,
          communityTags: [],
          communityDescription: null,
          communityThumbnail: null,
        } : {})
      }
    });

    console.log('✅ 活動已移至回收桶');
    if (activity.isPublicShared) {
      console.log('✅ 已同步取消社區發布');
    }

    return NextResponse.json({
      message: '活動已移至回收桶',
      deletedActivityId: activityId,
      deletedAt: deletedActivity.deletedAt
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
        vocabularyItems: true,  // 包含詞彙項目
        versions: {
          orderBy: { createdAt: 'desc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
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

// PATCH 方法：用於部分更新（例如重新命名）
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
    const body = await request.json();

    console.log('🔍 PATCH API 調用:', {
      activityId,
      userId,
      body
    });

    // 檢查活動是否存在且屬於該用戶
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId
      }
    });

    if (!existingActivity) {
      console.log('❌ 活動不存在或無權限:', { activityId, userId });
      return NextResponse.json({ error: '活動不存在或無權限編輯' }, { status: 404 });
    }

    // 更新活動（只更新提供的字段）
    const updateData: any = {
      updatedAt: new Date()
    };

    // 如果有 title，只更新 title
    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    // 如果有 communityTags，更新社區標籤
    if (body.communityTags !== undefined) {
      updateData.communityTags = body.communityTags;
    }

    // 如果有 communityCategory，更新社區分類
    if (body.communityCategory !== undefined) {
      updateData.communityCategory = body.communityCategory;
    }

    // 如果有 communityDescription，更新社區描述
    if (body.communityDescription !== undefined) {
      updateData.communityDescription = body.communityDescription;
    }

    // 更新活動
    const updatedActivity = await prisma.activity.update({
      where: {
        id: activityId
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    console.log('✅ 活動部分更新成功:', updatedActivity.title);

    return NextResponse.json(updatedActivity);

  } catch (error) {
    console.error('部分更新活動時出錯:', error);
    return NextResponse.json(
      { error: '更新活動失敗' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const body = await request.json();

    console.log('🔍 PUT API 調用:', {
      activityId,
      userId,
      body
    });

    // 檢查活動是否存在且屬於該用戶
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId
      }
    });

    if (!existingActivity) {
      console.log('❌ 活動不存在或無權限:', { activityId, userId });
      return NextResponse.json({ error: '活動不存在或無權限編輯' }, { status: 404 });
    }

    // 更新活動
    const updateData: any = {
      updatedAt: new Date()
    };

    // 如果有 title，更新 title
    if (body.title !== undefined) {
      updateData.title = body.title;
      updateData.type = 'vocabulary';
      updateData.content = {
        gameTemplateId: body.gameTemplateId, // 存儲在 content 中
        vocabularyItems: body.vocabularyItems || []
      };
    }

    // 如果有 folderId，更新 folderId（支持拖拽功能）
    if (body.folderId !== undefined) {
      updateData.folderId = body.folderId;
      console.log('📁 更新活動資料夾:', { activityId, folderId: body.folderId });

      // 🚀 [新方案] 使用事务确保数据一致性，并返回更新后的资料夹数据
      const { updatedActivity, updatedFolders } = await prisma.$transaction(async (tx) => {
        // 更新活动的 folderId
        const activity = await tx.activity.update({
          where: { id: activityId },
          data: updateData
        });

        // 强制等待一小段时间确保事务完全提交
        await new Promise(resolve => setTimeout(resolve, 100));

        // 获取更新后的所有资料夹数据
        const folders = await tx.folder.findMany({
          where: {
            userId: userId,
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

        // 计算每个资料夹的活动数量
        const foldersWithCount = await Promise.all(folders.map(async folder => {
          const activityCount = folder.activities.length;
          return {
            id: folder.id,
            name: folder.name,
            description: folder.description,
            color: folder.color,
            icon: folder.icon,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            activityCount: activityCount
          };
        }));

        return { updatedActivity: activity, updatedFolders: foldersWithCount };
      });

      console.log('✅ 活動更新成功:', updatedActivity.title);
      console.log('🚀 [新方案] 返回更新后的资料夹数据:', updatedFolders.length, '个资料夹');

      return NextResponse.json({
        success: true,
        activity: updatedActivity,
        folders: updatedFolders
      });
    }

    // 如果不是拖拽操作，使用原来的逻辑
    const updatedActivity = await prisma.activity.update({
      where: {
        id: activityId
      },
      data: updateData
    });

    console.log('✅ 活動更新成功:', updatedActivity.title);

    return NextResponse.json(updatedActivity);

  } catch (error) {
    console.error('更新活動時出錯:', error);
    return NextResponse.json(
      { error: '更新活動失敗' },
      { status: 500 }
    );
  }
}
