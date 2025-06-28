/**
 * 儀表板導航頁面
 * 提供所有儀表板的統一入口
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  features: string[];
  status: 'available' | 'beta' | 'coming-soon';
}

export default function DashboardsPage() {
  const dashboards: DashboardCard[] = [
    {
      id: 'analytics',
      title: '學習分析儀表板',
      description: '深入了解學習進度、行為模式和個性化洞察',
      icon: '📊',
      href: '/analytics-dashboard',
      color: 'from-blue-500 to-blue-600',
      features: ['學習進度追蹤', '行為分析', '個性化建議', '技能評估'],
      status: 'available'
    },
    {
      id: 'admin',
      title: '企業管理儀表板',
      description: '管理組織、用戶、權限和企業級功能',
      icon: '🏢',
      href: '/admin-dashboard',
      color: 'from-purple-500 to-purple-600',
      features: ['組織管理', '用戶管理', '權限控制', '統計報告'],
      status: 'available'
    },
    {
      id: 'performance',
      title: '性能監控儀表板',
      description: '實時監控系統性能、健康狀況和警報',
      icon: '📈',
      href: '/performance-dashboard',
      color: 'from-green-500 to-green-600',
      features: ['性能指標', '系統健康', '錯誤追蹤', '實時警報'],
      status: 'available'
    },
    {
      id: 'comprehensive',
      title: '綜合測試儀表板',
      description: '全面測試所有功能模塊的可用性和性能',
      icon: '🧪',
      href: '/comprehensive-test',
      color: 'from-orange-500 to-orange-600',
      features: ['功能測試', '性能測試', '兼容性測試', '自動化測試'],
      status: 'available'
    },
    {
      id: 'api-test',
      title: 'API 測試儀表板',
      description: '測試和驗證所有 API 端點的功能',
      icon: '🔗',
      href: '/api-test',
      color: 'from-indigo-500 to-indigo-600',
      features: ['API 測試', '響應驗證', '錯誤檢測', '性能測量'],
      status: 'available'
    },
    {
      id: 'content',
      title: '內容管理儀表板',
      description: '管理教學內容、模板和資源庫',
      icon: '📚',
      href: '/content-dashboard',
      color: 'from-teal-500 to-teal-600',
      features: ['內容創建', '模板管理', '資源庫', 'AI 生成'],
      status: 'beta'
    },
    {
      id: 'social',
      title: '社交協作儀表板',
      description: '管理用戶互動、協作和社區功能',
      icon: '👥',
      href: '/social-dashboard',
      color: 'from-pink-500 to-pink-600',
      features: ['用戶互動', '協作工具', '社區管理', '分享功能'],
      status: 'coming-soon'
    },
    {
      id: 'ai',
      title: 'AI 功能儀表板',
      description: '管理和配置所有 AI 驅動的功能',
      icon: '🤖',
      href: '/ai-dashboard',
      color: 'from-red-500 to-red-600',
      features: ['AI 配置', '模型管理', '智能分析', '自動化流程'],
      status: 'coming-soon'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'beta':
        return 'bg-yellow-100 text-yellow-800';
      case 'coming-soon':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '可用';
      case 'beta':
        return '測試版';
      case 'coming-soon':
        return '即將推出';
      default:
        return '未知';
    }
  };

  const availableDashboards = dashboards.filter(d => d.status === 'available');
  const betaDashboards = dashboards.filter(d => d.status === 'beta');
  const comingSoonDashboards = dashboards.filter(d => d.status === 'coming-soon');

  return (
    <>
      <Head>
        <title>儀表板中心 | EduCreate</title>
        <meta name="description" content="EduCreate 儀表板中心 - 統一管理所有功能儀表板" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 頭部 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">🎛️ 儀表板中心</h1>
                <p className="mt-2 text-xl text-gray-600">統一管理和訪問所有功能儀表板</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                  ← 返回首頁
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 統計概覽 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <span className="text-green-600 font-semibold">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">可用儀表板</p>
                  <p className="text-2xl font-semibold text-gray-900">{availableDashboards.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold">🧪</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">測試版</p>
                  <p className="text-2xl font-semibold text-gray-900">{betaDashboards.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">🚀</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">即將推出</p>
                  <p className="text-2xl font-semibold text-gray-900">{comingSoonDashboards.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">總儀表板</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboards.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 可用儀表板 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ 可用儀表板</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDashboards.map((dashboard) => (
                <Link key={dashboard.id} href={dashboard.href}>
                  <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className={`h-32 bg-gradient-to-r ${dashboard.color} rounded-t-lg flex items-center justify-center`}>
                      <span className="text-6xl">{dashboard.icon}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{dashboard.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(dashboard.status)}`}>
                          {getStatusText(dashboard.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{dashboard.description}</p>
                      <div className="space-y-1">
                        {dashboard.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-500">
                            <span className="text-green-500 mr-2">•</span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 測試版儀表板 */}
          {betaDashboards.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🧪 測試版儀表板</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {betaDashboards.map((dashboard) => (
                  <Link key={dashboard.id} href={dashboard.href}>
                    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer opacity-90">
                      <div className={`h-32 bg-gradient-to-r ${dashboard.color} rounded-t-lg flex items-center justify-center`}>
                        <span className="text-6xl">{dashboard.icon}</span>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{dashboard.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(dashboard.status)}`}>
                            {getStatusText(dashboard.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{dashboard.description}</p>
                        <div className="space-y-1">
                          {dashboard.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-500">
                              <span className="text-yellow-500 mr-2">•</span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 即將推出的儀表板 */}
          {comingSoonDashboards.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 即將推出</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comingSoonDashboards.map((dashboard) => (
                  <div key={dashboard.id} className="bg-white rounded-lg shadow-lg opacity-60 cursor-not-allowed">
                    <div className={`h-32 bg-gradient-to-r ${dashboard.color} rounded-t-lg flex items-center justify-center`}>
                      <span className="text-6xl grayscale">{dashboard.icon}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{dashboard.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(dashboard.status)}`}>
                          {getStatusText(dashboard.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{dashboard.description}</p>
                      <div className="space-y-1">
                        {dashboard.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-400">
                            <span className="text-gray-400 mr-2">•</span>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 快速操作 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 快速操作</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/comprehensive-test" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <span className="text-2xl mr-3">🧪</span>
                <div>
                  <p className="font-medium text-blue-900">運行全面測試</p>
                  <p className="text-sm text-blue-600">測試所有功能</p>
                </div>
              </Link>

              <Link href="/api-test" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-2xl mr-3">🔗</span>
                <div>
                  <p className="font-medium text-green-900">API 測試</p>
                  <p className="text-sm text-green-600">驗證 API 功能</p>
                </div>
              </Link>

              <Link href="/performance-dashboard" className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <span className="text-2xl mr-3">📈</span>
                <div>
                  <p className="font-medium text-yellow-900">性能監控</p>
                  <p className="text-sm text-yellow-600">查看系統狀態</p>
                </div>
              </Link>

              <Link href="/analytics-dashboard" className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <p className="font-medium text-purple-900">學習分析</p>
                  <p className="text-sm text-purple-600">查看學習數據</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
