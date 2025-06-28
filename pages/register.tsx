import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 驗證密碼
    if (formData.password !== formData.confirmPassword) {
      setError('密碼不匹配');
      return;
    }

    if (formData.password.length < 8) {
      setError('密碼必須至少8個字符');
      return;
    }

    try {
      setLoading(true);
      
      // 註冊用戶
      console.log('🚀 開始註冊請求...', { name: formData.name, email: formData.email });
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      
      console.log('📡 註冊響應狀態:', response.status, response.statusText);

      const data = await response.json();
      console.log('📋 註冊響應數據:', data);

      if (!response.ok) {
        // 顯示詳細的錯誤信息
        const errorMessage = data.error || data.message || `註冊失敗 (${response.status})`;
        console.error('❌ 註冊失敗:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          message: data.message,
          details: data.details,
          fullResponse: data
        });
        throw new Error(errorMessage);
      }

      console.log('✅ 註冊成功，準備自動登入...');

      // 註冊成功，顯示成功消息
      console.log('註冊成功:', data);
      
      // 註冊成功後自動登入
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      if (result?.error) {
        // 如果自動登入失敗，提示用戶手動登入
        setError('註冊成功，但自動登入失敗。請手動登入。');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      // 重定向到儀表板
      router.push('/dashboard');
    } catch (err: any) {
      console.error('註冊錯誤:', err);
      // 確保錯誤訊息是字串格式
      let errorMessage = '註冊過程中發生未知錯誤';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        if (err.message && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else {
          // 如果錯誤是物件但沒有有效的訊息，嘗試序列化
          try {
            errorMessage = JSON.stringify(err);
          } catch {
            errorMessage = '註冊失敗，請檢查輸入資料';
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>註冊 - EduCreate</title>
        <meta name="description" content="註冊EduCreate帳戶" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          創建您的帳戶
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          已有帳戶？{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            登入
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                確認密碼
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? '處理中...' : '註冊'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或使用社交媒體註冊</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <img className="h-5 w-5 mr-2" src="/icons/google.svg" alt="Google" />
                Google
              </button>

              <button
                onClick={() => signIn('github', { callbackUrl: '/' })}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <img className="h-5 w-5 mr-2" src="/icons/github.svg" alt="GitHub" />
                GitHub
              </button>
            </div>

            <div className="mt-6">
              <Link href="/" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                返回首頁
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}