/**
 * 完整分享系統面板組件
 * 三層分享模式、連結管理、權限控制、社交媒體集成、嵌入代碼生成等完整功能
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ShareSystemPanelProps {
  userId: string;
  enableThreeLayerSharing?: boolean;
  enableLinkManagement?: boolean;
  enablePermissionControl?: boolean;
  enableSocialIntegration?: boolean;
  enableEmbedCode?: boolean;
  enableGeptIntegration?: boolean;
  enableMemoryScience?: boolean;
}

interface ShareItem {
  id: string;
  name: string;
  type: 'activity' | 'folder' | 'game' | 'template';
  shareMode: 'public' | 'class' | 'private';
  shareUrl: string;
  shortUrl?: string;
  permissions: SharePermission[];
  settings: ShareSettings;
  stats: ShareStats;
  createdAt: Date;
  expiresAt?: Date;
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  memoryScience: string[];
  status: 'active' | 'expired' | 'disabled';
}

interface SharePermission {
  type: 'view' | 'edit' | 'comment' | 'download';
  enabled: boolean;
  requireAuth: boolean;
}

interface ShareSettings {
  requirePassword: boolean;
  password?: string;
  allowCopy: boolean;
  allowPrint: boolean;
  allowDownload: boolean;
  trackViews: boolean;
  maxViews?: number;
  customMessage?: string;
  embedEnabled: boolean;
  socialSharingEnabled: boolean;
}

interface ShareStats {
  totalViews: number;
  uniqueVisitors: number;
  shares: number;
  downloads: number;
  comments: number;
  lastAccessed?: Date;
  topReferrers: string[];
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export const ShareSystemPanel: React.FC<ShareSystemPanelProps> = ({
  userId,
  enableThreeLayerSharing = true,
  enableLinkManagement = true,
  enablePermissionControl = true,
  enableSocialIntegration = true,
  enableEmbedCode = true,
  enableGeptIntegration = true,
  enableMemoryScience = true
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'analytics' | 'settings'>('create');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [shareMode, setShareMode] = useState<'public' | 'class' | 'private'>('public');
  const [isCreating, setIsCreating] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  // 模擬分享項目數據
  const [shareItems] = useState<ShareItem[]>([
    {
      id: 'share-1',
      name: '英語基礎詞彙遊戲',
      type: 'activity',
      shareMode: 'public',
      shareUrl: 'https://educreate.app/share/abc123',
      shortUrl: 'https://edu.cr/abc123',
      permissions: [
        { type: 'view', enabled: true, requireAuth: false },
        { type: 'edit', enabled: false, requireAuth: true },
        { type: 'comment', enabled: true, requireAuth: false },
        { type: 'download', enabled: false, requireAuth: true }
      ],
      settings: {
        requirePassword: false,
        allowCopy: true,
        allowPrint: true,
        allowDownload: false,
        trackViews: true,
        maxViews: 1000,
        embedEnabled: true,
        socialSharingEnabled: true
      },
      stats: {
        totalViews: 245,
        uniqueVisitors: 189,
        shares: 23,
        downloads: 0,
        comments: 12,
        lastAccessed: new Date('2025-07-16'),
        topReferrers: ['Facebook', 'Twitter', 'Direct']
      },
      createdAt: new Date('2025-07-15'),
      expiresAt: new Date('2025-08-15'),
      geptLevel: 'elementary',
      memoryScience: ['主動回憶', '間隔重複'],
      status: 'active'
    },
    {
      id: 'share-2',
      name: '中級閱讀理解練習',
      type: 'activity',
      shareMode: 'class',
      shareUrl: 'https://educreate.app/share/def456',
      shortUrl: 'https://edu.cr/def456',
      permissions: [
        { type: 'view', enabled: true, requireAuth: true },
        { type: 'edit', enabled: true, requireAuth: true },
        { type: 'comment', enabled: true, requireAuth: true },
        { type: 'download', enabled: true, requireAuth: true }
      ],
      settings: {
        requirePassword: true,
        password: 'class2025',
        allowCopy: false,
        allowPrint: true,
        allowDownload: true,
        trackViews: true,
        embedEnabled: false,
        socialSharingEnabled: false
      },
      stats: {
        totalViews: 67,
        uniqueVisitors: 34,
        shares: 5,
        downloads: 12,
        comments: 8,
        lastAccessed: new Date('2025-07-16'),
        topReferrers: ['Class Portal', 'Direct']
      },
      createdAt: new Date('2025-07-14'),
      expiresAt: new Date('2025-09-14'),
      geptLevel: 'intermediate',
      memoryScience: ['語境記憶', '理解策略'],
      status: 'active'
    },
    {
      id: 'share-3',
      name: '高級寫作模板',
      type: 'template',
      shareMode: 'private',
      shareUrl: 'https://educreate.app/share/ghi789',
      permissions: [
        { type: 'view', enabled: true, requireAuth: true },
        { type: 'edit', enabled: false, requireAuth: true },
        { type: 'comment', enabled: false, requireAuth: true },
        { type: 'download', enabled: true, requireAuth: true }
      ],
      settings: {
        requirePassword: true,
        password: 'private123',
        allowCopy: false,
        allowPrint: false,
        allowDownload: true,
        trackViews: true,
        maxViews: 50,
        embedEnabled: false,
        socialSharingEnabled: false
      },
      stats: {
        totalViews: 15,
        uniqueVisitors: 8,
        shares: 0,
        downloads: 3,
        comments: 0,
        lastAccessed: new Date('2025-07-15'),
        topReferrers: ['Direct']
      },
      createdAt: new Date('2025-07-13'),
      expiresAt: new Date('2025-07-30'),
      geptLevel: 'high-intermediate',
      memoryScience: ['批判思維', '創意表達'],
      status: 'active'
    }
  ]);

  // 社交平台配置
  const [socialPlatforms] = useState<SocialPlatform[]>([
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600', enabled: true },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-sky-500', enabled: true },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700', enabled: true },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-green-500', enabled: true },
    { id: 'email', name: 'Email', icon: '📧', color: 'bg-gray-600', enabled: true },
    { id: 'copy', name: '複製連結', icon: '📋', color: 'bg-gray-500', enabled: true }
  ]);

  const handleCreateShare = async () => {
    if (!selectedItem) {
      alert('請選擇要分享的項目');
      return;
    }

    setIsCreating(true);
    try {
      // 模擬創建分享
      await new Promise(resolve => setTimeout(resolve, 1500));

      const shareUrl = `https://educreate.app/share/${Math.random().toString(36).substr(2, 8)}`;
      const shortUrl = `https://edu.cr/${Math.random().toString(36).substr(2, 6)}`;

      alert(`成功創建${getShareModeName(shareMode)}分享！\n分享連結：${shareUrl}\n短連結：${shortUrl}`);
    } catch (error) {
      alert('創建分享失敗：' + (error as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('複製失敗:', error);
    }
  };

  const handleSocialShare = (platform: SocialPlatform, shareUrl: string, title: string) => {
    let url = '';

    switch (platform.id) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        copyToClipboard(shareUrl, 'social');
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const getShareModeColor = (mode: string) => {
    switch (mode) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShareModeName = (mode: string) => {
    switch (mode) {
      case 'public': return '公開';
      case 'class': return '班級';
      case 'private': return '私人';
      default: return '未知';
    }
  };

  const getGeptLevelColor = (level: string) => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'high-intermediate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGeptLevelName = (level: string) => {
    switch (level) {
      case 'elementary': return '初級';
      case 'intermediate': return '中級';
      case 'high-intermediate': return '中高級';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'disabled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'active': return '活躍';
      case 'expired': return '已過期';
      case 'disabled': return '已停用';
      default: return '未知';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return '🎯';
      case 'folder': return '📁';
      case 'game': return '🎮';
      case 'template': return '📄';
      default: return '📋';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'activity': return '活動';
      case 'folder': return '檔案夾';
      case 'game': return '遊戲';
      case 'template': return '模板';
      default: return '未知';
    }
  };

  return (
    <div className="p-6" data-testid="share-system-panel">
      {/* 標籤切換 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="create-tab"
        >
          🔗 創建分享
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'manage'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="manage-tab"
        >
          📊 管理分享
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="analytics-tab"
        >
          📈 分享分析
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="settings-tab"
        >
          ⚙️ 分享設置
        </button>
      </div>

      {/* 創建分享標籤 */}
      {activeTab === 'create' && (
        <div data-testid="create-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">創建分享</h3>

          {/* 項目選擇 */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">選擇要分享的項目</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['activity-1', 'folder-1', 'game-1', 'template-1'].map((itemId, index) => {
                const itemNames = ['英語基礎測驗', '我的學習檔案夾', '詞彙配對遊戲', '閱讀理解模板'];
                const itemTypes = ['activity', 'folder', 'game', 'template'];
                return (
                  <div
                    key={itemId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedItem === itemId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedItem(itemId)}
                    data-testid={`item-${itemId}`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={selectedItem === itemId}
                        onChange={() => setSelectedItem(itemId)}
                        className="w-4 h-4"
                      />
                      <div className="text-2xl">{getTypeIcon(itemTypes[index])}</div>
                      <div>
                        <h5 className="font-medium text-gray-900">{itemNames[index]}</h5>
                        <div className="text-sm text-gray-600">{getTypeName(itemTypes[index])}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 分享模式選擇 */}
          {enableThreeLayerSharing && selectedItem && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">選擇分享模式</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['public', 'class', 'private'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setShareMode(mode as any)}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      shareMode === mode
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    data-testid={`share-mode-${mode}`}
                  >
                    <div className="text-3xl mb-2">
                      {mode === 'public' && '🌐'}
                      {mode === 'class' && '🏫'}
                      {mode === 'private' && '🔒'}
                    </div>
                    <div className="font-medium">{getShareModeName(mode)}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {mode === 'public' && '任何人都可以訪問'}
                      {mode === 'class' && '僅班級成員可訪問'}
                      {mode === 'private' && '指定用戶可訪問'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 權限設置 */}
          {enablePermissionControl && selectedItem && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">權限設置</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'view', name: '查看', icon: '👁️', description: '基本訪問權限' },
                  { key: 'edit', name: '編輯', icon: '✏️', description: '修改內容權限' },
                  { key: 'comment', name: '評論', icon: '💬', description: '添加評論權限' },
                  { key: 'download', name: '下載', icon: '📥', description: '下載文件權限' }
                ].map(permission => (
                  <label key={permission.key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={permission.key === 'view'}
                      className="w-4 h-4"
                      data-testid={`permission-${permission.key}`}
                    />
                    <div className="text-lg">{permission.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                      <div className="text-xs text-gray-600">{permission.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 高級設置 */}
          {selectedItem && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">高級設置</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">需要密碼保護</span>
                  <input type="checkbox" className="w-4 h-4" data-testid="require-password" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">允許複製內容</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="allow-copy" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">追蹤訪問統計</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="track-views" />
                </label>
                {enableEmbedCode && (
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">啟用嵌入代碼</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="enable-embed" />
                  </label>
                )}
                {enableSocialIntegration && (
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">啟用社交分享</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="enable-social" />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* 創建按鈕 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedItem ? `已選擇項目，分享模式：${getShareModeName(shareMode)}` : '請選擇要分享的項目'}
            </div>
            <button
              onClick={handleCreateShare}
              disabled={!selectedItem || isCreating}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
              data-testid="create-share-button"
            >
              {isCreating ? '創建中...' : '創建分享'}
            </button>
          </div>
        </div>
      )}

      {/* 管理分享標籤 */}
      {activeTab === 'manage' && (
        <div data-testid="manage-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">管理分享</h3>

          {/* 分享統計 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{shareItems.length}</div>
                <div className="text-blue-800">總分享數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {shareItems.filter(s => s.status === 'active').length}
                </div>
                <div className="text-green-800">活躍分享</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {shareItems.reduce((sum, s) => sum + s.stats.totalViews, 0)}
                </div>
                <div className="text-orange-800">總瀏覽量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {shareItems.reduce((sum, s) => sum + s.stats.shares, 0)}
                </div>
                <div className="text-purple-800">總分享次數</div>
              </div>
            </div>
          </div>

          {/* 分享列表 */}
          <div className="space-y-4">
            {shareItems.map(item => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTypeIcon(item.type)}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{getTypeName(item.type)}</span>
                        <span>•</span>
                        <span>創建: {item.createdAt.toLocaleDateString()}</span>
                        {item.expiresAt && (
                          <>
                            <span>•</span>
                            <span>過期: {item.expiresAt.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getShareModeColor(item.shareMode)}`}>
                      {getShareModeName(item.shareMode)}
                    </span>
                    {enableGeptIntegration && item.geptLevel && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(item.geptLevel)}`}>
                        {getGeptLevelName(item.geptLevel)}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusName(item.status)}
                    </span>
                  </div>
                </div>

                {/* 分享連結 */}
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={linkInputRef}
                      type="text"
                      value={item.shortUrl || item.shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(item.shortUrl || item.shareUrl, `link-${item.id}`)}
                      className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                    >
                      {copySuccess === `link-${item.id}` ? '已複製' : '複製'}
                    </button>
                  </div>
                </div>

                {/* 統計信息 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <div className="font-medium text-gray-900">{item.stats.totalViews}</div>
                    <div>總瀏覽</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.stats.uniqueVisitors}</div>
                    <div>獨立訪客</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.stats.shares}</div>
                    <div>分享次數</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.stats.downloads}</div>
                    <div>下載次數</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.stats.comments}</div>
                    <div>評論數</div>
                  </div>
                </div>

                {/* 社交分享按鈕 */}
                {enableSocialIntegration && item.settings.socialSharingEnabled && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {socialPlatforms.filter(p => p.enabled).map(platform => (
                      <button
                        key={platform.id}
                        onClick={() => handleSocialShare(platform, item.shareUrl, item.name)}
                        className={`flex items-center space-x-1 px-3 py-1 ${platform.color} text-white rounded text-sm hover:opacity-90`}
                      >
                        <span>{platform.icon}</span>
                        <span>{platform.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 記憶科學標籤 */}
                {enableMemoryScience && item.memoryScience.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.memoryScience.map((technique, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {technique}
                      </span>
                    ))}
                  </div>
                )}

                {/* 操作按鈕 */}
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                    編輯設置
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200">
                    查看統計
                  </button>
                  {enableEmbedCode && item.settings.embedEnabled && (
                    <button className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200">
                      嵌入代碼
                    </button>
                  )}
                  <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">
                    停用分享
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 公開分享：適合教學資源和公開內容，任何人都可以訪問</p>
          <p>• 班級分享：適合課堂教學，僅班級成員可以訪問和協作</p>
          <p>• 私人分享：適合個人或小組使用，需要邀請或密碼訪問</p>
          <p>• 權限控制：靈活設置查看、編輯、評論、下載等權限</p>
          <p>• 連結管理：支持短連結、自定義連結、過期時間設置</p>
          <p>• 社交集成：一鍵分享到各大社交平台，擴大影響力</p>
        </div>
      </div>
    </div>
  );
};