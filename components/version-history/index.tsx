'use client';

import { useState, useEffect } from 'react';
import { X, RotateCcw, Clock, User } from 'lucide-react';

export interface ImageVersion {
  id: string;
  version: number;
  url: string;
  blobPath: string;
  changes: any;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface VersionHistoryProps {
  imageId: string;
  onRestore: (versionId: string) => void;
  onClose: () => void;
}

export default function VersionHistory({ imageId, onRestore, onClose }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ImageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<ImageVersion | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [imageId]);

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/images/${imageId}/versions`);
      const data = await response.json();

      if (data.success) {
        setVersions(data.versions);
      } else {
        alert('獲取版本列表失敗');
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
      alert('獲取版本列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('確定要恢復到此版本嗎？')) return;

    setRestoring(versionId);
    try {
      const response = await fetch(`/api/images/${imageId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('恢復成功！');
        onRestore(versionId);
        fetchVersions(); // 重新獲取版本列表
      } else {
        alert(data.error || '恢復失敗');
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      alert('恢復失敗');
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChangesDescription = (changes: any) => {
    if (!changes) return '無變更記錄';

    if (changes.type === 'restore') {
      return `恢復到版本 ${changes.fromVersion}`;
    }

    const descriptions: string[] = [];
    if (changes.crop) descriptions.push('裁剪');
    if (changes.rotation) descriptions.push(`旋轉 ${changes.rotation}°`);
    if (changes.filter && changes.filter !== 'none') descriptions.push(`濾鏡: ${changes.filter}`);

    return descriptions.length > 0 ? descriptions.join(', ') : '編輯';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col relative">
        {/* Header - Fixed at top with highest z-index */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50 rounded-t-lg">
          <h2 className="text-xl font-semibold">版本歷史</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors relative z-10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Version List */}
          <div className="w-1/3 border-r overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Clock className="w-12 h-12 mb-2" />
                <p>暫無版本記錄</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVersion?.id === version.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">
                        版本 {version.version}
                      </span>
                      {version.version === versions[0].version && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          當前
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(version.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{version.user.name || version.user.email}</span>
                      </div>
                      <div className="text-gray-500">
                        {getChangesDescription(version.changes)}
                      </div>
                    </div>

                    {version.version !== versions[0].version && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version.id);
                        }}
                        disabled={restoring === version.id}
                        className="mt-2 w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {restoring === version.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>恢復中...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>恢復此版本</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 p-4 flex items-center justify-center bg-gray-50 overflow-hidden pointer-events-none">
            {selectedVersion ? (
              <div className="max-w-full max-h-full flex items-center justify-center">
                <img
                  src={selectedVersion.url}
                  alt={`版本 ${selectedVersion.version}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg pointer-events-auto"
                  style={{ maxHeight: 'calc(90vh - 200px)' }}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 pointer-events-auto">
                <p>選擇一個版本以預覽</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom with highest z-index */}
        <div className="p-4 border-t bg-gray-50 sticky bottom-0 z-50 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>共 {versions.length} 個版本</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

