import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import MatchingGame from '../components/games/MatchingGame';
import FlashcardGame from '../components/games/FlashcardGame';
import QuizGame from '../components/games/QuizGame';
import SubscriptionPrompt from '../components/SubscriptionPrompt';
import useSubscription from '../hooks/useSubscription';

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export default function CreateActivity() {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const { hasSubscription, isLoading: isSubscriptionLoading, requiresUpgrade, activityCount, activityLimit, canCreateMore } = useSubscription();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [step, setStep] = useState(1);
  const [previewData, setPreviewData] = useState<any>(null);

  // 從URL獲取模板參數
  useEffect(() => {
    if (router.query.template) {
      setSelectedTemplate(router.query.template as string);
      setStep(2);
    }
  }, [router.query]);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=' + encodeURIComponent('/create'));
    }
  }, [status, router]);
  
  // 使用useSubscription hook已經獲取了活動數量和限制信息，不需要額外獲取

  // 模板選項
  const templateOptions: TemplateOption[] = [
    {
      id: 'matching',
      name: '配對遊戲',
      description: '創建配對練習，幫助學生建立概念聯繫',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    },
    {
      id: 'flashcards',
      name: '單字卡片',
      description: '製作互動式詞彙學習卡片',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'quiz',
      name: '測驗問答',
      description: '設計趣味測驗，檢驗學習成果',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  // 處理模板選擇
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep(2);
  };

  // 處理基本信息提交
  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) {
      alert('請輸入活動標題');
      return;
    }
    setStep(3);

    // 根據選擇的模板生成預覽數據
    generatePreviewData();
  };

  // 生成預覽數據
  const generatePreviewData = () => {
    switch (selectedTemplate) {
      case 'matching':
        setPreviewData({
          questions: [
            { id: '1', content: '蘋果' },
            { id: '2', content: '香蕉' },
            { id: '3', content: '橙子' },
            { id: '4', content: '草莓' }
          ],
          answers: [
            { id: '1', content: 'Apple' },
            { id: '2', content: 'Banana' },
            { id: '3', content: 'Orange' },
            { id: '4', content: 'Strawberry' }
          ]
        });
        break;
      case 'flashcards':
        setPreviewData([
          { id: '1', front: '蘋果', back: 'Apple', tags: ['水果'] },
          { id: '2', front: '香蕉', back: 'Banana', tags: ['水果'] },
          { id: '3', front: '橙子', back: 'Orange', tags: ['水果'] },
          { id: '4', front: '草莓', back: 'Strawberry', tags: ['水果'] }
        ]);
        break;
      case 'quiz':
        setPreviewData([
          {
            id: '1',
            question: '蘋果的英文是什麼？',
            options: ['Apple', 'Banana', 'Orange', 'Strawberry'],
            correctAnswer: 0,
            explanation: '蘋果的英文是Apple。'
          },
          {
            id: '2',
            question: '香蕉的英文是什麼？',
            options: ['Apple', 'Banana', 'Orange', 'Strawberry'],
            correctAnswer: 1,
            explanation: '香蕉的英文是Banana。'
          },
          {
            id: '3',
            question: '橙子的英文是什麼？',
            options: ['Apple', 'Banana', 'Orange', 'Strawberry'],
            correctAnswer: 2,
            explanation: '橙子的英文是Orange。'
          }
        ]);
        break;
    }
  };

  // 處理保存活動
  const handleSaveActivity = () => {
    setIsSaving(true);
    
    // 模擬API保存過程
    setTimeout(() => {
      // 在實際應用中，這裡會發送API請求保存活動
      setIsSaving(false);
      alert('活動已保存！');
      router.push('/dashboard');
    }, 1500);
  };

  // 渲染預覽
  const renderPreview = () => {
    if (!previewData) return null;

    switch (selectedTemplate) {
      case 'matching':
        return <MatchingGame items={previewData} />;
      case 'flashcards':
        return <FlashcardGame cards={previewData} />;
      case 'quiz':
        return <QuizGame questions={previewData} />;
      default:
        return null;
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  if (status === 'loading' || isSubscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>創建活動 | EduCreate</title>
        <meta name="description" content="使用EduCreate創建互動式教學活動" />
      </Head>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 步驟指示器 */}
          {!canCreateMore && (
            <div className="mb-8">
              <SubscriptionPrompt 
                message={`免費用戶最多只能創建${activityLimit}個活動。您已創建了${activityCount}個活動。升級到專業版以創建無限活動！`}
                showButton={true}
                buttonText="升級到專業版"
                className="mb-6"
              />
            </div>
          )}
          
          <div className="mb-8">
            <nav className="flex items-center justify-center" aria-label="Progress">
              <ol className="flex items-center space-x-5">
                <li>
                  <div className={`flex items-center ${step > 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                    <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${step > 1 ? 'bg-blue-100' : step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                      {step > 1 ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>1</span>
                      )}
                    </span>
                    <span className="ml-3 text-sm font-medium">選擇模板</span>
                  </div>
                </li>

                <li>
                  <div className={`flex items-center ${step === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                    <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                      <span>2</span>
                    </span>
                    <span className="ml-3 text-sm font-medium">基本信息</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* 步驟內容 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {step === 1 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">選擇活動模板</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {templateOptions.map((template) => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-6 cursor-pointer transition-all ${selectedTemplate === template.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 hover:border-blue-300 hover:shadow'}`}
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                          {template.icon}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      </div>
                      <p className="text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">設置活動基本信息</h2>
                <form onSubmit={handleBasicInfoSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        活動標題 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={activityTitle}
                        onChange={(e) => setActivityTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="輸入活動標題"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        活動描述
                      </label>
                      <textarea
                        id="description"
                        value={activityDescription}
                        onChange={(e) => setActivityDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="輸入活動描述（可選）"
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        上一步
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!canCreateMore}
                      >
                        開始編輯
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">或者直接前往 <Link href="/templates" className="text-blue-600 hover:text-blue-800 font-medium">模板庫</Link> 選擇預設模板</p>
          </div>
        </div>
      </main>
    </div>
  );
}