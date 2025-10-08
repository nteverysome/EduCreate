'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;
  partOfSpeech?: string;
  difficultyLevel: number;
  exampleSentence?: string;
  notes?: string;
  imageUrl?: string;
  audioUrl?: string;
}

interface VocabularySet {
  id: string;
  title: string;
  description?: string;
  geptLevel: 'KIDS' | 'ELEMENTARY' | 'INTERMEDIATE' | 'HIGH_INTERMEDIATE';
  isPublic: boolean;
  totalWords: number;
  items: VocabularyItem[];
  createdAt: string;
  updatedAt: string;
}

const GEPT_LEVELS = [
  { value: 'KIDS', label: 'GEPT Kids (基礎300字)' },
  { value: 'ELEMENTARY', label: 'GEPT初級 (基礎1000字)' },
  { value: 'INTERMEDIATE', label: 'GEPT中級 (進階2000字)' },
  { value: 'HIGH_INTERMEDIATE', label: 'GEPT中高級 (高級3000字)' }
];

const PARTS_OF_SPEECH = [
  { value: 'NOUN', label: '名詞' },
  { value: 'VERB', label: '動詞' },
  { value: 'ADJECTIVE', label: '形容詞' },
  { value: 'ADVERB', label: '副詞' },
  { value: 'PRONOUN', label: '代名詞' },
  { value: 'PREPOSITION', label: '介詞' },
  { value: 'CONJUNCTION', label: '連詞' },
  { value: 'INTERJECTION', label: '感嘆詞' },
  { value: 'ARTICLE', label: '冠詞' },
  { value: 'PHRASE', label: '片語' }
];

export default function VocabularyManager() {
  const { data: session, status } = useSession();
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // 新建詞彙集表單狀態
  const [newSet, setNewSet] = useState({
    title: '',
    description: '',
    geptLevel: 'ELEMENTARY' as const,
    isPublic: false
  });

  // 新建詞彙項表單狀態
  const [newItem, setNewItem] = useState({
    english: '',
    chinese: '',
    phonetic: '',
    partOfSpeech: 'NOUN' as const,
    difficultyLevel: 1,
    exampleSentence: '',
    notes: ''
  });

  // 載入詞彙集列表
  const loadVocabularySets = async () => {
    try {
      const response = await fetch('/api/vocabulary/sets');
      if (!response.ok) {
        throw new Error('載入詞彙集失敗');
      }
      const data = await response.json();
      setVocabularySets(data.vocabularySets || []);
    } catch (error) {
      console.error('載入詞彙集錯誤:', error);
      toast.error('載入詞彙集失敗');
    } finally {
      setLoading(false);
    }
  };

  // 創建新詞彙集
  const createVocabularySet = async () => {
    try {
      const response = await fetch('/api/vocabulary/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSet)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '創建詞彙集失敗');
      }

      const data = await response.json();
      setVocabularySets(prev => [...prev, data.vocabularySet]);
      setNewSet({ title: '', description: '', geptLevel: 'ELEMENTARY', isPublic: false });
      setShowCreateForm(false);
      toast.success('詞彙集創建成功');
    } catch (error) {
      console.error('創建詞彙集錯誤:', error);
      toast.error(error instanceof Error ? error.message : '創建詞彙集失敗');
    }
  };

  // 添加詞彙項到選中的詞彙集
  const addVocabularyItem = async () => {
    if (!selectedSet) return;

    try {
      const response = await fetch(`/api/vocabulary/sets/${selectedSet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...selectedSet,
          items: [...selectedSet.items, { ...newItem, id: Date.now().toString() }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '添加詞彙項失敗');
      }

      const data = await response.json();
      setSelectedSet(data.vocabularySet);
      setVocabularySets(prev => 
        prev.map(set => set.id === selectedSet.id ? data.vocabularySet : set)
      );
      setNewItem({
        english: '',
        chinese: '',
        phonetic: '',
        partOfSpeech: 'NOUN',
        difficultyLevel: 1,
        exampleSentence: '',
        notes: ''
      });
      toast.success('詞彙項添加成功');
    } catch (error) {
      console.error('添加詞彙項錯誤:', error);
      toast.error(error instanceof Error ? error.message : '添加詞彙項失敗');
    }
  };

  // 刪除詞彙集
  const deleteVocabularySet = async (setId: string) => {
    if (!confirm('確定要刪除這個詞彙集嗎？此操作無法撤銷。')) return;

    try {
      const response = await fetch(`/api/vocabulary/sets/${setId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('刪除詞彙集失敗');
      }

      setVocabularySets(prev => prev.filter(set => set.id !== setId));
      if (selectedSet?.id === setId) {
        setSelectedSet(null);
      }
      toast.success('詞彙集刪除成功');
    } catch (error) {
      console.error('刪除詞彙集錯誤:', error);
      toast.error('刪除詞彙集失敗');
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadVocabularySets();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">需要登入</h2>
        <p className="text-gray-600 mb-6">請先登入以管理您的詞彙集</p>
        <a
          href="/login"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
        >
          前往登入
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">詞彙管理</h1>
        <p className="text-gray-600">管理您的個人詞彙集，創建自定義學習內容</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 詞彙集列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">我的詞彙集</h2>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  新建
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : vocabularySets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>還沒有詞彙集</p>
                  <p className="text-sm">點擊「新建」創建第一個詞彙集</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vocabularySets.map((set) => (
                    <div
                      key={set.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSet?.id === set.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSet(set)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{set.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {GEPT_LEVELS.find(level => level.value === set.geptLevel)?.label}
                          </p>
                          <p className="text-sm text-gray-500">
                            {set.totalWords} 個詞彙
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteVocabularySet(set.id);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 詞彙集詳情和編輯 */}
        <div className="lg:col-span-2">
          {selectedSet ? (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedSet.title}</h2>
                    <p className="text-gray-600 mt-1">{selectedSet.description}</p>
                  </div>
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    添加詞彙
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {selectedSet.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>這個詞彙集還沒有詞彙</p>
                    <p className="text-sm">點擊「添加詞彙」開始添加</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSet.items.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="font-medium text-gray-900">{item.english}</div>
                            {item.phonetic && (
                              <div className="text-sm text-gray-500">/{item.phonetic}/</div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{item.chinese}</div>
                            {item.partOfSpeech && (
                              <div className="text-sm text-gray-500">
                                {PARTS_OF_SPEECH.find(pos => pos.value === item.partOfSpeech)?.label}
                              </div>
                            )}
                          </div>
                        </div>
                        {item.exampleSentence && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>例句：</strong>{item.exampleSentence}
                          </div>
                        )}
                        {item.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>備註：</strong>{item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">選擇詞彙集</h3>
                <p className="text-gray-600">從左側選擇一個詞彙集來查看和編輯詞彙</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 創建詞彙集模態框 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">創建新詞彙集</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                <input
                  type="text"
                  value={newSet.title}
                  onChange={(e) => setNewSet(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入詞彙集標題"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={newSet.description}
                  onChange={(e) => setNewSet(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="輸入詞彙集描述（可選）"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GEPT 等級</label>
                <select
                  value={newSet.geptLevel}
                  onChange={(e) => setNewSet(prev => ({ ...prev, geptLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {GEPT_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newSet.isPublic}
                  onChange={(e) => setNewSet(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  公開詞彙集（其他用戶可以查看）
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={createVocabularySet}
                disabled={!newSet.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                創建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加詞彙項模態框 */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加詞彙項</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">英文</label>
                <input
                  type="text"
                  value={newItem.english}
                  onChange={(e) => setNewItem(prev => ({ ...prev, english: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入英文單詞"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">中文</label>
                <input
                  type="text"
                  value={newItem.chinese}
                  onChange={(e) => setNewItem(prev => ({ ...prev, chinese: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入中文翻譯"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">音標（可選）</label>
                <input
                  type="text"
                  value={newItem.phonetic}
                  onChange={(e) => setNewItem(prev => ({ ...prev, phonetic: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入音標"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">詞性</label>
                <select
                  value={newItem.partOfSpeech}
                  onChange={(e) => setNewItem(prev => ({ ...prev, partOfSpeech: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PARTS_OF_SPEECH.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">例句（可選）</label>
                <input
                  type="text"
                  value={newItem.exampleSentence}
                  onChange={(e) => setNewItem(prev => ({ ...prev, exampleSentence: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入例句"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">備註（可選）</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="輸入備註"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={addVocabularyItem}
                disabled={!newItem.english.trim() || !newItem.chinese.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
