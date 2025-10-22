'use client';

import React, { useState, useEffect } from 'react';
import InputWithImage from '../input-with-image';
import ImagePicker, { UserImage } from '../image-picker';
import ImageEditor from '../image-editor';
import { overlayTextOnImage, TextOverlayOptions } from '@/lib/image-text-overlay';

export interface VocabularyItemData {
  id: string;
  english: string;
  chinese: string;
  imageId?: string;           // 英文圖片 ID
  imageUrl?: string;          // 英文圖片 URL
  chineseImageId?: string;    // 中文圖片 ID
  chineseImageUrl?: string;   // 中文圖片 URL
  imageSize?: 'small' | 'medium' | 'large';        // 英文圖片大小
  chineseImageSize?: 'small' | 'medium' | 'large'; // 中文圖片大小
}

interface VocabularyItemWithImageProps {
  item: VocabularyItemData;
  index: number;
  onChange: (item: VocabularyItemData) => void;
  onRemove: () => void;
  minItems: number;
  totalItems: number;
}

/**
 * VocabularyItemWithImage - Wordwall 整合設計的詞彙項目組件
 *
 * 特點：
 * - 圖片功能完全整合在輸入框內部（Wordwall 風格）
 * - 圖片圖標在輸入框內部右側
 * - 圖片縮圖在輸入框內部左側
 * - 不佔用額外的垂直空間
 * - 完整的圖片功能（EduCreate 功能）
 * - 自動文字疊加
 * - 版本管理
 */
export default function VocabularyItemWithImage({
  item,
  index,
  onChange,
  onRemove,
  minItems,
  totalItems,
}: VocabularyItemWithImageProps) {
  // 英文圖片狀態
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);

  // 中文圖片狀態
  const [showChineseImagePicker, setShowChineseImagePicker] = useState(false);
  const [showChineseImageEditor, setShowChineseImageEditor] = useState(false);
  const [isGeneratingChinese, setIsGeneratingChinese] = useState(false);
  const [baseChineseImageUrl, setBaseChineseImageUrl] = useState<string | null>(null);

  // 處理圖片選擇
  const handleImageSelect = async (images: UserImage[]) => {
    if (images.length > 0) {
      const selectedImage = images[0];
      setBaseImageUrl(selectedImage.url);
      
      onChange({
        ...item,
        imageId: selectedImage.id,
        imageUrl: selectedImage.url,
      });
      
      setShowImagePicker(false);
      
      // 如果有文字，自動生成帶文字的圖片
      if (item.english || item.chinese) {
        await generateImageWithText(selectedImage.url);
      }
    }
  };

  // 處理圖片編輯
  const handleImageEdit = (editedBlob: Blob, editedUrl: string) => {
    setBaseImageUrl(editedUrl);
    onChange({
      ...item,
      imageUrl: editedUrl,
    });
    setShowImageEditor(false);
    
    // 重新生成帶文字的圖片
    if (item.english || item.chinese) {
      generateImageWithText(editedUrl);
    }
  };

  // 處理英文圖片刪除
  const handleImageRemove = () => {
    onChange({
      ...item,
      imageId: undefined,
      imageUrl: undefined,
    });
    setBaseImageUrl(null);
  };

  // 處理中文圖片選擇
  const handleChineseImageSelect = async (images: UserImage[]) => {
    if (images.length > 0) {
      const selectedImage = images[0];
      setBaseChineseImageUrl(selectedImage.url);

      onChange({
        ...item,
        chineseImageId: selectedImage.id,
        chineseImageUrl: selectedImage.url,
      });

      setShowChineseImagePicker(false);

      // 如果有中文文字，自動生成帶文字的圖片
      if (item.chinese) {
        await generateChineseImageWithText(selectedImage.url);
      }
    }
  };

  // 處理中文圖片編輯
  const handleChineseImageEdit = (editedBlob: Blob, editedUrl: string) => {
    setBaseChineseImageUrl(editedUrl);
    onChange({
      ...item,
      chineseImageUrl: editedUrl,
    });
    setShowChineseImageEditor(false);

    // 重新生成帶文字的圖片
    if (item.chinese) {
      generateChineseImageWithText(editedUrl);
    }
  };

  // 處理中文圖片刪除
  const handleChineseImageRemove = () => {
    onChange({
      ...item,
      chineseImageId: undefined,
      chineseImageUrl: undefined,
    });
    setBaseChineseImageUrl(null);
  };

  // 生成帶英文文字的圖片
  const generateImageWithText = async (imageUrl: string) => {
    if (!item.english && !item.chinese) return;

    setIsGenerating(true);
    try {
      // 構建文字內容
      const textLines: string[] = [];
      if (item.english) textLines.push(item.english);
      if (item.chinese) textLines.push(item.chinese);
      const text = textLines.join('\n');

      // 文字疊加選項
      const options: TextOverlayOptions = {
        text,
        position: { x: 50, y: 50 }, // 中心位置
        fontSize: 'medium',
        textColor: 'white',
        showBackground: true,
      };

      // 生成圖片 Blob
      const generatedImageBlob = await overlayTextOnImage(imageUrl, options);

      // 創建預覽 URL
      const previewUrl = URL.createObjectURL(generatedImageBlob);

      // 立即更新預覽
      onChange({
        ...item,
        imageUrl: previewUrl,
      });

      // 上傳生成的圖片到 Vercel Blob（後台進行）
      const formData = new FormData();
      formData.append('file', generatedImageBlob, `vocabulary-${item.id}-${Date.now()}.png`);

      // 使用測試 API 端點（不需要登錄）
      // 在生產環境中，應該使用 /api/images/upload（需要登錄）
      const uploadEndpoint = '/api/images/upload-test';

      console.log(`📤 上傳圖片到: ${uploadEndpoint}`);

      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();

        // 檢查響應結構
        const imageData = uploadData.image || uploadData;

        // 更新為永久 URL
        onChange({
          ...item,
          imageUrl: imageData.url,
          imageId: imageData.id,
        });

        // 釋放預覽 URL
        URL.revokeObjectURL(previewUrl);

        // 創建版本記錄
        if (item.imageId) {
          await fetch(`/api/images/${item.imageId}/versions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: imageData.url,
              changes: `Text overlay: ${text}`,
            }),
          });
        }
      } else {
        // 處理上傳失敗
        console.error('圖片上傳失敗:', uploadResponse.status, uploadResponse.statusText);
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error('錯誤詳情:', errorData);

        // 顯示錯誤信息給用戶
        alert(`圖片上傳失敗: ${errorData.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('生成圖片失敗:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 生成帶中文文字的圖片
  const generateChineseImageWithText = async (imageUrl: string) => {
    if (!item.chinese) return;

    setIsGeneratingChinese(true);
    try {
      // 文字疊加選項
      const options: TextOverlayOptions = {
        text: item.chinese,
        position: { x: 50, y: 50 }, // 中心位置
        fontSize: 'medium',
        textColor: 'white',
        showBackground: true,
      };

      // 生成圖片 Blob
      const generatedImageBlob = await overlayTextOnImage(imageUrl, options);

      // 創建預覽 URL
      const previewUrl = URL.createObjectURL(generatedImageBlob);

      // 立即更新預覽
      onChange({
        ...item,
        chineseImageUrl: previewUrl,
      });

      // 上傳生成的圖片到 Vercel Blob
      const formData = new FormData();
      formData.append('file', generatedImageBlob, `vocabulary-chinese-${item.id}-${Date.now()}.png`);

      const uploadEndpoint = '/api/images/upload-test';
      console.log(`📤 上傳中文圖片到: ${uploadEndpoint}`);

      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        const imageData = uploadData.image || uploadData;

        // 更新為永久 URL
        onChange({
          ...item,
          chineseImageUrl: imageData.url,
          chineseImageId: imageData.id,
        });

        // 釋放預覽 URL
        URL.revokeObjectURL(previewUrl);
      } else {
        console.error('中文圖片上傳失敗:', uploadResponse.status, uploadResponse.statusText);
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error('錯誤詳情:', errorData);
        alert(`中文圖片上傳失敗: ${errorData.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error('生成中文圖片失敗:', error);
    } finally {
      setIsGeneratingChinese(false);
    }
  };

  // 當英文文字改變時，重新生成英文圖片
  useEffect(() => {
    if (baseImageUrl && item.english) {
      const timer = setTimeout(() => {
        generateImageWithText(baseImageUrl);
      }, 1000); // 延遲 1 秒，避免頻繁生成

      return () => clearTimeout(timer);
    }
  }, [item.english]);

  // 當中文文字改變時，重新生成中文圖片
  useEffect(() => {
    if (baseChineseImageUrl && item.chinese) {
      const timer = setTimeout(() => {
        generateChineseImageWithText(baseChineseImageUrl);
      }, 1000); // 延遲 1 秒，避免頻繁生成

      return () => clearTimeout(timer);
    }
  }, [item.chinese]);

  return (
    <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white">
      {/* 序號 */}
      <div className="w-8 text-center text-sm text-gray-500 font-medium pt-2">
        {index + 1}.
      </div>

      {/* 英文輸入框（整合圖片功能） */}
      <div className="flex-1">
        <InputWithImage
          value={item.english}
          onChange={(value) => onChange({ ...item, english: value })}
          imageUrl={item.imageUrl}
          onImageIconClick={() => setShowImagePicker(true)}
          onThumbnailClick={() => setShowImageEditor(true)}
          placeholder="輸入英文單字..."
          disabled={isGenerating}
          imageSize={item.imageSize || 'medium'}
          onImageSizeChange={(size) => onChange({ ...item, imageSize: size })}
        />

        {/* 生成狀態提示 */}
        {isGenerating && (
          <div className="flex items-center space-x-2 text-sm text-blue-600 mt-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>正在生成圖片...</span>
          </div>
        )}
      </div>

      {/* 中文輸入框（獨立的圖片功能） */}
      <div className="flex-1">
        <InputWithImage
          value={item.chinese}
          onChange={(value) => onChange({ ...item, chinese: value })}
          imageUrl={item.chineseImageUrl}
          onImageIconClick={() => setShowChineseImagePicker(true)}
          onThumbnailClick={() => setShowChineseImageEditor(true)}
          placeholder="輸入中文翻譯..."
          disabled={isGeneratingChinese}
          imageSize={item.chineseImageSize || 'medium'}
          onImageSizeChange={(size) => onChange({ ...item, chineseImageSize: size })}
        />

        {/* 生成狀態提示 */}
        {isGeneratingChinese && (
          <div className="flex items-center space-x-2 text-sm text-blue-600 mt-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>正在生成中文圖片...</span>
          </div>
        )}
      </div>

      {/* 刪除按鈕 */}
      {totalItems > minItems && (
        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
          title="刪除此項目"
          aria-label="刪除此項目"
          disabled={isGenerating}
        >
          <span className="text-xl">🗑️</span>
        </button>
      )}

      {/* 英文圖片模態框 */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
          multiple={false}
        />
      )}

      {showImageEditor && item.imageUrl && (
        <ImageEditor
          imageUrl={baseImageUrl || item.imageUrl}
          onSave={handleImageEdit}
          onClose={() => setShowImageEditor(false)}
          onRemove={handleImageRemove}
        />
      )}

      {/* 中文圖片模態框 */}
      {showChineseImagePicker && (
        <ImagePicker
          onSelect={handleChineseImageSelect}
          onClose={() => setShowChineseImagePicker(false)}
          multiple={false}
        />
      )}

      {showChineseImageEditor && item.chineseImageUrl && (
        <ImageEditor
          imageUrl={baseChineseImageUrl || item.chineseImageUrl}
          onSave={handleChineseImageEdit}
          onClose={() => setShowChineseImageEditor(false)}
          onRemove={handleChineseImageRemove}
        />
      )}
    </div>
  );
}

