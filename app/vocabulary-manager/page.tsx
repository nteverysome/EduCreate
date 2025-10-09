'use client';

import React, { useState, useEffect } from 'react';

// 簡化的 UI 組件
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
  disabled?: boolean;
  className?: string;
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
  };
  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({
  value,
  onChange,
  placeholder = '',
  className = ''
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
  />
);

const Badge = ({
  children,
  variant = 'default',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// 圖標組件（簡化版）
const Trash2 = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Edit3 = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const Save = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const X = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Plus = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const BookOpen = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const Clock = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Hash = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

const Play = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GameController = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  partOfSpeech: string;
  difficultyLevel: number;
  createdAt: string;
  updatedAt: string;
}

interface VocabularySet {
  id: string;
  title: string;
  geptLevel: string;
  items: VocabularyItem[];
  createdAt: string;
  updatedAt: string;
}

export default function VocabularyManager() {
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([]);
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ english: '', chinese: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 載入詞彙數據
  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vocabulary/sets');
      const result = await response.json();
      
      if (result.success) {
        setVocabularySets(result.data);
        if (result.data.length > 0) {
          setSelectedSet(result.data[0]);
        }
      }
    } catch (error) {
      console.error('載入詞彙失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 開始編輯詞彙
  const startEdit = (item: VocabularyItem) => {
    setEditingItem(item.id);
    setEditForm({ english: item.english, chinese: item.chinese });
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({ english: '', chinese: '' });
  };

  // 保存編輯
  const saveEdit = async (itemId: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/vocabulary/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        await loadVocabulary();
        setEditingItem(null);
        setEditForm({ english: '', chinese: '' });
      }
    } catch (error) {
      console.error('保存失敗:', error);
    } finally {
      setSaving(false);
    }
  };

  // 刪除詞彙
  const deleteItem = async (itemId: string) => {
    if (!confirm('確定要刪除這個詞彙嗎？')) return;

    try {
      const response = await fetch(`/api/vocabulary/items/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadVocabulary();
      }
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  // 刪除詞彙集合
  const deleteSet = async (setId: string) => {
    if (!confirm('確定要刪除整個詞彙集合嗎？這將刪除其中的所有詞彙。')) return;

    try {
      const response = await fetch(`/api/vocabulary/sets/${setId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadVocabulary();
        setSelectedSet(null);
      }
    } catch (error) {
      console.error('刪除集合失敗:', error);
    }
  };

  // 開始遊戲
  const startGame = (vocabularySet: VocabularySet) => {
    // 將詞彙數據存儲到 localStorage 供遊戲使用
    const gameVocabulary = vocabularySet.items.map(item => ({
      english: item.english,
      chinese: item.chinese,
      level: vocabularySet.geptLevel.toLowerCase()
    }));

    localStorage.setItem('gameVocabulary', JSON.stringify(gameVocabulary));
    localStorage.setItem('gameTitle', vocabularySet.title);

    // 跳轉到遊戲頁面
    window.open('/games/shimozurdo-game', '_blank');
  };

  // 統計信息
  const totalWords = vocabularySets.reduce((sum, set) => sum + set.items.length, 0);
  const geptLevels = vocabularySets.reduce((acc, set) => {
    acc[set.geptLevel] = (acc[set.geptLevel] || 0) + set.items.length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入詞彙數據中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題和統計 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📚 詞彙管理中心</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">詞彙集合</p>
                    <p className="text-2xl font-bold text-gray-900">{vocabularySets.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Hash className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">總詞彙數</p>
                    <p className="text-2xl font-bold text-gray-900">{totalWords}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">GEPT 等級</p>
                    <div className="flex gap-1 mt-1">
                      {Object.entries(geptLevels).map(([level, count]) => (
                        <Badge key={level} variant="secondary" className="text-xs">
                          {level}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">快速操作</p>
                    <Button 
                      size="sm" 
                      className="mt-1"
                      onClick={() => window.location.href = '/universal-game'}
                    >
                      創建新詞彙
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：詞彙集合列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2" />
                  詞彙集合 ({vocabularySets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vocabularySets.map((set) => (
                    <div
                      key={set.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedSet?.id === set.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSet(set)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{set.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{set.geptLevel}</Badge>
                            <span className="text-sm text-gray-600">{set.items.length} 個詞彙</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(set.createdAt).toLocaleDateString('zh-TW')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startGame(set);
                            }}
                            className="text-green-600 hover:text-green-700"
                            title="開始遊戲"
                          >
                            <GameController className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSet(set.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="刪除集合"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右側：詞彙詳情 */}
          <div className="lg:col-span-2">
            {selectedSet ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedSet.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge>{selectedSet.geptLevel}</Badge>
                      <Button
                        size="sm"
                        onClick={() => startGame(selectedSet)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <GameController className="h-4 w-4 mr-1" />
                        開始遊戲
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedSet.items.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        {editingItem === item.id ? (
                          // 編輯模式
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  英文
                                </label>
                                <Input
                                  value={editForm.english}
                                  onChange={(e) => setEditForm({ ...editForm, english: e.target.value })}
                                  placeholder="英文單字"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  中文
                                </label>
                                <Input
                                  value={editForm.chinese}
                                  onChange={(e) => setEditForm({ ...editForm, chinese: e.target.value })}
                                  placeholder="中文翻譯"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(item.id)}
                                disabled={saving}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                {saving ? '保存中...' : '保存'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                <X className="h-4 w-4 mr-1" />
                                取消
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // 顯示模式
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div className="text-lg font-semibold text-blue-600">
                                  {item.english}
                                </div>
                                <div className="text-lg text-gray-700">
                                  {item.chinese}
                                </div>
                                <Badge variant="secondary">{item.partOfSpeech}</Badge>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                難度: {item.difficultyLevel} | 
                                創建: {new Date(item.createdAt).toLocaleDateString('zh-TW')}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(item)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteItem(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">選擇詞彙集合</h3>
                  <p className="text-gray-600">從左側選擇一個詞彙集合來查看和編輯詞彙</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
