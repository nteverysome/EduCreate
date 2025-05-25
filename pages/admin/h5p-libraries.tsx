import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { PlusIcon, UploadIcon, TrashIcon, DownloadIcon, RefreshIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function H5PLibrariesManagement({ user }: { user: any }) {
  const [libraries, setLibraries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 獲取H5P庫列表
  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const response = await fetch('/api/h5p/libraries');
        if (!response.ok) {
          throw new Error('獲取H5P庫列表失敗');
        }
        const data = await response.json();
        setLibraries(data);
      } catch (err) {
        setError('獲取H5P庫列表失敗');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibraries();
  }, []);

  // 處理文件上傳
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  // 上傳H5P庫
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('libraryFile', uploadFile);

    try {
      const response = await fetch('/api/h5p/libraries', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上傳H5P庫失敗');
      }

      // 重新獲取庫列表
      const librariesResponse = await fetch('/api/h5p/libraries');
      const librariesData = await librariesResponse.json();
      setLibraries(librariesData);
      
      setUploadModalOpen(false);
      setUploadFile(null);
    } catch (err) {
      setError('上傳H5P庫失敗');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>H5P庫管理 - EduCreate</title>
      </Head>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">H5P庫管理</h1>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <UploadIcon className="h-5 w-5 mr-2" />
          上傳H5P庫
        </button>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          H5P庫是H5P內容的基礎組件。上傳H5P庫文件以支持更多類型的H5P內容。
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">載入中...</div>
      ) : libraries.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">尚未安裝任何H5P庫</p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            上傳第一個H5P庫
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  庫名稱
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {libraries.map((library) => (
                <tr key={library}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {library}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 上傳H5P庫模態框 */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">上傳H5P庫</h2>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  選擇H5P庫文件
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

  if (!session || session.user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/login?redirect=/admin/h5p-libraries',
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