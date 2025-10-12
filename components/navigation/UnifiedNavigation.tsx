/**
 * EduCreate 統一導航系統
 * 連接所有已實現功能的統一導航組件
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  description: string;
  category: 'main' | 'features' | 'tools' | 'content' | 'files' | 'games';
  status: 'available' | 'coming-soon';
  testId: string;
}

// 簡化版導航項目 - 根據 MASSIVE_HOMEPAGE_CLEANUP_COMPLETE_REPORT.md 只保留核心功能
const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: '首頁',
    href: '/',
    icon: '🏠',
    description: 'EduCreate 主頁',
    category: 'main',
    status: 'available',
    testId: 'nav-home'
  },
  {
    id: 'my-activities',
    label: '我的活動',
    href: '/my-activities',
    icon: '📋',
    description: '活動管理系統',
    category: 'main',
    status: 'available',
    testId: 'nav-my-activities'
  },
  {
    id: 'create-activity',
    label: '創建活動',
    href: '/create',
    icon: '🚀',
    description: '創建記憶科學遊戲',
    category: 'main',
    status: 'available',
    testId: 'nav-create-activity'
  },
  {
    id: 'dashboard',
    label: '功能儀表板',
    href: '/dashboard',
    icon: '📊',
    description: '功能統一入口',
    category: 'main',
    status: 'available',
    testId: 'nav-dashboard'
  }
];

const categoryLabels = {
  main: '主要功能'
};

interface UnifiedNavigationProps {
  variant?: 'header' | 'sidebar' | 'mobile';
  showCategories?: boolean;
  className?: string;
}

const UnifiedNavigation = ({
  variant = 'header',
  showCategories = false,
  className = ''
}: UnifiedNavigationProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [demoSession, setDemoSession] = useState<any>(null);

  const { data: session } = useSession();

  // 檢查演示會話
  useEffect(() => {
    const demo = localStorage.getItem('demo-session');
    if (demo) {
      try {
        setDemoSession(JSON.parse(demo));
      } catch (error) {
        console.error('解析演示會話失敗:', error);
      }
    }
  }, []);

  const currentUser = session?.user || demoSession?.user;

  const handleLogout = () => {
    if (demoSession) {
      localStorage.removeItem('demo-session');
      setDemoSession(null);
      window.location.reload();
    } else {
      signOut();
    }
  };

  // 按類別分組導航項目
  const groupedItems = navigationItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, NavigationItem[]>);

  // 檢查是否為當前頁面
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // 簡化統計 - 現在只有4個核心功能
  const availableCount = navigationItems.length; // 全部都是可用的
  const totalCount = navigationItems.length;

  if (variant === 'header') {
    return (
      <nav className={`bg-white shadow-sm border-b ${className}`} data-testid="unified-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 左側：Logo 和標語 */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center" data-testid="nav-logo">
                <span className="text-2xl font-bold text-blue-600">EduCreate</span>
                <span className="ml-2 text-sm text-gray-500">({availableCount}/{totalCount})</span>
              </Link>
              <span className="hidden lg:block text-sm text-gray-600">更快地創建更好的課程</span>
            </div>

            {/* 中間：創建活動按鈕 */}
            <div className="hidden md:flex items-center">
              <Link
                href="/create"
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                data-testid="create-activity-button"
              >
                創建活動
              </Link>
            </div>

            {/* 右側：導航和用戶菜單 */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Wordwall 風格導航項目 */}
              <Link
                href="/community"
                className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span className="mr-1">👥</span>
                社區
              </Link>
              <Link
                href="/my-activities"
                className={`text-sm font-medium transition-colors ${
                  isActive('/my-activities')
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                我的活動
              </Link>
              <Link
                href="/my-results"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                我的結果
              </Link>

              {/* 桌面版導航 - 移除核心項目，只保留原有的固定項目 */}

              {/* Wordwall 風格用戶菜單 */}
              <div className="relative">
                {currentUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      data-testid="user-menu-button"
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-sm font-medium overflow-hidden">
                        {currentUser.image ? (
                          <img src={currentUser.image} alt="用戶頭像" className="w-full h-full object-cover" />
                        ) : (
                          currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'
                        )}
                      </div>
                      <span className="font-medium">{currentUser.name || currentUser.email || '用戶'}</span>
                      <span className="text-gray-400">▼</span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-50">
                        {/* 用戶信息頭部 */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium overflow-hidden">
                              {currentUser.image ? (
                                <img src={currentUser.image} alt="用戶頭像" className="w-full h-full object-cover" />
                              ) : (
                                currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{currentUser.name || '用戶'}</p>
                              {demoSession ? (
                                <p className="text-xs text-green-600 font-medium">演示帳戶</p>
                              ) : (
                                <p className="text-xs text-blue-600 font-medium">專業帳戶</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 菜單項目 */}
                        <div className="py-1">
                          <Link
                            href="/create"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span className="mr-3">➕</span>
                            創建活動
                          </Link>
                          <Link
                            href="/my-activities"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span className="mr-3">📋</span>
                            我的活動
                          </Link>
                          <Link
                            href="/my-results"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span className="mr-3">📊</span>
                            我的結果
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Link
                            href="/account/personal-details"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span className="mr-3">👤</span>
                            編輯個人資訊
                          </Link>
                          <Link
                            href="/account/payment"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span className="mr-3">💳</span>
                            管理付款
                          </Link>
                          <Link
                            href="/account/language"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span className="mr-3">🌐</span>
                            語言和位置
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Link
                            href="/community"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span className="mr-3">👥</span>
                            社區
                          </Link>
                          <Link
                            href="/contact"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span className="mr-3">📞</span>
                            聯繫方式
                          </Link>
                          <Link
                            href="/price-plans"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span className="mr-3">💎</span>
                            價格計劃
                          </Link>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <span className="mr-3">🚪</span>
                            登出
                          </button>
                        </div>

                        {/* 底部條款連結 */}
                        <div className="border-t border-gray-100 px-4 py-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <Link href="/terms" className="hover:text-gray-700">使用條款</Link>
                            <span>-</span>
                            <Link href="/privacy" className="hover:text-gray-700">隱私聲明</Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      data-testid="login-button"
                    >
                      登入
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      data-testid="register-button"
                    >
                      註冊
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 手機菜單按鈕 */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                data-testid="mobile-menu-button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* 手機導航菜單 */}
          {isOpen && (
            <div className="md:hidden border-t border-gray-200 py-4" data-testid="mobile-navigation-menu">
              {/* 用戶信息 */}
              {currentUser && (
                <div className="px-4 py-3 border-b border-gray-200 mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{currentUser.name || '用戶'}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                      {demoSession && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          演示模式
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 手機版選單 - 包含核心導航項目和用戶管理功能 */}

              {/* 核心導航項目 */}
              <div className="pb-2 mb-2 border-b border-gray-100">
                {navigationItems.map(item => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    data-testid={`mobile-${item.testId}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <div>{item.label}</div>
                  </Link>
                ))}
              </div>

              {/* 用戶操作 */}
              <div>
                {currentUser ? (
                  <div className="pt-2 mt-2">
                    {/* 純用戶管理功能 - 不包含導航項目 */}
                    <Link
                      href="/account/profile"
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">👤</span>
                      <div>編輯個人資訊</div>
                    </Link>
                    <Link
                      href="/account/payment"
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">💳</span>
                      <div>管理付款</div>
                    </Link>
                    <Link
                      href="/account/language"
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">🌐</span>
                      <div>語言和位置</div>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      href="/community"
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">👥</span>
                      <div>社區</div>
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">📞</span>
                      <div>聯繫方式</div>
                    </Link>
                    <Link
                      href="/pricing"
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">💎</span>
                      <div>價格計劃</div>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
                    >
                      <span className="mr-3">🚪</span>
                      <div>登出</div>
                    </button>
                    <div className="px-4 py-2">
                      <Link
                        href="/terms"
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        使用條款
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                    <Link
                      href="/login"
                      className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">🔐</span>
                      <div>登入</div>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center px-4 py-3 text-sm font-medium bg-blue-600 text-white rounded-md mx-4 hover:bg-blue-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="mr-3">✨</span>
                      <div>註冊</div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  if (variant === 'sidebar') {
    return (
      <aside className={`w-64 bg-white shadow-sm border-r ${className}`} data-testid="sidebar-navigation">
        <div className="p-6">
          <Link href="/" className="flex items-center mb-8" data-testid="sidebar-logo">
            <span className="text-xl font-bold text-blue-600">EduCreate</span>
          </Link>

          {showCategories ? (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h3>
                  <div className="space-y-1">
                    {items.map(item => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-100 text-blue-700'
                            : item.status === 'available'
                            ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        data-testid={`sidebar-${item.testId}`}
                        title={item.description}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.status === 'coming-soon' && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-1 py-0.5 rounded">
                            Soon
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {navigationItems.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : item.status === 'available'
                      ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  data-testid={`sidebar-${item.testId}`}
                  title={item.description}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.status === 'coming-soon' && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-1 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>
    );
  }

  return null;
}

// 導出導航項目供其他組件使用
export { navigationItems, type NavigationItem };
export default UnifiedNavigation;
