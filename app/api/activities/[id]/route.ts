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

    // 簡化刪除邏輯 - 只需要刪除 Activity（級聯刪除 VocabularyItem）
    console.log('🔍 活動內容:', JSON.stringify(activity.content, null, 2));

    // 在事務中刪除活動和相關數據
    await prisma.$transaction(async (tx) => {
      // 刪除活動版本
      if (activity.versions.length > 0) {
        console.log('🗑️ 刪除活動版本:', activity.versions.length);
        await tx.activityVersion.deleteMany({
          where: { activityId: activityId }
        });
      }

      // 刪除活動（會自動級聯刪除關聯的 VocabularyItem）
      console.log('🗑️ 刪除活動:', activityId);
      await tx.activity.delete({
        where: { id: activityId }
      });

      // 注意：VocabularyItem 會通過外鍵級聯刪除，不需要手動刪除
      console.log('✅ 活動及其關聯的詞彙項目已刪除');
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
    const updatedActivity = await prisma.activity.update({
      where: {
        id: activityId
      },
      data: {
        title: body.title,
        type: 'vocabulary',
        gameType: body.gameTemplateId,
        content: {
          vocabularyItems: body.vocabularyItems || []
        },
        updatedAt: new Date()
      }
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
