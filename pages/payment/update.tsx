import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

export default function UpdatePayment() {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 如果用戶未登入，重定向到登入頁面
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/payment/update');
    }
  }, [status, router]);

  const handleUpdatePayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 創建更新支付方式的會話
      const response = await fetch('/api/payment/update-payment-method', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || '創建更新支付方式會話失敗');
      }

      const data = await response.json();
      
      // 重定向到Stripe更新支付方式頁面
      if (data.url) {
        router.push(data.url);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('更新支付方式錯誤:', err);
      setError(err instanceof Error ? err.message : '更新支付方式時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 顯示加載中狀態
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">請先登入以更新支付方式</p>
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
        <title>更新支付方式 - EduCreate</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/subscription" className="text-blue-600 hover:underline">
            &larr; 返回訂閱管理
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold">更新支付方式</h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">支付方式已更新</h3>
                <p className="mt-2 text-sm text-gray-500">您的支付方式已成功更新。</p>
                <div className="mt-6">
                  <Link 
                    href="/subscription"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    返回訂閱管理
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">
                  點擊下方按鈕更新您的支付方式。您將被重定向到安全的支付頁面。
                </p>
                <button
                  onClick={handleUpdatePayment}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isLoading ? '處理中...' : '更新支付方式'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}