'use client';

import { useState } from 'react';
import { VISUAL_STYLES } from '@/types/visual-style';

/**
 * 視覺風格資源管理頁面
 * 允許管理員上傳和替換視覺風格的資源（圖片和音效）
 */
export default function VisualStylesAdminPage() {
  const [selectedStyle, setSelectedStyle] = useState('clouds');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // 資源類型定義
  const resourceTypes = [
    { id: 'spaceship', name: '太空船圖片', accept: 'image/png,image/jpeg,image/webp' },
    { id: 'cloud1', name: '雲朵圖片 1', accept: 'image/png,image/jpeg,image/webp' },
    { id: 'cloud2', name: '雲朵圖片 2', accept: 'image/png,image/jpeg,image/webp' },
    { id: 'background', name: '背景音樂', accept: 'audio/mpeg,audio/wav,audio/ogg' },
    { id: 'hit', name: '碰撞音效', accept: 'audio/mpeg,audio/wav,audio/ogg' },
    { id: 'success', name: '成功音效', accept: 'audio/mpeg,audio/wav,audio/ogg' },
  ];

  /**
   * 處理文件上傳
   */
  const handleFileUpload = async (resourceType: string, file: File) => {
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('styleId', selectedStyle);
      formData.append('resourceType', resourceType);

      const response = await fetch('/api/visual-styles/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上傳失敗');
      }

      const data = await response.json();
      setMessage(`✅ ${resourceType} 上傳成功！`);
      
      // 3 秒後清除消息
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('上傳錯誤:', error);
      setMessage(`❌ 上傳失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * 處理文件選擇
   */
  const handleFileChange = (resourceType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(resourceType, file);
    }
  };

  /**
   * 處理拖放上傳
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (resourceType: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(resourceType, file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 視覺風格資源管理
          </h1>
          <p className="text-gray-600">
            上傳和替換視覺風格的圖片和音效資源
          </p>
        </div>

        {/* 視覺風格選擇器 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            選擇視覺風格
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {VISUAL_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{style.displayName.split(' ')[0]}</div>
                <div className="text-sm font-medium text-gray-900">
                  {style.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 當前選擇的風格信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            當前選擇：{VISUAL_STYLES.find(s => s.id === selectedStyle)?.displayName}
          </h2>
          <p className="text-gray-600">
            {VISUAL_STYLES.find(s => s.id === selectedStyle)?.description}
          </p>
        </div>

        {/* 資源上傳區域 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            上傳資源
          </h2>

          {/* 消息提示 */}
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* 圖片資源 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📷 圖片資源
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resourceTypes.filter(r => r.id.includes('spaceship') || r.id.includes('cloud')).map((resource) => (
                <div
                  key={resource.id}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(resource.id, e)}
                >
                  <label htmlFor={`upload-${selectedStyle}-${resource.id}`} className="cursor-pointer block">
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {resource.id === 'spaceship' ? '🚀' : '☁️'}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        {resource.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        點擊上傳或拖放文件
                      </div>
                      <div className="text-xs text-gray-400">
                        支持 PNG, JPEG, WebP
                      </div>
                    </div>
                  </label>
                  <input
                    id={`upload-${selectedStyle}-${resource.id}`}
                    type="file"
                    accept={resource.accept}
                    onChange={(e) => handleFileChange(resource.id, e)}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 音效資源 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔊 音效資源
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resourceTypes.filter(r => !r.id.includes('spaceship') && !r.id.includes('cloud')).map((resource) => (
                <div
                  key={resource.id}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(resource.id, e)}
                >
                  <label htmlFor={`upload-${selectedStyle}-${resource.id}`} className="cursor-pointer block">
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {resource.id === 'background' ? '🎵' : resource.id === 'hit' ? '💥' : '🎉'}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        {resource.name}
                      </div>
                      <div className="text-xs text-gray-500 mb-4">
                        點擊上傳或拖放文件
                      </div>
                      <div className="text-xs text-gray-400">
                        支持 MP3, WAV, OGG
                      </div>
                    </div>
                  </label>
                  <input
                    id={`upload-${selectedStyle}-${resource.id}`}
                    type="file"
                    accept={resource.accept}
                    onChange={(e) => handleFileChange(resource.id, e)}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 上傳中提示 */}
          {uploading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div className="mt-2 text-gray-600">上傳中...</div>
            </div>
          )}
        </div>

        {/* 資源規格說明 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 資源規格說明
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div><strong>太空船圖片：</strong>建議尺寸 100x100 像素，PNG 格式，透明背景</div>
            <div><strong>雲朵圖片：</strong>建議尺寸 150x100 像素，PNG 格式，透明背景</div>
            <div><strong>背景音樂：</strong>MP3 格式，建議時長 1-3 分鐘，循環播放</div>
            <div><strong>碰撞音效：</strong>MP3 格式，建議時長 0.5-1 秒</div>
            <div><strong>成功音效：</strong>MP3 格式，建議時長 1-2 秒</div>
          </div>
        </div>

        {/* 返回按鈕 */}
        <div className="mt-6 text-center">
          <a
            href="/games/switcher?activityId=cmh29gjhe0001lb0448h2qt0j&customVocabulary=true"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← 返回遊戲
          </a>
        </div>
      </div>
    </div>
  );
}

