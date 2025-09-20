import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permissions';

// 簡單的內存緩存實現
const permissionCache = new Map<string, { value: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分鐘

const cacheGet = (key: string) => {
  const item = permissionCache.get(key);
  if (!item || Date.now() > item.expiry) {
    permissionCache.delete(key);
    return null;
  }
  return item.value;
};

const cacheSet = (key: string, value: any) => {
  permissionCache.set(key, {
    value,
    expiry: Date.now() + CACHE_TTL
  });
};

/**
 * 優化的權限檢查 Hook
 * 使用緩存和 memoization 提高性能
 */
export function usePermission() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const userRole = session?.user?.role || 'USER';
  const userId = session?.user?.id;

  // 使用 memoization 緩存權限檢查結果
  const permissionCheckers = useMemo(() => {
    const cacheKey = `permissions:${userId}:${userRole}`;

    return {
      /**
       * 檢查用戶是否擁有特定權限（帶緩存）
       */
      checkPermission: (permission: string): boolean => {
        const permissionCacheKey = `${cacheKey}:${permission}`;

        // 檢查緩存
        const cached = cacheGet(permissionCacheKey);
        if (cached !== null) {
          return cached;
        }

        // 計算權限並緩存
        const result = hasPermission(userRole, permission);
        cacheSet(permissionCacheKey, result);
        return result;
      },

      /**
       * 檢查用戶是否擁有多個權限中的任意一個
       */
      checkAnyPermission: (permissions: string[]): boolean => {
        const permissionCacheKey = `${cacheKey}:any:${permissions.join(',')}`;

        // 檢查緩存
        const cached = cacheGet(permissionCacheKey);
        if (cached !== null) {
          return cached;
        }

        // 計算權限並緩存
        const result = hasAnyPermission(userRole, permissions);
        cacheSet(permissionCacheKey, result);
        return result;
      },

      /**
       * 檢查用戶是否擁有所有指定的權限
       */
      checkAllPermissions: (permissions: string[]): boolean => {
        const permissionCacheKey = `${cacheKey}:all:${permissions.join(',')}`;

        // 檢查緩存
        const cached = cacheGet(permissionCacheKey);
        if (cached !== null) {
          return cached;
        }

        // 計算權限並緩存
        const result = hasAllPermissions(userRole, permissions);
        cacheSet(permissionCacheKey, result);
        return result;
      },
    };
  }, [userRole, userId]);

  // 預計算常用權限檢查
  const commonPermissions = useMemo(() => ({
    canCreateActivity: hasPermission(userRole, PERMISSIONS.CREATE_ACTIVITY),
    canEditActivity: hasPermission(userRole, PERMISSIONS.EDIT_ACTIVITY),
    canDeleteActivity: hasPermission(userRole, PERMISSIONS.DELETE_ACTIVITY),
    canCreateH5P: hasPermission(userRole, PERMISSIONS.CREATE_H5P),
    canManageUsers: hasPermission(userRole, PERMISSIONS.READ_USERS),
    isAdmin: userRole === 'ADMIN',
    isPremiumUser: userRole === 'PREMIUM_USER' || userRole === 'ADMIN',
    isTeacher: userRole === 'TEACHER' || userRole === 'ADMIN',
  }), [userRole]);

  return {
    ...permissionCheckers,
    ...commonPermissions,
    PERMISSIONS,
    userRole,
    userId,

    // 清除權限緩存的方法
    clearPermissionCache: () => {
      permissionCache.clear();
    },
  };
}