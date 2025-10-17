'use client';

/**
 * 個人資訊編輯頁面
 * 
 * 功能:
 * - 編輯姓名
 * - 編輯電子郵件
 * - 上傳頭像
 * - 選擇國家/地區
 * - 顯示帳戶創建日期
 * - 顯示最後更新日期
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Globe,
  Calendar,
  Save,
  X,
  Upload,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import PublicProfileSection from '@/components/account/PublicProfileSection';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PersonalDetailsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: 'TW',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 載入用戶資料
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error('無法載入個人資料');
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        country: data.country || 'TW',
      });
      setImagePreview(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 檢查文件大小（最大 5MB）
      if (file.size > 5 * 1024 * 1024) {
        setError('圖片大小不能超過 5MB');
        return;
      }

      // 檢查文件類型
      if (!file.type.startsWith('image/')) {
        setError('請選擇圖片文件');
        return;
      }

      setImageFile(file);
      
      // 創建預覽
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // 如果有新圖片，先上傳
      let imageUrl = profile?.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResponse = await fetch('/api/user/upload-avatar', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('圖片上傳失敗');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // 更新個人資料
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          country: formData.country,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新失敗');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setSuccess('個人資料已成功更新！');

      // 更新 session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedProfile.name,
          email: updatedProfile.email,
          image: updatedProfile.image,
        },
      });

      // 清除圖片文件
      setImageFile(null);

      // 3 秒後清除成功訊息
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        country: profile.country || 'TW',
      });
      setImagePreview(profile.image);
      setImageFile(null);
    }
    setError(null);
    setSuccess(null);
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
      <div className="container mx-auto px-4 max-w-3xl">
        {/* 返回按鈕 */}
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回首頁
        </Link>

        {/* 頁面標題 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            個人資訊
          </h1>
          <p className="text-gray-600">
            管理您的個人資料和帳戶設定
          </p>
        </div>

        {/* 公開頁面區塊 */}
        {profile && <PublicProfileSection userId={profile.id} />}

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

        {/* 個人資料表單 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {/* 頭像上傳 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              頭像
            </label>
            <div className="flex items-center space-x-4">
              {/* 頭像預覽 */}
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="頭像"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-100">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* 上傳按鈕 */}
              <div>
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  上傳圖片
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  支援 JPG、PNG、GIF，最大 5MB
                </p>
              </div>
            </div>
          </div>

          {/* 姓名 */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              姓名
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請輸入您的姓名"
            />
          </div>

          {/* 電子郵件 */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              電子郵件
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="請輸入您的電子郵件"
              required
            />
          </div>

          {/* 國家/地區 */}
          <div className="mb-6">
            <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              國家/地區
            </label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TW">台灣</option>
              <option value="CN">中國</option>
              <option value="HK">香港</option>
              <option value="MO">澳門</option>
              <option value="SG">新加坡</option>
              <option value="MY">馬來西亞</option>
              <option value="US">美國</option>
              <option value="GB">英國</option>
              <option value="JP">日本</option>
              <option value="KR">韓國</option>
              <option value="OTHER">其他</option>
            </select>
          </div>

          {/* 帳戶資訊 */}
          {profile && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">帳戶資訊</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>創建日期: {new Date(profile.createdAt).toLocaleDateString('zh-TW')}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>最後更新: {new Date(profile.updatedAt).toLocaleDateString('zh-TW')}</span>
                </div>
              </div>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  儲存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  儲存變更
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 mr-2" />
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

