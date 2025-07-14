import prisma from '../lib/prisma';

// 活動版本模型垈
export interface ActivityVersion {
  id: string;
  activityId: string;
  versionName: string;
  versionNotes?: string;
  content: any; // 活動內容的JSON數擇
  elements: any;
  published: boolean;
  createdAt: Date;
  userId: string;
  // 新增：完整的變更追蹤
  changeType: 'create' | 'update' | 'restore' | 'merge' | 'auto_save';
  changeDetails: ChangeDetail[];
  collaborators: string[]; // 協作者ID列表
  parentVersionId?: string; // 父版本ID，用於分支管理
  mergeFromVersionId?: string; // 合併來源版本ID
  tags: string[]; // 版本標籤
  isAutoSave: boolean; // 是否為自動保存版本
}

// 變更詳情接口
export interface ChangeDetail {
  field: string; // 變更的字段路徑
  action: 'add' | 'modify' | 'delete' | 'move';
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  userId: string;
  description?: string;
}

// 創建新版本（增強版）
export async function createActivityVersion(
  activityId: string,
  content: any,
  userId: string,
  options: {
    versionNotes?: string;
    changeType?: 'create' | 'update' | 'restore' | 'merge' | 'auto_save';
    collaborators?: string[];
    parentVersionId?: string;
    tags?: string[];
    isAutoSave?: boolean;
  } = {}
) {
  // 獲取當前活動和最新版本
  const [activity, latestVersion] = await Promise.all([
    prisma.activity.findUnique({ where: { id: activityId } }),
    prisma.activityVersion.findFirst({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
    })
  ]);

  if (!activity) {
    throw new Error('活動不存在');
  }

  // 計算變更詳情
  const changeDetails = latestVersion
    ? calculateChangeDetails(latestVersion.content, content, userId)
    : []; // 首次創建版本時沒有變更詳情

  // 生成版本名稱
  const versionCount = await prisma.activityVersion.count({ where: { activityId } });
  const versionName = options.isAutoSave
    ? `自動保存 ${new Date().toLocaleString('zh-TW')}`
    : options.versionNotes
      ? `v${versionCount + 1} - ${options.versionNotes}`
      : `v${versionCount + 1}`;

  // 創建新版本
  return prisma.activityVersion.create({
    data: {
      activityId,
      versionName,
      content,
      userId,
      versionNotes: options.versionNotes || '',
      elements: content || {},
      changeType: options.changeType || 'update',
      changeDetails: changeDetails as any,
      collaborators: options.collaborators || [userId],
      parentVersionId: options.parentVersionId || latestVersion?.id,
      tags: options.tags || [],
      isAutoSave: options.isAutoSave || false,
    },
  });
}

// 計算兩個版本之間的變更詳情
function calculateChangeDetails(oldContent: any, newContent: any, userId: string): ChangeDetail[] {
  const changes: ChangeDetail[] = [];
  const timestamp = new Date();

  // 深度比較對象差異
  function compareObjects(oldObj: any, newObj: any, path: string = '') {
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];

      if (oldValue === undefined && newValue !== undefined) {
        // 新增字段
        changes.push({
          field: currentPath,
          action: 'add',
          newValue,
          timestamp,
          userId,
          description: `新增 ${key}`
        });
      } else if (oldValue !== undefined && newValue === undefined) {
        // 刪除字段
        changes.push({
          field: currentPath,
          action: 'delete',
          oldValue,
          timestamp,
          userId,
          description: `刪除 ${key}`
        });
      } else if (oldValue !== newValue) {
        if (typeof oldValue === 'object' && typeof newValue === 'object') {
          // 遞歸比較對象
          compareObjects(oldValue, newValue, currentPath);
        } else {
          // 修改字段
          changes.push({
            field: currentPath,
            action: 'modify',
            oldValue,
            newValue,
            timestamp,
            userId,
            description: `修改 ${key}`
          });
        }
      }
    }
  }

  compareObjects(oldContent, newContent);
  return changes;
}

// 獲取活動的所有版本（增強版）
export async function getActivityVersions(activityId: string, options: {
  includeAutoSave?: boolean;
  limit?: number;
  collaboratorId?: string;
  tags?: string[];
} = {}) {
  const where: any = { activityId };

  // 過濾自動保存版本
  if (!options.includeAutoSave) {
    where.isAutoSave = false;
  }

  // 過濾協作者
  if (options.collaboratorId) {
    where.collaborators = {
      has: options.collaboratorId
    };
  }

  // 過濾標籤
  if (options.tags && options.tags.length > 0) {
    where.tags = {
      hasSome: options.tags
    };
  }

  return prisma.activityVersion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
}

// 獲取獹定一本
export async function getActivityVersion(versionId: string) {
  return prisma.activityVersion.findUnique({
    where: { id: versionId },
  });
}

// 恢復到猹定一本
export async function restoreActivityVersion(activityId: string, versionId: string, userId: string) {
  // 獲取要恢復的版本
  const versionToRestore = await prisma.activityVersion.findUnique({
    where: { id: versionId },
  });

  if (!versionToRestore) {
    throw new Error('版本不存在');
  }

  // 登建新版本，內容焁要恢復的版本相同
  return createActivityVersion(
    activityId,
    versionToRestore.content,
    userId,
    '恢復版本 ' + versionToRestore.versionName + ' 恢復'
  );
}