/**
 * 企業級組織管理儀表板
 * 提供組織管理、用戶管理、權限控制等功能
 */

import React, { useState, useEffect } from 'react';
import { 
  OrganizationManager,
  Organization,
  User,
  Department,
  Role,
  BulkOperation 
} from '../../lib/enterprise/OrganizationManager';

interface OrganizationDashboardProps {
  organizationId: string;
  currentUserId: string;
}

export default function OrganizationDashboard({
  organizationId,
  currentUserId
}: OrganizationDashboardProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);

  // 載入組織數據
  useEffect(() => {
    loadOrganizationData();
  }, [organizationId]);

  const loadOrganizationData = async () => {
    setLoading(true);
    
    try {
      const org = OrganizationManager.getOrganization(organizationId);
      const orgUsers = OrganizationManager.getOrganizationUsers(organizationId);
      const orgDepartments = OrganizationManager.getOrganizationDepartments(organizationId);
      const orgRoles = OrganizationManager.getOrganizationRoles(organizationId);
      const orgStats = OrganizationManager.getOrganizationStats(organizationId);

      setOrganization(org);
      setUsers(orgUsers);
      setDepartments(orgDepartments);
      setRoles(orgRoles);
      setStats(orgStats);
    } catch (error) {
      console.error('載入組織數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: '概覽', icon: '📊' },
    { id: 'users', name: '用戶管理', icon: '👥' },
    { id: 'departments', name: '部門管理', icon: '🏢' },
    { id: 'roles', name: '角色權限', icon: '🔐' },
    { id: 'settings', name: '組織設置', icon: '⚙️' },
    { id: 'billing', name: '訂閱計費', icon: '💳' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-gray-400 text-4xl mb-2">🏢</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">組織不存在</h3>
        <p className="text-gray-600">請檢查組織 ID 或聯繫管理員</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 頭部 */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{organization.name}</h1>
            <p className="text-blue-100 mt-1">
              {organization.type} • {organization.status} • {organization.subscription.plan}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">組織 ID</div>
            <div className="font-mono text-sm">{organization.id}</div>
          </div>
        </div>
      </div>

      {/* 標籤導航 */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="p-6">
        {/* 概覽標籤 */}
        {activeTab === 'overview' && (
          <div>
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="總用戶數"
                value={stats?.totalUsers || 0}
                icon="👥"
                color="blue"
                subtitle={`${stats?.activeUsers || 0} 活躍用戶`}
              />
              <StatCard
                title="部門數量"
                value={stats?.totalDepartments || 0}
                icon="🏢"
                color="green"
              />
              <StatCard
                title="存儲使用"
                value={`${Math.round((stats?.storageUsed || 0) / 1024)}GB`}
                icon="💾"
                color="purple"
                subtitle={`/ ${Math.round(organization.settings.limits.maxStorage / 1024)}GB`}
              />
              <StatCard
                title="API 調用"
                value={stats?.apiCallsThisMonth || 0}
                icon="🔌"
                color="orange"
                subtitle={`/ ${organization.settings.limits.apiCallsPerMonth}`}
              />
            </div>

            {/* 快速操作 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <QuickActionCard
                title="添加用戶"
                description="邀請新用戶加入組織"
                icon="➕"
                onClick={() => setShowUserModal(true)}
              />
              <QuickActionCard
                title="批量導入"
                description="批量導入用戶數據"
                icon="📤"
                onClick={() => setShowBulkImport(true)}
              />
              <QuickActionCard
                title="生成報告"
                description="生成組織使用報告"
                icon="📊"
                onClick={() => {}}
              />
            </div>

            {/* 最近活動 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活動</h3>
              <div className="space-y-3">
                <ActivityItem
                  type="user_created"
                  message="新用戶 john.doe@example.com 已加入組織"
                  timestamp={new Date()}
                />
                <ActivityItem
                  type="department_created"
                  message="創建了新部門：工程部"
                  timestamp={new Date(Date.now() - 3600000)}
                />
                <ActivityItem
                  type="role_updated"
                  message="更新了角色權限：教師"
                  timestamp={new Date(Date.now() - 7200000)}
                />
              </div>
            </div>
          </div>
        )}

        {/* 用戶管理標籤 */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">用戶管理</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  批量導入
                </button>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加用戶
                </button>
              </div>
            </div>

            {/* 用戶列表 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用戶
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      部門
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最後登錄
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.departmentId ? 
                          departments.find(d => d.id === user.departmentId)?.name || '未知部門' : 
                          '無部門'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(roleId => {
                            const role = roles.find(r => r.id === roleId);
                            return role ? (
                              <span key={roleId} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                {role.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : '從未登錄'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">編輯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 部門管理標籤 */}
        {activeTab === 'departments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">部門管理</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                創建部門
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department) => (
                <DepartmentCard key={department.id} department={department} users={users} />
              ))}
            </div>
          </div>
        )}

        {/* 角色權限標籤 */}
        {activeTab === 'roles' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">角色權限管理</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                創建角色
              </button>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </div>
          </div>
        )}

        {/* 組織設置標籤 */}
        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">組織設置</h3>
            <div className="space-y-6">
              <SettingsSection
                title="基本信息"
                description="組織的基本信息設置"
                organization={organization}
              />
              <SettingsSection
                title="安全設置"
                description="密碼策略和安全配置"
                organization={organization}
              />
              <SettingsSection
                title="功能設置"
                description="啟用或禁用組織功能"
                organization={organization}
              />
            </div>
          </div>
        )}

        {/* 訂閱計費標籤 */}
        {activeTab === 'billing' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">訂閱與計費</h3>
            <BillingSection organization={organization} />
          </div>
        )}
      </div>
    </div>
  );
}

// 統計卡片組件
function StatCard({ title, value, icon, color, subtitle }: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} p-6 rounded-lg`}>
      <div className="flex items-center">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-75">{title}</div>
          {subtitle && <div className="text-xs opacity-60 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

// 快速操作卡片組件
function QuickActionCard({ title, description, icon, onClick }: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

// 活動項目組件
function ActivityItem({ type, message, timestamp }: {
  type: string;
  message: string;
  timestamp: Date;
}) {
  const typeIcons = {
    user_created: '👤',
    department_created: '🏢',
    role_updated: '🔐'
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="text-lg">{typeIcons[type as keyof typeof typeIcons] || '📝'}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500">{timestamp.toLocaleString()}</p>
      </div>
    </div>
  );
}

// 部門卡片組件
function DepartmentCard({ department, users }: { department: Department; users: User[] }) {
  const departmentUsers = users.filter(u => u.departmentId === department.id);
  const manager = users.find(u => u.id === department.managerId);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-medium text-gray-900 mb-2">{department.name}</h4>
      <div className="text-sm text-gray-600 space-y-1">
        <div>經理: {manager ? `${manager.firstName} ${manager.lastName}` : '未指定'}</div>
        <div>成員: {departmentUsers.length} 人</div>
        <div>創建時間: {department.createdAt.toLocaleDateString()}</div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button className="text-blue-600 hover:text-blue-900 text-sm">編輯</button>
        <button className="text-red-600 hover:text-red-900 text-sm">刪除</button>
      </div>
    </div>
  );
}

// 角色卡片組件
function RoleCard({ role }: { role: Role }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-gray-900">{role.name}</h4>
          <p className="text-sm text-gray-600">{role.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            role.type === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {role.type}
          </span>
          <span className="text-sm text-gray-500">級別 {role.level}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">權限 ({role.permissions.length})</div>
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map((permission, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              {permission.action}:{permission.resource}
            </span>
          ))}
          {role.permissions.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              +{role.permissions.length - 3}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <button className="text-blue-600 hover:text-blue-900 text-sm">編輯</button>
        {role.type === 'custom' && (
          <button className="text-red-600 hover:text-red-900 text-sm">刪除</button>
        )}
      </div>
    </div>
  );
}

// 設置區塊組件
function SettingsSection({ title, description, organization }: {
  title: string;
  description: string;
  organization: Organization;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="text-center py-8 text-gray-500">
        <div className="text-3xl mb-2">🚧</div>
        <div className="text-sm">設置功能開發中</div>
      </div>
    </div>
  );
}

// 計費區塊組件
function BillingSection({ organization }: { organization: Organization }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">當前訂閱</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-600">方案</div>
            <div className="text-lg font-medium capitalize">{organization.subscription.plan}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">狀態</div>
            <div className={`text-lg font-medium ${
              organization.subscription.status === 'active' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {organization.subscription.status}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">到期日期</div>
            <div className="text-lg font-medium">{organization.subscription.endDate.toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">價格</div>
            <div className="text-lg font-medium">
              ${organization.subscription.price}/{organization.subscription.billingCycle}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">使用限制</h4>
        <div className="space-y-4">
          <LimitBar
            label="用戶數量"
            current={organization.settings.limits.maxUsers}
            max={organization.settings.limits.maxUsers}
          />
          <LimitBar
            label="活動數量"
            current={500}
            max={organization.settings.limits.maxActivities}
          />
          <LimitBar
            label="存儲空間"
            current={2048}
            max={organization.settings.limits.maxStorage}
            unit="MB"
          />
        </div>
      </div>
    </div>
  );
}

// 限制條組件
function LimitBar({ label, current, max, unit = '' }: {
  label: string;
  current: number;
  max: number;
  unit?: string;
}) {
  const percentage = (current / max) * 100;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{current}{unit} / {max}{unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            percentage > 90 ? 'bg-red-500' : 
            percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
