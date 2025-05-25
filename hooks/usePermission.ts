import { useSession } from 'next-auth/react';
import { PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permissions';

/**
 * 自定義Hook用於前端權限檢查
 * 可以檢查當前登入用戶是否擁有特定權限
 */
export function usePermission() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'USER';

  /**
   * 檢查用戶是否擁有特定權限
   * @param permission 權限名稱
   * @returns boolean
   */
  const checkPermission = (permission: string): boolean => {
    return hasPermission(userRole, permission);
  };

  /**
   * 檢查用戶是否擁有多個權限中的任意一個
   * @param permissions 權限名稱數組
   * @returns boolean
   */
  const checkAnyPermission = (permissions: string[]): boolean => {
    return hasAnyPermission(userRole, permissions);
  };

  /**
   * 檢查用戶是否擁有所有指定的權限
   * @param permissions 權限名稱數組
   * @returns boolean
   */
  const checkAllPermissions = (permissions: string[]): boolean => {
    return hasAllPermissions(userRole, permissions);
  };

  /**
   * 檢查用戶是否為管理員
   * @returns boolean
   */
  const isAdmin = (): boolean => {
    return userRole === 'ADMIN';
  };

  /**
   * 檢查用戶是否為高級用戶
   * @returns boolean
   */
  const isPremiumUser = (): boolean => {
    return userRole === 'PREMIUM_USER' || userRole === 'ADMIN';
  };

  /**
   * 檢查用戶是否為教師
   * @returns boolean
   */
  const isTeacher = (): boolean => {
    return userRole === 'TEACHER' || userRole === 'ADMIN';
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    isAdmin,
    isPremiumUser,
    isTeacher,
    PERMISSIONS,
    userRole,
  };
}