import React, { useState, useEffect } from 'react';
import { ActivityVersion, ChangeDetail } from '../../models/activityVersion';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
interface EnhancedVersionHistoryProps {
  activityId: string;
  onVersionSelect?: (version: ActivityVersion) => void;
  onVersionRestore?: (versionId: string) => void;
  currentUserId: string;
}
export const EnhancedVersionHistory: React.FC<EnhancedVersionHistoryProps> = ({
  activityId,
  onVersionSelect,
  onVersionRestore,
  currentUserId
}) => {
  const [versions, setVersions] = useState<ActivityVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ActivityVersion | null>(null);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const [filterCollaborator, setFilterCollaborator] = useState<string>('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  // 載入版本歷史
  useEffect(() => {
    loadVersions();
  }, [activityId, showAutoSave, filterCollaborator, filterTags]);
  const loadVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activities/${activityId}/versions?` + new URLSearchParams({
        includeAutoSave: showAutoSave.toString(),
        collaboratorId: filterCollaborator,
        tags: filterTags.join(',')
      }));
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      }
    } catch (error) {
      console.error('載入版本歷史失敗:', error);
    } finally {
      setLoading(false);
    }
  };
  // 渲染變更詳情
  const renderChangeDetails = (changeDetails: ChangeDetail[]) => {
    if (!changeDetails || changeDetails.length === 0) {
      return <span className="text-gray-500">無變更記錄</span>;
    }
    return (
      <div className="mt-2 space-y-1">
        {changeDetails.slice(0, 3).map((change, index) => (
          <div key={index} className="text-xs text-gray-600 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
              change.action === 'add' ? 'bg-green-500' :
              change.action === 'delete' ? 'bg-red-500' :
              change.action === 'modify' ? 'bg-blue-500' : 'bg-gray-500'
            }`}></span>
            <span>{change.description || `${change.action} ${change.field}`}</span>
          </div>
        ))}
        {changeDetails.length > 3 && (
          <div className="text-xs text-gray-500">
            還有 {changeDetails.length - 3} 個變更...
          </div>
        )}
      </div>
    );
  };
  // 渲染協作者頭像
  const renderCollaborators = (collaborators: string[]) => {
    return (
      <div className="flex -space-x-2 mt-2">
        {collaborators.slice(0, 3).map((collaboratorId, index) => (
          <div
            key={collaboratorId}
            className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs text-white"
            title={`協作者 ${collaboratorId}`}
          >
            {index + 1}
          </div>
        ))}
        {collaborators.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center text-xs text-white">
            +{collaborators.length - 3}
          </div>
        )}
      </div>
    );
  };
  // 渲染版本標籤
  const renderTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* 標題和過濾器 */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold mb-4">版本歷史</h3>
        {/* 過濾選項 */}
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showAutoSave}
              onChange={(e) => setShowAutoSave(e.target.checked)}
              className="mr-2"
            />
            顯示自動保存版本
          </label>
        </div>
      </div>
      {/* 版本列表 */}
      <div className="max-h-96 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            沒有找到版本記錄
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedVersion?.id === version.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedVersion(version);
                  onVersionSelect?.(version);
                }}
              >
                {/* 版本基本信息 */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{version.versionName}</h4>
                      {version.isAutoSave && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          自動保存
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${
                        version.changeType === 'create' ? 'bg-green-100 text-green-800' :
                        version.changeType === 'update' ? 'bg-blue-100 text-blue-800' :
                        version.changeType === 'restore' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {version.changeType}
                      </span>
                    </div>
                    {version.versionNotes && (
                      <p className="text-sm text-gray-600 mt-1">{version.versionNotes}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(version.createdAt), { 
                        addSuffix: true, 
                        locale: zhTW 
                      })}
                    </div>
                  </div>
                  {/* 操作按鈕 */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersionRestore?.(version.id);
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      恢復
                    </button>
                  </div>
                </div>
                {/* 變更詳情 */}
                {renderChangeDetails(version.changeDetails)}
                {/* 協作者 */}
                {version.collaborators && version.collaborators.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">協作者:</span>
                    {renderCollaborators(version.collaborators)}
                  </div>
                )}
                {/* 標籤 */}
                {renderTags(version.tags)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default EnhancedVersionHistory;
