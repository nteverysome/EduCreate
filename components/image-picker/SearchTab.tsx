/**
 * SearchTab 組件
 * Unsplash 圖片搜索標籤
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import ImageGrid from './ImageGrid';
import { UserImage } from './index';

interface SearchTabProps {
  onSelect: (image: UserImage) => void;
  isSelected: (imageId: string) => boolean;
}

interface UnsplashPhoto {
  id: string;
  description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  width: number;
  height: number;
  color: string;
  likes: number;
  user: {
    id: string;
    username: string;
    name: string;
    profileImage: string;
    profileUrl: string;
  };
  links: {
    html: string;
    download: string;
    downloadLocation: string;
  };
  createdAt: string;
}

export default function SearchTab({ onSelect, isSelected }: SearchTabProps) {
  const [searchQuery, setSearchQuery] = useState('education');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [orientation, setOrientation] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      searchPhotos();
    }
  }, [page, orientation, color]);

  const searchPhotos = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query: searchQuery,
        page: String(page),
        perPage: '20',
      });

      if (orientation) params.append('orientation', orientation);
      if (color) params.append('color', color);

      const response = await fetch(`/api/unsplash/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '搜索失敗');
      }

      setPhotos(data.photos);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    searchPhotos();
  };

  const handlePhotoSelect = async (userImage: UserImage) => {
    try {
      console.log('🔍 [SearchTab] handlePhotoSelect 開始:', userImage);

      // 從 UserImage 中獲取 sourceId（即 Unsplash photo ID）
      const photoId = userImage.sourceId;

      if (!photoId) {
        throw new Error('圖片 ID 不可用');
      }

      console.log('🔍 [SearchTab] Unsplash photo ID:', photoId);

      // 從原始 photos 數組中查找對應的 UnsplashPhoto
      const originalPhoto = photos.find(p => p.id === photoId);

      if (!originalPhoto) {
        throw new Error('找不到原始圖片數據');
      }

      console.log('🔍 [SearchTab] 找到原始照片:', originalPhoto);

      // 驗證圖片數據完整性
      if (!originalPhoto.links || !originalPhoto.links.downloadLocation) {
        throw new Error('圖片下載鏈接不可用');
      }

      console.log('🔍 [SearchTab] 開始調用 /api/unsplash/download');

      // 保存 Unsplash 圖片到用戶圖片庫
      const response = await fetch('/api/unsplash/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId: originalPhoto.id,
          downloadLocation: originalPhoto.links.downloadLocation,
          alt: originalPhoto.description || `Photo by ${originalPhoto.user.name}`,
          tags: ['unsplash'],
        }),
      });

      const data = await response.json();
      console.log('🔍 [SearchTab] API 響應:', data);

      if (!response.ok) {
        throw new Error(data.error || '保存圖片失敗');
      }

      console.log('🔍 [SearchTab] 準備調用 onSelect，data.image:', data.image);

      // 調用 onSelect 回調
      onSelect(data.image);

      console.log('✅ [SearchTab] onSelect 調用完成');
    } catch (err) {
      console.error('❌ [SearchTab] 選擇圖片錯誤:', err);
      alert(err instanceof Error ? err.message : '保存圖片失敗');
    }
  };

  const convertToUserImage = (photo: UnsplashPhoto): UserImage => {
    return {
      id: photo.id,
      url: photo.urls.regular,
      fileName: `unsplash-${photo.id}.jpg`,
      fileSize: 0,
      mimeType: 'image/jpeg',
      width: photo.width,
      height: photo.height,
      alt: photo.description || `Photo by ${photo.user.name}`,
      tags: ['unsplash'],
      source: 'unsplash',
      sourceId: photo.id,
      usageCount: 0,
      createdAt: photo.createdAt,
      photographer: {
        name: photo.user.name,
        username: photo.user.username,
        profileUrl: photo.user.profileUrl,
      },
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b bg-gray-50">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索圖片..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            篩選
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '搜索'}
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  方向
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部</option>
                  <option value="landscape">橫向</option>
                  <option value="portrait">縱向</option>
                  <option value="squarish">正方形</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  顏色
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部</option>
                  <option value="black_and_white">黑白</option>
                  <option value="black">黑色</option>
                  <option value="white">白色</option>
                  <option value="yellow">黃色</option>
                  <option value="orange">橙色</option>
                  <option value="red">紅色</option>
                  <option value="purple">紫色</option>
                  <option value="magenta">洋紅</option>
                  <option value="green">綠色</option>
                  <option value="teal">青色</option>
                  <option value="blue">藍色</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading && photos.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <ImageGrid
              images={photos.map(convertToUserImage)}
              onSelect={handlePhotoSelect}
              isSelected={isSelected}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  上一頁
                </button>
                <span className="text-sm text-gray-600">
                  第 {page} 頁 / 共 {totalPages} 頁
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

