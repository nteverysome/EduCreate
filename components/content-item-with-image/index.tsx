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
import { Image as ImageIcon, X, Edit2, Trash2, Download } from 'lucide-react';
import ImagePicker, { UserImage } from '../image-picker';
import { overlayTextOnImage, type TextOverlayOptions } from '@/lib/image-text-overlay';

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
  onSave?: (value: ContentItem) => Promise<boolean>;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export default function ContentItemWithImage({
  value,
  onChange,
  onRemove,
  onSave,
  autoSave = true,
  autoSaveDelay = 1000,
}: ContentItemWithImageProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Text overlay states
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 }); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [textColor, setTextColor] = useState<'white' | 'black'>('white');
  const [showBg, setShowBg] = useState(true);

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(localValue) !== JSON.stringify(value));
  }, [localValue, value]);

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

  const handleManualSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      if (onSave) {
        const success = await onSave(localValue);
        if (success) {
          onChange(localValue);
        }
      } else {
        onChange(localValue);
      }
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

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

  // Text dragging handlers
  const handleTextMouseDown = (e: React.MouseEvent) => {
    if (!localValue.imageUrl) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (textPosition.x * e.currentTarget.parentElement!.offsetWidth / 100),
      y: e.clientY - (textPosition.y * e.currentTarget.parentElement!.offsetHeight / 100),
    });
  };

  const handleTextMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !localValue.imageUrl) return;
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - dragStart.x) / rect.width) * 100;
    const y = ((e.clientY - dragStart.y) / rect.height) * 100;
    setTextPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleTextMouseUp = () => {
    setIsDragging(false);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-lg';
      case 'medium': return 'text-2xl';
      case 'large': return 'text-4xl';
    }
  };

  // Generate and upload image with text overlay
  const handleGenerateImage = async () => {
    if (!localValue.imageUrl || !localValue.text) {
      alert('請先選擇圖片並輸入文字');
      return;
    }

    setIsSaving(true);
    try {
      // Generate image with text overlay
      const overlayOptions: TextOverlayOptions = {
        text: localValue.text,
        position: textPosition,
        fontSize,
        textColor,
        showBackground: showBg,
      };

      const blob = await overlayTextOnImage(localValue.imageUrl, overlayOptions);

      // Upload to server
      const formData = new FormData();
      formData.append('file', blob, 'content-image-with-text.png');
      formData.append('source', 'content-item');

      const uploadResponse = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('上傳圖片失敗');
      }

      const uploadData = await uploadResponse.json();
      console.log('Image uploaded successfully:', uploadData);

      // Create version record for the newly uploaded image
      // This ensures that when users select the generated image in ImageGallery,
      // they can see its version history
      const versionResponse = await fetch(`/api/images/${uploadData.image.id}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: uploadData.image.url,
          blobPath: uploadData.image.blobPath,
          changes: {
            type: 'text-overlay',
            timestamp: new Date().toISOString(),
            description: '添加文字疊加',
            textContent: localValue.text,
            textPosition: textPosition,
            fontSize: fontSize,
            textColor: textColor,
            showBackground: showBg,
            originalImageId: localValue.imageId, // Track the original image
          },
        }),
      });

      if (!versionResponse.ok) {
        console.error('Failed to create version record');
        // Don't throw error, just log it - version creation is not critical
      } else {
        const versionData = await versionResponse.json();
        console.log('Version created successfully:', versionData);
      }

      // Update local value with new image URL
      const newValue = {
        ...localValue,
        imageId: uploadData.image.id,
        imageUrl: uploadData.image.url,
      };

      setLocalValue(newValue);

      // Call onSave if provided
      if (onSave) {
        await onSave(newValue);
      } else {
        onChange(newValue);
      }

      // Get version number for display
      let versionNumber = 1;
      if (versionResponse.ok) {
        const versionData = await versionResponse.json();
        versionNumber = versionData.version?.version || 1;
      }

      alert(`✅ 圖片已生成並保存！版本號：${versionNumber}\n您可以在圖片庫中查看。`);
    } catch (error) {
      console.error('Generate image error:', error);
      alert(error instanceof Error ? error.message : '生成圖片失敗');
    } finally {
      setIsSaving(false);
    }
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

      {/* Image Section with Draggable Text */}
      <div className="mb-4">
        {localValue.imageUrl ? (
          <div
            className="relative group select-none"
            onMouseMove={handleTextMouseMove}
            onMouseUp={handleTextMouseUp}
            onMouseLeave={handleTextMouseUp}
          >
            <img
              src={localValue.imageUrl}
              alt={localValue.text || '內容圖片'}
              className="w-full h-96 object-contain rounded-lg bg-gray-100"
            />

            {/* Draggable Text Overlay */}
            <div
              className={`absolute cursor-move ${getFontSizeClass()} font-bold ${
                textColor === 'white' ? 'text-white' : 'text-black'
              } ${showBg ? 'bg-black/50 px-4 py-2 rounded-lg' : ''}`}
              style={{
                left: `${textPosition.x}%`,
                top: `${textPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '80%',
                wordWrap: 'break-word',
              }}
              onMouseDown={handleTextMouseDown}
            >
              {localValue.text || '點擊下方編輯文字'}
            </div>

            {/* Control Buttons */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg pointer-events-none" />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
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

      {/* Text Style Controls (only show when image exists) */}
      {localValue.imageUrl && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文字樣式
          </label>
          <div className="flex flex-wrap gap-2">
            {/* Font Size */}
            <div className="flex gap-1">
              <button
                onClick={() => setFontSize('small')}
                className={`px-3 py-1 text-xs rounded ${
                  fontSize === 'small' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                小
              </button>
              <button
                onClick={() => setFontSize('medium')}
                className={`px-3 py-1 text-xs rounded ${
                  fontSize === 'medium' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                中
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-3 py-1 text-xs rounded ${
                  fontSize === 'large' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                大
              </button>
            </div>

            {/* Text Color */}
            <div className="flex gap-1">
              <button
                onClick={() => setTextColor('white')}
                className={`px-3 py-1 text-xs rounded ${
                  textColor === 'white' ? 'bg-white text-black border-2 border-blue-600' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                白色
              </button>
              <button
                onClick={() => setTextColor('black')}
                className={`px-3 py-1 text-xs rounded ${
                  textColor === 'black' ? 'bg-black text-white border-2 border-blue-600' : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                黑色
              </button>
            </div>

            {/* Background Toggle */}
            <button
              onClick={() => setShowBg(!showBg)}
              className={`px-3 py-1 text-xs rounded ${
                showBg ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {showBg ? '有背景' : '無背景'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 拖動圖片上的文字可以調整位置
          </p>
        </div>
      )}

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
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-xs text-gray-500">
            {localValue.text.length} 字
          </span>
          <div className="flex gap-2">
            {/* Generate Image Button (only show when image and text exist) */}
            {localValue.imageUrl && localValue.text && (
              <button
                onClick={handleGenerateImage}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                title="將文字疊加到圖片上並生成新圖片"
              >
                <Download className="w-4 h-4" />
                {isSaving ? '生成中...' : '生成圖片'}
              </button>
            )}

            {/* Save Button */}
            {autoSave ? (
              <span className="text-xs text-gray-500">
                自動保存已啟用
              </span>
            ) : (
              <button
                onClick={handleManualSave}
                disabled={!hasChanges || isSaving}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasChanges && !isSaving
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? '保存中...' : hasChanges ? '保存' : '已保存'}
              </button>
            )}
          </div>
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

