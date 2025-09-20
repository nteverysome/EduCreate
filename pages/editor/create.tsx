import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

export default function CreateActivityPage() {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const { template, type } = router.query;
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [step, setStep] = useState(1);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (status === 'unauthenticated') {
      // 如果用戶未登錄，重定向到登錄頁面並保留當前URL作為回調
      const callbackUrl = encodeURIComponent(router.asPath);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (status === 'authenticated') {
      setIsLoading(false);
    }
  }, [status, router]);

  // 處理模板參數
  useEffect(() => {
    if (template) {
      // 根據模板ID獲取模板信息
      const templateInfo = getTemplateInfo(template as string);
      if (templateInfo) {
        setSelectedTemplate(templateInfo);
        setActivityTitle(templateInfo.name);
        setActivityDescription(templateInfo.description);
        setStep(2);
      } else {
        alert('未找到指定的模板');
        router.push('/');
      }
    }
  }, [template, router]);

  // 獲取模板信息
  const getTemplateInfo = (templateId: string) => {
    const templates = [
      {
        id: '1',
        name: '配對遊戲',
        description: '拖放配對練習，適合詞彙學習',
        type: 'matching',
        icon: '🎯'
      },
      {
        id: '2',
        name: '問答遊戲',
        description: '互動式問答測驗',
        type: 'quiz',
        icon: '❓'
      },
      {
        id: '3',
        name: '單字遊戲',
        description: '詞彙學習卡片',
        type: 'flashcards',
        icon: '📚'
      },
      {
        id: '4',
        name: '隨機輪盤',
        description: '幸運轉盤選擇器',
        type: 'wheel',
        icon: '🎡'
      },
      {
        id: '5',
        name: '迷宮遊戲',
        description: '知識探索迷宮',
        type: 'maze',
        icon: '🌟'
      },
      {
        id: '6',
        name: '排序遊戲',
        description: '邏輯排序練習',
        type: 'sorting',
        icon: '🔢'
      },
      {
        id: '7',
        name: '記憶遊戲',
        description: '翻牌記憶挑戰',
        type: 'memory',
        icon: '🧠'
      },
      {
        id: '8',
        name: '填字遊戲',
        description: '互動填字練習',
        type: 'crossword',
        icon: '✏️'
      }
    ];

    return templates.find(t => t.id === templateId);
  };

  // 處理創建活動
  const handleCreateActivity = async () => {
    if (!activityTitle.trim()) {
      toast.error('請輸入活動標題');
      return;
    }

    if (!selectedTemplate) {
      toast.error('請選擇模板');
      return;
    }

    setIsLoading(true);

    try {
      // 創建活動
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: activityTitle,
          description: activityDescription,
          type: selectedTemplate.type,
          templateId: selectedTemplate.id,
          status: 'draft'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '創建活動失敗');
      }

      const data = await response.json();

      alert('活動創建成功！');

      // 重定向到編輯器頁面
      router.push(`/editor?id=${data.id}&template=${selectedTemplate.id}&type=${selectedTemplate.type}`);
    } catch (error) {
      console.error('創建活動失敗:', error);
      alert(error instanceof Error ? error.message : '創建活動失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 如果正在加載或用戶未認證，顯示加載狀態
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 如果用戶未認證，不渲染任何內容（已經重定向）
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <>
      <Head>
        <title>創建新活動 | EduCreate</title>
        <meta name="description" content="使用EduCreate創建互動式教學活動" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">創建新活動</h1>
            <p className="text-lg text-gray-600">
              {selectedTemplate ? `使用 ${selectedTemplate.name} 模板創建活動` : '選擇模板開始創建'}
            </p>
          </div>

          {/* 步驟指示器 */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>

          {/* 主要內容 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {selectedTemplate && (
              <>
                {/* 模板信息 */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{selectedTemplate.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h3>
                      <p className="text-gray-600">{selectedTemplate.description}</p>
                    </div>
                  </div>
                </div>

                {/* 活動設置表單 */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      活動標題 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="輸入活動標題"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      活動描述
                    </label>
                    <textarea
                      id="description"
                      value={activityDescription}
                      onChange={(e) => setActivityDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="輸入活動描述（可選）"
                    />
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex justify-between pt-6">
                    <Link
                      href="/"
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                    >
                      返回首頁
                    </Link>
                    
                    <button
                      onClick={handleCreateActivity}
                      disabled={isLoading || !activityTitle.trim()}
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isLoading ? '創建中...' : '創建活動'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 如果沒有選擇模板，顯示錯誤信息 */}
            {!selectedTemplate && !template && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未選擇模板</h3>
                <p className="text-gray-600 mb-4">請從首頁選擇一個模板開始創建活動</p>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  返回首頁選擇模板
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
