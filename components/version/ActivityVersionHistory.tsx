/**
 * 活動版本歷史組件
 * 顯示版本歷史、版本對比、版本恢復等功能
 */
import React, { useState, useEffect } from 'react';
import { VersionInfo, VersionComparison, CollaboratorActivity, VersionType, ChangeType } from '../../lib/version/ActivityVersionManager';
interface ActivityVersionHistoryProps {
  activityId: string;
  currentVersion?: string;
  onVersionRestore?: (version: string) => void;
  onVersionCompare?: (sourceVersion: string, targetVersion: string) => void;
  readOnly?: boolean;
}
export default function ActivityVersionHistory({
  activityId,
  currentVersion,
  onVersionRestore,
  onVersionCompare,
  readOnly = false
}: ActivityVersionHistoryProps) {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [collaboratorActivities, setCollaboratorActivities] = useState<CollaboratorActivity[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'versions' | 'activities' | 'comparison'>('versions');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState<string | null>(null);
  // 載入版本歷史
  const loadVersionHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/activities/${activityId}/versions`);
      if (!response.ok) {
        throw new Error('載入版本歷史失敗');
      }
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入版本歷史時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };
  // 載入協作者活動
  const loadCollaboratorActivities = async () => {
    try {
      const response = await fetch(`/api/activities/${activityId}/collaborator-activities`);
      if (!response.ok) {
        throw new Error('載入協作者活動失敗');
      }
      const data = await response.json();
      setCollaboratorActivities(data.activities || []);
    } catch (err) {
      console.error('載入協作者活動失敗:', err);
    }
  };
  // 比較版本
  const compareVersions = async (sourceVersion: string, targetVersion: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/activities/${activityId}/versions/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceVersion,
          targetVersion
        }),
      });
      if (!response.ok) {
        throw new Error('版本比較失敗');
      }
      const comparisonData = await response.json();
      setComparison(comparisonData);
      setActiveTab('comparison');
      if (onVersionCompare) {
        onVersionCompare(sourceVersion, targetVersion);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '版本比較時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };
  // 恢復版本
  const handleVersionRestore = async (version: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/activities/${activityId}/versions/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetVersion: version,
          preserveCurrentVersion: true,
          createBackup: true,
          mergeStrategy: 'overwrite',
          conflictResolution: 'auto',
          notifyCollaborators: true
        }),
      });
      if (!response.ok) {
        throw new Error('版本恢復失敗');
      }
      const restoredVersion = await response.json();
      // 重新載入版本歷史
      await loadVersionHistory();
      if (onVersionRestore) {
        onVersionRestore(version);
      }
      setShowRestoreDialog(false);
      setRestoreVersion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '版本恢復時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };
  // 處理版本選擇
  const handleVersionSelect = (version: string) => {
    if (selectedVersions.includes(version)) {
      setSelectedVersions(selectedVersions.filter(v => v !== version));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, version]);
    } else {
      setSelectedVersions([selectedVersions[1], version]);
    }
  };
  // 初始載入
  useEffect(() => {
    loadVersionHistory();
    loadCollaboratorActivities();
  }, [activityId]);
  // 當選擇了兩個版本時自動比較
  useEffect(() => {
    if (selectedVersions.length === 2) {
      compareVersions(selectedVersions[0], selectedVersions[1]);
    }
  }, [selectedVersions]);
  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // 獲取版本類型顏色
  const getVersionTypeColor = (type: VersionType) => {
    switch (type) {
      case VersionType.MAJOR:
        return 'bg-red-100 text-red-800';
      case VersionType.MINOR:
        return 'bg-blue-100 text-blue-800';
      case VersionType.PATCH:
        return 'bg-green-100 text-green-800';
      case VersionType.SNAPSHOT:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  // 獲取變更類型圖標
  const getChangeTypeIcon = (type: ChangeType) => {
    switch (type) {
      case ChangeType.CREATE:
        return '➕';
      case ChangeType.UPDATE:
        return '✏️';
      case ChangeType.DELETE:
        return '🗑️';
      case ChangeType.MOVE:
        return '📁';
      case ChangeType.COPY:
        return '📋';
      case ChangeType.RENAME:
        return '🏷️';
      case ChangeType.RESTORE:
        return '⏪';
      case ChangeType.MERGE:
        return '🔀';
      default:
        return '📝';
    }
  };
  // 渲染版本列表
  const renderVersionList = () => (
    <div className="space-y-4">
      {versions.map((version, index) => (
        <div
          key={version.id}
          className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
            selectedVersions.includes(version.version) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          } ${version.version === currentVersion ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => handleVersionSelect(version.version)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {version.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getVersionTypeColor(version.type)}`}>
                  {version.version}
                </span>
                {version.isStable && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    穩定版本
                  </span>
                )}
                {version.version === currentVersion && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    當前版本
                  </span>
                )}
              </div>
              {version.description && (
                <p className="text-gray-600 mb-2">{version.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <img
                    src={version.createdBy.avatar || '/default-avatar.png'}
                    alt={version.createdBy.name}
                    className="w-5 h-5 rounded-full mr-2"
                  />
                  {version.createdBy.name}
                </span>
                <span>{formatDate(version.createdAt)}</span>
                <span>{version.changes.length} 個變更</span>
                <span>{(version.metadata.size / 1024).toFixed(1)} KB</span>
              </div>
              {version.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {version.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {!readOnly && version.version !== currentVersion && (
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRestoreVersion(version.version);
                    setShowRestoreDialog(true);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  恢復
                </button>
              </div>
            )}
          </div>
          {/* 變更摘要 */}
          {version.changes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {version.changes.slice(0, 3).map((change, changeIndex) => (
                  <div
                    key={changeIndex}
                    className="flex items-center text-xs text-gray-600"
                  >
                    <span className="mr-1">{getChangeTypeIcon(change.type)}</span>
                    <span>{change.description}</span>
                  </div>
                ))}
                {version.changes.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{version.changes.length - 3} 個變更
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
  // 渲染協作者活動
  const renderCollaboratorActivities = () => (
    <div className="space-y-4">
      {collaboratorActivities.map((activity, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <img
              src={activity.userAvatar || '/default-avatar.png'}
              alt={activity.userName}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">{activity.userName}</span>
                <span className="text-sm text-gray-500">{activity.action}</span>
                <span className="text-sm text-gray-400">{formatDate(activity.timestamp)}</span>
              </div>
              {activity.changes.length > 0 && (
                <div className="space-y-1">
                  {activity.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="text-sm text-gray-600">
                      <span className="mr-2">{getChangeTypeIcon(change.type)}</span>
                      {change.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  // 渲染版本比較
  const renderVersionComparison = () => {
    if (!comparison) {
      return (
        <div className="text-center py-8 text-gray-500">
          請選擇兩個版本進行比較
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {/* 比較摘要 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            版本比較: {comparison.sourceVersion} ↔ {comparison.targetVersion}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{comparison.summary.totalChanges}</div>
              <div className="text-sm text-gray-600">總變更</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{comparison.summary.additions}</div>
              <div className="text-sm text-gray-600">新增</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{comparison.summary.deletions}</div>
              <div className="text-sm text-gray-600">刪除</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{comparison.summary.modifications}</div>
              <div className="text-sm text-gray-600">修改</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">相似度:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${comparison.similarityScore * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium ml-2">
                {(comparison.similarityScore * 100).toFixed(1)}%
              </span>
            </div>
            {comparison.conflictCount > 0 && (
              <div className="text-sm text-red-600">
                {comparison.conflictCount} 個衝突
              </div>
            )}
          </div>
        </div>
        {/* 詳細差異 */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">詳細差異</h4>
          {comparison.differences.map((diff, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                diff.type === 'addition' ? 'border-green-200 bg-green-50' :
                diff.type === 'deletion' ? 'border-red-200 bg-red-50' :
                diff.type === 'modification' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      diff.type === 'addition' ? 'bg-green-100 text-green-800' :
                      diff.type === 'deletion' ? 'bg-red-100 text-red-800' :
                      diff.type === 'modification' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {diff.type}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{diff.path}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      diff.severity === 'high' ? 'bg-red-100 text-red-800' :
                      diff.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {diff.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{diff.description}</p>
                  {diff.lineNumbers && (
                    <div className="text-xs text-gray-500 mt-1">
                      行號: {diff.lineNumbers.old} → {diff.lineNumbers.new}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* 標籤頁導航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'versions', label: '版本歷史', icon: '📚' },
            { id: 'activities', label: '協作活動', icon: '👥' },
            { id: 'comparison', label: '版本比較', icon: '🔍' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* 內容區域 */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">錯誤</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">載入中...</span>
          </div>
        )}
        {!isLoading && (
          <>
            {activeTab === 'versions' && renderVersionList()}
            {activeTab === 'activities' && renderCollaboratorActivities()}
            {activeTab === 'comparison' && renderVersionComparison()}
          </>
        )}
      </div>
      {/* 恢復確認對話框 */}
      {showRestoreDialog && restoreVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              確認恢復版本
            </h3>
            <p className="text-gray-600 mb-6">
              您確定要恢復到版本 {restoreVersion} 嗎？當前版本將會被備份。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleVersionRestore(restoreVersion)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '恢復中...' : '確認恢復'}
              </button>
              <button
                onClick={() => {
                  setShowRestoreDialog(false);
                  setRestoreVersion(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
