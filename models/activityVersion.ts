import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 活動版本模型
export interface ActivityVersion {
  id: string;
  activityId: string;
  versionName: string;
  versionNotes?: string;
  content: any; // 活動內容的JSON數據
  elements: any;
  published: boolean;
  createdAt: Date;
  userId: string;
}

// 創建新版本
export async function createActivityVersion(activityId: string, content: any, userId: string, versionNotes?: string) {
  // 獲取當前活動的最新版本名稱
  const latestVersion = await prisma.activityVersion.findFirst({
    where: { activityId },
    orderBy: { createdAt: 'desc' },
  });

  const versionName = `v${Date.now()}`; // 使用時間戳作為版本名稱

  // 創建新版本
  return prisma.activityVersion.create({
    data: {
      activityId,
      versionName: versionName,
      content,
      userId: userId,
      versionNotes: versionNotes,
      elements: content || {},
    },
  });
}

// 獲取活動的所有版本
export async function getActivityVersions(activityId: string) {
  return prisma.activityVersion.findMany({
    where: { activityId },
    orderBy: { createdAt: 'desc' },
  });
}

// 獲取特定版本
export async function getActivityVersion(versionId: string) {
  return prisma.activityVersion.findUnique({
    where: { id: versionId },
  });
}

// 恢復到特定版本
export async function restoreActivityVersion(activityId: string, versionId: string, userId: string) {
  // 獲取要恢復的版本
  const versionToRestore = await prisma.activityVersion.findUnique({
    where: { id: versionId },
  });

  if (!versionToRestore) {
    throw new Error('版本不存在');
  }

  // 創建新版本，內容與要恢復的版本相同
  return createActivityVersion(
    activityId,
    versionToRestore.content,
    userId,
    `從版本 ${versionToRestore.versionName} 恢復`
  );
}