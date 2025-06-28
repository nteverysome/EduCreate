import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permissions';
import { permissionCache } from '../lib/cache/CacheManager';

/**
 * 優化的權限檢查 Hook
 * 使用緩存和 memoization 提高性能
 */
export function usePermission() {
  const { data: session } = useSession();
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

        return permissionCache.getOrSet(
          permissionCacheKey,
          async () => hasPermission(userRole, permission),
          2 * 60 * 1000 // 2 分鐘緩存
        ) as boolean;
      },

      /**
       * 檢查用戶是否擁有多個權限中的任意一個
       */
      checkAnyPermission: (permissions: string[]): boolean => {
        const permissionCacheKey = `${cacheKey}:any:${permissions.join(',')}`;

        return permissionCache.getOrSet(
          permissionCacheKey,
          async () => hasAnyPermission(userRole, permissions),
          2 * 60 * 1000
        ) as boolean;
      },

      /**
       * 檢查用戶是否擁有所有指定的權限
       */
      checkAllPermissions: (permissions: string[]): boolean => {
        const permissionCacheKey = `${cacheKey}:all:${permissions.join(',')}`;

        return permissionCache.getOrSet(
          permissionCacheKey,
          async () => hasAllPermissions(userRole, permissions),
          2 * 60 * 1000
        ) as boolean;
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