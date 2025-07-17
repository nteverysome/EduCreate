/**
 * 活動歷史和版本管理面板組件
 * 完整的變更追蹤、版本比較、回滾機制，協作編輯歷史記錄
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';

interface ActivityHistoryVersionPanelProps {
  userId: string;
  enableVersionComparison?: boolean;
  enableVersionRollback?: boolean;
  enableCollaborationHistory?: boolean;
  enableGeptIntegration?: boolean;
  enableMemoryScience?: boolean;
}

interface VersionInfo {
  id: string;
  version: string;
  type: 'major' | 'minor' | 'patch' | 'auto';
  title: string;
  description?: string;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  changes: VersionChange[];
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  memoryScience: string[];
  isStable: boolean;
  size: number;
}

interface VersionChange {
  field: string;
  action: 'add' | 'modify' | 'delete' | 'move';
  oldValue?: any;
  newValue?: any;
  description: string;
}

interface Activity {
  id: string;
  name: string;
  type: string;
  geptLevel: 'elementary' | 'intermediate' | 'high-intermediate';
  currentVersion: string;
  totalVersions: number;
  lastModified: Date;
  collaborators: string[];
}

export const ActivityHistoryVersionPanel: React.FC<ActivityHistoryVersionPanelProps> = ({
  userId,
  enableVersionComparison = true,
  enableVersionRollback = true,
  enableCollaborationHistory = true,
  enableGeptIntegration = true,
  enableMemoryScience = true
}) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'comparison' | 'collaboration'>('history');
  const [isLoading, setIsLoading] = useState(false);
  
  // 模擬活動數據
  const [activities] = useState<Activity[]>([
    {
      id: 'act-1',
      name: '英語基礎測驗',
      type: 'quiz',
      geptLevel: 'elementary',
      currentVersion: 'v2.1.3',
      totalVersions: 15,
      lastModified: new Date('2025-07-16'),
      collaborators: ['user1', 'user2']
    },
    {
      id: 'act-2',
      name: '中級閱讀理解',
      type: 'reading',
      geptLevel: 'intermediate',
      currentVersion: 'v1.5.2',
      totalVersions: 8,
      lastModified: new Date('2025-07-15'),
      collaborators: ['user1', 'user3']
    },
    {
      id: 'act-3',
      name: '高級寫作練習',
      type: 'writing',
      geptLevel: 'high-intermediate',
      currentVersion: 'v3.0.1',
      totalVersions: 22,
      lastModified: new Date('2025-07-14'),
      collaborators: ['user2', 'user3', 'user4']
    }
  ]);

  // 模擬版本歷史數據
  const [versionHistory] = useState<VersionInfo[]>([
    {
      id: 'v-1',
      version: 'v2.1.3',
      type: 'patch',
      title: '修復語音播放問題',
      description: '解決了在某些瀏覽器中語音無法正常播放的問題',
      createdAt: new Date('2025-07-16T10:30:00'),
      createdBy: { id: 'user1', name: '張老師', avatar: '👩‍🏫' },
      changes: [
        { field: 'audio.settings', action: 'modify', description: '更新音頻編碼設置' },
        { field: 'browser.compatibility', action: 'add', description: '添加瀏覽器兼容性檢查' }
      ],
      geptLevel: 'elementary',
      memoryScience: ['聽覺記憶', '多感官學習'],
      isStable: true,
      size: 1.2
    },
    {
      id: 'v-2',
      version: 'v2.1.2',
      type: 'minor',
      title: '新增記憶科學功能',
      description: '整合間隔重複和主動回憶機制',
      createdAt: new Date('2025-07-15T14:20:00'),
      createdBy: { id: 'user2', name: '李教授', avatar: '👨‍🎓' },
      changes: [
        { field: 'memory.spaced_repetition', action: 'add', description: '添加間隔重複算法' },
        { field: 'memory.active_recall', action: 'add', description: '實現主動回憶機制' },
        { field: 'ui.progress_tracking', action: 'modify', description: '更新進度追蹤界面' }
      ],
      geptLevel: 'elementary',
      memoryScience: ['間隔重複', '主動回憶', '進度追蹤'],
      isStable: true,
      size: 2.8
    },
    {
      id: 'v-3',
      version: 'v2.1.1',
      type: 'patch',
      title: 'GEPT 分級優化',
      description: '改進詞彙難度分析和等級判定',
      createdAt: new Date('2025-07-14T09:15:00'),
      createdBy: { id: 'user3', name: '王研究員', avatar: '👨‍💼' },
      changes: [
        { field: 'gept.vocabulary_analysis', action: 'modify', description: '優化詞彙難度算法' },
        { field: 'gept.level_detection', action: 'modify', description: '改進等級自動檢測' }
      ],
      geptLevel: 'elementary',
      memoryScience: ['語言認知', '詞彙記憶'],
      isStable: true,
      size: 1.5
    },
    {
      id: 'v-4',
      version: 'v2.1.0',
      type: 'major',
      title: '協作編輯系統',
      description: '實現多用戶實時協作編輯功能',
      createdAt: new Date('2025-07-13T16:45:00'),
      createdBy: { id: 'user1', name: '張老師', avatar: '👩‍🏫' },
      changes: [
        { field: 'collaboration.realtime', action: 'add', description: '添加實時協作功能' },
        { field: 'collaboration.conflict_resolution', action: 'add', description: '實現衝突解決機制' },
        { field: 'ui.collaboration_panel', action: 'add', description: '新增協作面板' }
      ],
      geptLevel: 'elementary',
      memoryScience: ['社會學習', '協作記憶'],
      isStable: true,
      size: 4.2
    },
    {
      id: 'v-5',
      version: 'v2.0.5-auto',
      type: 'auto',
      title: '自動保存 - 2025/07/13 15:30',
      createdAt: new Date('2025-07-13T15:30:00'),
      createdBy: { id: 'system', name: '系統自動保存', avatar: '🤖' },
      changes: [
        { field: 'content.questions[2]', action: 'modify', description: '修改第3題選項' }
      ],
      geptLevel: 'elementary',
      memoryScience: ['自動化學習'],
      isStable: false,
      size: 0.3
    }
  ]);

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
    setSelectedVersions([]);
  };

  const handleVersionSelect = (versionId: string) => {
    if (enableVersionComparison) {
      setSelectedVersions(prev => {
        if (prev.includes(versionId)) {
          return prev.filter(id => id !== versionId);
        } else if (prev.length < 2) {
          return [...prev, versionId];
        } else {
          return [prev[1], versionId];
        }
      });
    }
  };

  const handleVersionRollback = async (versionId: string) => {
    if (!enableVersionRollback) return;
    
    const confirmed = window.confirm('確定要回滾到此版本嗎？這將創建一個新的版本。');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // 模擬回滾操作
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('版本回滾成功！已創建新版本。');
    } catch (error) {
      alert('版本回滾失敗：' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800';
      case 'minor': return 'bg-blue-100 text-blue-800';
      case 'patch': return 'bg-green-100 text-green-800';
      case 'auto': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVersionTypeName = (type: string) => {
    switch (type) {
      case 'major': return '主要版本';
      case 'minor': return '次要版本';
      case 'patch': return '修補版本';
      case 'auto': return '自動保存';
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

  const getChangeActionColor = (action: string) => {
    switch (action) {
      case 'add': return 'text-green-600';
      case 'modify': return 'text-blue-600';
      case 'delete': return 'text-red-600';
      case 'move': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeActionIcon = (action: string) => {
    switch (action) {
      case 'add': return '➕';
      case 'modify': return '✏️';
      case 'delete': return '🗑️';
      case 'move': return '🔄';
      default: return '❓';
    }
  };

  return (
    <div className="p-6" data-testid="activity-history-version-panel">
      {/* 活動選擇 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">選擇活動</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activities.map(activity => (
            <div
              key={activity.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedActivity === activity.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleActivitySelect(activity.id)}
              data-testid={`activity-${activity.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{activity.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(activity.geptLevel)}`}>
                  {getGeptLevelName(activity.geptLevel)}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>類型: {activity.type}</div>
                <div>當前版本: {activity.currentVersion}</div>
                <div>總版本數: {activity.totalVersions}</div>
                <div>協作者: {activity.collaborators.length} 人</div>
                <div>最後修改: {activity.lastModified.toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedActivity && (
        <>
          {/* 標籤切換 */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="history-tab"
            >
              📜 版本歷史
            </button>
            {enableVersionComparison && (
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'comparison'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid="comparison-tab"
              >
                🔍 版本比較
              </button>
            )}
            {enableCollaborationHistory && (
              <button
                onClick={() => setActiveTab('collaboration')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'collaboration'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid="collaboration-tab"
              >
                👥 協作歷史
              </button>
            )}
          </div>

          {/* 版本歷史標籤 */}
          {activeTab === 'history' && (
            <div data-testid="history-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">版本歷史</h3>
              
              {/* 版本統計 */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{versionHistory.length}</div>
                    <div className="text-blue-800">總版本數</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {versionHistory.filter(v => v.isStable).length}
                    </div>
                    <div className="text-green-800">穩定版本</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {versionHistory.filter(v => v.type === 'auto').length}
                    </div>
                    <div className="text-orange-800">自動保存</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(versionHistory.map(v => v.createdBy.id)).size}
                    </div>
                    <div className="text-purple-800">協作者</div>
                  </div>
                </div>
              </div>

              {/* 版本列表 */}
              <div className="space-y-4">
                {versionHistory.map(version => (
                  <div
                    key={version.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedVersions.includes(version.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleVersionSelect(version.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{version.createdBy.avatar}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{version.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVersionTypeColor(version.type)}`}>
                              {getVersionTypeName(version.type)}
                            </span>
                            {version.isStable && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                穩定
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {version.version} • {version.createdBy.name} • {version.createdAt.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{version.size} MB</span>
                        {enableVersionRollback && version.isStable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVersionRollback(version.id);
                            }}
                            disabled={isLoading}
                            className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200 disabled:opacity-50"
                            data-testid={`rollback-${version.id}`}
                          >
                            {isLoading ? '回滾中...' : '回滾'}
                          </button>
                        )}
                      </div>
                    </div>

                    {version.description && (
                      <p className="text-sm text-gray-600 mb-3">{version.description}</p>
                    )}

                    {/* 變更列表 */}
                    <div className="space-y-2">
                      {version.changes.map((change, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <span className="text-lg">{getChangeActionIcon(change.action)}</span>
                          <span className={`font-medium ${getChangeActionColor(change.action)}`}>
                            {change.action}
                          </span>
                          <span className="text-gray-600">{change.field}</span>
                          <span className="text-gray-500">-</span>
                          <span className="text-gray-700">{change.description}</span>
                        </div>
                      ))}
                    </div>

                    {/* GEPT 和記憶科學標籤 */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {enableGeptIntegration && version.geptLevel && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(version.geptLevel)}`}>
                          GEPT {getGeptLevelName(version.geptLevel)}
                        </span>
                      )}
                      {enableMemoryScience && version.memoryScience.map((technique, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                        >
                          {technique}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 版本比較標籤 */}
          {activeTab === 'comparison' && enableVersionComparison && (
            <div data-testid="comparison-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">版本比較</h3>
              
              {selectedVersions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  請在版本歷史中選擇要比較的版本（最多2個）
                </div>
              )}

              {selectedVersions.length === 1 && (
                <div className="text-center py-8 text-gray-500">
                  已選擇 1 個版本，請再選擇一個版本進行比較
                </div>
              )}

              {selectedVersions.length === 2 && (
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">版本差異分析</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedVersions.map((versionId, index) => {
                      const version = versionHistory.find(v => v.id === versionId);
                      if (!version) return null;
                      
                      return (
                        <div key={versionId} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-lg">{version.createdBy.avatar}</span>
                            <div>
                              <div className="font-medium">{version.title}</div>
                              <div className="text-sm text-gray-600">{version.version}</div>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>創建時間: {version.createdAt.toLocaleString()}</div>
                            <div>創建者: {version.createdBy.name}</div>
                            <div>變更數量: {version.changes.length}</div>
                            <div>文件大小: {version.size} MB</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2">比較結果</h5>
                    <div className="text-sm text-yellow-800">
                      <p>• 版本間隔: {Math.abs(
                        new Date(versionHistory.find(v => v.id === selectedVersions[0])?.createdAt || 0).getTime() -
                        new Date(versionHistory.find(v => v.id === selectedVersions[1])?.createdAt || 0).getTime()
                      ) / (1000 * 60 * 60 * 24)} 天</p>
                      <p>• 主要變更: 內容更新、功能增強、錯誤修復</p>
                      <p>• 建議: 較新版本包含重要的記憶科學改進</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 協作歷史標籤 */}
          {activeTab === 'collaboration' && enableCollaborationHistory && (
            <div data-testid="collaboration-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">協作歷史</h3>
              
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">協作者活動時間線</h4>
                
                <div className="space-y-4">
                  {versionHistory.filter(v => v.createdBy.id !== 'system').map(version => (
                    <div key={version.id} className="flex items-start space-x-3">
                      <span className="text-2xl">{version.createdBy.avatar}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{version.createdBy.name}</span>
                          <span className="text-sm text-gray-500">
                            {version.createdAt.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          創建了版本 {version.version}: {version.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {version.changes.length} 個變更
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 版本歷史：查看完整的變更記錄和版本演進</p>
          <p>• 版本比較：選擇兩個版本進行詳細差異分析</p>
          <p>• 版本回滾：安全地恢復到任意穩定版本</p>
          <p>• 協作歷史：追蹤多用戶編輯活動和貢獻</p>
          <p>• GEPT 整合：版本變更對學習等級的影響分析</p>
          <p>• 記憶科學：版本更新對學習效果的優化記錄</p>
        </div>
      </div>
    </div>
  );
};
