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
  
  // 只允許GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    const userId = session.user.id;
    const { period = 'month' } = req.query;
    
    // 獲取基本用戶統計數據
    const userStats = await getUserStats(userId);
    
    // 獲取活動參與度數據
    const activityEngagement = await getActivityEngagement(userId, period as string);
    
    // 獲取內容使用情況
    const contentUsage = await getContentUsage(userId);
    
    // 獲取訂閱相關數據
    const subscriptionData = await getSubscriptionData(userId);
    
    // 獲取H5P內容統計
    const h5pStats = await getH5PStats(userId);
    
    // 返回所有統計數據
    return res.status(200).json({
      userStats,
      activityEngagement,
      contentUsage,
      subscriptionData,
      h5pStats
    });
  } catch (error) {
    console.error('獲取統計數據失敗:', error);
    return res.status(500).json({ error: '獲取統計數據失敗' });
  }
}

// 獲取基本用戶統計數據
async function getUserStats(userId: string) {
  const totalActivities = await prisma.activity.count({
    where: { userId }
  });
  
  const publishedActivities = await prisma.activity.count({
    where: { userId, isPublic: true }
  });
  
  const totalH5PContents = await prisma.h5PContent.count({
    where: { userId }
  });
  
  const createdAt = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true }
  });
  
  const daysSinceRegistration = createdAt
    ? Math.floor((Date.now() - createdAt.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  return {
    totalActivities,
    publishedActivities,
    totalH5PContents,
    daysSinceRegistration
  };
}

// 獲取活動參與度數據
async function getActivityEngagement(userId: string, period: string) {
  // 計算時間範圍
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1); // 默認為一個月
  }
  
  // 獲取指定時間範圍內創建的活動
  const createdActivities = await prisma.activity.count({
    where: {
      userId,
      createdAt: { gte: startDate }
    }
  });
  
  // 獲取指定時間範圍內更新的活動
  const updatedActivities = await prisma.activity.count({
    where: {
      userId,
      updatedAt: { gte: startDate },
      createdAt: { lt: startDate } // 排除新創建的活動
    }
  });
  
  // 獲取指定時間範圍內發布的活動
  const publishedActivities = await prisma.activity.count({
    where: {
      userId,
      isPublic: true,
      updatedAt: { gte: startDate }
    }
  });
  
  return {
    createdActivities,
    updatedActivities,
    publishedActivities,
    period
  };
}

// 獲取內容使用情況
async function getContentUsage(userId: string) {
  // 獲取不同類型的活動數量
  const activityTypeDistribution = await prisma.activity.groupBy({
    by: ['type'],
    where: { userId },
    _count: true
  });
  
  // 獲取使用不同類型的活動數量
  const typeUsage = await prisma.activity.groupBy({
    by: ['type'],
    where: { 
      userId
    },
    _count: true
  });
  
  // 獲取模板詳情
  const templates = await prisma.template.findMany({
    where: {
      type: { in: typeUsage.map((t: { type: string }) => t.type) }
    },
    select: {
      id: true,
      name: true
    }
  });
  
  // 將類型映射到模板名稱
  const templateMap = templates.reduce((map: any, template: any) => {
    map[template.type] = template.name;
    return map;
  }, {} as Record<string, string>);
  
  // 格式化類型使用數據
  const formattedTemplateUsage = typeUsage.map((item: any) => ({
    type: item.type,
    templateName: templateMap[item.type as string] || item.type,
    count: item._count
  }));
  
  return {
    activityTypeDistribution,
    templateUsage: formattedTemplateUsage
  };
}

// 獲取訂閱相關數據
async function getSubscriptionData(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      planId: true,
      startDate: true,
      endDate: true
    }
  });
  
  if (!subscription) {
    return { hasSubscription: false };
  }
  
  const daysLeft = subscription.endDate
    ? Math.floor((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  
  return {
    hasSubscription: true,
    status: subscription.status,
    planId: subscription.planId,
    daysLeft,
    startDate: subscription.startDate,
    endDate: subscription.endDate
  };
}

// 獲取H5P內容統計
async function getH5PStats(userId: string) {
  const totalH5PContents = await prisma.h5PContent.count({
    where: { userId }
  });
  
  // 獲取不同類型的H5P內容數量
  const h5pTypeDistribution = await prisma.h5PContent.groupBy({
    by: ['library'],
    where: { userId },
    _count: true
  });
  
  // 獲取最近創建的H5P內容
  const recentH5PContents = await prisma.h5PContent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      library: true,
      createdAt: true
    }
  });
  
  return {
    totalH5PContents,
    h5pTypeDistribution,
    recentH5PContents
  };
}