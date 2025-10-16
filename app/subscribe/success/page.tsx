'use client';

/**
 * 訂閱成功頁面
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, CreditCard, Sparkles } from 'lucide-react';

export default function SubscribeSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // 5 秒後自動跳轉到首頁
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        {/* 成功圖標 */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            訂閱成功！
          </h1>
          <p className="text-gray-600">
            感謝您訂閱 EduCreate Pro
          </p>
        </div>

        {/* 成功訊息 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Sparkles className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-green-900 font-semibold mb-1">
                您現在可以使用所有 Pro 功能：
              </p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 無限活動創建</li>
                <li>• 所有遊戲模板</li>
                <li>• AI 內容生成</li>
                <li>• 進階統計分析</li>
                <li>• 優先客服支援</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            返回首頁
          </Link>
          
          <Link
            href="/account/payment"
            className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            查看訂閱詳情
          </Link>
        </div>

        {/* 自動跳轉提示 */}
        <p className="text-sm text-gray-500 mt-6">
          5 秒後自動跳轉到首頁...
        </p>
      </div>
    </div>
  );
}

