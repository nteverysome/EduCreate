'use client';

/**
 * 訂閱失敗頁面
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Home, CreditCard, RefreshCw } from 'lucide-react';

export default function SubscribeFailedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        {/* 失敗圖標 */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            訂閱失敗
          </h1>
          <p className="text-gray-600">
            很抱歉，您的訂閱未能完成
          </p>
        </div>

        {/* 失敗原因 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-900 font-semibold mb-2">
            可能的原因：
          </p>
          <ul className="text-sm text-red-800 space-y-1 text-left">
            <li>• 付款資訊不正確</li>
            <li>• 信用卡餘額不足</li>
            <li>• 付款過程中斷</li>
            <li>• 網路連線問題</li>
          </ul>
        </div>

        {/* 操作按鈕 */}
        <div className="space-y-3">
          <Link
            href="/account/payment"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            重新訂閱
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            返回首頁
          </Link>
        </div>

        {/* 客服資訊 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900 font-semibold mb-1">
            需要協助？
          </p>
          <p className="text-sm text-blue-800">
            請聯繫客服支援，我們將盡快協助您解決問題。
          </p>
        </div>
      </div>
    </div>
  );
}

