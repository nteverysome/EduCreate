import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import { PlusIcon, PencilIcon, TrashIcon, UploadIcon, CheckIcon } from '@heroicons/react/24/outline';
import H5PExport from '../../components/H5P/H5PExport';
import H5PBatchExport from '../../components/H5P/H5PBatchExport';

interface H5PContent {
  id: string;
  title: string;
  description?: string;
  contentType: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

export default function H5PContentManagement({ user }: { user: any }) {
  const router = useRouter();
  const [contents, setContents] = useState<H5PContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  // 獲取H5P內容列表
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await fetch('/api/h5p');
        if (!response.ok) {
          throw new Error('獲取H5P內容列表失敗');
        }
        const data = await response.json();
        setContents(data);
      } catch (err) {
        setError('獲取H5P內容列表失敗');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContents();
  }, []);

  // 處理文件上傳
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  // 上傳H5P內容
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('h5pFile', uploadFile);

    try {
      const response = await fetch('/api/h5p/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上傳H5P內容失敗');
      }

      const result = await response.json();
      setContents(prev => [result.h5pContent, ...prev]);
      setUploadModalOpen(false);
      setUploadFile(null);
    } catch (err) {
      setError('上傳H5P內容失敗');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // 刪除H5P內容
  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此H5P內容嗎？')) return;

    try {
      const response = await fetch(`/api/h5p/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('刪除H5P內容失敗');
      }

      setContents(prev => prev.filter(content => content.id !== id));
    } catch (err) {
      setError('刪除H5P內容失敗');
      console.error(err);
    }
  };

  // 發布H5P內容
  const handlePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    try {
      const response = await fetch(`/api/h5p/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('更新H5P內容狀態失敗');
      }

      const updatedContent = await response.json();
      setContents(prev => prev.map(content => 
        content.id === id ? updatedContent : content
      ));
    } catch (err) {
      setError('更新H5P內容狀態失敗');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>H5P內容管理 - EduCreate</title>
      </Head>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">H5P內容管理</h1>
        <div className="flex space-x-2">
          {selectMode ? (
            <>
              <button
                onClick={() => {
                  setSelectMode(false);
                  setSelectedContentIds([]);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md flex items-center"
              >
                取消選擇
              </button>
              <H5PBatchExport 
                contentIds={selectedContentIds} 
                className="flex items-center" 
                onExportComplete={() => {
                  setSelectMode(false);
                  setSelectedContentIds([]);
                }}
              />
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectMode(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                批量選擇
              </button>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <UploadIcon className="h-5 w-5 mr-2" />
                上傳H5P內容
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">載入中...</div>
      ) : contents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">尚未上傳任何H5P內容</p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            上傳第一個H5P內容
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {selectMode && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    選擇
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  標題
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  內容類型
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
              {contents.map((content) => (
                <tr key={content.id}>
                  {selectMode && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedContentIds.includes(content.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContentIds(prev => [...prev, content.id]);
                          } else {
                            setSelectedContentIds(prev => prev.filter(id => id !== content.id));
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{content.title}</div>
                    {content.description && (
                      <div className="text-sm text-gray-500">{content.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {content.contentType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${content.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {content.status === 'PUBLISHED' ? '已發布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(content.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handlePublish(content.id, content.status)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {content.status === 'PUBLISHED' ? '取消發布' : '發布'}
                    </button>
                    <Link href={`/h5p/preview/${content.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      預覽
                    </Link>
                    <Link href={`/h5p/edit/${content.id}`} className="text-green-600 hover:text-green-900 mr-3">
                      <PencilIcon className="h-5 w-5 inline" />
                    </Link>
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="text-red-600 hover:text-red-900 mr-3"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                    <H5PExport contentId={content.id} title={content.title} className="inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 上傳H5P內容模態框 */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">上傳H5P內容</h2>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  選擇H5P文件
                </label>
                <input
                  type="file"
                  accept=".h5p"
                  onChange={handleFileChange}
                  className="w-full border rounded-md p-2"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">僅支持.h5p格式的文件</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadModalOpen(false);
                    setUploadFile(null);
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                  disabled={isUploading}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                  disabled={!uploadFile || isUploading}
                >
                  {isUploading ? '上傳中...' : '上傳'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login?redirect=/h5p',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
};