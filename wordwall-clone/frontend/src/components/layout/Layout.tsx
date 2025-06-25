import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

/**
 * 主佈局組件
 * 
 * 提供應用的主要佈局結構：
 * - 頂部導航欄
 * - 側邊欄（登入用戶）
 * - 主內容區域
 * - 底部
 */
const Layout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航欄 */}
      <Header />

      <div className="flex">
        {/* 側邊欄 - 僅登入用戶顯示 */}
        {isAuthenticated && (
          <>
            {/* 桌面版側邊欄 */}
            <div className="hidden lg:flex lg:flex-shrink-0">
              <div className="flex flex-col w-64">
                <Sidebar />
              </div>
            </div>

            {/* 移動版側邊欄遮罩 */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                <div className="relative flex flex-col max-w-xs w-full bg-white shadow-xl">
                  <Sidebar />
                </div>
              </div>
            )}
          </>
        )}

        {/* 主內容區域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          </main>

          {/* 底部 */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
