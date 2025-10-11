/**
 * 重定向頁面：將 /universal-game 重定向到 /create
 * 保持向後兼容性
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UniversalGameRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 立即重定向到 /create 頁面
    router.replace('/create');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在重定向到創建活動頁面...</p>
      </div>
    </div>
  );
}



