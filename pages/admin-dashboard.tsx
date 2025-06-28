/**
 * 企業管理儀表板
 * 提供完整的企業級管理功能
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'pro' | 'enterprise';
  userLimit: number;
  features: string[];
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'teacher' | 'student';
  organizationId: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface DashboardStats {
  overview: {
    totalOrganizations: number;
    totalUsers: number;
    activeUsers: number;
    totalPermissions: number;
  };
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
  organizationsByPlan: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');

  // 加載儀表板數據
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 加載統計數據
      const statsResponse = await fetch('/api/admin/enterprise?action=dashboard');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.dashboard);
      }

      // 加載組織數據
      const orgsResponse = await fetch('/api/admin/enterprise?action=organizations');
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        setOrganizations(orgsData.data || []);
      }

      // 加載用戶數據
      const usersResponse = await fetch('/api/admin/enterprise?action=users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
      }
    } catch (error) {
      console.error('加載管理數據失敗:', error);
      // 使用模擬數據
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  // 生成模擬數據
  const generateMockData = () => {
    const mockStats: DashboardStats = {
      overview: {
        totalOrganizations: 12,
        totalUsers: 1247,
        activeUsers: 892,
        totalPermissions: 15
      },
      usersByRole: {
        admin: 8,
        manager: 24,
        teacher: 156,
        student: 1059
      },
      usersByStatus: {
        active: 892,
        inactive: 298,
        suspended: 57
      },
      organizationsByPlan: {
        free: 6,
        pro: 4,
        enterprise: 2
      }
    };

    const mockOrgs: Organization[] = [
      {
        id: 'org-1',
        name: '示範學校',
        domain: 'demo-school.edu',
        plan: 'enterprise',
        userLimit: 1000,
        features: ['analytics', 'sso', 'custom_branding', 'api_access'],
        createdAt: '2024-01-15'
      },
      {
        id: 'org-2',
        name: '科技大學',
        domain: 'tech-university.edu',
        plan: 'pro',
        userLimit: 500,
        features: ['analytics', 'api_access'],
        createdAt: '2024-02-01'
      }
    ];

    const mockUsers: User[] = [
      {
        id: 'user-1',
        email: 'admin@demo-school.edu',
        name: '系統管理員',
        role: 'admin',
        organizationId: 'org-1',
        lastActive: '2024-01-20T10:30:00Z',
        status: 'active'
      },
      {
        id: 'user-2',
        email: 'teacher@demo-school.edu',
        name: '張老師',
        role: 'teacher',
        organizationId: 'org-1',
        lastActive: '2024-01-20T09:15:00Z',
        status: 'active'
      }
    ];

    setStats(mockStats);
    setOrganizations(mockOrgs);
    setUsers(mockUsers);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加載管理數據中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>企業管理儀表板 | EduCreate</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 頭部 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🏢 企業管理儀表板</h1>
                <p className="mt-1 text-gray-600">管理組織、用戶和權限</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="all">所有組織</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
                <button
                  onClick={loadDashboardData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  刷新數據
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 標籤導航 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: '總覽', icon: '📊' },
                { id: 'organizations', name: '組織', icon: '🏢' },
                { id: 'users', name: '用戶', icon: '👥' },
                { id: 'permissions', name: '權限', icon: '🔐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 主要內容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && stats && (
            <div className="space-y-8">
              {/* 統計卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">🏢</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">總組織數</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalOrganizations}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                        <span className="text-green-600 font-semibold">👥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">總用戶數</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                        <span className="text-yellow-600 font-semibold">🔥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">活躍用戶</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.overview.activeUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">🔐</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">權限類型</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalPermissions}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 分布圖表 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 用戶角色分布 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 用戶角色分布</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.usersByRole).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(role)}`}>
                          {role === 'admin' ? '管理員' :
                           role === 'manager' ? '經理' :
                           role === 'teacher' ? '教師' : '學生'}
                        </span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 用戶狀態分布 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 用戶狀態分布</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.usersByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                          {status === 'active' ? '活躍' :
                           status === 'inactive' ? '非活躍' : '暫停'}
                        </span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 組織計劃分布 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💼 組織計劃分布</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.organizationsByPlan).map(([plan, count]) => (
                      <div key={plan} className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanColor(plan)}`}>
                          {plan === 'enterprise' ? '企業版' :
                           plan === 'pro' ? '專業版' : '免費版'}
                        </span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organizations' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">🏢 組織管理</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  添加組織
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        組織
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        域名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        計劃
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        用戶限制
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        創建時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {organizations.map((org) => (
                      <tr key={org.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{org.domain}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPlanColor(org.plan)}`}>
                            {org.plan === 'enterprise' ? '企業版' :
                             org.plan === 'pro' ? '專業版' : '免費版'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {org.userLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(org.createdAt).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">編輯</button>
                          <button className="text-red-600 hover:text-red-900">刪除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">👥 用戶管理</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  邀請用戶
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        用戶
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        角色
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        狀態
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        最後活動
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role === 'admin' ? '管理員' :
                             user.role === 'manager' ? '經理' :
                             user.role === 'teacher' ? '教師' : '學生'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? '活躍' :
                             user.status === 'inactive' ? '非活躍' : '暫停'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.lastActive).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">編輯</button>
                          <button className="text-red-600 hover:text-red-900">暫停</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">🔐 權限管理</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { category: 'content', name: '內容管理', permissions: ['查看', '編輯', '刪除', '發布'] },
                  { category: 'user', name: '用戶管理', permissions: ['查看用戶', '編輯用戶', '邀請用戶', '刪除用戶'] },
                  { category: 'analytics', name: '數據分析', permissions: ['查看報告', '導出數據', '配置指標'] },
                  { category: 'system', name: '系統管理', permissions: ['系統設置', '備份恢復', '日誌查看'] }
                ].map((group) => (
                  <div key={group.category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{group.name}</h4>
                    <div className="space-y-2">
                      {group.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            defaultChecked={index < 2}
                          />
                          <label className="ml-2 text-sm text-gray-700">{permission}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  保存權限設置
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
