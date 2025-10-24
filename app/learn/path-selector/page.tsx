'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface LearningPath {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  groupCount: number;
  wordsPerGroup: number;
  estimatedDays: number;
  advantages: string[];
  examples: string[];
}

export default function PathSelectorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedGeptLevel, setSelectedGeptLevel] = useState<string>('ELEMENTARY');

  // 學習路徑選項
  const learningPaths: LearningPath[] = [
    {
      id: 'prefix',
      name: '字首分組學習',
      description: '按照單字的字首（前綴）分組，理解字首規則後可以推測單字意思',
      icon: '🔤',
      color: 'blue',
      groupCount: 22,
      wordsPerGroup: 50,
      estimatedDays: 22,
      advantages: [
        '記憶效率提升 50-100%',
        '可以推測 40-50% 的新單字',
        '理解英文單字的構成邏輯',
        '建立系統化的記憶網絡'
      ],
      examples: [
        'un- (不): unhappy, unable, unfair',
        're- (再): rewrite, return, review',
        'pre- (前): preview, prepare, predict',
        'dis- (不): disagree, dislike, disappear'
      ]
    },
    {
      id: 'root',
      name: '字根分組學習',
      description: '按照單字的字根分組，理解字根後可以理解一系列相關單字',
      icon: '🌱',
      color: 'green',
      groupCount: 20,
      wordsPerGroup: 50,
      estimatedDays: 20,
      advantages: [
        '語義關聯強，記憶深刻',
        '一次學習多個相關單字',
        '提升詞彙量擴展能力',
        '理解單字的核心意義'
      ],
      examples: [
        'port (攜帶): transport, export, import',
        'dict (說): dictionary, predict, dictate',
        'vis (看): visit, video, television',
        'aud (聽): audio, audience, auditorium'
      ]
    },
    {
      id: 'suffix',
      name: '字尾分組學習',
      description: '按照單字的字尾（後綴）分組，理解字尾後可以判斷詞性',
      icon: '📝',
      color: 'purple',
      groupCount: 20,
      wordsPerGroup: 50,
      estimatedDays: 20,
      advantages: [
        '快速判斷詞性',
        '有助於語法學習',
        '理解單字的功能',
        '提升寫作能力'
      ],
      examples: [
        '-er (人): teacher, worker, player',
        '-tion (動作): action, education, creation',
        '-ful (充滿): beautiful, careful, useful',
        '-ly (方式): quickly, slowly, carefully'
      ]
    },
    {
      id: 'theme',
      name: '主題分組學習',
      description: '按照生活主題分組，相同主題的單字一起學習，實用性強',
      icon: '🎯',
      color: 'orange',
      groupCount: 50,
      wordsPerGroup: 50,
      estimatedDays: 50,
      advantages: [
        '單字之間有語義關聯',
        '記憶效果提升 30-50%',
        '實用性強，容易應用',
        '可以按興趣選擇主題'
      ],
      examples: [
        '日常生活: home, family, food, clothes',
        '學校教育: teacher, student, book, class',
        '工作職業: job, office, manager, meeting',
        '交通旅遊: car, bus, train, travel'
      ]
    },
    {
      id: 'frequency',
      name: '頻率分組學習',
      description: '按照單字使用頻率分組，優先學習最常用的單字',
      icon: '⭐',
      color: 'yellow',
      groupCount: 48,
      wordsPerGroup: 50,
      estimatedDays: 48,
      advantages: [
        '優先學習最實用的單字',
        '學習效果立即可見',
        '快速提升英語能力',
        '適合快速入門'
      ],
      examples: [
        '超高頻: the, be, to, of, and, a, in',
        '高頻: have, I, that, for, you, he, with',
        '中頻: say, this, they, at, but, we, his',
        '低頻: more specific vocabulary words'
      ]
    },
    {
      id: 'mixed',
      name: '混合分組學習（推薦）',
      description: '結合字根字首和主題分組，先學習字根字首規則，再按主題學習',
      icon: '🎓',
      color: 'indigo',
      groupCount: 48,
      wordsPerGroup: 50,
      estimatedDays: 48,
      advantages: [
        '結合多種記憶策略',
        '記憶效果最佳',
        '系統化學習',
        '適合長期學習'
      ],
      examples: [
        '第一階段: 學習字根字首規則 (22 組)',
        '第二階段: 按主題學習 (26 組)',
        '建立完整的詞彙網絡',
        '達到最佳學習效果'
      ]
    }
  ];

  // 處理路徑選擇
  const handleSelectPath = (pathId: string) => {
    setSelectedPath(pathId);
  };

  // 開始學習
  const handleStartLearning = () => {
    if (!selectedPath) {
      alert('請先選擇一個學習路徑');
      return;
    }

    // 保存用戶選擇到 localStorage
    localStorage.setItem('learningPath', selectedPath);
    localStorage.setItem('geptLevel', selectedGeptLevel);

    // 跳轉到分組列表頁面
    router.push(`/learn/groups?path=${selectedPath}&geptLevel=${selectedGeptLevel}`);
  };

  // 顏色映射
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
    indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400'
  };

  const selectedColorClasses = {
    blue: 'border-blue-500 bg-blue-100',
    green: 'border-green-500 bg-green-100',
    purple: 'border-purple-500 bg-purple-100',
    orange: 'border-orange-500 bg-orange-100',
    yellow: 'border-yellow-500 bg-yellow-100',
    indigo: 'border-indigo-500 bg-indigo-100'
  };

  if (status === 'loading') {
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
      <div className="max-w-7xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 選擇你的學習路徑</h1>
          <p className="text-lg text-gray-600">不同的學習方式，找到最適合你的記憶策略</p>
        </div>

        {/* GEPT 等級選擇 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 選擇 GEPT 等級</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedGeptLevel('ELEMENTARY')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                selectedGeptLevel === 'ELEMENTARY'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              初級 (2,357 個單字)
            </button>
            <button
              onClick={() => setSelectedGeptLevel('INTERMEDIATE')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                selectedGeptLevel === 'INTERMEDIATE'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              中級 (2,568 個單字)
            </button>
            <button
              onClick={() => setSelectedGeptLevel('HIGH_INTERMEDIATE')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                selectedGeptLevel === 'HIGH_INTERMEDIATE'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              中高級 (3,138 個單字)
            </button>
          </div>
        </div>

        {/* 學習路徑卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {learningPaths.map((path) => (
            <div
              key={path.id}
              onClick={() => handleSelectPath(path.id)}
              className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                selectedPath === path.id
                  ? selectedColorClasses[path.color as keyof typeof selectedColorClasses]
                  : colorClasses[path.color as keyof typeof colorClasses]
              }`}
            >
              {/* 圖標和標題 */}
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-3">{path.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{path.name}</h3>
                  <p className="text-sm text-gray-600">
                    {path.groupCount} 組 · 每組 {path.wordsPerGroup} 個單字
                  </p>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-gray-700 mb-4">{path.description}</p>

              {/* 預計時間 */}
              <div className="bg-white rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-600">預計完成時間</div>
                <div className="text-2xl font-bold text-gray-800">{path.estimatedDays} 天</div>
              </div>

              {/* 優勢 */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">✨ 優勢</div>
                <ul className="space-y-1">
                  {path.advantages.slice(0, 3).map((advantage, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 範例 */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">📖 範例</div>
                <div className="space-y-1">
                  {path.examples.slice(0, 2).map((example, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-white rounded px-2 py-1">
                      {example}
                    </div>
                  ))}
                </div>
              </div>

              {/* 選中標記 */}
              {selectedPath === path.id && (
                <div className="mt-4 text-center">
                  <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full font-medium">
                    ✓ 已選擇
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 開始學習按鈕 */}
        <div className="text-center">
          <button
            onClick={handleStartLearning}
            disabled={!selectedPath}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
              selectedPath
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedPath ? '🚀 開始學習' : '請先選擇學習路徑'}
          </button>
        </div>
      </div>
    </div>
  );
}

