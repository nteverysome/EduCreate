'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  RotateCcw, 
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  templateType?: string;
  totalWords: number;
  geptLevel: string;
  createdAt: string;
  deletedAt: string;
  content?: any;
}

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityRestore: (activityId: string) => void;
  onActivityPermanentDelete: (activityId: string) => void;
  onEmptyTrash: () => void;
}

export default function TrashModal({
  isOpen,
  onClose,
  onActivityRestore,
  onActivityPermanentDelete,
  onEmptyTrash
}: TrashModalProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // 獲取回收桶中的活動
  const fetchTrashActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/activities/trash');
      
      if (!response.ok) {
        throw new Error('獲取回收桶活動失敗');
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('獲取回收桶活動失敗:', error);
      alert('獲取回收桶活動失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 當模態框打開時獲取數據
  useEffect(() => {
    if (isOpen) {
      fetchTrashActivities();
    }
  }, [isOpen]);

  // 恢復活動
  const handleRestore = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/trash/${activityId}`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('恢復活動失敗');
      }

      // 從回收桶列表中移除
      setActivities(prev => prev.filter(a => a.id !== activityId));
      onActivityRestore(activityId);
      
      alert('活動已恢復！');
    } catch (error) {
      console.error('恢復活動失敗:', error);
      alert('恢復活動失敗，請稍後再試');
    }
  };

  // 永久刪除活動
  const handlePermanentDelete = async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    if (!confirm(`確定要永久刪除「${activity.title}」嗎？此操作無法撤銷！`)) {
      return;
    }

    try {
      const response = await fetch(`/api/activities/trash/${activityId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('永久刪除活動失敗');
      }

      // 從回收桶列表中移除
      setActivities(prev => prev.filter(a => a.id !== activityId));
      onActivityPermanentDelete(activityId);
      
      alert('活動已永久刪除！');
    } catch (error) {
      console.error('永久刪除活動失敗:', error);
      alert('永久刪除活動失敗，請稍後再試');
    }
  };

  // 清空回收桶
  const handleEmptyTrash = async () => {
    if (activities.length === 0) {
      alert('回收桶已經是空的！');
      return;
    }

    if (!confirm(`確定要清空回收桶嗎？這將永久刪除 ${activities.length} 個活動，此操作無法撤銷！`)) {
      return;
    }

    try {
      const response = await fetch('/api/activities/trash', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('清空回收桶失敗');
      }

      setActivities([]);
      onEmptyTrash();
      
      alert('回收桶已清空！');
    } catch (error) {
      console.error('清空回收桶失敗:', error);
      alert('清空回收桶失敗，請稍後再試');
    }
  };

  // 格式化時間
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              回收桶 ({activities.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {activities.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
              >
                清空回收桶
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">載入中...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">回收桶是空的</h3>
              <p className="text-gray-500">已刪除的活動會出現在這裡</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description || '無描述'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          創建：{formatDate(activity.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          刪除：{formatDate(activity.deletedAt)}
                        </span>
                        <span>📝 {activity.totalWords} 詞</span>
                        <span>{activity.geptLevel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleRestore(activity.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="恢復活動"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(activity.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="永久刪除"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
