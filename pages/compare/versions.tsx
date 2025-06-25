import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Version {
  id: string;
  versionName: string;
  content: any;
  createdAt: string;
  userId: string;
  versionNotes?: string;
  createdByUser?: {
    name: string;
  };
}

export default function CompareVersions() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { a: versionAId, b: versionBId } = router.query;
  
  const [versionA, setVersionA] = useState<Version | null>(null);
  const [versionB, setVersionB] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [differences, setDifferences] = useState<{key: string, typeA: string, typeB: string, valueA: any, valueB: any}[]>([]);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
    }
  }, [status, router]);

  // 加載版本數據
  useEffect(() => {
    if (!versionAId || !versionBId || status !== 'authenticated') return;
    
    const fetchVersions = async () => {
      setLoading(true);
      try {
        // 獲取版本A
        const responseA = await fetch(`/api/activities/versions/${versionAId}`);
        if (!responseA.ok) throw new Error('獲取版本A失敗');
        const dataA = await responseA.json();
        setVersionA(dataA);
        
        // 獲取版本B
        const responseB = await fetch(`/api/activities/versions/${versionBId}`);
        if (!responseB.ok) throw new Error('獲取版本B失敗');
        const dataB = await responseB.json();
        setVersionB(dataB);
      } catch (error) {
        console.error('獲取版本數據失敗:', error);
        setError('獲取版本數據失敗');
        toast.error('獲取版本數據失敗');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersions();
  }, [versionAId, versionBId, status]);

  // 比較兩個版本的差異
  useEffect(() => {
    if (!versionA || !versionB) return;
    
    const compareObjects = (objA: any, objB: any, path = '') => {
      const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
      const diffs: {key: string, typeA: string, typeB: string, valueA: any, valueB: any}[] = [];
      
      allKeys.forEach(key => {
        const valueA = objA[key];
        const valueB = objB[key];
        const typeA = valueA === undefined ? 'undefined' : typeof valueA;
        const typeB = valueB === undefined ? 'undefined' : typeof valueB;
        const currentPath = path ? `${path}.${key}` : key;
        
        // 檢查類型是否不同
        if (typeA !== typeB) {
          diffs.push({
            key: currentPath,
            typeA,
            typeB,
            valueA,
            valueB
          });
        } 
        // 如果類型相同但值不同
        else if (typeA === 'object' && valueA !== null && valueB !== null) {
          // 遞歸比較對象
          const nestedDiffs = compareObjects(valueA, valueB, currentPath);
          diffs.push(...nestedDiffs);
        } 
        // 簡單值比較
        else if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
          diffs.push({
            key: currentPath,
            typeA,
            typeB,
            valueA,
            valueB
          });
        }
      });
      
      return diffs;
    };
    
    const contentDiffs = compareObjects(versionA.content, versionB.content, 'content');
    setDifferences(contentDiffs);
  }, [versionA, versionB]);

  // 格式化顯示值
  const formatValue = (value: any, type: string) => {
    if (value === undefined) return '未定義';
    if (value === null) return '空值';
    
    switch (type) {
      case 'object':
      case 'array':
        return JSON.stringify(value, null, 2);
      case 'boolean':
        return value ? '是' : '否';
      default:
        return String(value);
    }
  };

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
        <title>版本比較 | EduCreate</title>
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 mr-4">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">版本比較</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {versionA && versionB && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-blue-800">版本 {versionA.versionName}</h2>
                  <p className="text-sm text-gray-500">
                    創建於 {format(new Date(versionA.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhTW })}
                  </p>
                  <p className="text-sm text-gray-500">
                    創建者: {versionA.createdByUser?.name || '未知用戶'}
                  </p>
                  {versionA.description && (
                    <p className="text-sm mt-2">{versionA.description}</p>
                  )}
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-green-800">版本 {versionB.versionName}</h2>
                  <p className="text-sm text-gray-500">
                    創建於 {format(new Date(versionB.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhTW })}
                  </p>
                  <p className="text-sm text-gray-500">
                    創建者: {versionB.createdByUser?.name || '未知用戶'}
                  </p>
                  {versionB.description && (
                    <p className="text-sm mt-2">{versionB.description}</p>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-4">差異比較</h3>
              
              {differences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  這兩個版本沒有差異
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          欄位
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          版本 {versionA.versionName}
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          版本 {versionB.versionName}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {differences.map((diff, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {diff.key}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 bg-blue-50">
                            <pre className="whitespace-pre-wrap font-mono text-xs">
                              {formatValue(diff.valueA, diff.typeA)}
                            </pre>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 bg-green-50">
                            <pre className="whitespace-pre-wrap font-mono text-xs">
                              {formatValue(diff.valueB, diff.typeB)}
                            </pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}