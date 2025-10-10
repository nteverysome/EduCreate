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
    id: 'my-activities',
    label: '我的活動',
    href: '/my-activities',
    icon: '📋',
    description: '完整的活動管理系統',
    category: 'main',
    status: 'available',
    testId: 'nav-my-activities'
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
    id: 'activity-templates',
    label: '活動模板和快速創建',
    href: '/activities/templates',
    icon: '🚀',
    description: '基於GEPT分級的活動模板，一鍵快速創建25種記憶科學遊戲',
    category: 'tools',
    status: 'available',
    testId: 'nav-activity-templates'
  },
  {
    id: 'file-space-system',
    label: '完整檔案空間系統',
    href: '/file-space',
    icon: '📁',
    description: '嵌套檔案夾結構、權限系統、高級搜索、批量操作、智能排序等完整功能',
    category: 'files',
    status: 'available',
    testId: 'nav-file-space-system'
  },
  {
    id: 'five-games-architecture',
    label: '完整5遊戲模板架構',
    href: '/games/five-games-architecture',
    icon: '🎮',
    description: 'Match配對、Fill-in填空、Quiz測驗、Sequence順序、Flashcard閃卡等5種記憶科學遊戲',
    category: 'games',
    status: 'available',
    testId: 'nav-five-games-architecture'
  },
  {
    id: 'game-switcher',
    label: '完整遊戲切換系統',
    href: '/games/game-switcher',
    icon: '🔄',
    description: '無縫遊戲切換、智能內容適配、狀態保持恢復、50種切換模式等完整功能',
    category: 'games',
    status: 'available',
    testId: 'nav-game-switcher'
  },
  {
    id: 'share-system',
    label: '完整分享系統',
    href: '/content/share-system',
    icon: '🔗',
    description: '三層分享模式、連結管理、權限控制、社交媒體集成、嵌入代碼生成等完整功能',
    category: 'content',
    status: 'available',
    testId: 'nav-share-system'
  },
  {
    id: 'thumbnail-preview',
    label: '完整縮圖和預覽系統',
    href: '/content/thumbnail-preview',
    icon: '🖼️',
    description: '400px標準縮圖、多尺寸支持、CDN集成、懶加載、批量管理等完整功能',
    category: 'content',
    status: 'available',
    testId: 'nav-thumbnail-preview'
  },
  {
    id: 'activity-copy-template',
    label: '活動複製和模板化',
    href: '/activities/copy-template',
    icon: '📋',
    description: '智能內容適配，一鍵複製活動，創建個人化模板，跨等級內容轉換',
    category: 'tools',
    status: 'available',
    testId: 'nav-activity-copy-template'
  },
  {
    id: 'activity-history-version',
    label: '活動歷史和版本管理',
    href: '/activities/history-version',
    icon: '📜',
    description: '完整的變更追蹤、版本比較、回滾機制，協作編輯歷史記錄',
    category: 'tools',
    status: 'available',
    testId: 'nav-activity-history-version'
  },
  {
    id: 'activity-import-export',
    label: '活動導入導出功能',
    href: '/activities/import-export',
    icon: '📤',
    description: '支持多種格式的活動導入導出，批量處理，輕鬆遷移和分享',
    category: 'tools',
    status: 'available',
    testId: 'nav-activity-import-export'
  },
  {
    id: 'favorites-tags',
    label: '收藏和標籤系統',
    href: '/activities/favorites-tags',
    icon: '⭐',
    description: '自定義標籤、智能分類、收藏管理的個人化內容組織系統',
    category: 'tools',
    status: 'available',
    testId: 'nav-favorites-tags'
  },
  {
    id: 'activity-analytics',
    label: '活動統計和分析',
    href: '/activities/analytics',
    icon: '📈',
    description: '使用頻率、學習效果、時間分布的完整分析系統',
    category: 'tools',
    status: 'available',
    testId: 'nav-activity-analytics'
  },
  {
    id: 'folder-analytics',
    label: '檔案夾統計',
    href: '/demo/folder-analytics',
    icon: '📊',
    description: '檔案夾統計分析系統',
    category: 'features',
    status: 'available',
    testId: 'nav-folder-analytics'
  },

  // 統一內容編輯器核心功能
  {
    id: 'universal-content-editor',
    label: '統一內容編輯器',
    href: '/universal-game',
    icon: '📝',
    description: '一站式內容管理平台，支持25種教育遊戲',
    category: 'content',
    status: 'available',
    testId: 'nav-universal-content-editor'
  },
  {
    id: 'rich-text-editor',
    label: '富文本編輯器',
    href: '/content/rich-text-editor',
    icon: '✏️',
    description: '完整的富文本編輯功能，支持格式化、表格、列表',
    category: 'content',
    status: 'available',
    testId: 'nav-rich-text-editor'
  },
  {
    id: 'multimedia-system',
    label: '多媒體支持',
    href: '/content/multimedia',
    icon: '🎬',
    description: '圖片、音頻、視頻和動畫的完整多媒體支持',
    category: 'content',
    status: 'available',
    testId: 'nav-multimedia-system'
  },
  {
    id: 'voice-recording-system',
    label: '語音錄製',
    href: '/content/voice-recording',
    icon: '🎤',
    description: '語音錄製、播放、語音識別和語音合成',
    category: 'content',
    status: 'available',
    testId: 'nav-voice-recording-system'
  },
  {
    id: 'gept-templates-system',
    label: 'GEPT分級系統',
    href: '/content/gept-templates',
    icon: '📚',
    description: 'GEPT分級模板管理、內容驗證和詞彙瀏覽',
    category: 'content',
    status: 'available',
    testId: 'nav-gept-templates-system'
  },
  {
    id: 'realtime-collaboration-system',
    label: '實時協作',
    href: '/content/realtime-collaboration',
    icon: '👥',
    description: '多用戶同時編輯、版本歷史、變更追蹤',
    category: 'content',
    status: 'available',
    testId: 'nav-realtime-collaboration-system'
  },
  {
    id: 'ai-content-generation-system',
    label: 'AI內容生成',
    href: '/content/ai-content-generation',
    icon: '🤖',
    description: '基於記憶科學原理的AI內容生成和翻譯',
    category: 'content',
    status: 'available',
    testId: 'nav-ai-content-generation-system'
  },
  {
    id: 'auto-save',
    label: '自動保存系統',
    href: '/content/autosave',
    icon: '💾',
    description: '2秒間隔自動保存，支援離線和衝突解決',
    category: 'content',
    status: 'available',
    testId: 'nav-auto-save'
  },

  // 工具功能
  {
    id: 'intelligent-search',
    label: '智能搜索系統',
    href: '/activities/intelligent-search',
    icon: '🔍',
    description: '全文搜索、模糊匹配、語義搜索、語音搜索的完整搜索功能',
    category: 'tools',
    status: 'available',
    testId: 'nav-intelligent-search'
  },
  {
    id: 'batch-operations',
    label: '批量操作系統',
    href: '/activities/batch-operations',
    icon: '🔄',
    description: '選擇、移動、複製、刪除、分享、標籤、導出的批量操作功能',
    category: 'tools',
    status: 'available',
    testId: 'nav-batch-operations'
  },
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

const UnifiedNavigation = ({
  variant = 'header',
  showCategories = false,
  className = ''
}: UnifiedNavigationProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showContentDropdown, setShowContentDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [demoSession, setDemoSession] = useState<any>(null);

  const { data: session, status } = useSession();

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
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // 獲取可用功能數量
  const availableCount = navigationItems.filter(item => item.status === 'available').length;
  const totalCount = navigationItems.length;

  // 獲取內容編輯器相關功能
  const contentEditorItems = navigationItems.filter(item =>
    item.category === 'content' && item.status === 'available'
  );

  // 獲取主要導航項目（排除內容編輯器子功能）
  const mainNavItems = navigationItems.filter(item =>
    item.category === 'main' ||
    (item.category === 'content' && item.id === 'universal-content-editor')
  );

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
                href="/universal-game"
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

              {/* 原有的導航項目（簡化版） */}
              {mainNavItems.filter(item => item.id === 'universal-content-editor').map(item => {
                // 統一內容編輯器特殊處理 - 添加下拉菜單
                if (item.id === 'universal-content-editor') {
                  return (
                    <div key={item.id} className="relative">
                      <button
                        onMouseEnter={() => setShowContentDropdown(true)}
                        onMouseLeave={() => setShowContentDropdown(false)}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                        data-testid={item.testId}
                      >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* 下拉菜單 */}
                      {showContentDropdown && (
                        <div
                          className="absolute top-full left-0 mt-1 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                          onMouseEnter={() => setShowContentDropdown(true)}
                          onMouseLeave={() => setShowContentDropdown(false)}
                          data-testid="content-editor-dropdown"
                        >
                          <div className="p-4">
                            <div className="text-sm font-medium text-gray-900 mb-3">內容編輯器功能</div>
                            <div className="grid grid-cols-2 gap-2">
                              {contentEditorItems.map(subItem => (
                                <Link
                                  key={subItem.id}
                                  href={subItem.href}
                                  className="flex items-center p-2 rounded-md text-sm hover:bg-gray-50 transition-colors"
                                  data-testid={`dropdown-${subItem.testId}`}
                                >
                                  <span className="mr-2 text-base">{subItem.icon}</span>
                                  <div>
                                    <div className="font-medium text-gray-900">{subItem.label}</div>
                                    <div className="text-xs text-gray-500 line-clamp-2">{subItem.description}</div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <Link
                                href="/content/universal-editor"
                                className="flex items-center justify-center w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                data-testid="view-all-content-features"
                              >
                                查看所有功能
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // 其他導航項目正常處理
                return (
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
                );
              })}

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

                {/* 用戶操作 */}
                {currentUser ? (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
                    >
                      <span className="mr-3">🚪</span>
                      <div>登出</div>
                    </button>
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
