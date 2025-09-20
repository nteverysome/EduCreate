
// 替代 date-fns 的輕量級日期工具函數
const formatDate = (date: Date, formatStr?: string): string => {
  if (formatStr === 'PPP') {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  
  if (diffSec < 60) {
    return '剛剛';
  } else if (diffMin < 60) {
    return `${diffMin} 分鐘前`;
  } else if (diffHour < 24) {
    return `${diffHour} 小時前`;
  } else if (diffDay < 30) {
    return `${diffDay} 天前`;
  } else if (diffMonth < 12) {
    return `${diffMonth} 個月前`;
  } else {
    const diffYear = Math.round(diffDay / 365);
    return `${diffYear} 年前`;
  }
};

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Version {
  id: string;
  versionName: string;
  content: any;
  createdAt: string;
  userId: string;
  description?: string;
  createdByUser?: {
    name: string;
  };
}

export default function VersionPreview() {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const { id } = router.query;
  
  const [version, setVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
    }
  }, [status, router]);

  // 加載版本數據
  useEffect(() => {
    if (!id || status !== 'authenticated') return;
    
    const fetchVersion = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/activities/versions/${id}`);
        if (!response.ok) throw new Error('獲取版本數據失敗');
        const data = await response.json();
        setVersion(data);
      } catch (error) {
        console.error('獲取版本數據失敗:', error);
        setError('獲取版本數據失敗');
        toast.error('獲取版本數據失敗');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersion();
  }, [id, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/dashboard" className="text-blue-500 hover:underline flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          返回儀表板
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>版本預覽 | EduCreate</title>
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 mr-4">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">版本預覽</h1>
          </div>
          {version && (
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              返回
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {version && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">版本 {version.versionName}</h2>
                <p className="text-sm text-gray-500">
                  創建於 {formatDate(new Date(version.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhTW })}
                </p>
                <p className="text-sm text-gray-500">
                  創建者: {version.createdByUser?.name || '未知用戶'}
                </p>
                {version.description && (
                  <p className="text-sm mt-2 text-gray-700">{version.description}</p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">版本內容</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {JSON.stringify(version.content, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  返回
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}