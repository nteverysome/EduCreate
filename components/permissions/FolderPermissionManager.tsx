/**
 * 檔案夾權限管理組件
 * 提供檔案夾權限的可視化管理界面
 */

import React, { useState, useEffect } from 'react';
import { FolderPermissionLevel, FolderPermissionAction, UserFolderPermission } from '../../lib/permissions/FolderPermissionManager';

interface FolderPermissionManagerProps {
  folderId: string;
  currentUserId: string;
  onPermissionChange?: (permissions: UserFolderPermission[]) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const FolderPermissionManager = ({
  folderId,
  currentUserId,
  onPermissionChange
}: FolderPermissionManagerProps) => {
  const [permissions, setPermissions] = useState<UserFolderPermission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPermissionLevel, setSelectedPermissionLevel] = useState<FolderPermissionLevel>(FolderPermissionLevel.VIEW);
  const [expiresAt, setExpiresAt] = useState<string>('');

  // 載入權限列表
  useEffect(() => {
    loadPermissions();
    loadUsers();
  }, [folderId]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/folders/${folderId}/permissions`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
        onPermissionChange?.(data);
      } else {
        setError('載入權限失敗');
      }
    } catch (err) {
      setError('載入權限時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users/search');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('載入用戶列表失敗:', err);
    }
  };

  // 授予權限
  const grantPermission = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/folders/${folderId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser,
          permissionLevel: selectedPermissionLevel,
          expiresAt: expiresAt ? new Date(expiresAt) : null
        })
      });

      if (response.ok) {
        await loadPermissions();
        setShowAddUser(false);
        setSelectedUser('');
        setExpiresAt('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || '授予權限失敗');
      }
    } catch (err) {
      setError('授予權限時發生錯誤');
    }
  };

  // 撤銷權限
  const revokePermission = async (userId: string) => {
    try {
      const response = await fetch(`/api/folders/${folderId}/permissions/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadPermissions();
      } else {
        const errorData = await response.json();
        setError(errorData.message || '撤銷權限失敗');
      }
    } catch (err) {
      setError('撤銷權限時發生錯誤');
    }
  };

  // 更新權限級別
  const updatePermissionLevel = async (userId: string, newLevel: FolderPermissionLevel) => {
    try {
      const response = await fetch(`/api/folders/${folderId}/permissions/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissionLevel: newLevel
        })
      });

      if (response.ok) {
        await loadPermissions();
      } else {
        const errorData = await response.json();
        setError(errorData.message || '更新權限失敗');
      }
    } catch (err) {
      setError('更新權限時發生錯誤');
    }
  };

  // 權限級別顯示名稱
  const getPermissionLevelName = (level: FolderPermissionLevel): string => {
    switch (level) {
      case FolderPermissionLevel.VIEW:
        return '查看';
      case FolderPermissionLevel.EDIT:
        return '編輯';
      case FolderPermissionLevel.SHARE:
        return '分享';
      case FolderPermissionLevel.MANAGE:
        return '管理';
      default:
        return '無權限';
    }
  };

  // 權限級別顏色
  const getPermissionLevelColor = (level: FolderPermissionLevel): string => {
    switch (level) {
      case FolderPermissionLevel.VIEW:
        return 'bg-blue-100 text-blue-800';
      case FolderPermissionLevel.EDIT:
        return 'bg-green-100 text-green-800';
      case FolderPermissionLevel.SHARE:
        return 'bg-yellow-100 text-yellow-800';
      case FolderPermissionLevel.MANAGE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">檔案夾權限管理</h3>
        <button
          onClick={() => setShowAddUser(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加用戶
        </button>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            關閉
          </button>
        </div>
      )}

      {/* 權限列表 */}
      <div className="space-y-4">
        {permissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            尚未設置任何權限
          </div>
        ) : (
          permissions.map((permission) => (
            <div
              key={permission.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {permission.userId.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    用戶 {permission.userId}
                  </div>
                  <div className="text-sm text-gray-500">
                    授予時間: {new Date(permission.grantedAt).toLocaleDateString('zh-TW')}
                    {permission.expiresAt && (
                      <span className="ml-2">
                        過期時間: {new Date(permission.expiresAt).toLocaleDateString('zh-TW')}
                      </span>
                    )}
                  </div>
                  {permission.inheritedFrom && (
                    <div className="text-xs text-blue-600">
                      繼承自父檔案夾
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* 權限級別選擇器 */}
                <select
                  value={permission.permissionLevel}
                  onChange={(e) => updatePermissionLevel(permission.userId, e.target.value as FolderPermissionLevel)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  disabled={permission.inheritedFrom !== undefined}
                >
                  <option value={FolderPermissionLevel.VIEW}>查看</option>
                  <option value={FolderPermissionLevel.EDIT}>編輯</option>
                  <option value={FolderPermissionLevel.SHARE}>分享</option>
                  <option value={FolderPermissionLevel.MANAGE}>管理</option>
                </select>

                {/* 權限級別標籤 */}
                <span className={`px-2 py-1 text-xs rounded-full ${getPermissionLevelColor(permission.permissionLevel)}`}>
                  {getPermissionLevelName(permission.permissionLevel)}
                </span>

                {/* 撤銷按鈕 */}
                {!permission.inheritedFrom && (
                  <button
                    onClick={() => revokePermission(permission.userId)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                  >
                    撤銷
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加用戶對話框 */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">添加用戶權限</h4>
            
            <div className="space-y-4">
              {/* 用戶選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇用戶
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">請選擇用戶</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* 權限級別選擇 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  權限級別
                </label>
                <select
                  value={selectedPermissionLevel}
                  onChange={(e) => setSelectedPermissionLevel(e.target.value as FolderPermissionLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={FolderPermissionLevel.VIEW}>查看</option>
                  <option value={FolderPermissionLevel.EDIT}>編輯</option>
                  <option value={FolderPermissionLevel.SHARE}>分享</option>
                  <option value={FolderPermissionLevel.MANAGE}>管理</option>
                </select>
              </div>

              {/* 過期時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  過期時間（可選）
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={grantPermission}
                disabled={!selectedUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                授予權限
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderPermissionManager;
