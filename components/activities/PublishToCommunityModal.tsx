'use client';

/**
 * 發布到社區模態框
 * 
 * 允許用戶將活動發布到社區，需要填寫：
 * - 分類（必填）
 * - 標籤（必填，至少1個）
 * - 描述（可選）
 * - 縮圖 URL（可選）
 */

import { useState } from 'react';
import { X, Globe, Tag, FileText, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import {
  ACTIVITY_CATEGORIES,
  GRADE_TAGS,
  EDUCATION_LEVEL_TAGS,
  SUBJECT_TAGS
} from '@/lib/community/utils';

interface PublishToCommunityModalProps {
  activity: {
    id: string;
    title: string;
    description?: string;
    isPublicShared?: boolean;
    shareToken?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function PublishToCommunityModal({
  activity,
  onClose,
  onSuccess,
}: PublishToCommunityModalProps) {
  const [category, setCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState(activity.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證
    if (!category) {
      setError('請選擇分類');
      return;
    }
    
    if (selectedTags.length === 0) {
      setError('請至少選擇一個標籤');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/activities/${activity.id}/publish-to-community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          tags: selectedTags,
          description: description || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '發布失敗');
      }

      const data = await response.json();
      
      setSuccess(true);
      
      // 2秒後關閉並刷新
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('發布失敗:', err);
      setError(err instanceof Error ? err.message : '發布失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('確定要取消發布到社區嗎？')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/activities/${activity.id}/publish-to-community`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '取消發布失敗');
      }

      setSuccess(true);
      
      // 2秒後關閉並刷新
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('取消發布失敗:', err);
      setError(err instanceof Error ? err.message : '取消發布失敗');
    } finally {
      setLoading(false);
    }
  };

  // 成功狀態
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {activity.isPublicShared ? '取消發布成功！' : '發布成功！'}
          </h3>
          <p className="text-gray-600">
            {activity.isPublicShared ? '活動已從社區移除' : '活動已發布到社區'}
          </p>
        </div>
      </div>
    );
  }

  // 如果已發布，顯示取消發布界面
  if (activity.isPublicShared) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          {/* 標題 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">社區分享</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* 內容 */}
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                <Globe size={20} />
                <span>已發布到社區</span>
              </div>
              <p className="text-sm text-green-600">
                這個活動已經發布到社區，其他用戶可以瀏覽和使用。
              </p>
            </div>

            {activity.shareToken && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  社區連結
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/community/activity/${activity.shareToken}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/community/activity/${activity.shareToken}`
                      );
                      alert('已複製連結！');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    複製
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleUnpublish}
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>處理中...</span>
                </>
              ) : (
                <span>取消發布到社區</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 發布表單
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        {/* 標題 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Globe className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">發布到社區</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 活動標題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              活動標題
            </label>
            <input
              type="text"
              value={activity.title}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          {/* 分類 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              分類 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">請選擇分類</option>
              {ACTIVITY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 標籤 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                標籤 <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">
                (已選擇 {selectedTags.length}/5)
              </span>
            </div>

            {/* 年級標籤 */}
            <div>
              <div className="flex flex-wrap gap-2">
                {GRADE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 教育階段標籤 */}
            <div>
              <div className="flex flex-wrap gap-2 items-center">
                {EDUCATION_LEVEL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
                  >
                    {tag}
                  </button>
                ))}

                {/* 添加年齡帶按鈕 */}
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => {
                    // TODO: 實現自定義年齡帶功能
                    alert('自定義年齡帶功能即將推出！');
                  }}
                >
                  + 添加年齡帶
                </button>
              </div>
            </div>

            {/* 科目標籤 */}
            <div>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 添加主題連結 */}
            <div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => {
                  // TODO: 實現自定義標籤功能
                  alert('自定義標籤功能即將推出！');
                }}
              >
                + 添加主題
              </button>
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-1" />
              描述 <span className="text-gray-500 text-xs">(可選)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="簡單描述這個活動的內容和用途..."
            />
          </div>

          {/* 錯誤提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !category || selectedTags.length === 0}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>發布中...</span>
                </>
              ) : (
                <>
                  <Globe size={20} />
                  <span>發布到社區</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

