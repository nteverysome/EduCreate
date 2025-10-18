import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import MatchingGame from '../../components/games/MatchingGame';
import FlashcardGame from '../../components/games/FlashcardGame';
import QuizGame from '../../components/games/QuizGame';
import ShareActivity from '../../components/ShareActivity';

interface Activity {
  id: string;
  title: string;
  description?: string;
  templateType: string;
  createdAt: string;
  published: boolean;
  content?: any;
  authorName?: string;
  version?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: string;
  tags?: string[];
}

export default function ActivityShare() {
  const router = useRouter();
  const { id } = router.query;
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameScore, setGameScore] = useState<{score: number, total: number} | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // 獲取活動數據
  useEffect(() => {
    if (id) {
      // 在實際應用中，這裡會從API獲取數據
      // 模擬API請求
      setTimeout(() => {
        // 模擬活動數據
        const mockActivities: Activity[] = [
          {
            id: '1',
            title: '英語詞彙學習',
            description: '基礎英語詞彙學習卡片',
            templateType: 'FLASHCARDS',
            createdAt: '2023-10-15T10:30:00Z',
            published: true,
            authorName: '王老師',
            version: '1.2',
            difficulty: 'easy',
            estimatedTime: '5-10分鐘',
            tags: ['英語', '詞彙', '初級'],
            content: [
              { id: '1', front: '蘋果', back: 'Apple', tags: ['水果'] },
              { id: '2', front: '香蕉', back: 'Banana', tags: ['水果'] },
              { id: '3', front: '橙子', back: 'Orange', tags: ['水果'] },
              { id: '4', front: '草莓', back: 'Strawberry', tags: ['水果'] }
            ]
          },
          {
            id: '2',
            title: '數學概念配對',
            description: '數學術語與定義配對練習',
            templateType: 'MATCHING',
            createdAt: '2023-10-10T14:20:00Z',
            published: true,
            authorName: '李老師',
            version: '2.0',
            difficulty: 'medium',
            estimatedTime: '10-15分鐘',
            tags: ['數學', '概念', '中級'],
            content: {
              questions: [
                { id: '1', content: '加法' },
                { id: '2', content: '減法' },
                { id: '3', content: '乘法' },
                { id: '4', content: '除法' }
              ],
              answers: [
                { id: '1', content: 'Addition' },
                { id: '2', content: 'Subtraction' },
                { id: '3', content: 'Multiplication' },
                { id: '4', content: 'Division' }
              ]
            }
          },
          {
            id: '3',
            title: '歷史知識測驗',
            description: '中國古代歷史知識測驗',
            templateType: 'QUIZ',
            createdAt: '2023-10-05T09:15:00Z',
            published: true,
            authorName: '張老師',
            version: '1.5',
            difficulty: 'hard',
            estimatedTime: '15-20分鐘',
            tags: ['歷史', '中國', '高級'],
            content: [
              {
                id: '1',
                question: '秦始皇統一六國的年份是？',
                options: ['公元前221年', '公元前206年', '公元前202年', '公元前220年'],
                correctAnswer: 0,
                explanation: '秦始皇於公元前221年統一六國，建立了中國歷史上第一個統一的多民族的中央集權國家。'
              },
              {
                id: '2',
                question: '漢朝的建立者是誰？',
                options: ['劉邦', '項羽', '劉備', '曹操'],
                correctAnswer: 0,
                explanation: '劉邦於公元前202年建立漢朝，史稱漢高祖。'
              },
              {
                id: '3',
                question: '唐朝的建立者是誰？',
                options: ['李淵', '李世民', '李隆基', '李白'],
                correctAnswer: 0,
                explanation: '李淵於618年建立唐朝，史稱唐高祖。'
              }
            ]
          }
        ];

        const foundActivity = mockActivities.find(a => a.id === id);
        setActivity(foundActivity || null);
        setIsLoading(false);
      }, 500);
    }
  }, [id]);

  // 處理遊戲完成
  const handleGameComplete = (score?: number, total?: number) => {
    setGameCompleted(true);
    if (score !== undefined && total !== undefined) {
      setGameScore({ score, total });
      // 模擬保存進度到服務器
      setProgress(100);
    }
  };
  
  // 處理收藏功能
  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // 模擬API請求
    setTimeout(() => {
      // 在實際應用中，這裡會發送API請求保存收藏狀態
      console.log(`活動 ${id} 已${!isFavorited ? '加入收藏' : '取消收藏'}`);
    }, 300);
  };
  
  // 提交反饋
  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      alert('請輸入反饋內容');
      return;
    }
    // 模擬API請求
    setTimeout(() => {
      // 在實際應用中，這裡會發送API請求保存反饋
      alert('感謝您的反饋！');
      setFeedback('');
      setShowFeedback(false);
    }, 500);
  };
  
  // 顯示版本歷史
  const handleShowVersionHistory = () => {
    setShowVersionHistory(!showVersionHistory);
  };

  // 渲染活動內容
  const renderActivityContent = () => {
    if (!activity) return null;

    switch (activity.templateType) {
      case 'MATCHING':
        return <MatchingGame items={activity.content} onComplete={handleGameComplete} />;
      case 'FLASHCARDS':
        return <FlashcardGame cards={activity.content} onComplete={() => handleGameComplete()} />;
      case 'QUIZ':
        return <QuizGame questions={activity.content} onComplete={handleGameComplete} />;
      default:
        return <div className="p-4 bg-gray-100 rounded-lg">不支持的活動類型</div>;
    }
  };

  // 獲取模板類型的中文名稱
  const getTemplateTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'MATCHING': '配對遊戲',
      'FLASHCARDS': '單字卡片',
      'QUIZ': '測驗問答'
    };
    return typeMap[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">找不到活動</h2>
          <p className="text-gray-600 mb-6">您請求的活動不存在或已被刪除。</p>
          <Link href="/" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{activity.title} - EduCreate</title>
        <meta name="description" content={activity.description || `EduCreate 互動式教育活動: ${activity.title}`} />

        {/* Open Graph Meta Tags - 使用動態生成的預覽圖 */}
        <meta property="og:title" content={`${activity.title} - EduCreate`} />
        <meta property="og:description" content={activity.description || `EduCreate 互動式教育活動: ${activity.title}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app'}/activity/${id}`} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app'}/api/og/activity/${id}?title=${encodeURIComponent(activity.title)}&gameType=${activity.templateType || 'vocabulary'}`} />
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="300" />
        <meta property="og:image:alt" content={`${activity.title} - 遊戲預覽`} />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${activity.title} - EduCreate`} />
        <meta name="twitter:description" content={activity.description || `EduCreate 互動式教育活動: ${activity.title}`} />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app'}/api/og/activity/${id}?title=${encodeURIComponent(activity.title)}&gameType=${activity.templateType || 'vocabulary'}`} />
      </Head>

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">EduCreate</span>
          </Link>
          <div className="flex items-center space-x-4">
            {status === 'authenticated' ? (
              <>
                <Link href="/activities" className="text-gray-600 hover:text-indigo-600">
                  瀏覽活動
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600">
                  我的儀表板
                </Link>
              </>
            ) : (
              <>
                <Link href="/activities" className="text-gray-600 hover:text-indigo-600">
                  瀏覽活動
                </Link>
                <Link href="/api/auth/signin" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  登入
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
                {activity.description && (
                  <p className="mt-2 text-gray-600">{activity.description}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {getTemplateTypeName(activity.templateType)}
                  </span>
                  {activity.difficulty && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.difficulty === 'easy' ? 'bg-green-100 text-green-800' : activity.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {activity.difficulty === 'easy' ? '初級' : activity.difficulty === 'medium' ? '中級' : '高級'}
                    </span>
                  )}
                  {activity.estimatedTime && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {activity.estimatedTime}
                    </span>
                  )}
                  {activity.version && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 cursor-pointer" onClick={handleShowVersionHistory}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      版本 {activity.version}
                    </span>
                  )}
                  {activity.authorName && (
                    <span className="text-sm text-gray-500 ml-1">由 {activity.authorName} 創建</span>
                  )}
                </div>
                {activity.tags && activity.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {activity.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full ${isFavorited ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-50'}`}
                  aria-label={isFavorited ? '取消收藏' : '收藏'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorited ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-50"
                  aria-label="分享"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setShowFeedback(true)}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-50"
                  aria-label="反饋"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {showVersionHistory && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800 mb-2">版本歷史</h3>
                <ul className="text-sm space-y-1">
                  <li className="flex justify-between">
                    <span>版本 {activity.version}</span>
                    <span className="text-gray-500">當前版本 - 更新於 {new Date(activity.createdAt).toLocaleDateString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>版本 1.0</span>
                    <span className="text-gray-500">初始版本 - 創建於 {new Date(activity.createdAt).toLocaleDateString()}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                互動學習活動
              </h2>
              <div className="text-sm text-gray-500">
                {activity.templateType === 'QUIZ' ? '測驗問答' : activity.templateType === 'MATCHING' ? '配對遊戲' : '單字卡片'}
              </div>
            </div>
            
            {/* 進度指示器 */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>學習進度</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            {gameCompleted ? (
              <div className="text-center py-8 max-w-md mx-auto">
                <div className="mb-6 bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                  <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">活動完成！</h2>
                {gameScore && (
                  <div className="mb-6">
                    <p className="text-lg text-gray-600 mb-2">
                      您的得分: <span className="font-bold text-indigo-600">{gameScore.score}</span> / {gameScore.total}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(gameScore.score / gameScore.total) * 100}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {gameScore.score === gameScore.total ? '太棒了！完美得分！' :
                       gameScore.score >= gameScore.total * 0.8 ? '做得很好！繼續努力！' :
                       gameScore.score >= gameScore.total * 0.6 ? '不錯的嘗試！再接再厲！' :
                       '繼續練習，你會做得更好！'}
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setGameCompleted(false);
                      setGameScore(null);
                      setProgress(0);
                      // 重新載入活動
                      window.location.reload();
                    }}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    再試一次
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    分享結果
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className={`${isFavorited ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-300 text-gray-700'} border px-6 py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorited ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isFavorited ? '已收藏' : '收藏活動'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg">
                {renderActivityContent()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">想要創建自己的互動教育活動？</p>
          <Link href="/register" className="mt-2 inline-block text-indigo-600 hover:text-indigo-800 hover:underline">
            立即註冊 EduCreate
          </Link>
        </div>
      </main>

      {showShareModal && (
        <ShareActivity
          activityId={activity.id}
          activityTitle={activity.title}
          onClose={() => setShowShareModal(false)}
        />
      )}
      
      {/* 反饋彈窗 */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">提供反饋</h3>
              <button onClick={() => setShowFeedback(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-4">您的反饋將幫助我們改進此活動。</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 h-32"
              placeholder="請輸入您的反饋或建議..."
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                提交反饋
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}