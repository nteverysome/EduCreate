import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { withVocabularySetOwnership, withVocabularyItemLimit } from '../../../../middleware/withVocabularyAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🎯 詞彙集合詳情API被調用:', {
    method: req.method,
    id: req.query.id,
    timestamp: new Date().toISOString()
  });

  try {
    // 驗證用戶身份
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      console.log('❌ 未授權訪問');
      return res.status(401).json({ message: '請先登入' });
    }

    const userId = session.user.id;
    const setId = req.query.id as string;

    if (!setId) {
      console.log('❌ 缺少詞彙集合ID');
      return res.status(400).json({ message: '詞彙集合ID是必需的' });
    }

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, userId, setId);
      case 'PUT':
        return await handlePut(req, res, userId, setId);
      case 'DELETE':
        return await handleDelete(req, res, userId, setId);
      default:
        console.log('❌ 不支持的方法:', req.method);
        return res.status(405).json({ message: '方法不允許' });
    }
  } catch (error) {
    console.error('❌ 詞彙集合詳情API錯誤:', error);
    return res.status(500).json({ 
      message: '服務器錯誤',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : error) : undefined
    });
  }
}

// 獲取單個詞彙集合
async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string, setId: string) {
  console.log('📖 獲取詞彙集合詳情:', setId);
  
  try {
    const vocabularySet = await prisma.vocabularySet.findFirst({
      where: { 
        id: setId,
        OR: [
          { userId }, // 用戶自己的詞彙集合
          { isPublic: true } // 或公開的詞彙集合
        ]
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    if (!vocabularySet) {
      console.log('❌ 詞彙集合不存在或無權限訪問');
      return res.status(404).json({ message: '詞彙集合不存在或無權限訪問' });
    }

    console.log('✅ 詞彙集合獲取成功');

    return res.status(200).json({
      success: true,
      data: vocabularySet
    });
  } catch (error) {
    console.error('❌ 獲取詞彙集合失敗:', error);
    throw error;
  }
}

// 更新詞彙集合
async function handlePut(req: NextApiRequest, res: NextApiResponse, userId: string, setId: string) {
  console.log('✏️ 更新詞彙集合:', setId);
  
  const { title, description, geptLevel, isPublic, items } = req.body;

  try {
    // 檢查詞彙集合是否存在且屬於當前用戶
    const existingSet = await prisma.vocabularySet.findFirst({
      where: { id: setId, userId }
    });

    if (!existingSet) {
      console.log('❌ 詞彙集合不存在或無權限修改');
      return res.status(404).json({ message: '詞彙集合不存在或無權限修改' });
    }

    // 使用事務更新詞彙集合和項目
    const updatedSet = await prisma.$transaction(async (tx) => {
      // 更新詞彙集合基本信息
      const updated = await tx.vocabularySet.update({
        where: { id: setId },
        data: {
          title: title || existingSet.title,
          description: description !== undefined ? description : existingSet.description,
          geptLevel: geptLevel || existingSet.geptLevel,
          isPublic: isPublic !== undefined ? isPublic : existingSet.isPublic,
          totalWords: items ? items.length : existingSet.totalWords
        }
      });

      // 如果提供了新的詞彙項目，則替換所有項目
      if (items && Array.isArray(items)) {
        // 刪除舊的詞彙項目
        await tx.vocabularyItem.deleteMany({
          where: { setId }
        });

        // 創建新的詞彙項目
        if (items.length > 0) {
          await tx.vocabularyItem.createMany({
            data: items.map((item: any) => ({
              setId,
              english: item.english,
              chinese: item.chinese,
              phonetic: item.phonetic || null,
              partOfSpeech: item.partOfSpeech || null,
              difficultyLevel: item.difficultyLevel || 1,
              exampleSentence: item.exampleSentence || null,
              notes: item.notes || null,
              imageUrl: item.imageUrl || null,
              audioUrl: item.audioUrl || null
            }))
          });
        }
      }

      return updated;
    });

    console.log('✅ 詞彙集合更新成功');

    // 獲取完整的更新後數據
    const completeSet = await prisma.vocabularySet.findUnique({
      where: { id: setId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: '詞彙集合更新成功',
      data: completeSet
    });
  } catch (error) {
    console.error('❌ 更新詞彙集合失敗:', error);
    throw error;
  }
}

// 刪除詞彙集合
async function handleDelete(req: NextApiRequest, res: NextApiResponse, userId: string, setId: string) {
  console.log('🗑️ 刪除詞彙集合:', setId);
  
  try {
    // 檢查詞彙集合是否存在且屬於當前用戶
    const existingSet = await prisma.vocabularySet.findFirst({
      where: { id: setId, userId }
    });

    if (!existingSet) {
      console.log('❌ 詞彙集合不存在或無權限刪除');
      return res.status(404).json({ message: '詞彙集合不存在或無權限刪除' });
    }

    // 刪除詞彙集合（級聯刪除會自動刪除相關的詞彙項目和學習進度）
    await prisma.vocabularySet.delete({
      where: { id: setId }
    });

    console.log('✅ 詞彙集合刪除成功');

    return res.status(200).json({
      success: true,
      message: '詞彙集合刪除成功'
    });
  } catch (error) {
    console.error('❌ 刪除詞彙集合失敗:', error);
    throw error;
  }
}

// 應用中間件
export default withVocabularySetOwnership((req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    return withVocabularyItemLimit(handler)(req, res);
  }
  return handler(req, res);
});
