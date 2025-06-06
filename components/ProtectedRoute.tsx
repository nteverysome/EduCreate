import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { usePermission } from '../hooks/usePermission';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  adminOnly?: boolean;
  premiumOnly?: boolean;
  redirectTo?: string;
}

/**
 * 保護路由組件
 * 用於限制頁面訪問，只允許具有特定權限的用戶訪問
 */
export default function ProtectedRoute({
  children,
  permission,
  requiredPermission,
  requiredPermissions,
  requireAllPermissions = false,
  adminOnly = false,
  premiumOnly = false,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  // Use permission prop as fallback for requiredPermission
  const effectivePermission = requiredPermission || permission;
  const { data: session, status } = useSession();
  const router = useRouter();
  const { 
    checkPermission, 
    checkAnyPermission, 
    checkAllPermissions,
    isAdmin,
    isPremiumUser
  } = usePermission();

  useEffect(() => {
    // 如果用戶未登入，重定向到登入頁面
    if (status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    // 如果用戶已登入但仍在加載中，不做任何操作
    if (status === 'loading') {
      return;
    }

    // 檢查是否需要管理員權限
    if (adminOnly && !isAdmin()) {
      router.push('/');
      return;
    }

    // 檢查是否需要高級用戶權限
    if (premiumOnly && !isPremiumUser()) {
      router.push('/pricing');
      return;
    }

    // 檢查單一權限
    if (effectivePermission && !checkPermission(effectivePermission)) {
      router.push('/');
      return;
    }

    // 檢查多個權限
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermissions = requireAllPermissions
        ? checkAllPermissions(requiredPermissions)
        : checkAnyPermission(requiredPermissions);

      if (!hasPermissions) {
        router.push('/');
        return;
      }
    }
  }, [status, router, effectivePermission, requiredPermissions, requireAllPermissions, adminOnly, premiumOnly, redirectTo, checkPermission, checkAnyPermission, checkAllPermissions, isAdmin, isPremiumUser]);

  // 如果用戶未登入或正在加載中，顯示加載狀態
  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="flex justify-center items-center min-h-screen">加載中...</div>;
  }

  // 如果用戶已登入且具有所需權限，顯示子組件
  return <>{children}</>;
}