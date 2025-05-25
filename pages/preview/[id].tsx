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
}

export default function ActivityPreview() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameScore, setGameScore] = useState<{score: number, total: number} | null>(null);

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
            published: false,
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

        // 設置分享URL
        if (foundActivity) {
          setShareUrl(`${window.location.origin}/preview/${foundActivity.id}`);
        }
      }, 500);
    }
  }, [id]);

  // 處理遊戲完成
  const handleGameComplete = (score?: number, total?: number) => {
    setGameCompleted(true);
    if (score !== undefined && total !== undefined) {
      setGameScore({ score, total });
    }
  };

  // 複製分享鏈接
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('分享鏈接已複製到剪貼板！');
  };

  // 渲染活動內容
  const renderActivityContent = () => {
    if (!activity || !activity.content) return null;

    switch (activity.templateType) {
      case 'MATCHING':
        return <MatchingGame items={activity.content} onComplete={handleGameComplete} />;
      case 'FLASHCARDS':
        return <FlashcardGame cards={activity.content} onComplete={() => handleGameComplete()} />;
      case 'QUIZ':
        return <QuizGame questions={activity.content} onComplete={handleGameComplete} />;
      default:
        return <div className="p-4 text-gray-500">不支持的活動類型</div>;
    }
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
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">找不到活動</h3>
          <p className="mt-1 text-gray-500">您請求的活動不存在或已被刪除</p>
          <div className="mt-6">
            <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              返回儀表板
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>{activity.title} - EduCreate</title>
        <meta name="description" content={activity.description || '互動教學活動'} />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">EduCreate</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600">
              返回儀表板
            </Link>
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              分享
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{activity.title}</h1>
                {activity.description && <p className="mt-1 text-gray-500">{activity.description}</p>}
              </div>
              <div className="flex space-x-2">
                {session && (
                  <Link href={`/edit/${activity.id}`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    編輯
                  </Link>
                )}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  分享
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="p-6">
              {gameCompleted ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">活動完成！</h2>
                  {gameScore && (
                    <p className="mt-2 text-lg text-gray-600">
                      您的得分: {gameScore.score} / {gameScore.total}
                    </p>
                  )}
                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setGameCompleted(false);
                        setGameScore(null);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      再試一次
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      分享結果
                    </button>
                    <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      返回儀表板
                    </Link>
                  </div>
                </div>
              ) : (
                renderActivityContent()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 分享模態框 */}
      {showShareModal && (
        <ShareActivity
          activityId={activity?.id || ''}
          activityTitle={activity?.title || ''}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}