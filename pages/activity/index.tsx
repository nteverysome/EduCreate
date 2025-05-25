import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  h5pContentId?: string;
}

export default function ActivityList() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 獲取活動列表
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        if (!response.ok) {
          throw new Error('獲取活動列表失敗');
        }
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        setError('獲取活動列表失敗');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // 刪除活動
  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此活動嗎？')) return;

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('刪除活動失敗');
      }

      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (err) {
      setError('刪除活動失敗');
      console.error(err);
    }
  };

  // 發布活動
  const handlePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('更新活動狀態失敗');
      }

      const updatedActivity = await response.json();
      setActivities(prev => prev.map(activity => 
        activity.id === id ? updatedActivity : activity
      ));
    } catch (err) {
      setError('更新活動狀態失敗');
      console.error(err);
    }
  };

  // 獲取活動類型的中文名稱
  const getActivityTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'matching': '配對遊戲',
      'flashcards': '單字卡片',
      'quiz': '測驗問答'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>活動管理 - EduCreate</title>
      </Head>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">活動管理</h1>
        <div className="flex space-x-2">
          <Link
            href="/activity/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            創建活動
          </Link>
          <Link
            href="/h5p"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            管理H5P內容
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">尚未創建任何活動</p>
          <Link
            href="/activity/create"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            創建第一個活動
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  標題
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新時間
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                    {activity.description && (
                      <div className="text-sm text-gray-500">{activity.description}</div>
                    )}
                    {activity.h5pContentId && (
                      <div className="text-xs text-indigo-600 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          包含H5P內容
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getActivityTypeName(activity.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {activity.published ? '已發布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/activity/${activity.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        查看
                      </Link>
                      <Link
                        href={`/editor/${activity.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        編輯
                      </Link>
                      <button
                        onClick={() => handlePublish(activity.id, activity.published)}
                        className="text-green-600 hover:text-green-900"
                      >
                        {activity.published ? '取消發布' : '發布'}
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login?redirect=/activity',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};