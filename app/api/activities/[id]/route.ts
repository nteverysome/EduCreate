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

    // 軟刪除 - 設置 deletedAt 時間戳
    console.log('🗑️ 軟刪除活動:', activityId);

    const deletedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        deletedAt: new Date()  // 設置刪除時間戳
      }
    });

    console.log('✅ 活動已移至回收桶');

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
    }

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
