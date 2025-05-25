import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import prisma from '../../lib/prisma';
import SubscriptionPrompt from '../../components/SubscriptionPrompt';
import useSubscription from '../../hooks/useSubscription';

interface H5PContent {
  id: string;
  title: string;
  description?: string;
  contentType: string;
  contentPath: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

interface CreateActivityProps {
  h5pContent?: H5PContent;
  h5pId?: string;
}

export default function CreateActivity({ h5pContent, h5pId }: CreateActivityProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState<'matching' | 'flashcards' | 'quiz'>('quiz');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { hasSubscription, isLoading: isSubscriptionLoading, requiresUpgrade, activityCount, activityLimit, canCreateMore } = useSubscription();

  // 如果有H5P內容，自動填充標題和描述
  useEffect(() => {
    if (h5pContent) {
      setTitle(`${h5pContent.title} 活動`);
      if (h5pContent.description) {
        setDescription(h5pContent.description);
      }
    }
  }, [h5pContent]);
  
  // 使用useSubscription hook已經獲取了活動數量和限制信息，不需要額外獲取

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('請輸入活動標題');
      return;
    }
    
    if (!canCreateMore) {
      setError(`免費用戶最多只能創建${activityLimit}個活動，請升級到專業版以創建更多活動`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 創建活動
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          type: activityType,
          h5pContentId: h5pId, // 關聯H5P內容
        }),
      });

      if (!response.ok) {
        throw new Error('創建活動失敗');
      }

      const data = await response.json();
      // 重定向到編輯器頁面
      router.push(`/editor/${data.id}`);
    } catch (err) {
      console.error(err);
      setError('創建活動失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscriptionLoading) {
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
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>創建活動 - EduCreate</title>
      </Head>

      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          &larr; 返回儀表板
        </Link>
      </div>
      
      {!canCreateMore && (
        <div className="mb-6">
          <SubscriptionPrompt 
            message={`免費用戶最多只能創建${activityLimit}個活動。您已創建了${activityCount}個活動。升級到專業版以創建無限活動！`}
            showButton={true}
            buttonText="升級到專業版"
          />
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-2xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">創建新活動</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {h5pContent && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">使用H5P內容: {h5pContent.title}</p>
              <p className="text-sm mt-1">類型: {h5pContent.contentType}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                活動標題 *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                活動描述
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 mb-1">
                活動類型
              </label>
              <select
                id="activityType"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as 'matching' | 'flashcards' | 'quiz')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="quiz">測驗問答</option>
                <option value="matching">配對遊戲</option>
                <option value="flashcards">單字卡片</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading || !canCreateMore}
              >
                {isLoading ? '創建中...' : '創建活動'}
              </button>
              <Link
                href={h5pId ? `/h5p/preview/${h5pId}` : '/dashboard'}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login?redirect=/activity/create',
        permanent: false,
      },
    };
  }

  // 檢查是否有H5P內容ID參數
  const h5pId = context.query.h5pId as string;
  let h5pContent = null;

  if (h5pId) {
    try {
      // 獲取H5P內容
      const content = await prisma.h5PContent.findFirst({
        where: {
          id: h5pId,
          OR: [
            { userId: session.user.id },
            { status: 'PUBLISHED' },
          ],
        },
      });

      if (content) {
        h5pContent = JSON.parse(JSON.stringify(content));
      }
    } catch (error) {
      console.error('獲取H5P內容失敗:', error);
    }
  }

  return {
    props: {
      h5pContent,
      h5pId: h5pId || null,
    },
  };
};