/**
 * 活動測試 API 端點 - 無需認證
 * 用於測試和開發環境
 */

import { NextApiRequest, NextApiResponse } from 'next';

// 模擬活動數據
const mockActivities = [
  {
    id: 'activity-1',
    title: '數學基礎練習',
    description: '基本的加減乘除練習',
    gameType: 'quiz',
    difficulty: 'easy',
    estimatedTime: 15,
    isPublic: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'user-1',
    content: {
      questions: [
        {
          question: '2 + 2 = ?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1
        }
      ]
    }
  },
  {
    id: 'activity-2',
    title: '英語單詞配對',
    description: '基礎英語單詞學習',
    gameType: 'matching',
    difficulty: 'medium',
    estimatedTime: 20,
    isPublic: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    createdBy: 'user-1',
    content: {
      pairs: [
        { left: 'Apple', right: '蘋果' },
        { left: 'Book', right: '書' }
      ]
    }
  },
  {
    id: 'activity-3',
    title: '科學知識卡片',
    description: '基礎科學概念學習',
    gameType: 'flashcards',
    difficulty: 'medium',
    estimatedTime: 25,
    isPublic: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    createdBy: 'user-2',
    content: {
      cards: [
        { front: '水的化學式', back: 'H2O' },
        { front: '光的速度', back: '299,792,458 m/s' }
      ]
    }
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API 錯誤:', error);
    return res.status(500).json({ 
      error: '服務器內部錯誤',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 獲取活動列表
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    gameType,
    difficulty,
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  } = req.query;

  try {
    let filteredActivities = [...mockActivities];

    // 搜索過濾
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredActivities = filteredActivities.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm) ||
        activity.description.toLowerCase().includes(searchTerm)
      );
    }

    // 遊戲類型過濾
    if (gameType) {
      filteredActivities = filteredActivities.filter(activity =>
        activity.gameType === gameType
      );
    }

    // 難度過濾
    if (difficulty) {
      filteredActivities = filteredActivities.filter(activity =>
        activity.difficulty === difficulty
      );
    }

    // 排序
    filteredActivities.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue < bValue ? -1 : 1;
      }
    });

    // 分頁
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      data: paginatedActivities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredActivities.length,
        totalPages: Math.ceil(filteredActivities.length / Number(limit))
      },
      filters: {
        search,
        gameType,
        difficulty
      }
    });

  } catch (error) {
    console.error('獲取活動列表失敗:', error);
    return res.status(500).json({ 
      error: '獲取活動列表失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 創建新活動
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    title,
    description,
    gameType,
    difficulty = 'medium',
    estimatedTime = 10,
    isPublic = false,
    content = {},
    createdBy = 'test-user'
  } = req.body;

  // 驗證必要字段
  if (!title || !gameType) {
    return res.status(400).json({
      error: '缺少必要字段',
      required: ['title', 'gameType']
    });
  }

  try {
    // 創建新活動
    const newActivity = {
      id: `activity-${Date.now()}`,
      title,
      description: description || '',
      gameType,
      difficulty,
      estimatedTime,
      isPublic,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    };

    // 添加到模擬數據（實際應用中會保存到數據庫）
    mockActivities.unshift(newActivity);

    return res.status(201).json({
      success: true,
      data: newActivity,
      message: '活動創建成功'
    });

  } catch (error) {
    console.error('創建活動失敗:', error);
    return res.status(500).json({
      error: '創建活動失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 更新活動
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ error: '缺少活動 ID' });
  }

  try {
    // 查找活動
    const activityIndex = mockActivities.findIndex(activity => activity.id === id);
    
    if (activityIndex === -1) {
      return res.status(404).json({ error: '活動不存在' });
    }

    // 更新活動
    mockActivities[activityIndex] = {
      ...mockActivities[activityIndex],
      ...updateData,
      updatedAt: new Date()
    };

    return res.status(200).json({
      success: true,
      data: mockActivities[activityIndex],
      message: '活動更新成功'
    });

  } catch (error) {
    console.error('更新活動失敗:', error);
    return res.status(500).json({
      error: '更新活動失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

// 刪除活動
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: '缺少活動 ID' });
  }

  try {
    // 查找活動
    const activityIndex = mockActivities.findIndex(activity => activity.id === id);
    
    if (activityIndex === -1) {
      return res.status(404).json({ error: '活動不存在' });
    }

    // 刪除活動
    const deletedActivity = mockActivities.splice(activityIndex, 1)[0];

    return res.status(200).json({
      success: true,
      data: deletedActivity,
      message: '活動刪除成功'
    });

  } catch (error) {
    console.error('刪除活動失敗:', error);
    return res.status(500).json({
      error: '刪除活動失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}
