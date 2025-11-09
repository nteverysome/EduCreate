'use client';

import React, { useState, useEffect } from 'react';
import InputWithImage from '../input-with-image';
import ImagePicker, { UserImage } from '../image-picker';
import ImageEditor from '../image-editor';
import AddSoundDialog from '../tts/AddSoundDialog';
import AudioPreviewDialog from '../tts/AudioPreviewDialog';
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
  audioUrl?: string;          // 語音 URL
  chineseAudioUrl?: string;   // 中文語音 URL
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
  const [enableEnglishTextOverlay, setEnableEnglishTextOverlay] = useState(false);

  // 中文圖片狀態
  const [showChineseImagePicker, setShowChineseImagePicker] = useState(false);
  const [showChineseImageEditor, setShowChineseImageEditor] = useState(false);
  const [isGeneratingChinese, setIsGeneratingChinese] = useState(false);
  const [baseChineseImageUrl, setBaseChineseImageUrl] = useState<string | null>(null);
  const [enableChineseTextOverlay, setEnableChineseTextOverlay] = useState(false);

  // 語音狀態（僅英文）
  const [showAddSoundDialog, setShowAddSoundDialog] = useState(false);
  const [showAudioPreview, setShowAudioPreview] = useState(false);

  // 處理語音生成（僅英文）
  const handleSoundGenerated = (audioUrl: string) => {
    onChange({ ...item, audioUrl });
    setShowAddSoundDialog(false);
  };

  // 處理語音移除（僅英文）
  const handleRemoveAudio = () => {
    onChange({ ...item, audioUrl: undefined });
    setShowAudioPreview(false);
  };

  // 處理圖片選擇
  const handleImageSelect = async (images: UserImage[]) => {
    console.log('🔍 [VocabularyItemWithImage] handleImageSelect 開始:', images);

    if (images.length > 0) {
      const selectedImage = images[0];
      console.log('🔍 [VocabularyItemWithImage] 選擇的圖片:', selectedImage);

      setBaseImageUrl(selectedImage.url);

      const updatedItem = {
        ...item,
        imageId: selectedImage.id,
        imageUrl: selectedImage.url,
      };

      console.log('🔍 [VocabularyItemWithImage] 準備調用 onChange，updatedItem:', updatedItem);

      onChange(updatedItem);

      console.log('✅ [VocabularyItemWithImage] onChange 調用完成');

      setShowImagePicker(false);

      // 🔥 移除自動生成文字功能 - 用戶不需要圖片上的文字
      // if (item.english || item.chinese) {
      //   await generateImageWithText(selectedImage.url);
      // }
    }
  };

  // 處理圖片編輯
  const handleImageEdit = async (editedBlob: Blob, editedUrl: string) => {
    setShowImageEditor(false);

    // 🎯 根據勾選框決定是否疊加文字
    if (enableEnglishTextOverlay && item.english) {
      // 只疊加英文文字
      setBaseImageUrl(editedUrl);
      await generateImageWithText(editedUrl);
    } else {
      // 🎯 不疊加文字，直接上傳編輯後的圖片
      setIsGenerating(true);
      try {
        // 立即更新預覽
        onChange({
          ...item,
          imageUrl: editedUrl,
        });

        // 上傳圖片到 Vercel Blob
        const formData = new FormData();
        formData.append('file', editedBlob, `vocabulary-${item.id}-${Date.now()}.png`);

        const uploadEndpoint = '/api/images/upload-test';
        console.log(`📤 上傳編輯後的圖片到: ${uploadEndpoint}`);

        const uploadResponse = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          const imageData = uploadData.image || uploadData;

          // 更新為雲端 URL
          onChange({
            ...item,
            imageUrl: imageData.url,
            imageId: imageData.id,
          });

          // 🎯 清除 baseImageUrl，使用雲端 URL
          setBaseImageUrl(null);

          // 釋放預覽 URL
          URL.revokeObjectURL(editedUrl);

          console.log('✅ 編輯後的圖片上傳成功:', imageData);
        } else {
          console.error('圖片上傳失敗:', uploadResponse.status, uploadResponse.statusText);
          const errorData = await uploadResponse.json().catch(() => ({}));
          console.error('錯誤詳情:', errorData);
          alert(`圖片上傳失敗: ${errorData.error || '未知錯誤'}`);
        }
      } catch (error) {
        console.error('上傳圖片失敗:', error);
      } finally {
        setIsGenerating(false);
      }
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

      // 🔥 移除自動生成文字功能 - 用戶不需要圖片上的文字
      // if (item.chinese) {
      //   await generateChineseImageWithText(selectedImage.url);
      // }
    }
  };

  // 處理中文圖片編輯
  const handleChineseImageEdit = async (editedBlob: Blob, editedUrl: string) => {
    setShowChineseImageEditor(false);

    // 🎯 根據勾選框決定是否疊加文字
    if (enableChineseTextOverlay && item.chinese) {
      // 只疊加中文文字
      setBaseChineseImageUrl(editedUrl);
      await generateChineseImageWithText(editedUrl);
    } else {
      // 🎯 不疊加文字，直接上傳編輯後的圖片
      setIsGeneratingChinese(true);
      try {
        // 立即更新預覽
        onChange({
          ...item,
          chineseImageUrl: editedUrl,
        });

        // 上傳圖片到 Vercel Blob
        const formData = new FormData();
        formData.append('file', editedBlob, `vocabulary-chinese-${item.id}-${Date.now()}.png`);

        const uploadEndpoint = '/api/images/upload-test';
        console.log(`📤 上傳編輯後的中文圖片到: ${uploadEndpoint}`);

        const uploadResponse = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          const imageData = uploadData.image || uploadData;

          // 更新為雲端 URL
          onChange({
            ...item,
            chineseImageUrl: imageData.url,
            chineseImageId: imageData.id,
          });

          // 🎯 清除 baseChineseImageUrl，使用雲端 URL
          setBaseChineseImageUrl(null);

          // 釋放預覽 URL
          URL.revokeObjectURL(editedUrl);

          console.log('✅ 編輯後的中文圖片上傳成功:', imageData);
        } else {
          console.error('中文圖片上傳失敗:', uploadResponse.status, uploadResponse.statusText);
          const errorData = await uploadResponse.json().catch(() => ({}));
          console.error('錯誤詳情:', errorData);
          alert(`中文圖片上傳失敗: ${errorData.error || '未知錯誤'}`);
        }
      } catch (error) {
        console.error('上傳中文圖片失敗:', error);
      } finally {
        setIsGeneratingChinese(false);
      }
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

  // 🎯 生成只帶英文文字的圖片（用於英文輸入框的圖片）
  // 🔥 [v73.0] 改進錯誤處理和日誌記錄
  const generateImageWithText = async (imageUrl: string) => {
    if (!item.english) return;

    setIsGenerating(true);
    try {
      console.log(`📝 [v73.0] 開始生成帶英文文字的圖片: ${item.english}`);

      // 🎯 只使用英文文字
      const text = item.english;

      // 文字疊加選項
      const options: TextOverlayOptions = {
        text,
        position: { x: 50, y: 50 }, // 中心位置
        fontSize: 'medium',
        textColor: 'white',
        showBackground: true,
      };

      // 生成圖片 Blob
      console.log(`🎨 [v73.0] 調用 overlayTextOnImage...`);
      const generatedImageBlob = await overlayTextOnImage(imageUrl, options);
      console.log(`✅ [v73.0] 圖片生成成功，大小: ${generatedImageBlob.size} bytes`);

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
        const uploadData = await uploadResponse.json() as any;

        // 檢查響應結構
        const imageData = uploadData.image || uploadData;

        console.log(`✅ [v73.0] 英文圖片上傳成功: ${imageData.url}`);

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
        console.error(`❌ [v73.0] 圖片上傳失敗:`, uploadResponse.status, uploadResponse.statusText);
        const errorData = await uploadResponse.json().catch(() => ({})) as any;
        console.error(`❌ [v73.0] 錯誤詳情:`, errorData);

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
  // 🔥 [v73.0] 改進錯誤處理和日誌記錄
  const generateChineseImageWithText = async (imageUrl: string) => {
    if (!item.chinese) return;

    setIsGeneratingChinese(true);
    try {
      console.log(`📝 [v73.0] 開始生成帶中文文字的圖片: ${item.chinese}`);

      // 文字疊加選項
      const options: TextOverlayOptions = {
        text: item.chinese,
        position: { x: 50, y: 50 }, // 中心位置
        fontSize: 'medium',
        textColor: 'white',
        showBackground: true,
      };

      // 生成圖片 Blob
      console.log(`🎨 [v73.0] 調用 overlayTextOnImage...`);
      const generatedImageBlob = await overlayTextOnImage(imageUrl, options);
      console.log(`✅ [v73.0] 圖片生成成功，大小: ${generatedImageBlob.size} bytes`);

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
      console.log(`📤 [v73.0] 上傳中文圖片到: ${uploadEndpoint}`);

      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json() as any;
        const imageData = uploadData.image || uploadData;

        console.log(`✅ [v73.0] 中文圖片上傳成功: ${imageData.url}`);

        // 更新為永久 URL
        onChange({
          ...item,
          chineseImageUrl: imageData.url,
          chineseImageId: imageData.id,
        });

        // 釋放預覽 URL
        URL.revokeObjectURL(previewUrl);
      } else {
        console.error(`❌ [v73.0] 中文圖片上傳失敗:`, uploadResponse.status, uploadResponse.statusText);
        const errorData = await uploadResponse.json().catch(() => ({})) as any;
        console.error(`❌ [v73.0] 錯誤詳情:`, errorData);
        alert(`中文圖片上傳失敗: ${errorData.error || '未知錯誤'}`);
      }
    } catch (error) {
      console.error(`❌ [v73.0] 生成中文圖片失敗:`, error);
      // 🔥 [v73.0] 提供更詳細的錯誤提示
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      alert(`生成中文圖片失敗: ${errorMessage}`);
    } finally {
      setIsGeneratingChinese(false);
    }
  };

  // 當英文文字改變時，重新生成英文圖片（只在勾選文字疊加時）
  useEffect(() => {
    if (baseImageUrl && item.english && enableEnglishTextOverlay) {
      const timer = setTimeout(() => {
        generateImageWithText(baseImageUrl);
      }, 1000); // 延遲 1 秒，避免頻繁生成

      return () => clearTimeout(timer);
    }
  }, [item.english, enableEnglishTextOverlay]);

  // 當中文文字改變時，重新生成中文圖片（只在勾選文字疊加時）
  useEffect(() => {
    if (baseChineseImageUrl && item.chinese && enableChineseTextOverlay) {
      const timer = setTimeout(() => {
        generateChineseImageWithText(baseChineseImageUrl);
      }, 1000); // 延遲 1 秒，避免頻繁生成

      return () => clearTimeout(timer);
    }
  }, [item.chinese, enableChineseTextOverlay]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white">
      {/* 序號 - 手機版在頂部，桌面版在左側 */}
      <div className="sm:w-8 text-left sm:text-center text-sm text-gray-500 font-medium sm:pt-2">
        {index + 1}.
      </div>

      {/* 輸入框容器 - 手機版垂直堆疊，桌面版水平排列 */}
      <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* 英文輸入框（整合圖片和語音功能） */}
        <div className="flex-1 min-w-0">
          <InputWithImage
            value={item.english}
            onChange={(value) => onChange({ ...item, english: value })}
            imageUrl={item.imageUrl}
            onImageIconClick={() => setShowImagePicker(true)}
            onThumbnailClick={() => setShowImageEditor(true)}
            onAddSoundClick={() => setShowAddSoundDialog(true)}
            hasAudio={!!item.audioUrl}
            audioUrl={item.audioUrl}
            onAudioThumbnailClick={() => setShowAudioPreview(true)}
            placeholder="輸入關鍵字..."
            disabled={isGenerating}
          />

          {/* 生成狀態提示 */}
          {isGenerating && (
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-600 mt-2">
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
              <span>正在生成圖片...</span>
            </div>
          )}
        </div>

        {/* 中文輸入框（獨立的圖片功能，不顯示語音功能） */}
        <div className="flex-1 min-w-0">
          <InputWithImage
            value={item.chinese}
            onChange={(value) => onChange({ ...item, chinese: value })}
            imageUrl={item.chineseImageUrl}
            onImageIconClick={() => setShowChineseImagePicker(true)}
            onThumbnailClick={() => setShowChineseImageEditor(true)}
            placeholder="輸入匹配物件..."
            disabled={isGeneratingChinese}
          />

          {/* 生成狀態提示 */}
          {isGeneratingChinese && (
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-600 mt-2">
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
              <span>正在生成中文圖片...</span>
            </div>
          )}
        </div>
      </div>

      {/* 英文圖片模態框 */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
          multiple={false}
          initialSearchQuery={item.english}
        />
      )}

      {showImageEditor && item.imageUrl && (
        <ImageEditor
          imageUrl={baseImageUrl || item.imageUrl}
          onSave={handleImageEdit}
          onClose={() => setShowImageEditor(false)}
          onRemove={handleImageRemove}
          imageSize={item.imageSize || 'medium'}
          onImageSizeChange={(size) => onChange({ ...item, imageSize: size })}
          enableTextOverlay={enableEnglishTextOverlay}
          onEnableTextOverlayChange={setEnableEnglishTextOverlay}
        />
      )}

      {/* 中文圖片模態框 */}
      {showChineseImagePicker && (
        <ImagePicker
          onSelect={handleChineseImageSelect}
          onClose={() => setShowChineseImagePicker(false)}
          multiple={false}
          initialSearchQuery={item.chinese}
        />
      )}

      {showChineseImageEditor && item.chineseImageUrl && (
        <ImageEditor
          imageUrl={baseChineseImageUrl || item.chineseImageUrl}
          onSave={handleChineseImageEdit}
          onClose={() => setShowChineseImageEditor(false)}
          onRemove={handleChineseImageRemove}
          imageSize={item.chineseImageSize || 'medium'}
          onImageSizeChange={(size) => onChange({ ...item, chineseImageSize: size })}
          enableTextOverlay={enableChineseTextOverlay}
          onEnableTextOverlayChange={setEnableChineseTextOverlay}
        />
      )}

      {/* 英文語音對話框 */}
      {showAddSoundDialog && (
        <AddSoundDialog
          isOpen={showAddSoundDialog}
          onClose={() => setShowAddSoundDialog(false)}
          text={item.english}
          onSoundGenerated={handleSoundGenerated}
        />
      )}

      {/* 英文語音預覽對話框 */}
      {showAudioPreview && item.audioUrl && (
        <AudioPreviewDialog
          isOpen={showAudioPreview}
          onClose={() => setShowAudioPreview(false)}
          audioUrl={item.audioUrl}
          text={item.english}
          onRemove={handleRemoveAudio}
        />
      )}
    </div>
  );
}

