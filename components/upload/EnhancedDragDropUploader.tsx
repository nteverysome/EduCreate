/**
 * EnhancedDragDropUploader - 增強的拖拽上傳組件
 * 支持批量上傳、進度追蹤、文件預處理、格式轉換等高級功能
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MediaFile } from '../../lib/media/MediaManager';

export interface UploadFile extends File {
  id: string;
  preview?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface EnhancedDragDropUploaderProps {
  onUploadComplete?: (files: MediaFile[]) => void;
  onUploadProgress?: (progress: { [fileId: string]: number }) => void;
  onFilePreprocess?: (file: File) => Promise<File>;
  acceptedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  enablePreview?: boolean;
  enableCompression?: boolean;
  enableFormatConversion?: boolean;
  className?: string;
  'data-testid'?: string;
}

const EnhancedDragDropUploader = ({
  onUploadComplete,
  onUploadProgress,
  onFilePreprocess,
  acceptedTypes = ['image/*', 'audio/*', 'video/*'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 10,
  enablePreview = true,
  enableCompression = true,
  enableFormatConversion = false,
  className = '',
  'data-testid': testId = 'enhanced-drag-drop-uploader'
}: EnhancedDragDropUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [fileId: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // 生成文件ID
  const generateFileId = (): string => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 驗證文件
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // 檢查文件大小
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `文件大小超過限制 (${(maxFileSize / 1024 / 1024).toFixed(1)}MB)`
      };
    }

    // 檢查文件類型
    if (acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return {
          valid: false,
          error: `不支持的文件類型: ${file.type}`
        };
      }
    }

    return { valid: true };
  };

  // 創建文件預覽
  const createFilePreview = async (file: File): Promise<string | undefined> => {
    if (!enablePreview) return undefined;

    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }

    return undefined;
  };

  // 處理文件選擇
  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // 檢查文件數量限制
    if (uploadFiles.length + fileArray.length > maxFiles) {
      alert(`最多只能上傳 ${maxFiles} 個文件`);
      return;
    }

    const newUploadFiles: UploadFile[] = [];

    for (const file of fileArray) {
      const validation = validateFile(file);
      const fileId = generateFileId();
      
      const uploadFile: UploadFile = Object.assign(file, {
        id: fileId,
        status: validation.valid ? 'pending' : 'error',
        error: validation.error,
        progress: 0
      });

      if (validation.valid) {
        // 創建預覽
        uploadFile.preview = await createFilePreview(file);
      }

      newUploadFiles.push(uploadFile);
    }

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, [uploadFiles.length, maxFiles, maxFileSize, acceptedTypes, enablePreview]);

  // 拖拽事件處理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 只有當離開整個拖拽區域時才設置為false
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // 文件輸入變更處理
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
    // 清空輸入值以允許重複選擇同一文件
    e.target.value = '';
  }, [handleFiles]);

  // 點擊上傳區域
  const handleUploadAreaClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 移除文件
  const removeFile = useCallback((fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  }, []);

  // 模擬上傳過程
  const uploadFile = async (file: UploadFile): Promise<MediaFile> => {
    return new Promise((resolve, reject) => {
      // 模擬上傳進度
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // 模擬上傳完成
          const mediaFile: MediaFile = {
            id: file.id,
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' :
                  file.type.startsWith('audio/') ? 'audio' :
                  file.type.startsWith('video/') ? 'video' : 'other',
            format: file.name.split('.').pop() || '',
            size: file.size,
            url: file.preview || URL.createObjectURL(file),
            createdAt: Date.now(),
            metadata: {
              originalName: file.name,
              mimeType: file.type
            }
          };
          
          resolve(mediaFile);
        } else {
          setUploadProgress(prev => ({ ...prev, [file.id]: progress }));
          onUploadProgress?.({ ...uploadProgress, [file.id]: progress });
        }
      }, 100 + Math.random() * 200);
    });
  };

  // 開始上傳
  const startUpload = useCallback(async () => {
    const validFiles = uploadFiles.filter(f => f.status === 'pending');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // 更新文件狀態為上傳中
      setUploadFiles(prev => prev.map(f => 
        f.status === 'pending' ? { ...f, status: 'uploading' } : f
      ));

      const uploadPromises = validFiles.map(async (file) => {
        try {
          // 預處理文件（如果提供了預處理函數）
          let processedFile = file;
          if (onFilePreprocess) {
            processedFile = Object.assign(await onFilePreprocess(file), {
              id: file.id,
              preview: file.preview,
              status: 'processing' as const
            });
          }

          // 上傳文件
          const mediaFile = await uploadFile(processedFile);
          
          // 更新文件狀態為完成
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'complete' } : f
          ));

          return mediaFile;
        } catch (error) {
          // 更新文件狀態為錯誤
          setUploadFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : '上傳失敗' 
            } : f
          ));
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<MediaFile> => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulUploads.length > 0) {
        onUploadComplete?.(successfulUploads);
      }

    } catch (error) {
      console.error('批量上傳失敗:', error);
    } finally {
      setIsUploading(false);
    }
  }, [uploadFiles, onFilePreprocess, onUploadComplete, uploadProgress, onUploadProgress]);

  // 清空所有文件
  const clearAllFiles = useCallback(() => {
    setUploadFiles([]);
    setUploadProgress({});
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 獲取狀態顏色
  const getStatusColor = (status: UploadFile['status']): string => {
    switch (status) {
      case 'pending': return 'text-gray-600';
      case 'uploading': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'complete': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // 獲取狀態圖標
  const getStatusIcon = (status: UploadFile['status']): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '⬆️';
      case 'processing': return '⚙️';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '📄';
    }
  };

  return (
    <div className={`enhanced-drag-drop-uploader ${className}`} data-testid={testId}>
      {/* 拖拽上傳區域 */}
      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
        data-testid="drop-zone"
      >
        <div className="text-6xl mb-4">
          {isDragOver ? '📂' : '📁'}
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {isDragOver ? '放開以上傳文件' : '拖拽文件到此處或點擊選擇'}
        </h3>
        <p className="text-gray-600 mb-4">
          支持 {acceptedTypes.join(', ')} 格式
        </p>
        <p className="text-sm text-gray-500">
          最大文件大小: {formatFileSize(maxFileSize)} | 最多 {maxFiles} 個文件
        </p>
        
        {/* 隱藏的文件輸入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          data-testid="file-input"
        />
      </div>

      {/* 文件列表 */}
      {uploadFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              選擇的文件 ({uploadFiles.length}/{maxFiles})
            </h4>
            <div className="space-x-2">
              <button
                onClick={startUpload}
                disabled={isUploading || uploadFiles.every(f => f.status !== 'pending')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                data-testid="start-upload-btn"
              >
                {isUploading ? '上傳中...' : '開始上傳'}
              </button>
              <button
                onClick={clearAllFiles}
                disabled={isUploading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                data-testid="clear-files-btn"
              >
                清空列表
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {uploadFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                data-testid={`file-item-${file.id}`}
              >
                {/* 文件預覽 */}
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl">
                    📄
                  </div>
                )}

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{file.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </div>
                  {file.error && (
                    <div className="text-sm text-red-600 mt-1">{file.error}</div>
                  )}
                </div>

                {/* 狀態和進度 */}
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-1 ${getStatusColor(file.status)}`}>
                    <span>{getStatusIcon(file.status)}</span>
                    <span className="text-sm font-medium">
                      {file.status === 'uploading' && uploadProgress[file.id] 
                        ? `${Math.round(uploadProgress[file.id])}%`
                        : file.status
                      }
                    </span>
                  </div>

                  {/* 移除按鈕 */}
                  <button
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading && file.status === 'uploading'}
                    className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    data-testid={`remove-file-${file.id}`}
                  >
                    🗑️
                  </button>
                </div>

                {/* 進度條 */}
                {file.status === 'uploading' && uploadProgress[file.id] !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[file.id]}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDragDropUploader;
