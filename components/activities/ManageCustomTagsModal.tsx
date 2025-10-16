'use client';

import { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Plus, Check } from 'lucide-react';

interface ManageCustomTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagsUpdated: (tags: string[]) => void;
}

export default function ManageCustomTagsModal({
  isOpen,
  onClose,
  onTagsUpdated,
}: ManageCustomTagsModalProps) {
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 載入自訂標籤
  useEffect(() => {
    if (isOpen) {
      loadCustomTags();
    }
  }, [isOpen]);

  const loadCustomTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/custom-tags');
      if (response.ok) {
        const data = await response.json();
        setCustomTags(data.customTags || []);
      }
    } catch (error) {
      console.error('載入自訂標籤失敗:', error);
      setError('載入自訂標籤失敗');
    } finally {
      setLoading(false);
    }
  };

  // 添加新標籤
  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/user/custom-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: newTag.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomTags(data.customTags);
        setNewTag('');
        onTagsUpdated(data.customTags);
      } else {
        const data = await response.json();
        setError(data.error || '添加標籤失敗');
      }
    } catch (error) {
      console.error('添加標籤失敗:', error);
      setError('添加標籤失敗');
    } finally {
      setLoading(false);
    }
  };

  // 開始編輯標籤
  const startEditTag = (tag: string) => {
    setEditingTag(tag);
    setEditValue(tag);
    setError(null);
  };

  // 保存編輯
  const handleSaveEdit = async () => {
    if (!editingTag || !editValue.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/user/custom-tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldTag: editingTag, newTag: editValue.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomTags(data.customTags);
        setEditingTag(null);
        setEditValue('');
        onTagsUpdated(data.customTags);
      } else {
        const data = await response.json();
        setError(data.error || '更新標籤失敗');
      }
    } catch (error) {
      console.error('更新標籤失敗:', error);
      setError('更新標籤失敗');
    } finally {
      setLoading(false);
    }
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingTag(null);
    setEditValue('');
    setError(null);
  };

  // 刪除標籤
  const handleDeleteTag = async (tag: string) => {
    if (!confirm(`確定要刪除標籤「${tag}」嗎？`)) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/user/custom-tags?tag=${encodeURIComponent(tag)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setCustomTags(data.customTags);
        onTagsUpdated(data.customTags);
      } else {
        const data = await response.json();
        setError(data.error || '刪除標籤失敗');
      }
    } catch (error) {
      console.error('刪除標籤失敗:', error);
      setError('刪除標籤失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* 標題 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">管理自訂標籤</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 內容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 錯誤提示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 添加新標籤 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              添加新標籤
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="輸入新標籤..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={handleAddTag}
                disabled={loading || !newTag.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                添加
              </button>
            </div>
          </div>

          {/* 自訂標籤列表 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              我的自訂標籤 ({customTags.length})
            </label>
            {loading && customTags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">載入中...</div>
            ) : customTags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                還沒有自訂標籤，請添加新標籤
              </div>
            ) : (
              <div className="space-y-2">
                {customTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {editingTag === tag ? (
                      <>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              cancelEdit();
                            }
                          }}
                          className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          disabled={loading}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="確認"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={loading}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="取消"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-gray-900">{tag}</span>
                        <button
                          onClick={() => startEditTag(tag)}
                          disabled={loading}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="編輯"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag)}
                          disabled={loading}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="刪除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

