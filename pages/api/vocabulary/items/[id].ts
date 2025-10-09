import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid item ID' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        return await updateVocabularyItem(req, res, id);
      case 'DELETE':
        return await deleteVocabularyItem(req, res, id);
      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function updateVocabularyItem(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { english, chinese, partOfSpeech, difficultyLevel } = req.body;

  if (!english || !chinese) {
    return res.status(400).json({ 
      success: false, 
      error: 'English and Chinese translations are required' 
    });
  }

  try {
    const updatedItem = await prisma.vocabularyItem.update({
      where: { id },
      data: {
        english: english.trim(),
        chinese: chinese.trim(),
        ...(partOfSpeech && { partOfSpeech }),
        ...(difficultyLevel && { difficultyLevel: parseInt(difficultyLevel) }),
        updatedAt: new Date()
      }
    });

    console.log('✅ 詞彙更新成功:', updatedItem);

    return res.status(200).json({
      success: true,
      data: updatedItem,
      message: '詞彙更新成功'
    });
  } catch (error) {
    console.error('❌ 更新詞彙失敗:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({
        success: false,
        error: 'Vocabulary item not found'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update vocabulary item',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function deleteVocabularyItem(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // 檢查詞彙是否存在
    const existingItem = await prisma.vocabularyItem.findUnique({
      where: { id },
      include: { vocabularySet: true }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Vocabulary item not found'
      });
    }

    // 刪除詞彙
    await prisma.vocabularyItem.delete({
      where: { id }
    });

    console.log('✅ 詞彙刪除成功:', { id, english: existingItem.english });

    // 檢查詞彙集合是否還有其他詞彙，如果沒有則刪除集合
    const remainingItems = await prisma.vocabularyItem.count({
      where: { vocabularySetId: existingItem.vocabularySetId }
    });

    if (remainingItems === 0) {
      await prisma.vocabularySet.delete({
        where: { id: existingItem.vocabularySetId }
      });
      console.log('✅ 空詞彙集合已刪除:', existingItem.vocabularySetId);
    }

    return res.status(200).json({
      success: true,
      message: '詞彙刪除成功',
      deletedSetIfEmpty: remainingItems === 0
    });
  } catch (error) {
    console.error('❌ 刪除詞彙失敗:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to delete vocabulary item',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
