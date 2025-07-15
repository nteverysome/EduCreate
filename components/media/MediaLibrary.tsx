/**
 * MediaLibrary - 媒體庫組件
 * 展示、搜索和管理已上傳的媒體文件
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MediaManager, MediaFile, MediaLibraryFilter } from '../../lib/media/MediaManager';

export interface MediaLibraryProps {
  onFileSelect?: (file: MediaFile) => void;
  onFileDelete?: (file: MediaFile) => void;
  selectable?: boolean;
  deletable?: boolean;
  className?: string;
  'data-testid'?: string;
}

export default function MediaLibrary({
  onFileSelect,
  onFileDelete,
  selectable = true,
  deletable = true,
  className = '',
  'data-testid': testId = 'media-library'
}: MediaLibraryProps) {
  const [mediaManager] = useState(() => new MediaManager());
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [filter, setFilter] = useState<MediaLibraryFilter>({});
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 載入媒體文件
  useEffect(() => {
    const handleLibraryUpdate = (files: MediaFile[]) => {
      setMediaFiles(files);
    };

    mediaManager.addLibraryListener(handleLibraryUpdate);
    
    // 初始載入
    const initialFiles = mediaManager.getAllMediaFiles();
    setMediaFiles(initialFiles);

    return () => {
      mediaManager.removeLibraryListener(handleLibraryUpdate);
      mediaManager.destroy();
    };
  }, [mediaManager]);

  // 應用過濾器
  useEffect(() => {
    const filtered = mediaManager.searchMedia(filter);
    setFilteredFiles(filtered);
  }, [mediaManager, mediaFiles, filter]);

  // 處理搜索
  const handleSearch = useCallback((searchQuery: string) => {
    setFilter(prev => ({ ...prev, searchQuery }));
  }, []);

  // 處理類型過濾
  const handleTypeFilter = useCallback((type: MediaFile['type'] | undefined) => {
    setFilter(prev => ({ ...prev, type }));
  }, []);

  // 處理文件選擇
  const handleFileClick = useCallback((file: MediaFile) => {
    if (selectable) {
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  }, [selectable, onFileSelect]);

  // 處理文件刪除
  const handleFileDelete = useCallback(async (file: MediaFile, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!deletable) return;
    
    if (confirm(`確定要刪除 "${file.name}" 嗎？`)) {
      try {
        await mediaManager.deleteMediaFile(file.id);
        onFileDelete?.(file);
        
        // 如果刪除的是當前選中的文件，清除選擇
        if (selectedFile?.id === file.id) {
          setSelectedFile(null);
        }
      } catch (error) {
        alert('刪除文件失敗');
        console.error('刪除文件失敗:', error);
      }
    }
  }, [deletable, mediaManager, onFileDelete, selectedFile]);

  // 獲取文件類型圖標
  const getFileTypeIcon = (type: MediaFile['type']): string => {
    switch (type) {
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'video': return '🎬';
      case 'animation': return '🎭';
      default: return '📄';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    return mediaManager.formatFileSize(bytes);
  };

  // 格式化日期
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`media-library ${className}`} data-testid={testId}>
      {/* 工具列 */}
      <div className="toolbar bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* 搜索框 */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜索媒體文件..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleSearch(e.target.value)}
              data-testid="search-input"
            />
          </div>

          {/* 過濾器和視圖控制 */}
          <div className="flex items-center space-x-4">
            {/* 類型過濾 */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleTypeFilter(e.target.value as MediaFile['type'] || undefined)}
              data-testid="type-filter"
            >
              <option value="">所有類型</option>
              <option value="image">圖片</option>
              <option value="audio">音頻</option>
              <option value="video">視頻</option>
              <option value="animation">動畫</option>
            </select>

            {/* 視圖模式切換 */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setViewMode('grid')}
                data-testid="grid-view-btn"
              >
                網格
              </button>
              <button
                className={`px-3 py-2 text-sm border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setViewMode('list')}
                data-testid="list-view-btn"
              >
                列表
              </button>
            </div>
          </div>
        </div>

        {/* 統計信息 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span data-testid="file-count">
              共 {filteredFiles.length} 個文件
            </span>
            <span data-testid="total-size">
              總大小: {formatFileSize(filteredFiles.reduce((sum, file) => sum + file.size, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* 媒體文件展示 */}
      {filteredFiles.length === 0 ? (
        <div className="empty-state text-center py-12" data-testid="empty-state">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到媒體文件</h3>
          <p className="text-gray-600">
            {mediaFiles.length === 0 ? '還沒有上傳任何文件' : '嘗試調整搜索條件'}
          </p>
        </div>
      ) : (
        <div className={`media-grid ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}`} data-testid="media-grid">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`media-item cursor-pointer transition-all ${
                viewMode === 'grid' 
                  ? `bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md ${selectedFile?.id === file.id ? 'ring-2 ring-blue-500' : ''}`
                  : `bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 ${selectedFile?.id === file.id ? 'bg-blue-50 border-blue-300' : ''}`
              }`}
              onClick={() => handleFileClick(file)}
              data-testid={`media-item-${file.id}`}
            >
              {viewMode === 'grid' ? (
                /* 網格視圖 */
                <>
                  {/* 縮略圖或圖標 */}
                  <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt={file.metadata?.altText || file.name}
                        className="w-full h-full object-cover"
                        data-testid={`thumbnail-${file.id}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {getFileTypeIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* 文件信息 */}
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(file.size)}
                    </p>
                    {file.dimensions && (
                      <p className="text-xs text-gray-500">
                        {file.dimensions.width} × {file.dimensions.height}
                      </p>
                    )}
                    {file.duration && (
                      <p className="text-xs text-gray-500">
                        {mediaManager.formatDuration(file.duration)}
                      </p>
                    )}
                  </div>

                  {/* 操作按鈕 */}
                  {deletable && (
                    <button
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleFileDelete(file, e)}
                      title="刪除文件"
                      data-testid={`delete-btn-${file.id}`}
                    >
                      ×
                    </button>
                  )}
                </>
              ) : (
                /* 列表視圖 */
                <div className="flex items-center space-x-4">
                  {/* 圖標或縮略圖 */}
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt={file.metadata?.altText || file.name}
                        className="w-full h-full object-cover"
                        data-testid={`list-thumbnail-${file.id}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {getFileTypeIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* 文件信息 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{file.type}</span>
                      <span>{formatFileSize(file.size)}</span>
                      {file.dimensions && (
                        <span>{file.dimensions.width} × {file.dimensions.height}</span>
                      )}
                      {file.duration && (
                        <span>{mediaManager.formatDuration(file.duration)}</span>
                      )}
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  {deletable && (
                    <button
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                      onClick={(e) => handleFileDelete(file, e)}
                      data-testid={`list-delete-btn-${file.id}`}
                    >
                      刪除
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 選中文件詳情 */}
      {selectedFile && (
        <div className="selected-file-details mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid="selected-file-details">
          <h4 className="font-medium text-blue-900 mb-2">選中文件詳情</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>文件名:</strong> {selectedFile.name}
            </div>
            <div>
              <strong>類型:</strong> {selectedFile.type}
            </div>
            <div>
              <strong>大小:</strong> {formatFileSize(selectedFile.size)}
            </div>
            <div>
              <strong>上傳時間:</strong> {formatDate(selectedFile.uploadedAt)}
            </div>
            {selectedFile.dimensions && (
              <div>
                <strong>尺寸:</strong> {selectedFile.dimensions.width} × {selectedFile.dimensions.height}
              </div>
            )}
            {selectedFile.duration && (
              <div>
                <strong>時長:</strong> {mediaManager.formatDuration(selectedFile.duration)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
