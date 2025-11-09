/**
 * ImagePicker 組件
 * 
 * 功能：
 * - 三個標籤頁：搜索（Unsplash）、上傳、我的圖片庫
 * - 圖片預覽和選擇
 * - 尺寸篩選
 * - 標籤管理
 */

'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import SearchTab from './SearchTab';
import UploadTab from './UploadTab';
import LibraryTab from './LibraryTab';

export interface UserImage {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  alt?: string;
  tags: string[];
  source: 'upload' | 'unsplash';
  sourceId?: string;
  usageCount: number;
  createdAt: string;
  photographer?: {
    name: string;
    username: string;
    profileUrl: string;
  };
}

export interface ImagePickerProps {
  onSelect: (images: UserImage[]) => void;
  onClose: () => void;
  multiple?: boolean;
  maxSelection?: number;
  initialSearchQuery?: string;
}

type TabType = 'search' | 'upload' | 'library';

export default function ImagePicker({
  onSelect,
  onClose,
  multiple = false,
  maxSelection = 10,
  initialSearchQuery = '',
}: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [selectedImages, setSelectedImages] = useState<UserImage[]>([]);

  const handleImageSelect = (image: UserImage) => {
    if (multiple) {
      setSelectedImages((prev) => {
        const isSelected = prev.some((img) => img.id === image.id);
        if (isSelected) {
          return prev.filter((img) => img.id !== image.id);
        } else {
          if (prev.length >= maxSelection) {
            alert(`最多只能選擇 ${maxSelection} 張圖片`);
            return prev;
          }
          return [...prev, image];
        }
      });
    } else {
      onSelect([image]);
      onClose();
    }
  };

  const handleConfirm = () => {
    if (selectedImages.length > 0) {
      onSelect(selectedImages);
      onClose();
    }
  };

  const isImageSelected = (imageId: string) => {
    return selectedImages.some((img) => img.id === imageId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold">選擇圖片</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'search'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            搜索 Unsplash
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            上傳圖片
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'library'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            我的圖片庫
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'search' && (
            <SearchTab
              onSelect={handleImageSelect}
              isSelected={isImageSelected}
              initialSearchQuery={initialSearchQuery}
            />
          )}
          {activeTab === 'upload' && (
            <UploadTab
              onSelect={handleImageSelect}
              isSelected={isImageSelected}
            />
          )}
          {activeTab === 'library' && (
            <LibraryTab
              onSelect={handleImageSelect}
              isSelected={isImageSelected}
            />
          )}
        </div>

        {/* Footer */}
        {multiple && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              已選擇: {selectedImages.length} / {maxSelection} 張圖片
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedImages.length === 0}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                確認選擇
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

