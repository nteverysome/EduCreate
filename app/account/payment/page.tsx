'use client';

/**
 * 訂購頁面
 * 
 * 功能:
 * - 顯示訂閱方案
 * - 選擇付款方式
 * - 整合綠界 ECPay
 * - 顯示當前訂閱狀態
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard,
  Building2,
  Store,
  Check,
  X,
  ArrowLeft,
  Loader2,
  Crown,
  Zap,
  Shield,
  Users,
  Sparkles,
  Calendar
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'MONTHLY' | 'YEARLY';
  features: string[];
  popular?: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string | null;
  currentPeriodEnd: string | null;
  plan: Plan;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: '免費版',
    description: '適合個人教師試用',
    price: 0,
    interval: 'MONTHLY',
    features: [
      '最多 5 個活動',
      '基本遊戲模板',
      '社區活動瀏覽',
      '基本統計數據',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro 月付',
    description: '適合活躍教師',
    price: 180,
    interval: 'MONTHLY',
    popular: true,
    features: [
      '無限活動',
      '所有遊戲模板',
      'AI 內容生成',
      '進階統計分析',
      '優先客服支援',
      '無廣告體驗',
      '匯出 PDF',
      '自訂品牌',
    ],
  },
  {
    id: 'pro-yearly',
    name: 'Pro 年付',
    description: '最划算的選擇',
    price: 1800,
    interval: 'YEARLY',
    features: [
      '無限活動',
      '所有遊戲模板',
      'AI 內容生成',
      '進階統計分析',
      '優先客服支援',
      '無廣告體驗',
      '匯出 PDF',
      '自訂品牌',
      '💰 省下 2 個月費用',
    ],
  },
];

const PAYMENT_METHODS = [
  {
    id: 'credit',
    name: '信用卡',
    icon: CreditCard,
    description: '支援 Visa、Mastercard、JCB',
    fee: '2.8%',
  },
  {
    id: 'atm',
    name: 'ATM 轉帳',
    icon: Building2,
    description: '虛擬帳號轉帳',
    fee: 'NT$ 10',
  },
  {
    id: 'cvs',
    name: '超商代碼',
    icon: Store,
    description: '7-11、全家、萊爾富、OK',
    fee: 'NT$ 30',
  },
];

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchSubscription();
    }
  }, [status, router]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription');
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('載入訂閱失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError('請選擇訂閱方案');
      return;
    }

    setError(null);
    setProcessing(true);

    try {
      const plan = PLANS.find(p => p.id === selectedPlan);
      if (!plan) throw new Error('方案不存在');

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          amount: plan.price,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '創建付款失敗');
      }

      const data = await response.json();
      
      // 跳轉到綠界付款頁面
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.html) {
        // 如果返回 HTML，創建表單並提交
        const div = document.createElement('div');
        div.innerHTML = data.html;
        document.body.appendChild(div);
        const form = div.querySelector('form');
        if (form) form.submit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '訂閱失敗');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 返回按鈕 */}
        <Link 
          href="/account/personal-details"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回個人資訊
        </Link>

        {/* 頁面標題 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Crown className="w-10 h-10 text-yellow-500 mr-3" />
            選擇您的方案
          </h1>
          <p className="text-xl text-gray-600">
            升級到 Pro 版，解鎖所有功能
          </p>
        </div>

        {/* 當前訂閱狀態 */}
        {subscription && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-6 h-6 text-green-600 mr-2" />
              當前訂閱
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">方案</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.plan.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">狀態</p>
                <p className="text-lg font-semibold text-green-600">
                  {subscription.status === 'ACTIVE' ? '有效' : '已取消'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">到期日</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.currentPeriodEnd 
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('zh-TW')
                    : '無限期'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 方案選擇 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => plan.price > 0 && setSelectedPlan(plan.id)}
              className={`
                relative bg-white rounded-lg shadow-lg p-6 transition-all cursor-pointer
                ${selectedPlan === plan.id
                  ? 'ring-4 ring-blue-500 transform scale-105'
                  : 'hover:shadow-xl hover:scale-102'
                }
                ${plan.popular ? 'border-2 border-yellow-400' : ''}
                ${plan.price === 0 ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold flex items-center">
                    <Sparkles className="w-4 h-4 mr-1" />
                    最受歡迎
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">
                    NT$ {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    / {plan.interval === 'MONTHLY' ? '月' : '年'}
                  </span>
                </div>
                {plan.interval === 'YEARLY' && plan.price > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    平均每月 NT$ {Math.round(plan.price / 12)}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.price > 0 && (
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`
                    w-full py-3 rounded-lg font-semibold transition-colors
                    ${selectedPlan === plan.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {selectedPlan === plan.id ? '已選擇' : '選擇方案'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 付款方式選擇 */}
        {selectedPlan && PLANS.find(p => p.id === selectedPlan)?.price! > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
              選擇付款方式
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left
                      ${selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }
                    `}
                  >
                    <div className="flex items-center mb-2">
                      <Icon className="w-6 h-6 text-blue-600 mr-2" />
                      <span className="font-semibold text-gray-900">
                        {method.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {method.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      手續費: {method.fee}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* 訂閱按鈕 */}
            <div className="mt-8">
              <button
                onClick={handleSubscribe}
                disabled={processing}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    處理中...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    立即訂閱
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 說明文字 */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📝 訂閱說明
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• 訂閱後立即生效，可立即使用所有 Pro 功能</li>
            <li>• 月付方案每月自動續訂，年付方案每年自動續訂</li>
            <li>• 可隨時取消訂閱，取消後將在當前計費週期結束時停止</li>
            <li>• 支援多種付款方式：信用卡、ATM 轉帳、超商代碼</li>
            <li>• 所有交易均由綠界科技 ECPay 安全處理</li>
            <li>• 如有任何問題，請聯繫客服支援</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

