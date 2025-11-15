'use client';

import React, { useState, useEffect } from 'react';
import ImagePicker from '@/components/image-picker';
import ImageEditor from '@/components/image-editor';
import AddSoundDialog from '@/components/tts/AddSoundDialog';
import AudioPreviewDialog from '@/components/tts/AudioPreviewDialog';
import InputWithImage from '@/components/input-with-image';

// Speaking Card 數據接口
export interface SpeakingCardData {
  id: string;
  text?: string;
  imageUrl?: string;
  imageId?: string;
  audioUrl?: string;
  imageSize?: 'small' | 'medium' | 'large';
}

interface SpeakingCardItemProps {
  card: SpeakingCardData;
  index: number;
  onChange: (card: SpeakingCardData) => void;
  onRemove: () => void;
  minItems: number;
  totalItems: number;
}

/**
 * SpeakingCardItem - Speaking Cards 遊戲的單邊輸入框組件
 *
 * 特點：
 * - 單邊輸入框（只有一個輸入欄位）
 * - 整合圖片功能（選擇、編輯、預覽）
 * - 整合語音功能（錄音、上傳、預覽）
 * - 支援文字輸入
 * - Wordwall 風格設計
 */
export default function SpeakingCardItem({
  card,
  index,
  onChange,
  onRemove,
  minItems,
  totalItems,
}: SpeakingCardItemProps) {
  // 圖片狀態
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);

  // 語音狀態
  const [showAddSoundDialog, setShowAddSoundDialog] = useState(false);
  const [showAudioPreview, setShowAudioPreview] = useState(false);

  // 處理圖片選擇
  const handleImageSelect = async (imageUrl: string, imageId?: string) => {
    setShowImagePicker(false);
    setBaseImageUrl(imageUrl);

    // 直接使用選擇的圖片，不疊加文字
    onChange({
      ...card,
      imageUrl,
      imageId,
    });
  };

  // 處理圖片編輯
  const handleImageEdit = async (editedBlob: Blob, editedUrl: string) => {
    setShowImageEditor(false);
    setIsGenerating(true);

    try {
      // 立即更新預覽
      onChange({
        ...card,
        imageUrl: editedUrl,
      });

      // 上傳圖片到 Vercel Blob
      const formData = new FormData();
      formData.append('file', editedBlob, `speaking-card-${card.id}-${Date.now()}.png`);

      const uploadEndpoint = '/api/images/upload-test';
      console.log(`📤 上傳編輯後的圖片到: ${uploadEndpoint}`);

      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json() as any;
        const imageData = uploadData.image || uploadData;

        console.log(`✅ 圖片上傳成功: ${imageData.url}`);

        // 更新為永久 URL
        onChange({
          ...card,
          imageUrl: imageData.url,
          imageId: imageData.id,
        });

        // 釋放預覽 URL
        URL.revokeObjectURL(editedUrl);
      } else {
        console.error('❌ 圖片上傳失敗');
        alert('圖片上傳失敗，請稍後再試');
      }
    } catch (error) {
      console.error('❌ 圖片處理失敗:', error);
      alert('圖片處理失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  // 處理圖片移除
  const handleImageRemove = () => {
    onChange({
      ...card,
      imageUrl: undefined,
      imageId: undefined,
    });
    setShowImageEditor(false);
  };

  // 處理語音生成
  const handleSoundGenerated = (audioUrl: string) => {
    onChange({
      ...card,
      audioUrl,
    });
    setShowAddSoundDialog(false);
  };

  // 處理語音移除
  const handleAudioRemove = () => {
    onChange({
      ...card,
      audioUrl: undefined,
    });
    setShowAudioPreview(false);
  };

  return (
    <div className="flex flex-col p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white">
      {/* 單邊輸入框（整合圖片和語音功能） */}
      <div className="w-full">
        <InputWithImage
          value={card.text || ''}
          onChange={(value) => onChange({ ...card, text: value })}
          imageUrl={card.imageUrl}
          onImageIconClick={() => setShowImagePicker(true)}
          onThumbnailClick={() => setShowImageEditor(true)}
          onAddSoundClick={() => setShowAddSoundDialog(true)}
          hasAudio={!!card.audioUrl}
          audioUrl={card.audioUrl}
          onAudioThumbnailClick={() => setShowAudioPreview(true)}
          placeholder="輸入文字..."
          disabled={isGenerating}
        />

        {/* 生成狀態提示 */}
        {isGenerating && (
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-600 mt-2">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
            <span>正在處理圖片...</span>
          </div>
        )}

        {/* 內容提示 */}
        {!card.text && !card.imageUrl && !card.audioUrl && (
          <div className="mt-2 text-xs text-gray-400">
            💡 提示：可以添加文字、圖片或語音（或組合）
          </div>
        )}
      </div>

      {/* 圖片選擇器 */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
          multiple={false}
          initialSearchQuery={card.text}
        />
      )}

      {/* 圖片編輯器 */}
      {showImageEditor && card.imageUrl && (
        <ImageEditor
          imageUrl={baseImageUrl || card.imageUrl}
          onSave={handleImageEdit}
          onClose={() => setShowImageEditor(false)}
          onRemove={handleImageRemove}
          imageSize={card.imageSize || 'medium'}
          onImageSizeChange={(size) => onChange({ ...card, imageSize: size })}
          enableTextOverlay={false} // Speaking Cards 不需要文字疊加
          onTextOverlayChange={() => {}}
          textToOverlay=""
        />
      )}

      {/* 語音添加對話框 */}
      {showAddSoundDialog && (
        <AddSoundDialog
          isOpen={showAddSoundDialog}
          onClose={() => setShowAddSoundDialog(false)}
          text={card.text || ''}
          onSoundGenerated={handleSoundGenerated}
        />
      )}

      {/* 語音預覽 */}
      {showAudioPreview && card.audioUrl && (
        <AudioPreviewDialog
          isOpen={showAudioPreview}
          onClose={() => setShowAudioPreview(false)}
          audioUrl={card.audioUrl}
          text={card.text}
          onRemove={handleAudioRemove}
        />
      )}
    </div>
  );
}

