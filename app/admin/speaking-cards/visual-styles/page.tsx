'use client';

import { useState, useEffect } from 'react';

/**
 * Speaking Cards 遊戲視覺風格資源管理頁面
 * 允許管理員上傳和替換視覺風格的資源（背景圖片、卡片背景、卡片正面等）
 */
export default function SpeakingCardsVisualStylesAdminPage() {
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedResources, setUploadedResources] = useState<Record<string, { exists: boolean; url?: string }>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Speaking Cards 遊戲的視覺風格列表（與 SpeakingCardsStyleSelector 統一）
  const visualStyles = [
    { id: 'clouds', name: 'clouds', displayName: '☁️ 雲朵', description: '輕鬆愉快的雲朵主題，適合所有年齡層' },
    { id: 'videogame', name: 'videogame', displayName: '🎮 電子遊戲', description: '復古像素風格，適合遊戲愛好者' },
    { id: 'magiclibrary', name: 'magiclibrary', displayName: '📚 魔法圖書館', description: '神秘的魔法圖書館主題，充滿魔法氛圍' },
    { id: 'underwater', name: 'underwater', displayName: '🐠 水下', description: '神秘的海底世界主題' },
    { id: 'pets', name: 'pets', displayName: '🐶 寵物', description: '可愛的寵物主題，適合動物愛好者' },
    { id: 'space', name: 'space', displayName: '🚀 太空', description: '神秘的外太空主題' },
    { id: 'dinosaur', name: 'dinosaur', displayName: '🦕 恐龍', description: '史前恐龍主題，適合恐龍愛好者' },
  ];

  // Speaking Cards 遊戲的資源類型
  const resourceTypes = [
    { id: 'background', name: '遊戲背景', accept: 'image/png,image/jpeg,image/webp', icon: '🖼️', description: '遊戲場景的背景圖片' },
    { id: 'card_back', name: '卡片背面', accept: 'image/png,image/jpeg,image/webp', icon: '🎴', description: '未翻開時顯示的卡片背面' },
    { id: 'card_front', name: '卡片正面', accept: 'image/png,image/jpeg,image/webp', icon: '📄', description: '翻開後顯示的卡片正面背景' },
  ];

  /**
   * 獲取已上傳的資源
   */
  const fetchUploadedResources = async () => {
    try {
      const response = await fetch(`/api/visual-styles/upload?styleId=${selectedStyle}&game=speaking-cards`);
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
      formData.append('game', 'speaking-cards');

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
        `/api/visual-styles/upload?styleId=${selectedStyle}&resourceType=${resourceType}&game=speaking-cards`,
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎴 Speaking Cards 視覺風格資源管理
          </h1>
          <p className="text-gray-600">
            上傳和替換 Speaking Cards 遊戲的視覺風格資源
          </p>
        </div>

        {/* 視覺風格選擇器 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">選擇視覺風格</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {visualStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-3xl mb-1">{style.displayName.split(' ')[0]}</div>
                <div className="text-xs font-medium text-gray-900">{style.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 當前選擇的風格信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resourceTypes.map((resource) => {
              const uploaded = uploadedResources[resource.id];
              return (
                <div
                  key={resource.id}
                  className={`relative border-2 border-dashed rounded-xl p-6 hover:border-purple-400 transition-colors ${
                    uploaded?.exists ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(resource.id, e)}
                >
                  <label htmlFor={`upload-${selectedStyle}-${resource.id}`} className="cursor-pointer block">
                    <div className="text-center">
                      {uploaded?.exists && uploaded.url ? (
                        <div className="mb-3">
                          <img
                            key={`${resource.id}-${refreshKey}`}
                            src={uploaded.url}
                            alt={resource.name}
                            className="w-28 h-28 object-contain mx-auto rounded-lg border border-gray-200 shadow-sm"
                            onError={(e) => {
                              console.error('圖片加載失敗:', uploaded.url);
                            }}
                          />
                          <div className="text-xs text-green-600 mt-2 font-medium">✅ 已上傳</div>
                        </div>
                      ) : (
                        <div className="text-5xl mb-3">{resource.icon}</div>
                      )}
                      <div className="text-base font-semibold text-gray-900 mb-1">{resource.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{resource.description}</div>
                      <div className="text-xs text-gray-400">點擊上傳或拖放文件</div>
                      <div className="text-xs text-gray-300 mt-1">PNG, JPEG, WebP</div>
                    </div>
                  </label>
                  {uploaded?.exists && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileDelete(resource.id);
                      }}
                      disabled={uploading}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg text-sm"
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
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <div className="mt-2 text-gray-600">上傳中...</div>
            </div>
          )}
        </div>

        {/* 預覽區域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎮 預覽效果</h2>
          <p className="text-gray-600 mb-4">選擇風格後，在遊戲中使用以下 URL 預覽：</p>
          <div className="bg-gray-100 rounded-lg p-4">
            <code className="text-sm text-purple-700 break-all">
              /games/switcher?game=speaking-cards&style={selectedStyle}
            </code>
          </div>
          <a
            href={`/games/switcher?game=speaking-cards&style=${selectedStyle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🎮 開啟遊戲預覽
          </a>
        </div>

        {/* 返回按鈕 */}
        <div className="mt-6 flex gap-4 justify-center">
          <a
            href="/games/switcher?game=speaking-cards"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← 返回遊戲
          </a>
          <a
            href="/admin/match-up-game/visual-styles"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🎨 Match-up 視覺風格
          </a>
        </div>
      </div>
    </div>
  );
}

