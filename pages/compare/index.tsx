import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { ActivityVersion } from '@/models/activityVersion';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

const prisma = new PrismaClient();

// 定义组件props类型
interface CompareVersionsProps {
  versions: any[];
  activityId: string;
  error?: string;
}

// 版本比較頁面
export default function CompareVersions({ versions, activityId }: CompareVersionsProps) {
  const router = useRouter();
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 選擇版本進行比較
  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else {
        // 最多選擇兩個版本進行比較
        if (prev.length >= 2) {
          return [prev[1], versionId];
        }
        return [...prev, versionId];
      }
    });
  };
  
  // 恢復到特定版本
  const restoreVersion = async (versionId: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/activities/versions/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId,
          versionId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '恢復版本失敗');
      }
      
      // 恢復成功，重定向到編輯器
      router.push(`/editor/${activityId}?restored=true`);
    } catch (err) {
      // 確保錯誤訊息是字串格式
        let errorMessage = '載入比較數據時發生錯誤';
        
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err && typeof err === 'object') {
          if ((err as any).message && typeof (err as any).message === 'string') {
            errorMessage = (err as any).message;
          } else if ((err as any).error && typeof (err as any).error === 'string') {
            errorMessage = (err as any).error;
          } else {
            errorMessage = '載入比較數據失敗，請稍後再試';
          }
        }
        
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">版本歷史</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <Link href={`/editor/${activityId}`}>
          <a className="text-blue-500 hover:underline">返回編輯器</a>
        </Link>
      </div>
      
      {selectedVersions.length === 2 && (
        <div className="mb-6">
          <Link href={`/compare/diff?v1=${selectedVersions[0]}&v2=${selectedVersions[1]}&activityId=${activityId}`}>
            <a className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              比較選中的版本
            </a>
          </Link>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                選擇
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                版本
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                創建時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                創建者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                描述
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {versions.map((version: any) => (
              <tr key={version.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedVersions.includes(version.id)}
                    onChange={() => toggleVersionSelection(version.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    v{version.versionNumber}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {version.user?.name || '未知用戶'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {version.description || '無描述'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => restoreVersion(version.id)}
                    disabled={loading}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    恢復到此版本
                  </button>
                  <Link href={`/preview/version/${version.id}`}>
                    <a className="text-blue-600 hover:text-blue-900">
                      預覽
                    </a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 服務器端獲取版本數據
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context);
  
  // 檢查用戶是否已登入
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  const { activityId } = context.query;
  
  if (!activityId) {
    return {
      notFound: true,
    };
  }
  
  try {
    // 檢查用戶是否有權限訪問該活動
    const activity = await prisma.activity.findUnique({
      where: { id: activityId as string },
      select: { userId: true }
    });
    
    if (!activity || activity.userId !== session.user.id) {
      return {
        notFound: true,
      };
    }
    
    // 獲取活動的所有版本
    const versions = await prisma.activityVersion.findMany({
      where: { activityId: activityId as string },
      orderBy: { createdAt: 'desc' },
      include: {
        activity: {
          select: {
            title: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    return {
      props: {
        versions: JSON.parse(JSON.stringify(versions)),
        activityId,
      },
    };
  } catch (error) {
    console.error('獲取版本歷史失敗:', error);
    return {
      props: {
        versions: [],
        activityId,
        error: '獲取版本歷史失敗',
      },
    };
  }
}