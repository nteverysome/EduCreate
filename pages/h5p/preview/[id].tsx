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

export default function H5PContentPreview({ content, error }: H5PContentProps) {
  const router = useRouter();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>{content.title} - H5P預覽 - EduCreate</title>
      </Head>

      <div className="mb-6">
        <Link href="/h5p" className="text-blue-600 hover:underline">
          &larr; 返回H5P內容列表
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
          {content.description && (
            <p className="text-gray-600 mb-4">{content.description}</p>
          )}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span className="mr-4">類型: {content.contentType}</span>
            <span className="mr-4">狀態: {content.status === 'PUBLISHED' ? '已發布' : '草稿'}</span>
            <span>更新時間: {new Date(content.updatedAt).toLocaleString()}</span>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <H5PEmbed 
              contentId={content.id}
              contentPath={content.contentPath}
              title={content.title}
              height={600} width={''}            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        <Link 
          href={`/h5p/edit/${content.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          編輯內容
        </Link>
        <Link 
          href={`/activity/create?h5pId=${content.id}`}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          創建使用此H5P的活動
        </Link>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
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
        OR: [
          // 如果用戶已登錄，允許查看自己的內容
          { userId: session?.user?.id },
          // 允許查看已發布的內容
          { published: true },
        ],
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