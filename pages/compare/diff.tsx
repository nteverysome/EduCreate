import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

interface VersionDiffProps {
  v1Data: any;
  v2Data: any;
  activityId: string;
}

// 版本差異比較頁面
export default function VersionDiff({ v1Data, v2Data, activityId }: VersionDiffProps) {
  const router = useRouter();
  const { v1, v2 } = router.query;
  const [theme, setTheme] = useState('light');

  // 格式化JSON以便更好地顯示差異
  const formatJSON = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return '無效的JSON數據';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">版本比較</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <Link href={`/compare?activityId=${activityId}`}>
          <a className="text-blue-500 hover:underline">返回版本歷史</a>
        </Link>
        
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          切換{theme === 'light' ? '深色' : '淺色'}主題
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-4">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">版本 {v1Data.versionName}</h2>
            <p className="text-sm text-gray-500">
              創建於 {new Date(v1Data.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">版本 {v2Data.versionName}</h2>
            <p className="text-sm text-gray-500">
              創建於 {new Date(v2Data.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Version {v1}</h3>
            <pre className="text-sm overflow-auto">{formatJSON(v1Data)}</pre>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Version {v2}</h3>
            <pre className="text-sm overflow-auto">{formatJSON(v2Data)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

import { GetServerSideProps } from 'next';

// 服務器端獲取版本數據
export const getServerSideProps: GetServerSideProps = async (context) => {
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
  
  const { v1, v2, activityId } = context.query;
  
  if (!v1 || !v2 || !activityId) {
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
    
    // 獲取兩個版本的數據
    const v1Data = await prisma.activityVersion.findUnique({
      where: { id: v1 as string },
    });
    
    const v2Data = await prisma.activityVersion.findUnique({
      where: { id: v2 as string },
    });
    
    if (!v1Data || !v2Data) {
      return {
        notFound: true,
      };
    }
    
    return {
      props: {
        v1Data: JSON.parse(JSON.stringify(v1Data)),
        v2Data: JSON.parse(JSON.stringify(v2Data)),
        activityId,
      },
    };
  } catch (error) {
    console.error('獲取版本數據失敗:', error);
    return {
      props: {
        error: '獲取版本數據失敗',
      },
    };
  }
}