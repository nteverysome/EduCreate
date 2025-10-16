'use client';

/**
 * 語言設定頁面
 * 
 * 功能:
 * - 選擇用戶界面語言
 * - 顯示支援的語言列表
 * - 即時預覽語言變更
 * - 保存語言設定到資料庫
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Globe, 
  Check, 
  ArrowLeft,
  Loader2,
  Languages
} from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
];

export default function LanguagePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [currentLanguage, setCurrentLanguage] = useState<string>('zh-TW');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 載入用戶語言設定
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchLanguage();
    }
  }, [status, router]);

  const fetchLanguage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/language');
      
      if (!response.ok) {
        throw new Error('無法載入語言設定');
      }

      const data = await response.json();
      setCurrentLanguage(data.language || 'zh-TW');
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch('/api/user/language', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: languageCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新失敗');
      }

      const data = await response.json();
      setCurrentLanguage(data.language);
      setSuccess('語言設定已成功更新！');

      // 更新 session
      await update({
        ...session,
        user: {
          ...session?.user,
          language: data.language,
        },
      });

      // 3 秒後清除成功訊息
      setTimeout(() => setSuccess(null), 3000);

      // 可選：重新載入頁面以應用新語言
      // setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
    } finally {
      setSaving(false);
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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 返回按鈕 */}
        <Link 
          href="/account/personal-details"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回個人資訊
        </Link>

        {/* 頁面標題 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-2">
            <Languages className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              語言設定
            </h1>
          </div>
          <p className="text-gray-600">
            選擇您偏好的用戶界面語言
          </p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 成功訊息 */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* 語言列表 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="w-6 h-6 mr-2 text-blue-600" />
            選擇語言
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                disabled={saving}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${currentLanguage === language.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  }
                  ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{language.flag}</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {language.nativeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {language.name}
                      </div>
                    </div>
                  </div>

                  {currentLanguage === language.code && (
                    <div className="flex items-center">
                      <Check className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                </div>

                {saving && currentLanguage === language.code && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 說明文字 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              📝 注意事項
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 語言設定會影響整個用戶界面的顯示語言</li>
              <li>• 變更會立即生效，無需重新登入</li>
              <li>• 活動內容的語言不受此設定影響</li>
              <li>• 您可以隨時變更語言設定</li>
            </ul>
          </div>
        </div>

        {/* 當前語言資訊 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            當前語言
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-5xl">
              {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.flag}
            </span>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.nativeName}
              </div>
              <div className="text-gray-600">
                {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                語言代碼: {currentLanguage}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

