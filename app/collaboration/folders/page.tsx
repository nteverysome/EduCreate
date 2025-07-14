/**
 * 檔案夾分享和協作頁面
 * 三層分享模式的檔案夾協作權限系統
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import { 
  FolderCollaborationManagerImpl, 
  type FolderCollaboration, 
  type CollaborationPermission,
  type ShareSettings,
  type CollaborationInvitation,
  type CollaborationStats
} from '@/lib/collaboration/FolderCollaborationManager';

export default function FolderCollaborationPage() {
  const [collaborationManager] = useState(() => new FolderCollaborationManagerImpl());
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<CollaborationPermission[]>([]);
  const [shareSettings, setShareSettings] = useState<ShareSettings | null>(null);
  const [invitations, setInvitations] = useState<CollaborationInvitation[]>([]);
  const [stats, setStats] = useState<CollaborationStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'collaborators' | 'sharing' | 'invitations' | 'activity'>('overview');

  // 模擬檔案夾數據
  const [folders] = useState([
    { id: 'folder_1', name: '英語學習資料', itemCount: 25, collaboratorCount: 3 },
    { id: 'folder_2', name: '數學練習題', itemCount: 18, collaboratorCount: 1 },
    { id: 'folder_3', name: '科學實驗', itemCount: 12, collaboratorCount: 5 },
    { id: 'folder_4', name: '歷史資料', itemCount: 30, collaboratorCount: 2 }
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      loadFolderData(selectedFolder);
    }
  }, [selectedFolder]);

  const loadStats = async () => {
    try {
      const statsData = await collaborationManager.getCollaborationStats('current-user');
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadFolderData = async (folderId: string) => {
    try {
      const [collaboratorsData, shareData, invitationsData] = await Promise.all([
        collaborationManager.getCollaborators(folderId),
        collaborationManager.getShareSettings(folderId),
        collaborationManager.getPendingInvitations(folderId)
      ]);

      setCollaborators(collaboratorsData);
      setShareSettings(shareData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Failed to load folder data:', error);
    }
  };

  const handleCreateShare = async (shareType: ShareSettings['shareType']) => {
    if (!selectedFolder) return;

    try {
      const newShareSettings = await collaborationManager.createShare(selectedFolder, {
        shareType,
        allowDownload: true,
        allowCopy: true,
        trackAccess: true
      });
      setShareSettings(newShareSettings);
    } catch (error) {
      console.error('Failed to create share:', error);
    }
  };

  const handleAddCollaborator = async (email: string, role: CollaborationPermission['role']) => {
    if (!selectedFolder) return;

    try {
      await collaborationManager.addCollaborator(selectedFolder, {
        userId: `user_${Date.now()}`,
        userName: email.split('@')[0],
        userEmail: email,
        role,
        grantedBy: 'current-user'
      });
      await loadFolderData(selectedFolder);
    } catch (error) {
      console.error('Failed to add collaborator:', error);
    }
  };

  const handleSendInvitation = async (email: string, role: CollaborationPermission['role']) => {
    if (!selectedFolder) return;

    const folder = folders.find(f => f.id === selectedFolder);
    if (!folder) return;

    try {
      await collaborationManager.sendInvitation({
        folderId: selectedFolder,
        folderName: folder.name,
        inviterName: 'Current User',
        inviteeEmail: email,
        role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天後過期
      });
      await loadFolderData(selectedFolder);
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  const getShareTypeColor = (shareType: string) => {
    switch (shareType) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'commenter': return 'bg-yellow-100 text-yellow-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 統一導航系統 */}
      <UnifiedNavigation variant="header" />

      {/* 頁面內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="collaboration-title">
            檔案夾分享和協作
          </h1>
          <p className="text-lg text-gray-600" data-testid="collaboration-description">
            管理檔案夾的分享權限和協作設定，支援三層分享模式
          </p>
        </div>

        {/* 統計概覽 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-2xl font-bold text-blue-600" data-testid="total-collaborations">
                {stats.totalCollaborations}
              </div>
              <div className="text-sm text-gray-600">總協作檔案夾</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-2xl font-bold text-green-600" data-testid="total-collaborators">
                {stats.totalCollaborators}
              </div>
              <div className="text-sm text-gray-600">協作者總數</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-2xl font-bold text-purple-600" data-testid="total-shares">
                {stats.totalShares}
              </div>
              <div className="text-sm text-gray-600">分享連結總數</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-2xl font-bold text-orange-600" data-testid="total-views">
                {stats.totalViews}
              </div>
              <div className="text-sm text-gray-600">總瀏覽次數</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 檔案夾列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800" data-testid="folders-title">
                  我的檔案夾
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedFolder === folder.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                    }`}
                    data-testid={`folder-item-${folder.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{folder.name}</h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {folder.itemCount} 項目 • {folder.collaboratorCount} 協作者
                        </div>
                      </div>
                      <div className="text-2xl">📁</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 協作詳情 */}
          <div className="lg:col-span-2">
            {selectedFolder ? (
              <div className="bg-white rounded-lg shadow-sm border">
                {/* 標籤頁 */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', label: '概覽' },
                      { id: 'collaborators', label: '協作者' },
                      { id: 'sharing', label: '分享設定' },
                      { id: 'invitations', label: '邀請' },
                      { id: 'activity', label: '活動記錄' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        data-testid={`tab-${tab.id}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* 概覽標籤 */}
                  {activeTab === 'overview' && (
                    <div data-testid="overview-tab">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">檔案夾概覽</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">檔案夾名稱</label>
                            <div className="mt-1 text-gray-900">
                              {folders.find(f => f.id === selectedFolder)?.name}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">分享狀態</label>
                            <div className="mt-1">
                              {shareSettings ? (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getShareTypeColor(shareSettings.shareType)}`}>
                                  {shareSettings.shareType === 'public' && '公開分享'}
                                  {shareSettings.shareType === 'class' && '班級分享'}
                                  {shareSettings.shareType === 'private' && '私人'}
                                </span>
                              ) : (
                                <span className="text-gray-500">未分享</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">協作者數量</label>
                            <div className="mt-1 text-gray-900">{collaborators.length} 人</div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">邀請數量</label>
                            <div className="mt-1 text-gray-900">{invitations.length} 個待處理</div>
                          </div>
                        </div>
                      </div>

                      {/* 快速操作 */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-800 mb-4">快速操作</h4>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleCreateShare('public')}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                            data-testid="create-public-share"
                          >
                            創建公開分享
                          </button>
                          <button
                            onClick={() => handleCreateShare('class')}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            data-testid="create-class-share"
                          >
                            創建班級分享
                          </button>
                          <button
                            onClick={() => setActiveTab('collaborators')}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                            data-testid="manage-collaborators"
                          >
                            管理協作者
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 協作者標籤 */}
                  {activeTab === 'collaborators' && (
                    <div data-testid="collaborators-tab">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">協作者管理</h3>
                        <button
                          onClick={() => {
                            const email = prompt('請輸入協作者郵箱:');
                            if (email) {
                              handleAddCollaborator(email, 'viewer');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          data-testid="add-collaborator-button"
                        >
                          添加協作者
                        </button>
                      </div>

                      <div className="space-y-3">
                        {collaborators.map((collaborator) => (
                          <div
                            key={collaborator.userId}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                            data-testid={`collaborator-${collaborator.userId}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {collaborator.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{collaborator.userName}</div>
                                <div className="text-sm text-gray-500">{collaborator.userEmail}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(collaborator.role)}`}>
                                {collaborator.role}
                              </span>
                              <button className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}

                        {collaborators.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            尚無協作者，點擊上方按鈕添加協作者
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 分享設定標籤 */}
                  {activeTab === 'sharing' && (
                    <div data-testid="sharing-tab">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">分享設定</h3>
                      
                      {shareSettings ? (
                        <div className="space-y-6">
                          <div>
                            <label className="text-sm font-medium text-gray-700">分享連結</label>
                            <div className="mt-1 flex">
                              <input
                                type="text"
                                value={shareSettings.shareUrl}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                                data-testid="share-url-input"
                              />
                              <button
                                onClick={() => navigator.clipboard.writeText(shareSettings.shareUrl)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                                data-testid="copy-share-url"
                              >
                                複製
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-sm font-medium text-gray-700">分享類型</label>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getShareTypeColor(shareSettings.shareType)}`}>
                                  {shareSettings.shareType}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700">訪問次數</label>
                              <div className="mt-1 text-gray-900">
                                {shareSettings.currentAccessCount} 次
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">允許下載</span>
                              <input
                                type="checkbox"
                                checked={shareSettings.allowDownload}
                                className="rounded"
                                data-testid="allow-download-checkbox"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">允許複製</span>
                              <input
                                type="checkbox"
                                checked={shareSettings.allowCopy}
                                className="rounded"
                                data-testid="allow-copy-checkbox"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">追蹤訪問</span>
                              <input
                                type="checkbox"
                                checked={shareSettings.trackAccess}
                                className="rounded"
                                data-testid="track-access-checkbox"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 mb-4">此檔案夾尚未分享</div>
                          <div className="space-x-3">
                            <button
                              onClick={() => handleCreateShare('public')}
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                            >
                              創建公開分享
                            </button>
                            <button
                              onClick={() => handleCreateShare('class')}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                              創建班級分享
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 邀請標籤 */}
                  {activeTab === 'invitations' && (
                    <div data-testid="invitations-tab">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">邀請管理</h3>
                        <button
                          onClick={() => {
                            const email = prompt('請輸入邀請郵箱:');
                            if (email) {
                              handleSendInvitation(email, 'viewer');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          data-testid="send-invitation-button"
                        >
                          發送邀請
                        </button>
                      </div>

                      <div className="space-y-3">
                        {invitations.map((invitation) => (
                          <div
                            key={invitation.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                            data-testid={`invitation-${invitation.id}`}
                          >
                            <div>
                              <div className="font-medium text-gray-900">{invitation.inviteeEmail}</div>
                              <div className="text-sm text-gray-500">
                                邀請為 {invitation.role} • {invitation.invitedAt.toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {invitation.status}
                              </span>
                              <button className="text-red-600 hover:text-red-700 text-sm">
                                撤銷
                              </button>
                            </div>
                          </div>
                        ))}

                        {invitations.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            無待處理邀請
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 活動記錄標籤 */}
                  {activeTab === 'activity' && (
                    <div data-testid="activity-tab">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">活動記錄</h3>
                      
                      <div className="space-y-3">
                        {/* 模擬活動記錄 */}
                        <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-blue-600">👁️</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">張三 查看了檔案夾</div>
                            <div className="text-xs text-gray-500">2 分鐘前</div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-green-600">✏️</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">李四 編輯了檔案</div>
                            <div className="text-xs text-gray-500">1 小時前</div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-purple-600">🔗</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">王五 分享了檔案夾</div>
                            <div className="text-xs text-gray-500">3 小時前</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2" data-testid="no-folder-selected">
                  選擇檔案夾開始協作
                </h3>
                <p className="text-gray-600">
                  從左側選擇一個檔案夾來管理分享和協作設定
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 返回導航 */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            data-testid="back-to-dashboard"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            返回功能儀表板
          </Link>
        </div>
      </div>
    </div>
  );
}
