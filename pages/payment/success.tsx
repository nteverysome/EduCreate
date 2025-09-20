import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import Stripe from 'stripe';

export default function PaymentSuccess() {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady || !session) return;

    const { session_id } = router.query;
    
    if (session_id) {
      verifyPayment(session_id as string);
    } else {
      setStatus('error');
      setError('無效的支付會話');
    }
  }, [router.isReady, router.query, session]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payment/verify-session?session_id=${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '驗證支付失敗');
      }

      const data = await response.json();
      setSubscription(data.subscription);
      setStatus('success');
    } catch (err) {
      console.error('支付驗證錯誤:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : '驗證支付時發生錯誤');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">請先登入以查看訂閱狀態</p>
          <Link 
            href="/login"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Head>
        <title>支付成功 - EduCreate</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {status === 'loading' && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">正在處理您的訂閱...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">支付處理失敗</h3>
              <p className="mt-2 text-sm text-gray-500">{error || '處理您的支付時發生錯誤，請聯繫客服。'}</p>
              <div className="mt-6">
                <Link 
                  href="/pricing"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  返回訂閱頁面
                </Link>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">訂閱成功！</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>感謝您訂閱 EduCreate {subscription?.plan?.name}！</p>
                <p className="mt-1">您的訂閱已激活，現在可以使用所有功能。</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  前往儀表板
                </Link>
                <Link 
                  href="/profile"
                  className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
                >
                  查看訂閱詳情
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}