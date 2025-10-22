/**
 * UploadTab 組件
 * 圖片上傳標籤
 */

'use client';

import React, { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { UserImage } from './index';

interface UploadTabProps {
  onSelect: (image: UserImage) => void;
  isSelected: (imageId: string) => boolean;
}

export default function UploadTab({ onSelect, isSelected }: UploadTabProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UserImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      const filesArray = Array.from(files);

      // 為每個文件獲取圖片尺寸並添加到 FormData
      const imageDimensionsPromises = filesArray.map((file, index) => {
        return new Promise<{ index: number; width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);

          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ index, width: img.width, height: img.height });
          };

          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`無法讀取圖片: ${file.name}`));
          };

          img.src = objectUrl;
        });
      });

      // 等待所有圖片尺寸獲取完成
      const imageDimensions = await Promise.all(imageDimensionsPromises);

      // 添加文件和尺寸信息到 FormData
      filesArray.forEach((file, index) => {
        formData.append(`file${index}`, file);
        const dimensions = imageDimensions[index];
        formData.append(`width${index}`, dimensions.width.toString());
        formData.append(`height${index}`, dimensions.height.toString());
      });

      const response = await fetch('/api/images/batch-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '上傳失敗');
      }

      // 添加成功上傳的圖片
      if (data.result.details.success) {
        setUploadedImages((prev) => [...prev, ...data.result.details.success]);
      }

      // 顯示失敗信息
      if (data.result.details.failed.length > 0) {
        const failedMessages = data.result.details.failed
          .map((f: any) => `${f.fileName}: ${f.reason}`)
          .join('\n');
        alert(`部分圖片上傳失敗:\n${failedMessages}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上傳失敗');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        input.files = files;
        handleFileSelect({ target: input } as any);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          點擊或拖放圖片到這裡
        </p>
        <p className="text-sm text-gray-500">
          支持 JPG, PNG, WebP, GIF（最大 10MB，最多 10 張）
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Uploading Indicator */}
      {uploading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>上傳中...</span>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">已上傳的圖片</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${
                  isSelected(image.id)
                    ? 'border-blue-500'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => onSelect(image)}
              >
                <img
                  src={image.url}
                  alt={image.alt || image.fileName}
                  className="w-full h-48 object-cover"
                />
                {isSelected(image.id) && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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
        </div>
      )}
    </div>
  );
}

