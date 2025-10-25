'use client';

import { useState, useEffect } from 'react';
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
  totalWords?: number; // 該等級的總單字數
}

interface GeptLevelStats {
  level: string;
  totalWords: number;
  pathStats: Record<string, { groupCount: number; totalWords: number }>;
}

export default function PathSelectorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedGeptLevel, setSelectedGeptLevel] = useState<string>('ELEMENTARY');
  const [geptStats, setGeptStats] = useState<GeptLevelStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 獲取 GEPT 等級統計數據
  useEffect(() => {
    const fetchGeptStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vocabulary/gept-stats?geptLevel=${selectedGeptLevel}`);
        const data = await response.json();
        setGeptStats(data);
      } catch (error) {
        console.error('獲取 GEPT 統計數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGeptStats();
  }, [selectedGeptLevel]);

  // 獲取動態數據的輔助函�?  const getPathData = (pathId: string) => {
    if (!geptStats?.pathStats[pathId]) {
      return { groupCount: 0, totalWords: 0, estimatedDays: 0 };
    }
    const stats = geptStats.pathStats[pathId];
    return {
      groupCount: stats.groupCount,
      totalWords: stats.totalWords,
      estimatedDays: Math.ceil(stats.groupCount / 2) // 每天學習 2 �?    };
  };

  // 學習路徑選項（移除硬編碼數據�?  const learningPaths: LearningPath[] = [
    {
      id: 'partOfSpeech',
      name: '詞性分組學�?,
      description: '按照詞性分組，有助於語法學習和句子構建',
      icon: '📖',
      color: 'blue',
      groupCount: 0, // 動態計算
      wordsPerGroup: 0, // 動態計算
      estimatedDays: 0, // 動態計算
      advantages: [
        '語法理解提升 50-60%',
        '記憶效果提升 30-40%',
        '快速判斷單字功�?,
        '適合所有學習�?
      ],
      examples: [
        '名詞: teacher, student, book',
        '動詞: run, jump, write',
        '形容�? big, beautiful, happy',
        '副詞: quickly, slowly, carefully'
      ]
    },
    {
      id: 'prefix',
      name: '字首分組學習',
      description: '按照單字的字首（前綴）分組，理解字首規則後可以推測單字意�?,
      icon: '🔤',
      color: 'indigo',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '記憶效率提升 50-100%',
        '可以推測 40-50% 的新單字',
        '理解英文單字的構成邏�?,
        '建立系統化的記憶網絡'
      ],
      examples: [
        'un- (�?: unhappy, unable, unfair',
        're- (�?: rewrite, return, review',
        'pre- (�?: preview, prepare, predict',
        'dis- (�?: disagree, dislike, disappear'
      ]
    },
    {
      id: 'root',
      name: '字根分組學習',
      description: '按照單字的字根分組，理解字根後可以理解一系列相關單字',
      icon: '🌱',
      color: 'green',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '語義關聯強，記憶深刻',
        '一次學習多個相關單�?,
        '提升詞彙量擴展能�?,
        '理解單字的核心意�?
      ],
      examples: [
        'port (攜帶): transport, export, import',
        'dict (�?: dictionary, predict, dictate',
        'vis (�?: visit, video, television',
        'aud (�?: audio, audience, auditorium'
      ]
    },
    {
      id: 'suffix',
      name: '字尾分組學習',
      description: '按照單字的字尾（後綴）分組，理解字尾後可以判斷詞�?,
      icon: '📝',
      color: 'purple',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '快速判斷詞�?,
        '有助於語法學�?,
        '理解單字的功�?,
        '提升寫作能力'
      ],
      examples: [
        '-er (�?: teacher, worker, player',
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
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '單字之間有語義關�?,
        '記憶效果提升 30-50%',
        '實用性強，容易應�?,
        '可以按興趣選擇主�?
      ],
      examples: [
        '日常生活: home, family, food, clothes',
        '學校教育: teacher, student, book, class',
        '工作職業: job, office, manager, meeting',
        '交通旅�? car, bus, train, travel'
      ]
    },
    {
      id: 'frequency',
      name: '頻率分組學習',
      description: '按照單字使用頻率分組，優先學習最常用的單�?,
      icon: '�?,
      color: 'yellow',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '優先學習最實用的單�?,
        '學習效果立即可見',
        '快速提升英語能�?,
        '適合快速入門'
      ],
      examples: [
        '超高�? the, be, to, of, and, a, in',
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
      color: 'purple',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '結合多種記憶策略',
        '記憶效果最�?,
        '系統化學�?,
        '適合長期學習'
      ],
      examples: [
        '第一階段: 學習字根字首規則 (22 �?',
        '第二階段: 按主題學�?(26 �?',
        '建立完整的詞彙網�?,
        '達到最佳學習效�?
      ]
    },
    {
      id: 'syllable',
      name: '音節分組學習',
      description: '按照音節數量分組，循序漸進學習，有助於發�?,
      icon: '🎵',
      color: 'pink',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '有助於發音學�?,
        '循序漸進學�?,
        '記憶效果提升 20-30%',
        '適合初學�?
      ],
      examples: [
        '單音節: cat, dog, run, big',
        '雙音節: happy, teacher, water',
        '三音節: beautiful, important',
        '多音節: university, communication'
      ]
    },
    {
      id: 'context',
      name: '情境分組學習',
      description: '按照生活情境分組，實用性強，容易應用到生活�?,
      icon: '🎬',
      color: 'teal',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '實用性極�?,
        '記憶效果提升 50-70%',
        '容易應用到生活中',
        '情境記憶深刻'
      ],
      examples: [
        '餐廳情境: menu, order, waiter, bill',
        '醫院情境: doctor, nurse, patient',
        '機場情境: flight, ticket, passport',
        '購物情境: shop, buy, price, discount'
      ]
    },
    {
      id: 'emotional',
      name: '情感分組學習',
      description: '按照情感色彩分組，情感記憶最深刻',
      icon: '😊',
      color: 'rose',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '記憶效果提升 60-80%',
        '情感記憶最深刻',
        '有助於情感表�?,
        '記憶保持率最�?
      ],
      examples: [
        '正面情感: happy, joy, love, wonderful',
        '負面情感: sad, angry, hate, terrible',
        '中性情�? table, chair, book, pen'
      ]
    },
    {
      id: 'action',
      name: '動作分組學習',
      description: '按照動作類型分組，動作記憶效果好',
      icon: '🏃',
      color: 'lime',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '動作記憶效果�?,
        '記憶效果提升 30-50%',
        '適合動覺學習�?,
        '有趣且互動性強'
      ],
      examples: [
        '移動動作: walk, run, jump, fly',
        '手部動作: write, draw, hold, catch',
        '思考動�? think, know, understand',
        '感官動作: see, hear, smell, taste'
      ]
    },
    {
      id: 'visual',
      name: '視覺聯想分組學習',
      description: '按照視覺特徵分組，視覺記憶效果好',
      icon: '🎨',
      color: 'amber',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '視覺記憶效果�?,
        '適合視覺學習�?,
        '有助於描述能�?,
        '記憶效果提升 30-40%'
      ],
      examples: [
        '顏色: red, blue, green, yellow',
        '形狀: circle, square, triangle',
        '大小: big, small, large, tiny',
        '材質: wood, metal, plastic, glass'
      ]
    },
    {
      id: 'temporal',
      name: '時間分組學習',
      description: '按照時間類別分組，時間軸記憶清晰',
      icon: '�?,
      color: 'cyan',
      groupCount: 0,
      wordsPerGroup: 0,
      estimatedDays: 0,
      advantages: [
        '時間軸記憶清�?,
        '實用性強',
        '適合日常對話',
        '記憶效果提升 20-30%'
      ],
      examples: [
        '時間�? morning, noon, afternoon',
        '季節: spring, summer, autumn, winter',
        '月份: January, February, March',
        '時間長度: second, minute, hour, day'
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
      alert('請先選擇一個學習路�?);
      return;
    }

    // 保存用戶選擇�?localStorage
    localStorage.setItem('learningPath', selectedPath);
    localStorage.setItem('geptLevel', selectedGeptLevel);

    // 跳轉到分組列表頁�?    router.push(`/learn/groups?path=${selectedPath}&geptLevel=${selectedGeptLevel}`);
  };

  // 顏色映射
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
    indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    pink: 'bg-pink-50 border-pink-200 hover:border-pink-400',
    teal: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    rose: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    lime: 'bg-lime-50 border-lime-200 hover:border-lime-400',
    amber: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    cyan: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400'
  };

  const selectedColorClasses = {
    blue: 'border-blue-500 bg-blue-100',
    green: 'border-green-500 bg-green-100',
    purple: 'border-purple-500 bg-purple-100',
    orange: 'border-orange-500 bg-orange-100',
    yellow: 'border-yellow-500 bg-yellow-100',
    indigo: 'border-indigo-500 bg-indigo-100',
    pink: 'border-pink-500 bg-pink-100',
    teal: 'border-teal-500 bg-teal-100',
    rose: 'border-rose-500 bg-rose-100',
    lime: 'border-lime-500 bg-lime-100',
    amber: 'border-amber-500 bg-amber-100',
    cyan: 'border-cyan-500 bg-cyan-100'
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">載入�?..</div>
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
              初級 {loading ? '(載入�?..)' : `(${geptStats?.totalWords || 0} 個單�?`}
            </button>
            <button
              onClick={() => setSelectedGeptLevel('INTERMEDIATE')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                selectedGeptLevel === 'INTERMEDIATE'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              中級 {loading ? '(載入�?..)' : `(${geptStats?.totalWords || 0} 個單�?`}
            </button>
            <button
              onClick={() => setSelectedGeptLevel('HIGH_INTERMEDIATE')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                selectedGeptLevel === 'HIGH_INTERMEDIATE'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              中高�?{loading ? '(載入�?..)' : `(${geptStats?.totalWords || 0} 個單�?`}
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
              {/* 圖標和標�?*/}
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-3">{path.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{path.name}</h3>
                  <p className="text-sm text-gray-600">
                    {loading ? (
                      '載入�?..'
                    ) : geptStats?.pathStats[path.id] ? (
                      `${geptStats.pathStats[path.id].groupCount} �?· �?${geptStats.pathStats[path.id].totalWords} 個單字`
                    ) : (
                      `${path.groupCount} �?· 每組 ${path.wordsPerGroup} 個單字`
                    )}
                  </p>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-gray-700 mb-4">{path.description}</p>

              {/* 預計時間 */}
              <div className="bg-white rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-600">預計完成時間</div>
                <div className="text-2xl font-bold text-gray-800">
                  {loading ? (
                    '...'
                  ) : geptStats?.pathStats[path.id] ? (
                    `${Math.ceil(geptStats.pathStats[path.id].groupCount / 2)} 天`
                  ) : (
                    `${path.estimatedDays} 天`
                  )}
                </div>
              </div>

              {/* 優勢 */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">�?優勢</div>
                <ul className="space-y-1">
                  {path.advantages.slice(0, 3).map((advantage, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2">�?/span>
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
                    �?已選�?                  </div>
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

