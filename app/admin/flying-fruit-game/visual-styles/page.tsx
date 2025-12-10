'use client';

import { useState, useEffect } from 'react';

// Flying Fruit 遊戲專屬視覺風格
const FLYING_FRUIT_STYLES = [
  { id: 'jungle', name: 'jungle', displayName: '🌴 叢林', description: '熱帶叢林主題，充滿生機的綠色背景' },
  { id: 'clouds', name: 'clouds', displayName: '☁️ 雲朵', description: '輕鬆愉快的天空雲朵主題' },
  { id: 'space', name: 'space', displayName: '🚀 太空', description: '神秘的宇宙太空主題' },
  { id: 'underwater', name: 'underwater', displayName: '🐠 海底', description: '色彩繽紛的海底世界' },
  { id: 'celebration', name: 'celebration', displayName: '🎉 慶典', description: '歡樂熱鬧的慶典派對主題' },
  { id: 'farm', name: 'farm', displayName: '🚜 農場', description: '田園風光的農場主題' },
  { id: 'candy', name: 'candy', displayName: '🍬 糖果', description: '甜蜜夢幻的糖果世界' },
  { id: 'dinosaur', name: 'dinosaur', displayName: '🦕 恐龍', description: '史前時代的恐龍冒險' },
  { id: 'winter', name: 'winter', displayName: '❄️ 冬季', description: '銀白色的冬季雪景' },
  { id: 'rainbow', name: 'rainbow', displayName: '🌈 彩虹', description: '七彩繽紛的彩虹世界' },
];

export default function FlyingFruitVisualStylesAdminPage() {
  const [selectedStyle, setSelectedStyle] = useState('jungle');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedResources, setUploadedResources] = useState<Record<string, { exists: boolean; url?: string }>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Flying Fruit 遊戲的資源類型定義
  const resourceTypes = [
    { id: 'fruit_bg', name: '水果背景圖', accept: 'image/png,image/jpeg,image/webp', emoji: '🍎' },
    { id: 'decoration_1', name: '裝飾圖 1', accept: 'image/png,image/jpeg,image/webp', emoji: '🌿' },
    { id: 'decoration_2', name: '裝飾圖 2', accept: 'image/png,image/jpeg,image/webp', emoji: '🌴' },
    { id: 'bg_layer', name: '背景圖片', accept: 'image/png,image/jpeg,image/webp', emoji: '🖼️' },
  ];

  const audioTypes = [
    { id: 'background', name: '背景音樂', accept: 'audio/mpeg,audio/wav,audio/ogg', emoji: '🎵' },
    { id: 'correct', name: '正確音效', accept: 'audio/mpeg,audio/wav,audio/ogg', emoji: '✅' },
    { id: 'wrong', name: '錯誤音效', accept: 'audio/mpeg,audio/wav,audio/ogg', emoji: '❌' },
    { id: 'success', name: '成功音效', accept: 'audio/mpeg,audio/wav,audio/ogg', emoji: '🎉' },
  ];

  const fetchUploadedResources = async () => {
    try {
      const response = await fetch(`/api/visual-styles/upload?styleId=${selectedStyle}&game=flying-fruit-game`);
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

  const handleFileUpload = async (resourceType: string, file: File) => {
    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('styleId', selectedStyle);
      formData.append('resourceType', resourceType);
      formData.append('game', 'flying-fruit-game');

      const response = await fetch('/api/visual-styles/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('上傳失敗');
      setMessage(`✅ ${resourceType} 上傳成功！`);
      await fetchUploadedResources();
      setRefreshKey(Date.now());
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ 上傳失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (resourceType: string) => {
    if (!confirm(`確定要刪除 ${resourceType} 資源嗎？`)) return;
    setUploading(true);
    try {
      const response = await fetch(`/api/visual-styles/upload?styleId=${selectedStyle}&resourceType=${resourceType}&game=flying-fruit-game`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('刪除失敗');
      setMessage(`✅ ${resourceType} 刪除成功！`);
      await fetchUploadedResources();
      setRefreshKey(Date.now());
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ 刪除失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (resourceType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileUpload(resourceType, file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (resourceType: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileUpload(resourceType, file);
  };

  const currentStyle = FLYING_FRUIT_STYLES.find(s => s.id === selectedStyle);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 頁面標題 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍎 Flying Fruit 遊戲視覺風格管理
          </h1>
          <p className="text-gray-600">
            自訂 Flying Fruit 遊戲的視覺風格、背景和音效
          </p>
        </div>

        {/* 視覺風格選擇器 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎨 選擇視覺風格</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {FLYING_FRUIT_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  selectedStyle === style.id
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="text-3xl mb-1">{style.displayName.split(' ')[0]}</div>
                <div className="text-sm font-medium text-gray-900">{style.displayName.split(' ')[1]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 當前風格信息 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            當前選擇：{currentStyle?.displayName}
          </h2>
          <p className="text-gray-600">{currentStyle?.description}</p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* 圖片資源上傳 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📷 圖片資源</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {resourceTypes.map((resource) => {
              const uploaded = uploadedResources[resource.id];
              return (
                <div
                  key={resource.id}
                  className={`border-2 border-dashed rounded-xl p-6 hover:border-orange-400 transition-all ${
                    uploaded?.exists ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(resource.id, e)}
                >
                  <div className="relative">
                    <label htmlFor={`upload-${selectedStyle}-${resource.id}`} className="cursor-pointer block">
                      <div className="text-center">
                        {uploaded?.exists && uploaded.url ? (
                          <div className="mb-2">
                            <img
                              key={`${resource.id}-${refreshKey}`}
                              src={uploaded.url}
                              alt={resource.name}
                              className="w-20 h-20 object-contain mx-auto rounded-lg border border-gray-200"
                            />
                            <div className="text-xs text-green-600 mt-1">✅ 已上傳</div>
                          </div>
                        ) : (
                          <div className="text-4xl mb-2">{resource.emoji}</div>
                        )}
                        <div className="text-sm font-medium text-gray-900 mb-1">{resource.name}</div>
                        <div className="text-xs text-gray-500">點擊上傳或拖放</div>
                      </div>
                    </label>
                    {uploaded?.exists && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFileDelete(resource.id); }}
                        disabled={uploading}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
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
        </div>

        {/* 音效資源上傳 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔊 音效資源</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {audioTypes.map((resource) => {
              const uploaded = uploadedResources[resource.id];
              return (
                <div
                  key={resource.id}
                  className={`border-2 border-dashed rounded-xl p-6 hover:border-orange-400 transition-all ${
                    uploaded?.exists ? 'border-green-300 bg-green-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(resource.id, e)}
                >
                  <div className="relative">
                    <label htmlFor={`upload-audio-${selectedStyle}-${resource.id}`} className="cursor-pointer block">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{resource.emoji}</div>
                        {uploaded?.exists && uploaded.url && (
                          <div className="mb-2">
                            <audio controls className="w-full max-w-[150px] mx-auto" src={uploaded.url} />
                            <div className="text-xs text-green-600 mt-1">✅ 已上傳</div>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900 mb-1">{resource.name}</div>
                        <div className="text-xs text-gray-500">點擊上傳或拖放</div>
                      </div>
                    </label>
                    {uploaded?.exists && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFileDelete(resource.id); }}
                        disabled={uploading}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <input
                    id={`upload-audio-${selectedStyle}-${resource.id}`}
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
        </div>

        {/* 上傳中提示 */}
        {uploading && (
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <div className="mt-2 text-gray-600">上傳中...</div>
          </div>
        )}

        {/* 資源規格說明 */}
        <div className="bg-orange-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 資源規格說明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>🍎 水果背景圖：</strong>建議尺寸 100x60 像素，PNG 格式，透明背景
            </div>
            <div>
              <strong>🌿 裝飾圖：</strong>建議尺寸 80x80 像素，PNG 格式，透明背景
            </div>
            <div>
              <strong>🖼️ 背景圖片：</strong>建議尺寸 1920x1080 像素，PNG/JPEG 格式
            </div>
            <div>
              <strong>🎵 音效：</strong>MP3 格式，背景音樂 1-3 分鐘，音效 0.5-2 秒
            </div>
          </div>
        </div>

        {/* 返回按鈕 */}
        <div className="text-center">
          <a
            href="/games/switcher?game=flying-fruit-game&activityId=cmix0jze10001jx04qtqutna6"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-md"
          >
            🎮 返回遊戲
          </a>
        </div>
      </div>
    </div>
  );
}

