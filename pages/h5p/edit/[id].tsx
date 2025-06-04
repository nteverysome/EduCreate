import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import H5PEmbed from '../../../components/H5P/H5PEmbed';
import prisma from '../../../lib/prisma';

interface H5PContentProps {
  content: {
    id: string;
    title: string;
    description?: string;
    contentType: string;
    contentPath: string;
    status: 'DRAFT' | 'PUBLISHED';
    createdAt: string;
    updatedAt: string;
  } | null;
  error?: string;
}

export default function H5PContentEdit({ content, error }: H5PContentProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 初始化表單數據
  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setDescription(content.description || '');
      setStatus(content.status);
    }
  }, [content]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Head>
          <title>錯誤 - EduCreate</title>
        </Head>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/h5p" className="text-blue-600 hover:underline">
          返回H5P內容列表
        </Link>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Head>
          <title>載入中... - EduCreate</title>
        </Head>
        <div className="text-center py-8">載入中...</div>
      </div>
    );
  }

  // 處理文件上傳
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveError('');
    setSuccessMessage('');

    try {
      // 更新基本信息
      const response = await fetch(`/api/h5p/${content.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('更新H5P內容失敗');
      }

      // 如果有上傳新的H5P文件
      if (uploadFile) {
        const formData = new FormData();
        formData.append('h5pFile', uploadFile);

        const uploadResponse = await fetch(`/api/h5p/upload?contentId=${content.id}`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('上傳H5P內容文件失敗');
        }
      }

      setSuccessMessage('H5P內容已成功更新');
      // 短暫顯示成功消息後重定向到預覽頁面
      setTimeout(() => {
        router.push(`/h5p/preview/${content.id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSaveError('保存失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>編輯H5P內容 - EduCreate</title>
      </Head>

      <div className="mb-6">
        <Link href="/h5p" className="text-blue-600 hover:underline">
          &larr; 返回H5P內容列表
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">編輯H5P內容</h1>

          {saveError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {saveError}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                標題 *
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
                描述
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                狀態
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DRAFT">草稿</option>
                <option value="PUBLISHED">已發布</option>
              </select>
            </div>

            <div>
              <label htmlFor="h5pFile" className="block text-sm font-medium text-gray-700 mb-1">
                更新H5P內容文件 (可選)
              </label>
              <input
                type="file"
                id="h5pFile"
                accept=".h5p"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">僅支持.h5p格式的文件</p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : '保存更改'}
              </button>
              <Link
                href={`/h5p/preview/${content.id}`}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">預覽</h2>
        <div className="border rounded-lg p-4 bg-gray-50">
          <H5PEmbed 
            contentId={content.id}
            contentPath={content.contentPath}
            title={content.title}
            height={500} width={''}          />
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
        destination: '/login?redirect=/h5p',
        permanent: false,
      },
    };
  }

  const id = context.params?.id as string;

  if (!id) {
    return {
      props: {
        content: null,
        error: '無效的內容ID',
      },
    };
  }

  try {
    // 查詢H5P內容
    const content = await prisma.h5PContent.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!content) {
      return {
        props: {
          content: null,
          error: '內容不存在或無權訪問',
        },
      };
    }

    return {
      props: {
        content: JSON.parse(JSON.stringify(content)),
        error: null,
      },
    };
  } catch (error) {
    console.error('獲取H5P內容失敗:', error);
    return {
      props: {
        content: null,
        error: '獲取H5P內容失敗',
      },
    };
  }
};