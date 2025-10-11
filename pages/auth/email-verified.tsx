import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EmailVerified() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSuccess(router.query.success === 'true');
  }, [router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {success ? (
            <>
              {/* 成功圖標 */}
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 郵箱驗證成功！
              </h1>
              
              <p className="text-gray-600 mb-6">
                恭喜您！您的電子郵件地址已成功驗證。<br />
                現在您可以使用 EduCreate 的所有功能了。
              </p>
              
              <div className="space-y-4">
                <Link 
                  href="/login"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  立即登入
                </Link>
                
                <Link 
                  href="/"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  返回首頁
                </Link>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  🚀 接下來您可以：
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 創建您的第一個學習活動</li>
                  <li>• 探索 25 種記憶科學遊戲</li>
                  <li>• 管理您的詞彙和內容</li>
                  <li>• 追蹤學習進度</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* 錯誤圖標 */}
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ❌ 驗證失敗
              </h1>
              
              <p className="text-gray-600 mb-6">
                很抱歉，郵箱驗證失敗。<br />
                可能是驗證連結已過期或無效。
              </p>
              
              <div className="space-y-4">
                <Link 
                  href="/register"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  重新註冊
                </Link>
                
                <Link 
                  href="/"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  返回首頁
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
