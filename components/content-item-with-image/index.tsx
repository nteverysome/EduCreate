/**
 * ContentItemWithImage 組件
 * 
 * 功能：
 * - 圖片 + 文字輸入
 * - 圖片預覽
 * - 圖片選擇（使用 ImagePicker）
 * - 自動保存
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Edit2, Trash2 } from 'lucide-react';
import ImagePicker, { UserImage } from '../image-picker';

export interface ContentItem {
  id: string;
  imageId?: string;
  imageUrl?: string;
  text: string;
  position: number;
}

export interface ContentItemWithImageProps {
  value: ContentItem;
  onChange: (value: ContentItem) => void;
  onRemove?: () => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export default function ContentItemWithImage({
  value,
  onChange,
  onRemove,
  autoSave = true,
  autoSaveDelay = 1000,
}: ContentItemWithImageProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave) return;

    const timer = setTimeout(() => {
      if (JSON.stringify(localValue) !== JSON.stringify(value)) {
        setIsSaving(true);
        onChange(localValue);
        setTimeout(() => setIsSaving(false), 500);
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [localValue, autoSave, autoSaveDelay]);

  const handleTextChange = (text: string) => {
    setLocalValue({ ...localValue, text });
  };

  const handleImageSelect = (images: UserImage[]) => {
    if (images.length > 0) {
      const image = images[0];
      setLocalValue({
        ...localValue,
        imageId: image.id,
        imageUrl: image.url,
      });
    }
  };

  const handleImageRemove = () => {
    setLocalValue({
      ...localValue,
      imageId: undefined,
      imageUrl: undefined,
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            內容項目 #{value.position + 1}
          </span>
          {isSaving && (
            <span className="text-xs text-blue-600">保存中...</span>
          )}
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="刪除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Image Section */}
      <div className="mb-4">
        {localValue.imageUrl ? (
          <div className="relative group">
            <img
              src={localValue.imageUrl}
              alt={localValue.text || '內容圖片'}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg" />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowImagePicker(true)}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                title="更換圖片"
              >
                <Edit2 className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={handleImageRemove}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                title="刪除圖片"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowImagePicker(true)}
            className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">
              點擊選擇圖片
            </span>
            <span className="text-xs text-gray-500 mt-1">
              從 Unsplash 搜索或上傳圖片
            </span>
          </button>
        )}
      </div>

      {/* Text Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          文字內容
        </label>
        <textarea
          value={localValue.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="輸入文字內容..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {localValue.text.length} 字
          </span>
          {autoSave && (
            <span className="text-xs text-gray-500">
              自動保存已啟用
            </span>
          )}
        </div>
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
          multiple={false}
        />
      )}
    </div>
  );
}

