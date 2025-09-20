import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type PlanType = {
  id: string;
  name: string;
  price: number;
  interval: 'MONTHLY' | 'YEARLY';
  features: string[];
  description: string;
  highlighted?: boolean;
};

// 示例計劃數據
const plans: PlanType[] = [
  {
    id: 'free',
    name: '免費版',
    price: 0,
    interval: 'MONTHLY',
    description: '適合初次嘗試的教育工作者',
    features: [
      '最多創建5個活動',
      '基本模板訪問',
      '有限的分享功能',
      '社區支持'
    ]
  },
  {
    id: 'pro',
    name: '專業版',
    price: 9.99,
    interval: 'MONTHLY',
    description: '適合積極使用的教師',
    features: [
      '無限活動創建',
      '所有模板訪問',
      '高級分享和協作功能',
      '優先支持',
      '無廣告'
    ],
    highlighted: true
  },
  {
    id: 'school',
    name: '學校版',
    price: 99.99,
    interval: 'YEARLY',
    description: '適合學校和教育機構',
    features: [
      '多用戶管理',
      '所有專業版功能',
      '學校品牌定制',
      '專屬客戶經理',
      '使用統計和分析'
    ]
  }
];

export default function Pricing() {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const [selectedInterval, setSelectedInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      // 未登入用戶重定向到登入頁面
      router.push(`/login?callbackUrl=${encodeURIComponent('/pricing')}`);
      return;
    }

    try {
      setIsLoading(planId);
      
      // 創建結帳會話
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '創建結帳會話失敗');
      }

      // 重定向到Stripe結帳頁面
      router.push(data.url);
    } catch (error) {
      console.error('訂閱錯誤:', error);
      alert('處理您的訂閱時出錯，請稍後再試。');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Head>
        <title>訂閱計劃 - EduCreate</title>
        <meta name="description" content="選擇適合您的EduCreate訂閱計劃" />
      </Head>

      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                EduCreate
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
                    儀表板
                  </Link>
                  <Link href="/api/auth/signout" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    登出
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/api/auth/signin" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    登入
                  </Link>
                  <Link href="/register" className="bg-white text-indigo-600 px-4 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition">
                    註冊
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            選擇適合您的計劃
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            無論您是個人教師還是教育機構，我們都有適合您需求的計劃
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative bg-white rounded-lg p-0.5 flex">
            <button
              type="button"
              className={`relative py-2 px-6 border border-transparent rounded-md text-sm font-medium whitespace-nowrap ${selectedInterval === 'MONTHLY' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500'}`}
              onClick={() => setSelectedInterval('MONTHLY')}
            >
              月付
            </button>
            <button
              type="button"
              className={`ml-0.5 relative py-2 px-6 border border-transparent rounded-md text-sm font-medium whitespace-nowrap ${selectedInterval === 'YEARLY' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500'}`}
              onClick={() => setSelectedInterval('YEARLY')}
            >
              年付
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                省20%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border rounded-lg shadow-sm divide-y divide-gray-200 ${plan.highlighted ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'}`}
            >
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">{plan.name}</h2>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-base font-medium text-gray-500">
                    {plan.price > 0 ? (plan.interval === 'MONTHLY' ? '/月' : '/年') : ''}
                  </span>
                </p>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id}
                  className={`mt-8 block w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition disabled:opacity-50 ${plan.highlighted ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                >
                  {isLoading === plan.id ? '處理中...' : plan.price > 0 ? '訂閱' : '開始使用'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">包含功能</h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-gray-100 text-gray-600 py-6 mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-sm">© {new Date().getFullYear()} EduCreate</p>
          </div>
        </div>
      </footer>
    </div>
  );
}