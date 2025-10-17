'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';

interface VocabularyItem {
  id?: string;
  english: string;
  chinese: string;
  phonetic?: string;
}

interface EditVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  onSuccess?: () => void;
}

const EditVocabularyModal: React.FC<EditVocabularyModalProps> = ({
  isOpen,
  onClose,
  activityId,
  onSuccess,
}) => {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入詞彙
  useEffect(() => {
    if (isOpen && activityId) {
      loadVocabulary();
    }
  }, [isOpen, activityId]);

  const loadVocabulary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/activities/${activityId}/vocabulary`);
      if (response.ok) {
        const data = await response.json();
        setVocabularyItems(data.vocabularyItems || []);
      } else {
        setError('載入詞彙失敗');
      }
    } catch (err) {
      setError('載入詞彙時出錯');
      console.error('載入詞彙錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setVocabularyItems([
      ...vocabularyItems,
      { english: '', chinese: '', phonetic: '' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setVocabularyItems(vocabularyItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof VocabularyItem,
    value: string
  ) => {
    const updated = [...vocabularyItems];
    updated[index] = { ...updated[index], [field]: value };
    setVocabularyItems(updated);
  };

  const handleSave = async () => {
    // 驗證
    const hasEmpty = vocabularyItems.some(
      (item) => !item.english.trim() || !item.chinese.trim()
    );
    if (hasEmpty) {
      setError('請填寫所有英文和中文欄位');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/activities/${activityId}/vocabulary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabularyItems }),
      });

      if (response.ok) {
        onSuccess?.();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || '儲存失敗');
      }
    } catch (err) {
      setError('儲存時出錯');
      console.error('儲存詞彙錯誤:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* 標題欄 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">編輯單字</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">載入中...</span>
            </div>
          ) : (
            <>
              {/* 錯誤提示 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 詞彙列表 */}
              <div className="space-y-3">
                {vocabularyItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* 英文 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          英文 *
                        </label>
                        <input
                          type="text"
                          value={item.english}
                          onChange={(e) =>
                            handleItemChange(index, 'english', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例如: apple"
                        />
                      </div>

                      {/* 中文 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          中文 *
                        </label>
                        <input
                          type="text"
                          value={item.chinese}
                          onChange={(e) =>
                            handleItemChange(index, 'chinese', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例如: 蘋果"
                        />
                      </div>

                      {/* 音標 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          音標（選填）
                        </label>
                        <input
                          type="text"
                          value={item.phonetic || ''}
                          onChange={(e) =>
                            handleItemChange(index, 'phonetic', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例如: /ˈæp.əl/"
                        />
                      </div>
                    </div>

                    {/* 刪除按鈕 */}
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* 新增按鈕 */}
              <button
                onClick={handleAddItem}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>新增單字</span>
              </button>

              {/* 提示 */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  💡 提示：英文和中文為必填欄位，音標為選填。
                </p>
              </div>
            </>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>儲存中...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>儲存</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVocabularyModal;

