import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // 檢查用戶是否已登入
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  // 獲取活動ID
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '無效的活動ID' });
  }
  
  // 根據請求方法處理不同的操作
  switch (req.method) {
    case 'GET':
      return getActivity(req, res, session, id);
    case 'PUT':
      return updateActivity(req, res, session, id);
    case 'DELETE':
      return deleteActivity(req, res, session, id);
    case 'POST':
      // 處理特殊操作，如發布活動
      if (req.query.action === 'publish') {
        return publishActivity(req, res, session, id);
      }
      return res.status(400).json({ error: '無效的操作' });
    default:
      return res.status(405).json({ error: '方法不允許' });
  }
}

// 獲取單個活動
async function getActivity(req: NextApiRequest, res: NextApiResponse, session: any, id: string) {
  try {
    const userId = session.user.id;
    
    // 獲取活動
    const activity = await prisma.activity.findUnique({
      where: { id }
    });
    
    // 檢查活動是否存在
    if (!activity) {
      return res.status(404).json({ error: '活動不存在' });
    }
    
    // 檢查用戶是否有權限訪問該活動
    if (activity.userId !== userId && !activity.published) {
      return res.status(403).json({ error: '無權訪問此活動' });
    }
    
    return res.status(200).json(activity);
  } catch (error) {
    console.error('獲取活動失敗:', error);
    return res.status(500).json({ error: '獲取活動失敗' });
  }
}

// 更新活動
async function updateActivity(req: NextApiRequest, res: NextApiResponse, session: any, id: string) {
  try {
    const userId = session.user.id;
    
    // 檢查活動是否存在並且屬於當前用戶
    const existingActivity = await prisma.activity.findUnique({
      where: { id }
    });
    
    if (!existingActivity) {
      return res.status(404).json({ error: '活動不存在' });
    }
    
    if (existingActivity.userId !== userId) {
      return res.status(403).json({ error: '無權更新此活動' });
    }
    
    // 更新活動
    const { title, description, elements } = req.body;
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        title: title || existingActivity.title,
        description: description !== undefined ? description : existingActivity.description,
        elements: elements || existingActivity.elements,
        updatedAt: new Date()
      }
    });
    
    return res.status(200).json(updatedActivity);
  } catch (error) {
    console.error('更新活動失敗:', error);
    return res.status(500).json({ error: '更新活動失敗' });
  }
}

// 刪除活動
async function deleteActivity(req: NextApiRequest, res: NextApiResponse, session: any, id: string) {
  try {
    const userId = session.user.id;
    
    // 檢查活動是否存在並且屬於當前用戶
    const existingActivity = await prisma.activity.findUnique({
      where: { id }
    });
    
    if (!existingActivity) {
      return res.status(404).json({ error: '活動不存在' });
    }
    
    if (existingActivity.userId !== userId) {
      return res.status(403).json({ error: '無權刪除此活動' });
    }
    
    // 刪除活動
    await prisma.activity.delete({
      where: { id }
    });
    
    return res.status(200).json({ message: '活動已刪除' });
  } catch (error) {
    console.error('刪除活動失敗:', error);
    return res.status(500).json({ error: '刪除活動失敗' });
  }
}

// 發布活動
async function publishActivity(req: NextApiRequest, res: NextApiResponse, session: any, id: string) {
  try {
    const userId = session.user.id;
    
    // 檢查活動是否存在並且屬於當前用戶
    const existingActivity = await prisma.activity.findUnique({
      where: { id }
    });
    
    if (!existingActivity) {
      return res.status(404).json({ error: '活動不存在' });
    }
    
    if (existingActivity.userId !== userId) {
      return res.status(403).json({ error: '無權發布此活動' });
    }
    
    // 發布活動
    const publishedActivity = await prisma.activity.update({
      where: { id },
      data: {
        published: true,
        updatedAt: new Date()
      }
    });
    
    return res.status(200).json(publishedActivity);
  } catch (error) {
    console.error('發布活動失敗:', error);
    return res.status(500).json({ error: '發布活動失敗' });
  }
}