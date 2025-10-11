import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const activityId = params.id;
    console.log('🔄 複製活動:', { activityId, userEmail: session.user.email });

    // 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    // 獲取要複製的原始活動（包含詞彙項目）
    const originalActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        deletedAt: null  // 只能複製未刪除的活動
      },
      include: {
        vocabularyItems: true
      }
    });

    if (!originalActivity) {
      console.log('❌ 活動不存在或已刪除:', activityId);
      return NextResponse.json({ error: '活動不存在或已刪除' }, { status: 404 });
    }

    console.log('📋 找到原始活動:', {
      title: originalActivity.title,
      vocabularyCount: originalActivity.vocabularyItems.length
    });

    // 創建複製的活動
    const copiedActivity = await prisma.activity.create({
      data: {
        userId: user.id,
        title: `${originalActivity.title} (副本)`,
        description: originalActivity.description,
        type: originalActivity.type,
        templateType: originalActivity.templateType,
        content: originalActivity.content,
        elements: originalActivity.elements,
        published: false,  // 複製的活動默認為未發布
        isPublic: false,   // 複製的活動默認為私人
        isDraft: originalActivity.isDraft,
        playCount: 0,      // 重置播放次數
        shareCount: 0,     // 重置分享次數
        difficulty: originalActivity.difficulty,
        estimatedTime: originalActivity.estimatedTime,
        tags: originalActivity.tags,
        geptLevel: originalActivity.geptLevel,
        totalWords: originalActivity.totalWords,
        folderId: null,    // 複製的活動放在根級別

        // 複製詞彙項目
        vocabularyItems: {
          create: originalActivity.vocabularyItems.map(item => ({
            english: item.english,
            chinese: item.chinese,
            phonetic: item.phonetic,
            difficultyLevel: item.difficultyLevel
          }))
        }
      },
      include: {
        vocabularyItems: true
      }
    });

    console.log('✅ 活動複製成功:', {
      originalId: activityId,
      copiedId: copiedActivity.id,
      title: copiedActivity.title,
      vocabularyCount: copiedActivity.vocabularyItems.length
    });

    return NextResponse.json({
      id: copiedActivity.id,
      title: copiedActivity.title,
      totalWords: copiedActivity.totalWords,
      message: '活動複製成功'
    });

  } catch (error: any) {
    console.error('❌ 複製活動失敗:', error);
    return NextResponse.json(
      { error: '複製活動失敗', details: error.message },
      { status: 500 }
    );
  }
}
