'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface WordGroup {
  id: string;
  name: string;
  description: string;
  wordCount: number;
  learnedCount: number;
  masteredCount: number;
  isUnlocked: boolean;
  completionRate: number;
}

function GroupsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const path = searchParams.get('path') || 'mixed';
  const geptLevel = searchParams.get('geptLevel') || 'ELEMENTARY';
  
  const [groups, setGroups] = useState<WordGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // 獲取分組數據
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/vocabulary/groups?path=${path}&geptLevel=${geptLevel}`);
        const data = await response.json();
        setGroups(data.groups || []);
      } catch (error) {
        console.error('獲取分組數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [path, geptLevel]);

  // 路徑名稱映射
  const pathNames: Record<string, string> = {
    prefix: '字首分組學習',
    root: '字根分組學習',
    suffix: '字尾分組學習',
    theme: '主題分組學習',
    frequency: '頻率分組學習',
    mixed: '混合分組學習'
  };

  // 路徑圖標映射
  const pathIcons: Record<string, string> = {
    prefix: '🔤',
    root: '🌱',
    suffix: '📝',
    theme: '🎯',
    frequency: '⭐',
    mixed: '🎓'
  };

  // GEPT 等級名稱映射
  const geptLevelNames: Record<string, string> = {
    ELEMENTARY: '初級',
    INTERMEDIATE: '中級',
    HIGH_INTERMEDIATE: '中高級'
  };

  // 開始學習某個分組
  const handleStartLearning = (groupId: string) => {
    router.push(`/learn/forgetting-curve?geptLevel=${geptLevel}&groupId=${groupId}`);
  };

  // 返回路徑選擇
  const handleBackToPathSelector = () => {
    router.push('/learn/path-selector');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">載入中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">請先登入</h1>
        <a href="/api/auth/signin" className="text-blue-600 hover:underline">
          前往登入
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="mb-8">
          <button
            onClick={handleBackToPathSelector}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← 返回選擇學習路徑
          </button>
          <div className="flex items-center mb-2">
            <div className="text-5xl mr-4">{pathIcons[path]}</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{pathNames[path]}</h1>
              <p className="text-lg text-gray-600">GEPT {geptLevelNames[geptLevel]}</p>
            </div>
          </div>
        </div>

        {/* 進度總覽 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 學習進度總覽</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">總分組數</div>
              <div className="text-3xl font-bold text-blue-600">{groups.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">已解鎖</div>
              <div className="text-3xl font-bold text-green-600">
                {groups.filter(g => g.isUnlocked).length}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">學習中</div>
              <div className="text-3xl font-bold text-purple-600">
                {groups.filter(g => g.learnedCount > 0 && g.completionRate < 80).length}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">已完成</div>
              <div className="text-3xl font-bold text-orange-600">
                {groups.filter(g => g.completionRate >= 80).length}
              </div>
            </div>
          </div>
        </div>

        {/* 分組列表 */}
        <div className="space-y-4">
          {groups.map((group, index) => (
            <div
              key={group.id}
              className={`bg-white rounded-xl shadow-lg p-6 transition-all ${
                group.isUnlocked ? 'hover:shadow-xl' : 'opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* 左側：分組信息 */}
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 text-blue-600 font-bold rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </div>
                  </div>

                  {/* 進度條 */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>學習進度</span>
                      <span>{group.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          group.completionRate >= 80
                            ? 'bg-green-500'
                            : group.completionRate >= 50
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${group.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 統計信息 */}
                  <div className="flex gap-4 mt-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-600">總單字:</span>
                      <span className="ml-1 font-medium text-gray-800">{group.wordCount}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600">已學習:</span>
                      <span className="ml-1 font-medium text-blue-600">{group.learnedCount}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600">已掌握:</span>
                      <span className="ml-1 font-medium text-green-600">{group.masteredCount}</span>
                    </div>
                  </div>
                </div>

                {/* 右側：操作按鈕 */}
                <div className="ml-6">
                  {group.isUnlocked ? (
                    <button
                      onClick={() => handleStartLearning(group.id)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        group.completionRate >= 80
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : group.learnedCount > 0
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      {group.completionRate >= 80
                        ? '✓ 已完成'
                        : group.learnedCount > 0
                        ? '繼續學習'
                        : '開始學習'}
                    </button>
                  ) : (
                    <div className="px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-medium">
                      🔒 未解鎖
                    </div>
                  )}
                </div>
              </div>

              {/* 解鎖提示 */}
              {!group.isUnlocked && index > 0 && (
                <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  💡 提示：完成上一組 80% 的單字後即可解鎖此組
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 空狀態 */}
        {groups.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">暫無分組數據</h3>
            <p className="text-gray-600 mb-6">請稍後再試或選擇其他學習路徑</p>
            <button
              onClick={handleBackToPathSelector}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
            >
              返回選擇學習路徑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GroupsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl">載入中...</div></div>}>
      <GroupsContent />
    </Suspense>
  );
}

