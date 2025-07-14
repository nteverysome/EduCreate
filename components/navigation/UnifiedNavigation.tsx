/**
 * EduCreate 統一導航系統
 * 連接所有已實現功能的統一導航組件
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  description: string;
  category: 'main' | 'features' | 'tools' | 'content';
  status: 'available' | 'coming-soon';
  testId: string;
}

const navigationItems: NavigationItem[] = [
  // 主要頁面
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
    id: 'dashboard',
    label: '功能儀表板',
    href: '/dashboard',
    icon: '📊',
    description: '所有功能的統一入口',
    category: 'main',
    status: 'available',
    testId: 'nav-dashboard'
  },

  // 已實現功能
  {
    id: 'smart-sorting',
    label: '智能排序',
    href: '/demo/smart-sorting',
    icon: '🔄',
    description: '多維度智能排序系統',
    category: 'features',
    status: 'available',
    testId: 'nav-smart-sorting'
  },
  {
    id: 'folder-analytics',
    label: '檔案夾統計',
    href: '/demo/folder-analytics',
    icon: '📈',
    description: '檔案夾統計分析系統',
    category: 'features',
    status: 'available',
    testId: 'nav-folder-analytics'
  },

  // 內容管理功能
  {
    id: 'content-editor',
    label: '內容編輯器',
    href: '/content/editor',
    icon: '✏️',
    description: '富文本內容編輯器',
    category: 'content',
    status: 'coming-soon',
    testId: 'nav-content-editor'
  },
  {
    id: 'auto-save',
    label: '自動保存',
    href: '/content/autosave',
    icon: '💾',
    description: '自動保存管理系統',
    category: 'content',
    status: 'coming-soon',
    testId: 'nav-auto-save'
  },

  // 工具功能
  {
    id: 'file-manager',
    label: '檔案管理',
    href: '/tools/files',
    icon: '📁',
    description: '檔案空間管理系統',
    category: 'tools',
    status: 'available',
    testId: 'nav-file-manager'
  },
  {
    id: 'folder-collaboration',
    label: '檔案夾協作',
    href: '/collaboration/folders',
    icon: '🤝',
    description: '檔案夾分享和協作管理',
    category: 'tools',
    status: 'available',
    testId: 'nav-folder-collaboration'
  },
  {
    id: 'folder-templates',
    label: '檔案夾模板',
    href: '/tools/folder-templates',
    icon: '📁',
    description: '檔案夾模板系統',
    category: 'tools',
    status: 'available',
    testId: 'nav-folder-templates'
  },
  {
    id: 'folder-import-export',
    label: '檔案夾導入導出',
    href: '/tools/folder-import-export',
    icon: '🔄',
    description: '檔案夾導入導出功能',
    category: 'tools',
    status: 'available',
    testId: 'nav-folder-import-export'
  },
  {
    id: 'real-time-sync',
    label: '實時同步',
    href: '/tools/real-time-sync',
    icon: '⚡',
    description: '實時同步和衝突解決',
    category: 'tools',
    status: 'available',
    testId: 'nav-real-time-sync'
  }
];

const categoryLabels = {
  main: '主要功能',
  features: '核心功能',
  tools: '工具',
  content: '內容管理'
};

interface UnifiedNavigationProps {
  variant?: 'header' | 'sidebar' | 'mobile';
  showCategories?: boolean;
  className?: string;
}

export default function UnifiedNavigation({ 
  variant = 'header', 
  showCategories = false,
  className = '' 
}: UnifiedNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // 獲取可用功能數量
  const availableCount = navigationItems.filter(item => item.status === 'available').length;
  const totalCount = navigationItems.length;

  if (variant === 'header') {
    return (
      <nav className={`bg-white shadow-sm border-b ${className}`} data-testid="unified-navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center" data-testid="nav-logo">
                <span className="text-2xl font-bold text-blue-600">EduCreate</span>
                <span className="ml-2 text-sm text-gray-500">({availableCount}/{totalCount})</span>
              </Link>
            </div>

            {/* 桌面導航 */}
            <div className="hidden md:flex items-center space-x-6">
              {navigationItems
                .filter(item => item.category === 'main' || item.status === 'available')
                .map(item => (
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
                  data-testid={item.testId}
                  title={item.description}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                  {item.status === 'coming-soon' && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      即將推出
                    </span>
                  )}
                </Link>
              ))}
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
              <div className="space-y-2">
                {navigationItems.map(item => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                        : item.status === 'available'
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        : 'text-gray-400'
                    }`}
                    data-testid={`mobile-${item.testId}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <div className="flex-1">
                      <div>{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    {item.status === 'coming-soon' && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        即將推出
                      </span>
                    )}
                  </Link>
                ))}
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
