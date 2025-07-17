/**
 * 完整縮圖和預覽系統面板組件
 * 400px標準縮圖、多尺寸支持、CDN集成、懶加載、批量管理等完整功能
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ThumbnailPreviewPanelProps {
  userId: string;
  enableMultiSize?: boolean;
  enableCDN?: boolean;
  enableLazyLoading?: boolean;
  enableBatchProcessing?: boolean;
  enableCustomThumbnails?: boolean;
  enableGeptIntegration?: boolean;
  enableMemoryScience?: boolean;
}

interface ThumbnailSize {
  name: string;
  width: number;
  height: number;
  description: string;
  usage: string;
}

interface ImageFile {
  id: string;
  name: string;
  originalUrl: string;
  thumbnails: Record<string, string>;
  size: number;
  format: string;
  uploadedAt: Date;
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  memoryScience: string[];
  status: 'processing' | 'ready' | 'error';
}

interface ThumbnailSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'webp' | 'jpeg' | 'png' | 'avif';
  enableCDN: boolean;
  enableLazyLoading: boolean;
  compressionLevel: number;
}

export const ThumbnailPreviewPanel: React.FC<ThumbnailPreviewPanelProps> = ({
  userId,
  enableMultiSize = true,
  enableCDN = true,
  enableLazyLoading = true,
  enableBatchProcessing = true,
  enableCustomThumbnails = true,
  enableGeptIntegration = true,
  enableMemoryScience = true
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'settings'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<ThumbnailSettings>({
    quality: 'high',
    format: 'webp',
    enableCDN: true,
    enableLazyLoading: true,
    compressionLevel: 80
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 支持的縮圖尺寸
  const thumbnailSizes: ThumbnailSize[] = [
    { name: '100px', width: 100, height: 100, description: '移動端', usage: '列表縮圖' },
    { name: '200px', width: 200, height: 200, description: '列表視圖', usage: '卡片預覽' },
    { name: '400px', width: 400, height: 400, description: '標準尺寸', usage: 'Wordwall標準' },
    { name: '800px', width: 800, height: 800, description: '高清顯示', usage: '詳細預覽' }
  ];

  // 模擬圖像文件數據
  const [imageFiles] = useState<ImageFile[]>([
    {
      id: 'img-1',
      name: '英語基礎詞彙卡片.jpg',
      originalUrl: '/api/placeholder/800/600',
      thumbnails: {
        '100px': '/api/placeholder/100/100',
        '200px': '/api/placeholder/200/200',
        '400px': '/api/placeholder/400/400',
        '800px': '/api/placeholder/800/800'
      },
      size: 245760, // 240KB
      format: 'JPEG',
      uploadedAt: new Date('2025-07-16'),
      geptLevel: 'elementary',
      memoryScience: ['視覺記憶', '聯想記憶'],
      status: 'ready'
    },
    {
      id: 'img-2',
      name: '中級閱讀理解圖表.png',
      originalUrl: '/api/placeholder/800/600',
      thumbnails: {
        '100px': '/api/placeholder/100/100',
        '200px': '/api/placeholder/200/200',
        '400px': '/api/placeholder/400/400',
        '800px': '/api/placeholder/800/800'
      },
      size: 512000, // 500KB
      format: 'PNG',
      uploadedAt: new Date('2025-07-15'),
      geptLevel: 'intermediate',
      memoryScience: ['圖表記憶', '邏輯記憶'],
      status: 'ready'
    },
    {
      id: 'img-3',
      name: '高級寫作範例.jpg',
      originalUrl: '/api/placeholder/800/600',
      thumbnails: {
        '100px': '/api/placeholder/100/100',
        '200px': '/api/placeholder/200/200',
        '400px': '/api/placeholder/400/400',
        '800px': '/api/placeholder/800/800'
      },
      size: 1048576, // 1MB
      format: 'JPEG',
      uploadedAt: new Date('2025-07-14'),
      geptLevel: 'high-intermediate',
      memoryScience: ['文字記憶', '結構記憶'],
      status: 'processing'
    }
  ]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      // 模擬文件上傳和縮圖生成
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`處理文件: ${file.name}`);
        
        // 模擬處理時間
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      alert(`成功上傳 ${files.length} 個文件並生成縮圖`);
    } catch (error) {
      alert('上傳失敗：' + (error as Error).message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const handleBatchRegenerate = async () => {
    if (selectedFiles.length === 0) {
      alert('請選擇要重新生成縮圖的文件');
      return;
    }

    setIsProcessing(true);
    try {
      // 模擬批量重新生成
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`成功重新生成 ${selectedFiles.length} 個文件的縮圖`);
      setSelectedFiles([]);
    } catch (error) {
      alert('批量處理失敗：' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    setSelectedFiles(imageFiles.map(f => f.id));
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  const getGeptLevelColor = (level: string) => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'high-intermediate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGeptLevelName = (level: string) => {
    switch (level) {
      case 'elementary': return '初級';
      case 'intermediate': return '中級';
      case 'high-intermediate': return '中高級';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'ready': return '就緒';
      case 'processing': return '處理中';
      case 'error': return '錯誤';
      default: return '未知';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6" data-testid="thumbnail-preview-panel">
      {/* 標籤切換 */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="upload-tab"
        >
          📤 上傳圖像
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'manage'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="manage-tab"
        >
          🖼️ 縮圖管理
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          data-testid="settings-tab"
        >
          ⚙️ 系統設置
        </button>
      </div>

      {/* 上傳圖像標籤 */}
      {activeTab === 'upload' && (
        <div data-testid="upload-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">上傳圖像</h3>
          
          {/* 支持的尺寸說明 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">支持的縮圖尺寸：</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {thumbnailSizes.map(size => (
                <div key={size.name} className="bg-white rounded p-2 text-center">
                  <div className="font-medium text-blue-800">{size.name}</div>
                  <div className="text-xs text-blue-600">{size.description}</div>
                  <div className="text-xs text-gray-500">{size.usage}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 文件上傳區域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple={enableBatchProcessing}
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              data-testid="file-input"
            />
            <div className="text-4xl mb-4">🖼️</div>
            <p className="text-gray-600 mb-4">
              {enableBatchProcessing ? '拖拽圖像到此處或點擊選擇多個文件' : '拖拽圖像到此處或點擊選擇文件'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
              data-testid="select-files-button"
            >
              {isProcessing ? '處理中...' : '選擇圖像'}
            </button>
          </div>

          {/* 上傳設置 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">上傳設置</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">圖像質量：</label>
                <select
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  data-testid="quality-select"
                >
                  <option value="low">低質量 (快速)</option>
                  <option value="medium">中等質量</option>
                  <option value="high">高質量</option>
                  <option value="ultra">超高質量</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">輸出格式：</label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  data-testid="format-select"
                >
                  <option value="webp">WebP (推薦)</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="avif">AVIF (最新)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              {enableCDN && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enableCDN}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableCDN: e.target.checked }))}
                    className="mr-2"
                    data-testid="enable-cdn"
                  />
                  <span className="text-sm text-gray-700">啟用CDN加速</span>
                </label>
              )}
              {enableLazyLoading && (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enableLazyLoading}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableLazyLoading: e.target.checked }))}
                    className="mr-2"
                    data-testid="enable-lazy-loading"
                  />
                  <span className="text-sm text-gray-700">啟用懶加載</span>
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 縮圖管理標籤 */}
      {activeTab === 'manage' && (
        <div data-testid="manage-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">縮圖管理</h3>
          
          {/* 批量操作 */}
          {enableBatchProcessing && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={selectAllFiles}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    data-testid="select-all-button"
                  >
                    全選
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    data-testid="clear-selection-button"
                  >
                    清除
                  </button>
                  <span className="text-sm text-gray-600">
                    已選擇 {selectedFiles.length} 個文件
                  </span>
                </div>
                <button
                  onClick={handleBatchRegenerate}
                  disabled={selectedFiles.length === 0 || isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
                  data-testid="batch-regenerate-button"
                >
                  {isProcessing ? '處理中...' : '批量重新生成'}
                </button>
              </div>
            </div>
          )}

          {/* 圖像列表 */}
          <div className="space-y-4">
            {imageFiles.map(file => (
              <div
                key={file.id}
                className={`border rounded-lg p-4 transition-colors ${
                  selectedFiles.includes(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {enableBatchProcessing && (
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="mt-2"
                    />
                  )}
                  
                  {/* 縮圖預覽 */}
                  <div className="flex-shrink-0">
                    <img
                      src={file.thumbnails['200px']}
                      alt={file.name}
                      className="w-20 h-20 object-cover rounded"
                      loading={enableLazyLoading ? 'lazy' : 'eager'}
                    />
                  </div>
                  
                  {/* 文件信息 */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                      <div className="flex items-center space-x-2">
                        {enableGeptIntegration && file.geptLevel && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(file.geptLevel)}`}>
                            {getGeptLevelName(file.geptLevel)}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                          {getStatusName(file.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span>格式: {file.format}</span>
                      <span className="mx-2">•</span>
                      <span>大小: {formatFileSize(file.size)}</span>
                      <span className="mx-2">•</span>
                      <span>上傳: {file.uploadedAt.toLocaleDateString()}</span>
                    </div>
                    
                    {/* 縮圖尺寸 */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {thumbnailSizes.map(size => (
                        <span
                          key={size.name}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {size.name}
                        </span>
                      ))}
                    </div>
                    
                    {/* 記憶科學標籤 */}
                    {enableMemoryScience && file.memoryScience.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {file.memoryScience.map((technique, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            {technique}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 系統設置標籤 */}
      {activeTab === 'settings' && (
        <div data-testid="settings-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">系統設置</h3>
          
          {/* 縮圖設置 */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h4 className="font-medium text-gray-900 mb-4">縮圖生成設置</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  壓縮等級: {settings.compressionLevel}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.compressionLevel}
                  onChange={(e) => setSettings(prev => ({ ...prev, compressionLevel: parseInt(e.target.value) }))}
                  className="w-full"
                  data-testid="compression-slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>高壓縮 (小文件)</span>
                  <span>低壓縮 (高質量)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 性能設置 */}
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h4 className="font-medium text-gray-900 mb-4">性能設置</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">CDN加速</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableCDN}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableCDN: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">懶加載</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableLazyLoading}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableLazyLoading: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 統計信息 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-4">系統統計</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{imageFiles.length}</div>
                <div className="text-blue-800">總圖像數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {imageFiles.filter(f => f.status === 'ready').length}
                </div>
                <div className="text-green-800">就緒圖像</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {imageFiles.length * thumbnailSizes.length}
                </div>
                <div className="text-orange-800">縮圖總數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatFileSize(imageFiles.reduce((sum, f) => sum + f.size, 0))}
                </div>
                <div className="text-purple-800">總存儲</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">使用提示</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 400px標準：基於Wordwall標準的最佳縮圖尺寸</p>
          <p>• 多尺寸支持：自動生成100px、200px、400px、800px四種尺寸</p>
          <p>• CDN加速：全球分發網路確保快速載入</p>
          <p>• 懶加載：按需載入縮圖，提升頁面性能</p>
          <p>• 批量處理：支持多文件同時上傳和處理</p>
          <p>• 智能壓縮：根據內容自動選擇最佳壓縮設置</p>
        </div>
      </div>
    </div>
  );
};
