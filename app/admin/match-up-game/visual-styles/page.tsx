'use client';

import { useState, useEffect } from 'react';

/**
 * Match-up 遊戲視覺風格資源管理頁面
 * 允許管理員上傳和替換視覺風格的資源（背景圖片、卡片背景等）
 */
export default function MatchUpVisualStylesAdminPage() {
  const [selectedStyle, setSelectedStyle] = useState('clouds');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedResources, setUploadedResources] = useState<Record<string, { exists: boolean; url?: string }>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Match-up 遊戲的視覺風格列表
  const visualStyles = [
    { id: 'clouds', name: 'clouds', displayName: '☁️ 雲朵', description: '輕鬆愉快的雲朵主題' },
    { id: 'videogame', name: 'videogame', displayName: '🎮 電子遊戲', description: '復古像素風格' },
    { id: 'magiclibrary', name: 'magiclibrary', displayName: '📚 魔法圖書館', description: '神秘的魔法圖書館主題' },
    { id: 'underwater', name: 'underwater', displayName: '🐠 水下', description: '神秘的海底世界主題' },
    { id: 'pets', name: 'pets', displayName: '🐶 寵物', description: '可愛的寵物主題' },
    { id: 'space', name: 'space', displayName: '🚀 太空', description: '神秘的外太空主題' },
    { id: 'dinosaur', name: 'dinosaur', displayName: '🦕 恐龍', description: '史前恐龍主題' }
  ];

  // Match-up 遊戲的資源類型
  const resourceTypes = [
    { id: 'background', name: '背景圖片', accept: 'image/png,image/jpeg,image/webp', icon: '🖼️' },
    { id: 'card_background', name: '卡片背景', accept: 'image/png,image/jpeg,image/webp', icon: '🎴' },
    { id: 'card_border', name: '卡片邊框', accept: 'image/png,image/jpeg,image/webp', icon: '📦' }
  ];

  /**
   * 獲取已上傳的資源
   */
  const fetchUploadedResources = async () => {
    try {
      const response = await fetch(`/api/visual-styles/upload?styleId=${selectedStyle}&game=match-up-game`);
      if (response.ok) {
        const data = await response.json();
        setUploadedResources(data.resources || {});
      }
    } catch (error) {
      console.error('獲取資源列表失敗:', error);
    }
  };

  useEffect(() => {
    fetchUploadedResources();
  }, [selectedStyle]);

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
      formData.append('game', 'match-up-game');

      const response = await fetch('/api/visual-styles/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上傳失敗');
      }

      setMessage(`✅ ${resourceType} 上傳成功！`);
      await fetchUploadedResources();
      setRefreshKey(Date.now());
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('上傳錯誤:', error);
      setMessage(`❌ 上傳失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * 處理文件刪除
   */
  const handleFileDelete = async (resourceType: string) => {
    if (!confirm(`確定要刪除 ${resourceType} 資源嗎？`)) {
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const response = await fetch(
        `/api/visual-styles/upload?styleId=${selectedStyle}&resourceType=${resourceType}&game=match-up-game`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      setMessage(`✅ ${resourceType} 刪除成功！`);
      await fetchUploadedResources();
      setRefreshKey(Date.now());
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('刪除錯誤:', error);
      setMessage(`❌ 刪除失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (resourceType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(resourceType, file);
    }
  };

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
            🎨 Match-up 遊戲視覺風格資源管理
          </h1>
          <p className="text-gray-600">
            上傳和替換 Match-up 遊戲的視覺風格資源
          </p>
        </div>

        {/* 視覺風格選擇器 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">選擇視覺風格</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {visualStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{style.displayName.split(' ')[0]}</div>
                <div className="text-xs font-medium text-gray-900">{style.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 當前選擇的風格信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            當前選擇：{visualStyles.find(s => s.id === selectedStyle)?.displayName}
          </h2>
          <p className="text-gray-600">
            {visualStyles.find(s => s.id === selectedStyle)?.description}
          </p>
        </div>

        {/* 資源上傳區域 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">上傳資源</h2>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resourceTypes.map((resource) => {
              const uploaded = uploadedResources[resource.id];
              return (
                <div
                  key={resource.id}
                  className={`border-2 border-dashed rounded-lg p-6 hover:border-blue-400 transition-colors ${
                    uploaded?.exists ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(resource.id, e)}
                >
                  <label htmlFor={`upload-${selectedStyle}-${resource.id}`} className="cursor-pointer block">
                    <div className="text-center">
                      {uploaded?.exists && uploaded.url ? (
                        <div className="mb-2">
                          <img
                            key={`${resource.id}-${refreshKey}`}
                            src={uploaded.url}
                            alt={resource.name}
                            className="w-24 h-24 object-contain mx-auto rounded-lg border border-gray-200"
                            onError={(e) => {
                              console.error('圖片加載失敗:', uploaded.url);
                            }}
                          />
                          <div className="text-xs text-green-600 mt-1">✅ 已上傳</div>
                        </div>
                      ) : (
                        <div className="text-4xl mb-2">{resource.icon}</div>
                      )}
                      <div className="text-sm font-medium text-gray-900 mb-2">{resource.name}</div>
                      <div className="text-xs text-gray-500 mb-4">點擊上傳或拖放文件</div>
                      <div className="text-xs text-gray-400">支持 PNG, JPEG, WebP</div>
                    </div>
                  </label>
                  {uploaded?.exists && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileDelete(resource.id);
                      }}
                      disabled={uploading}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
                    >
                      ✕
                    </button>
                  )}
                  <input
                    id={`upload-${selectedStyle}-${resource.id}`}
                    type="file"
                    accept={resource.accept}
                    onChange={(e) => handleFileChange(resource.id, e)}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              );
            })}
          </div>

          {uploading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div className="mt-2 text-gray-600">上傳中...</div>
            </div>
          )}
        </div>

        {/* 返回按鈕 */}
        <div className="mt-6 text-center">
          <a
            href="/games/switcher?game=match-up-game"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← 返回遊戲
          </a>
        </div>
      </div>
    </div>
  );
}

