import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

// 國家/地區選項
const countries = [
  { value: 'TW', label: '臺灣' },
  { value: 'CN', label: '中國' },
  { value: 'HK', label: '香港' },
  { value: 'US', label: '美國' },
  { value: 'JP', label: '日本' },
  { value: 'KR', label: '韓國' },
  { value: 'SG', label: '新加坡' },
  { value: 'MY', label: '馬來西亞' },
  { value: 'TH', label: '泰國' },
  { value: 'VN', label: '越南' },
  { value: 'PH', label: '菲律賓' },
  { value: 'ID', label: '印尼' },
  { value: 'IN', label: '印度' },
  { value: 'AU', label: '澳大利亞' },
  { value: 'NZ', label: '紐西蘭' },
  { value: 'CA', label: '加拿大' },
  { value: 'GB', label: '英國' },
  { value: 'DE', label: '德國' },
  { value: 'FR', label: '法國' },
  { value: 'ES', label: '西班牙' },
  { value: 'IT', label: '義大利' },
  { value: 'NL', label: '荷蘭' },
  { value: 'BR', label: '巴西' },
  { value: 'MX', label: '墨西哥' },
  { value: 'OTHER', label: '其他' }
];

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'TW' // 預設為臺灣
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 驗證使用條款
    if (!acceptTerms) {
      setError('請接受使用條款和隱私權政策');
      return;
    }

    // 驗證密碼
    if (formData.password !== formData.confirmPassword) {
      setError('密碼不匹配');
      return;
    }

    if (formData.password.length < 8) {
      setError('密碼必須至少8個字符');
      return;
    }

    // 驗證密碼強度：至少一個大寫字母、一個小寫字母
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase) {
      setError('密碼必須包含至少一個大寫字母和一個小寫字母');
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
          password: formData.password,
          country: formData.country
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

      console.log('✅ 註冊成功，郵箱驗證郵件已發送');

      // 註冊成功，顯示郵箱驗證提示
      console.log('註冊成功:', data);

      // 清空錯誤信息並顯示成功信息
      setError('');
      setSuccess(data.message || '註冊成功！請檢查您的電子郵件並點擊驗證連結來啟用帳戶。');

      // 清空表單
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        country: 'TW'
      });
      setAcceptTerms(false);

      // 不再自動登入，等待用戶驗證郵箱
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
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        <h1 className="text-center text-2xl font-bold text-gray-900 mb-2">
          註冊一個基本帳戶
        </h1>
        <div className="border-t border-gray-200 my-6"></div>
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

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                  <p className="text-xs text-green-600 mt-2">
                    📧 請檢查您的收件匣（包括垃圾郵件資料夾）
                  </p>
                  <div className="mt-3">
                    <Link
                      href={`/auth/resend-verification?email=${encodeURIComponent(formData.email)}`}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      沒收到郵件？點擊重新發送
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 社交登入 - 放在頂部 */}
          <div className="mb-6">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboards' })}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <img className="h-5 w-5 mr-3" src="/icons/google.svg" alt="Google" />
              使用 Google 註冊
            </button>

            <div className="mt-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="電子郵件地址"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="密碼"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                密碼要求：至少8個字符，包含至少一個大寫字母和一個小寫字母
              </p>
            </div>

            <div>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="確認密碼"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                位置
              </label>
              <div className="relative">
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="text-gray-700">
                  我接受{' '}
                  <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
                    使用條款
                  </Link>
                  {' '}和{' '}
                  <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                    隱私權政策
                  </Link>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '處理中...' : '註冊'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                要比較帳戶類型，請閱讀{' '}
                <Link href="/price-plans" className="text-indigo-600 hover:text-indigo-500">
                  價格計畫
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-500">
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}