import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const activityId = params.id;

    // 獲取活動和相關的詞彙數據
    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        // 🔥 [v63.0] 新增：包含 vocabularyItems 關聯，以便獲取所有圖片字段
        vocabularyItems: true
      }
    });

    if (!activity) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 });
    }

    // 🔥 修復：允許公開訪問（用於遊戲播放）
    // 如果用戶已登錄，檢查權限
    if (session?.user?.email) {
      // 已登錄用戶：只能訪問自己的活動或公開活動
      if (activity.user.email !== session.user.email && !activity.isPublic) {
        return NextResponse.json({ error: '無權限訪問此活動' }, { status: 403 });
      }
    } else {
      // 未登錄用戶：只能訪問公開活動
      if (!activity.isPublic) {
        return NextResponse.json({ error: '此活動不是公開的' }, { status: 403 });
      }
    }

    // 🔥 [v63.0] 優先從 vocabularyItems 關聯獲取詞彙（最新方式）
    let vocabularyItems = [];
    const content = activity.content as any;

    if (activity.vocabularyItems && activity.vocabularyItems.length > 0) {
      // 🔥 [v63.0] 從 vocabularyItems 關聯獲取詞彙，包含所有圖片字段
      vocabularyItems = activity.vocabularyItems.map(item => ({
        id: item.id,
        english: item.english,
        chinese: item.chinese,
        phonetic: item.phonetic,
        partOfSpeech: item.partOfSpeech,
        difficultyLevel: item.difficultyLevel,
        exampleSentence: item.exampleSentence,
        notes: item.notes,
        // 英文圖片字段
        imageId: item.imageId,
        imageUrl: item.imageUrl,
        imageSize: item.imageSize,
        // 🔥 [v63.0] 新增：中文圖片字段
        chineseImageId: item.chineseImageId,
        chineseImageUrl: item.chineseImageUrl,
        chineseImageSize: item.chineseImageSize,
        // 語音字段
        audioUrl: item.audioUrl
      }));
    } else if (content?.questions && Array.isArray(content.questions) && content.questions.length > 0) {
      // 🔥 Flying Fruit 格式支持：從 content.questions 轉換為標準 vocabularyItems 格式
      console.log('📝 從 content.questions 轉換詞彙 (Flying Fruit 格式)');

      // 🔥 新邏輯：將所有答案選項都轉換為詞彙項（包括錯誤答案）
      // 這樣其他遊戲（如 Shimozurdo、Match-Up）就有多個詞彙可以使用
      const allVocabularyItems: any[] = [];

      content.questions.forEach((q: any, qIndex: number) => {
        if (q.answers && Array.isArray(q.answers)) {
          q.answers.forEach((answer: any, aIndex: number) => {
            if (answer.isCorrect) {
              // 正確答案：使用問題作為英文
              allVocabularyItems.push({
                id: answer.id || `q${qIndex}_a${aIndex}`,
                english: q.question || '',
                chinese: answer.text || '',
                imageUrl: q.questionImageUrl || null,
                chineseImageUrl: answer.imageUrl || null,
                audioUrl: q.questionAudioUrl || null,
                isCorrectAnswer: true
              });
            } else {
              // 🔥 錯誤答案：也轉換為詞彙項（中文 -> 中文，讓遊戲可以使用）
              // 由於沒有對應英文，使用中文本身作為標識
              allVocabularyItems.push({
                id: answer.id || `q${qIndex}_a${aIndex}`,
                english: answer.text || '',  // 使用中文作為英文（干擾項）
                chinese: answer.text || '',
                imageUrl: answer.imageUrl || null,
                chineseImageUrl: answer.imageUrl || null,
                audioUrl: null,
                isCorrectAnswer: false
              });
            }
          });
        }
      });

      vocabularyItems = allVocabularyItems;
      console.log(`📝 轉換完成：${vocabularyItems.length} 個詞彙項（包含正確和錯誤答案）`);
    } else {
      // 向後兼容：從舊的存儲方式獲取詞彙
      const vocabularySetId = content?.vocabularySetId;

      if (vocabularySetId) {
        // 從詞彙集合中獲取詞彙
        const vocabularySet = await prisma.vocabularySet.findUnique({
          where: {
            id: vocabularySetId
          },
          include: {
            items: true
          }
        });

        if (vocabularySet) {
          vocabularyItems = vocabularySet.items.map(item => ({
            id: item.id,
            english: item.english,
            chinese: item.chinese,
            phonetic: item.phonetic,
            partOfSpeech: item.partOfSpeech,
            difficultyLevel: item.difficultyLevel,
            exampleSentence: item.exampleSentence,
            notes: item.notes,
            imageUrl: item.imageUrl,
            audioUrl: item.audioUrl
          }));
        }
      } else if (content?.vocabularyItems && content.vocabularyItems.length > 0) {
        // 從活動內容中直接獲取詞彙（向後兼容）
        vocabularyItems = content.vocabularyItems;
      } else if (activity.elements && Array.isArray(activity.elements) && activity.elements.length > 0) {
        // 從 elements 字段獲取詞彙（向後兼容）
        vocabularyItems = activity.elements as any[];
      }
    }

    return NextResponse.json({
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        templateType: activity.templateType,
        gameTemplateId: content?.gameTemplateId,
        difficulty: activity.difficulty,
        estimatedTime: activity.estimatedTime,
        tags: activity.tags,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        playCount: activity.playCount
      },
      vocabularyItems: vocabularyItems,
      totalItems: vocabularyItems.length
    });

  } catch (error) {
    console.error('獲取活動詞彙時出錯:', error);
    return NextResponse.json(
      { error: '獲取活動詞彙失敗' },
      { status: 500 }
    );
  }
}
