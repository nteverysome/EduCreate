import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  activities?: {
    id: string;
    title: string;
    type: string;
    published: boolean;
    updatedAt: Date;
  }[];
  activityStats?: {
    total: number;
    published: number;
    draft: number;
  };
}

interface ProfileProps {
  userProfile: UserProfile;
}

export default function Profile({ userProfile }: ProfileProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState(userProfile.name || '');
  const [image, setImage] = useState(userProfile.image || '');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 如果用戶未登入，重定向到登入頁面
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, image }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新個人資料失敗');
      }

      setMessage('個人資料已成功更新');
      setIsEditing(false);
    } catch (err) {
      // 確保錯誤訊息是字串格式
      let errorMessage = '更新個人資料時發生錯誤';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        const errorObj = err as any;
        if (errorObj.message && typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        } else if (errorObj.error && typeof errorObj.error === 'string') {
          errorMessage = errorObj.error;
        } else {
          errorMessage = '更新個人資料失敗，請稍後再試';
        }
      }
      
      setError(errorMessage);
    }
  };

  // 顯示加載中狀態
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">加載中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">個人資料</h1>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">基本資料</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            {isEditing ? '取消' : '編輯'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                姓名
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="image">
                頭像 URL
              </label>
              <input
                id="image"
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                保存
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              {userProfile.image && (
                <Image
                  src={userProfile.image}
                  alt={userProfile.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full mr-4 object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-medium">{userProfile.name}</h3>
                <p className="text-gray-600">{userProfile.email}</p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">會員類型</p>
                  <p className="font-medium">{userProfile.role === 'PREMIUM_USER' ? '高級會員' : userProfile.role === 'ADMIN' ? '管理員' : userProfile.role === 'TEACHER' ? '教師' : '基本會員'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">註冊日期</p>
                  <p className="font-medium">{new Date(userProfile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 活動統計 */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">活動統計</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{userProfile.activityStats?.total || 0}</p>
            <p className="text-gray-600">總活動數</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{userProfile.activityStats?.published || 0}</p>
            <p className="text-gray-600">已發布</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{userProfile.activityStats?.draft || 0}</p>
            <p className="text-gray-600">草稿</p>
          </div>
        </div>
      </div>

      {/* 最近活動 */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">最近活動</h2>
          <button
            onClick={() => router.push('/activity')}
            className="text-blue-500 hover:text-blue-600 transition"
          >
            查看全部
          </button>
        </div>
        <div className="space-y-4">
          {userProfile.activities?.map((activity) => (
            <div key={activity.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition">
              <div>
                <h3 className="font-medium">{activity.title}</h3>
                <p className="text-sm text-gray-500">
                  {activity.type} · {activity.published ? '已發布' : '草稿'} · 
                  {new Date(activity.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => router.push(`/editor/${activity.id}`)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                編輯
              </button>
            </div>
          ))}
          {(!userProfile.activities || userProfile.activities.length === 0) && (
            <p className="text-center text-gray-500 py-4">暫無活動</p>
          )}
        </div>
      </div>

      {/* 帳戶設置 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">帳戶設置</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <h3 className="font-medium">更改密碼</h3>
              <p className="text-gray-500 text-sm">定期更新密碼以保護您的帳戶安全</p>
            </div>
            <button
              onClick={() => router.push('/reset-password')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              更改
            </button>
          </div>

          {userProfile.role !== 'PREMIUM_USER' && userProfile.role !== 'ADMIN' && (
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <h3 className="font-medium">升級會員</h3>
                <p className="text-gray-500 text-sm">解鎖更多功能和資源</p>
              </div>
              <button
                onClick={() => router.push('/pricing')}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
              >
                查看方案
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login?redirect=/profile',
        permanent: false,
      },
    };
  }

  const prisma = new PrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        subscription: {
          select: {
            id: true,
            status: true,
            planId: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: {
        userProfile: {
          id: user.id,
          name: user.name || '',
          email: user.email,
          image: user.image,
          role: user.role,
          createdAt: JSON.parse(JSON.stringify(user.createdAt)),
          subscription: user.subscription ? JSON.parse(JSON.stringify(user.subscription)) : null,
        },
      },
    };
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};