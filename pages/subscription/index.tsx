import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import Head from 'next/head';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  interval: 'MONTHLY' | 'YEARLY';
  features: string[];
}

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAYMENT_FAILED' | 'PAST_DUE' | 'UNPAID' | 'EXPIRED';
  startDate: string;
  endDate?: string;
  plan: Plan;
}

interface SubscriptionPageProps {
  subscription?: Subscription;
}

export default function SubscriptionPage({ subscription }: SubscriptionPageProps) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 如果用戶未登入，重定向到登入頁面
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?redirect=/subscription');
    }
  }, [sessionStatus, router]);

  // 處理取消訂閱
  const handleCancelSubscription = async () => {
    if (!confirm('確定要取消訂閱嗎？您將繼續擁有訂閱權益直到當前計費週期結束。')) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/cancel-subscription', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '取消訂閱失敗');
      }

      // 重新載入頁面以顯示更新後的訂閱狀態
      router.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : '取消訂閱時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取訂閱狀態的中文名稱
  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      'ACTIVE': '有效',
      'CANCELED': '已取消',
      'PAYMENT_FAILED': '支付失敗',
      'PAST_DUE': '逾期',
      'UNPAID': '未支付',
      'EXPIRED': '已過期'
    };
    return statusMap[status] || status;
  };

  // 獲取訂閱週期的中文名稱
  const getIntervalName = (interval: string) => {
    return interval === 'MONTHLY' ? '月付' : '年付';
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '無限期';
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 顯示加載中狀態
  if (sessionStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Head>
        <title>訂閱管理 - EduCreate</title>
      </Head>

      <div className="mb-6">
        <Link href="/profile" className="text-blue-600 hover:underline">
          &larr; 返回個人資料
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">訂閱管理</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!subscription ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">您目前沒有有效的訂閱</h2>
          <p className="text-gray-600 mb-6">訂閱 EduCreate 專業版以獲得更多功能和資源。</p>
          <Link
            href="/pricing"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            查看訂閱方案
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">當前訂閱</h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  subscription.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : subscription.status === 'CANCELED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {getStatusName(subscription.status)}
              </span>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{subscription.plan.name}</h3>
              {subscription.plan.description && (
                <p className="text-gray-600">{subscription.plan.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">訂閱費用</h4>
                <p className="text-lg font-semibold">
                  ${subscription.plan.price} / {getIntervalName(subscription.plan.interval)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">訂閱狀態</h4>
                <p className="text-lg font-semibold">{getStatusName(subscription.status)}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">開始日期</h4>
                <p className="text-lg font-semibold">{formatDate(subscription.startDate)}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  {subscription.status === 'CANCELED' ? '結束日期' : '下次續費日期'}
                </h4>
                <p className="text-lg font-semibold">{formatDate(subscription.endDate)}</p>
              </div>
            </div>

            {subscription.status === 'ACTIVE' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">訂閱管理</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isLoading ? '處理中...' : '取消訂閱'}
                  </button>
                  <Link
                    href="/pricing"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    變更方案
                  </Link>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  取消訂閱後，您將繼續擁有訂閱權益直到當前計費週期結束。
                </p>
              </div>
            )}

            {subscription.status === 'PAYMENT_FAILED' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">支付失敗</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>您的最近一次訂閱付款失敗。請更新您的支付方式以繼續使用服務。</p>
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/payment/update"
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm"
                        >
                          更新支付方式
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">包含功能</h3>
            <ul className="space-y-2">
              {subscription.plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login?redirect=/subscription',
        permanent: false,
      },
    };
  }

  const prisma = new PrismaClient();
  
  try {
    // 獲取用戶的訂閱信息
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        status: true,
        planId: true,
        startDate: true,
        endDate: true
      },
    });

    return {
      props: {
        subscription: subscription ? JSON.parse(JSON.stringify(subscription)) : null,
      },
    };
  } catch (error) {
    console.error('獲取訂閱信息錯誤:', error);
    return {
      props: { subscription: null },
    };
  } finally {
    await prisma.$disconnect();
  }
};