import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Button, SearchInput } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

/**
 * 頂部導航欄組件
 * 
 * 功能：
 * - Logo 和品牌名稱
 * - 搜索功能
 * - 用戶菜單
 * - 移動端菜單切換
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側：Logo 和菜單 */}
          <div className="flex items-center">
            {/* 移動端菜單按鈕 */}
            {isAuthenticated && (
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center ml-4 lg:ml-0">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                  Wordwall Clone
                </span>
              </div>
            </Link>
          </div>

          {/* 中間：搜索框 */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <SearchInput
              placeholder="搜索活動、模板..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          {/* 右側：用戶菜單或登入按鈕 */}
          <div className="flex items-center space-x-4">
            {/* 移動端搜索按鈕 */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => {/* 打開搜索模態框 */}}
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {isAuthenticated ? (
              /* 已登入用戶菜單 */
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.displayName}
                  </span>
                </button>

                {/* 用戶下拉菜單 */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserCircleIcon className="h-4 w-4 mr-2" />
                      個人資料
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-2" />
                      設置
                    </Link>
                    <hr className="my-1" />
                    <button
                      type="button"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      登出
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 未登入用戶按鈕 */
              <div className="flex items-center space-x-3">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    登入
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="primary" size="sm">
                    註冊
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移動端搜索欄 */}
      <div className="md:hidden border-t border-gray-200 px-4 py-3">
        <SearchInput
          placeholder="搜索活動、模板..."
          onSearch={handleSearch}
          className="w-full"
        />
      </div>
    </header>
  );
};

export default Header;
