/**
 * MediaUploader - 多媒體上傳組件
 * 支持拖拽上傳、批量處理和實時進度顯示
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MediaManager, MediaUploadProgress, MediaFile } from '../../lib/media/MediaManager';
export interface MediaUploaderProps {
  onUploadComplete?: (files: MediaFile[]) => void;
  onUploadProgress?: (progress: MediaUploadProgress[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  className?: string;
  'data-testid'?: string;
}
export default function MediaUploader({
  onUploadComplete,
  onUploadProgress,
  acceptedTypes,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  multiple = true,
  className = '',
  'data-testid': testId = 'media-uploader'
}: MediaUploaderProps) {
  const [mediaManager] = useState(() => {
    // 只在瀏覽器環境中創建 MediaManager
    if (typeof window === 'undefined') {
      return null;
    }
    return new MediaManager({
      maxFileSize,
      allowedTypes: acceptedTypes
    });
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 設置監聽器
  useEffect(() => {
    if (!mediaManager) return;

    const handleProgress = (progress: MediaUploadProgress[]) => {
      setUploadProgress(progress);
      onUploadProgress?.(progress);
    };
    const handleLibraryUpdate = (files: MediaFile[]) => {
      setUploadedFiles(files);
    };
    mediaManager.addProgressListener(handleProgress);
    mediaManager.addLibraryListener(handleLibraryUpdate);
    return () => {
      mediaManager.removeProgressListener(handleProgress);
      mediaManager.removeLibraryListener(handleLibraryUpdate);
      mediaManager.destroy();
    };
  }, [mediaManager, onUploadProgress]);
  // 處理文件選擇
  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!mediaManager) return;

    try {
      const fileIds = await mediaManager.uploadFiles(files);
      const uploadedMediaFiles = fileIds.map(id => mediaManager.getMediaFile(id)!).filter(Boolean);
      onUploadComplete?.(uploadedMediaFiles);
    } catch (error) {
      console.error('文件上傳失敗:', error);
    }
  }, [mediaManager, onUploadComplete]);
  // 處理拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);
  // 處理點擊上傳
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // 清空 input 值，允許重複選擇同一文件
    e.target.value = '';
  }, [handleFileSelect]);
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    return mediaManager.formatFileSize(bytes);
  };
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
  // 獲取進度條顏色
  const getProgressColor = (status: MediaUploadProgress['status']): string => {
    switch (status) {
      case 'uploading': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  return (
    <div className={`media-uploader ${className}`} data-testid={testId}>
      {/* 上傳區域 */}
      <div
        className={`upload-area border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="上傳媒體文件"
        data-testid="upload-area"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className="text-4xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isDragOver ? '放開以上傳文件' : '拖拽文件到此處或點擊上傳'}
        </h3>
        <p className="text-gray-600 mb-4">
          支持圖片、音頻、視頻和動畫文件
        </p>
        <p className="text-sm text-gray-500">
          最大文件大小: {formatFileSize(maxFileSize)}
        </p>
        {/* 隱藏的文件輸入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes?.join(',') || '*/*'}
          onChange={handleFileInputChange}
          className="hidden"
          data-testid="file-input"
        />
      </div>
      {/* 上傳進度 */}
      {uploadProgress.length > 0 && (
        <div className="upload-progress mt-6" data-testid="upload-progress">
          <h4 className="text-lg font-medium text-gray-900 mb-4">上傳進度</h4>
          <div className="space-y-3">
            {uploadProgress.map((progress) => (
              <div key={progress.fileId} className="progress-item bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📄</span>
                    <span className="font-medium text-gray-900">{progress.fileName}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {progress.status === 'complete' ? '完成' : 
                     progress.status === 'error' ? '錯誤' :
                     progress.status === 'processing' ? '處理中' :
                     progress.status === 'uploading' ? '上傳中' : '等待中'}
                  </span>
                </div>
                {/* 進度條 */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.status)}`}
                    style={{ width: `${progress.progress}%` }}
                    data-testid={`progress-bar-${progress.fileId}`}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{progress.progress}%</span>
                  {progress.error && (
                    <span className="text-red-600" data-testid={`error-${progress.fileId}`}>
                      {progress.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 已上傳文件預覽 */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files mt-6" data-testid="uploaded-files">
          <h4 className="text-lg font-medium text-gray-900 mb-4">已上傳文件</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.slice(0, 6).map((file) => (
              <div key={file.id} className="file-preview bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl flex-shrink-0">
                    {getFileTypeIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {file.type} • {formatFileSize(file.size)}
                    </p>
                    {file.dimensions && (
                      <p className="text-sm text-gray-500">
                        {file.dimensions.width} × {file.dimensions.height}
                      </p>
                    )}
                    {file.duration && (
                      <p className="text-sm text-gray-500">
                        時長: {mediaManager.formatDuration(file.duration)}
                      </p>
                    )}
                  </div>
                </div>
                {/* 縮略圖 */}
                {file.thumbnailUrl && (
                  <div className="mt-3">
                    <img
                      src={file.thumbnailUrl}
                      alt={file.metadata?.altText || file.name}
                      className="w-full h-24 object-cover rounded border"
                      data-testid={`thumbnail-${file.id}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {uploadedFiles.length > 6 && (
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                還有 {uploadedFiles.length - 6} 個文件...
              </p>
            </div>
          )}
        </div>
      )}
      {/* 支持的文件類型說明 */}
      <div className="file-types-info mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">支持的文件類型</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
          <div>
            <strong>圖片:</strong> JPG, PNG, GIF, WebP, SVG, BMP, TIFF
          </div>
          <div>
            <strong>音頻:</strong> MP3, WAV, OGG, AAC, M4A, FLAC
          </div>
          <div>
            <strong>視頻:</strong> MP4, WebM, OGG, AVI, MOV, WMV
          </div>
          <div>
            <strong>動畫:</strong> GIF, MP4, WebM, Lottie JSON
          </div>
        </div>
      </div>
    </div>
  );
}
