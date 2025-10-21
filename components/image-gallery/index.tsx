/**
 * ImageGallery 組件
 * 
 * 功能：
 * - 圖片網格顯示
 * - 標籤篩選
 * - 搜索功能
 * - 批量操作（刪除、標籤管理）
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Tag, Loader2, Grid, List } from 'lucide-react';
import { UserImage } from '../image-picker';

export interface ImageGalleryProps {
  onSelect?: (image: UserImage | UserImage[]) => void;
  onClose?: () => void;
  onDelete?: (deletedCount: number) => void;
  selectable?: boolean;
  multiple?: boolean;
}

export default function ImageGallery({
  onSelect,
  onClose,
  onDelete,
  selectable = false,
  multiple = false,
}: ImageGalleryProps) {
  const [images, setImages] = useState<UserImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [source, setSource] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchImages();
    fetchStats();
  }, [page, source, tag]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        perPage: '20',
      });

      if (source) params.append('source', source);
      if (tag) params.append('tag', tag);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/images/list?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '獲取圖片失敗');
      }

      setImages(data.images);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取圖片失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/images/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('獲取統計失敗:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchImages();
  };

  const handleImageSelect = (image: UserImage) => {
    if (selectable) {
      if (multiple) {
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(image.id)) {
            newSet.delete(image.id);
          } else {
            newSet.add(image.id);
          }
          return newSet;
        });
      } else {
        onSelect?.(image);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (selectedIds.size === 0) return;

    const selectedImages = images.filter(img => selectedIds.has(img.id));
    if (multiple) {
      onSelect?.(selectedImages);
    } else {
      onSelect?.(selectedImages[0]);
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    const deletedCount = selectedIds.size;
    try {
      const response = await fetch('/api/images/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: Array.from(selectedIds) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '刪除失敗');
      }

      alert(data.message);
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      fetchImages();
      fetchStats();

      // 通知父組件刪除成功
      if (onDelete) {
        onDelete(deletedCount);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '刪除失敗');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">我的圖片庫</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
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

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  來源
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部</option>
                  <option value="upload">上傳</option>
                  <option value="unsplash">Unsplash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  標籤
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="輸入標籤..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">總圖片</div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">上傳</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.bySource.upload}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Unsplash</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.bySource.unsplash}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">存儲空間</div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.storage.totalMB.toFixed(1)} MB
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Batch Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border-b p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            已選擇 {selectedIds.size} 張圖片
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消選擇
            </button>
            {selectable && onSelect && (
              <button
                onClick={handleConfirmSelection}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                確認選擇
              </button>
            )}
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              刪除
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading && images.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">還沒有圖片</p>
            <p className="text-sm mt-2">上傳圖片或從 Unsplash 搜索圖片</p>
          </div>
        ) : (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                  : 'space-y-2'
              }
            >
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedIds.has(image.id)
                      ? 'border-blue-500 shadow-lg'
                      : 'border-transparent hover:border-gray-300 hover:shadow-md'
                  } ${viewMode === 'list' ? 'flex items-center gap-4 p-2' : ''}`}
                  onClick={() => handleImageSelect(image)}
                >
                  <img
                    src={image.url}
                    alt={image.alt || image.fileName}
                    className={
                      viewMode === 'grid'
                        ? 'w-full h-48 object-cover'
                        : 'w-24 h-24 object-cover rounded'
                    }
                    loading="lazy"
                  />
                  {viewMode === 'list' && (
                    <div className="flex-1">
                      <p className="font-medium">{image.alt || image.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {image.width} × {image.height}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {image.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedIds.has(image.id) && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">確認刪除</h3>
                <p className="text-sm text-gray-600">此操作無法撤銷</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                確定要刪除 <span className="font-semibold text-red-600">{selectedIds.size}</span> 張圖片嗎？
              </p>
              <p className="text-sm text-gray-500 mt-2">
                這些圖片將從您的圖片庫中永久刪除，包括所有相關的版本記錄。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>刪除中...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>確認刪除</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

