import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon as RestoreIcon, EyeIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Version {
  id: string;
  activityId: string;
  versionNumber: number;
  createdAt: Date;
  createdBy: string;
  snapshot: string; // JSON字符串，包含活動的完整狀態
  comment?: string;
}

interface VersionHistoryProps {
  activityId: string;
  onVersionRestore: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionHistory({ activityId, onVersionRestore, isOpen, onClose }: VersionHistoryProps) {
  const { data: session } = useSession();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  // 加載版本歷史
  useEffect(() => {
    if (!activityId) return;

    const fetchVersions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/activities/${activityId}/versions`);
        
        if (!response.ok) {
          throw new Error('無法加載版本歷史');
        }
        
        const data = await response.json();
        setVersions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [activityId]);

  // 恢復到特定版本
  const handleRestore = async (versionId: string) => {
    if (!confirm('確定要恢復到此版本嗎？當前未保存的更改將會丟失。')) {
      return;
    }

    setRestoring(true);
    try {
      const response = await fetch(`/api/activities/versions/${versionId}/restore`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('恢復版本失敗');
      
      toast.success('成功恢復到選定版本');
      onVersionRestore();
      onClose();
    } catch (err) {
      console.error('恢復版本失敗:', err);
      setError('恢復版本時發生錯誤');
      toast.error('恢復版本失敗');
    } finally {
      setRestoring(false);
    }
  };

  // 查看特定版本
  const handleViewVersion = async (versionId: string) => {
    try {
      // 這裡可以實現查看版本的功能，例如在新窗口中打開預覽
      window.open(`/preview/version/${versionId}`, '_blank');
    } catch (err) {
      console.error('查看版本失敗:', err);
      setError('查看版本失敗');
      toast.error('查看版本失敗');
    }
  };

  return (
    <Dialog as="div" className="relative z-50" open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-6">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-indigo-500" />
            版本歷史
          </Dialog.Title>
          
          <div className="mt-4">
            {/* 版本列表 */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : versions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">尚無版本歷史</p>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        版本
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        描述
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        創建者
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        創建時間
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">操作</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {versions.map((version) => (
                      <tr key={version.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          版本 {version.versionNumber}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {version.comment || '無描述'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {version.createdBy || '未知用戶'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleViewVersion(version.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                            title="查看此版本"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRestore(version.id)}
                            disabled={restoring}
                            className="text-green-600 hover:text-green-900"
                            title="恢復到此版本"
                          >
                            <RestoreIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
              onClick={onClose}
            >
              關閉
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}