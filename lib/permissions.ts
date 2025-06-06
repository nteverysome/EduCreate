import { getSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 權限常量定義
export const PERMISSIONS = {
  // 活動相關權限
  CREATE_ACTIVITY: 'create:activity',
  READ_ACTIVITY: 'read:activity',
  UPDATE_ACTIVITY: 'update:activity',
  EDIT_ACTIVITY: 'edit:activity',
  DELETE_ACTIVITY: 'delete:activity',
  PUBLISH_ACTIVITY: 'publish:activity',

  // 模板相關權限
  CREATE_TEMPLATE: 'create:template',
  READ_TEMPLATE: 'read:template',
  UPDATE_TEMPLATE: 'update:template',
  DELETE_TEMPLATE: 'delete:template',

  // 用戶相關權限
  READ_USERS: 'read:users',
  UPDATE_USERS: 'update:users',
  DELETE_USERS: 'delete:users',

  // 訂閱相關權限
  MANAGE_SUBSCRIPTIONS: 'manage:subscriptions',

  // H5P相關權限
  CREATE_H5P: 'create:h5p',
  EDIT_H5P: 'edit:h5p',
  IMPORT_H5P: 'import:h5p',
  EXPORT_H5P: 'export:h5p',
};

// ======= 修正循環參考區 =======
const USER_PERMISSIONS = [
  PERMISSIONS.READ_ACTIVITY,
  PERMISSIONS.READ_TEMPLATE,
  // 基本用戶只能管理自己的活動
];

const PREMIUM_USER_PERMISSIONS = [
  ...USER_PERMISSIONS,
  PERMISSIONS.CREATE_ACTIVITY,
  PERMISSIONS.UPDATE_ACTIVITY,
  PERMISSIONS.DELETE_ACTIVITY,
  PERMISSIONS.PUBLISH_ACTIVITY,
  PERMISSIONS.CREATE_H5P,
  PERMISSIONS.EDIT_H5P,
  PERMISSIONS.IMPORT_H5P,
  PERMISSIONS.EXPORT_H5P,
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  USER: USER_PERMISSIONS,
  PREMIUM_USER: PREMIUM_USER_PERMISSIONS,
  ADMIN: [
    ...Object.values(PERMISSIONS),
  ],
};
// ======= 修正循環參考區 =======

// 檢查用戶是否有特定權限
export function hasPermission(userRole: string, permission: string): boolean {
  if (!ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

// 檢查用戶是否有多個權限中的任意一個
export function hasAnyPermission(userRole: string, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// 檢查用戶是否擁有所有指定的權限
export function hasAllPermissions(userRole: string, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// 檢查用戶是否有有效訂閱的中間件
export async function withSubscription(req: NextApiRequest, res: NextApiResponse, next: () => Promise<void>) {
  try {
    const session = await getSession({ req });

    if (!session?.user) {
      return res.status(401).json({ message: '請先登入' });
    }

    // 檢查用戶角色
    if (session.user.role === 'ADMIN') {
      // 管理員可以訪問所有功能
      return next();
    }

    // 檢查用戶是否有有效訂閱
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: '需要有效訂閱才能訪問此功能', 
        requiresSubscription: true 
      });
    }

    // 用戶有有效訂閱，允許訪問
    return next();
  } catch (error) {
    console.error('訂閱檢查錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}

// 檢查用戶是否可以創建更多活動
export async function canCreateMoreActivities(userId: string) {
  try {
    // 獲取用戶角色和訂閱信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return { canCreate: false, reason: '用戶不存在' };
    }

    // 管理員可以創建無限活動
    if (user.role === 'ADMIN') {
      return { canCreate: true };
    }

    // 檢查用戶是否有有效訂閱
    const hasActiveSubscription = 
      user.subscription && user.subscription.status === 'ACTIVE';

    // 如果用戶有有效訂閱，可以創建無限活動
    if (hasActiveSubscription) {
      return { canCreate: true };
    }

    // 免費用戶只能創建有限數量的活動
    const activityCount = await prisma.activity.count({
      where: { userId: user.id },
    });

    const FREE_ACTIVITY_LIMIT = 5;
    if (activityCount >= FREE_ACTIVITY_LIMIT) {
      return { 
        canCreate: false, 
        reason: `免費用戶最多只能創建${FREE_ACTIVITY_LIMIT}個活動`,
        requiresSubscription: true
      };
    }

    return { canCreate: true };
  } catch (error) {
    console.error('檢查活動創建權限錯誤:', error);
    return { canCreate: false, reason: '檢查權限時發生錯誤' };
  }
}
