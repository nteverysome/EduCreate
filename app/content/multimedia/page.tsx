/**
 * 多媒體支持系統頁面
 * 展示完整的多媒體上傳、管理和預覽功能
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MediaUploader from '../../../components/media/MediaUploader';
import MediaLibrary from '../../../components/media/MediaLibrary';
import { MediaFile } from '../../../lib/media/MediaManager';

export default function MultimediaPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleUploadComplete = (files: MediaFile[]) => {
    console.log('上傳完成:', files);
    // 自動切換到媒體庫標籤
    setActiveTab('library');
  };

  const handleFileSelect = (file: MediaFile) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleFileDelete = (file: MediaFile) => {
    console.log('文件已刪除:', file);
    if (selectedFile?.id === file.id) {
      setSelectedFile(null);
      setShowPreview(false);
    }
  };

  const renderMediaPreview = (file: MediaFile) => {
    switch (file.type) {
      case 'image':
        return (
          <img
            src={file.url}
            alt={file.metadata?.altText || file.name}
            className="max-w-full max-h-96 object-contain rounded-lg"
            data-testid="image-preview"
          />
        );
      
      case 'audio':
        return (
          <audio
            controls
            className="w-full"
            data-testid="audio-preview"
          >
            <source src={file.url} type={file.mimeType} />
            您的瀏覽器不支持音頻播放。
          </audio>
        );
      
      case 'video':
        return (
          <video
            controls
            className="max-w-full max-h-96 rounded-lg"
            data-testid="video-preview"
          >
            <source src={file.url} type={file.mimeType} />
            您的瀏覽器不支持視頻播放。
          </video>
        );
      
      case 'animation':
        if (file.mimeType === 'image/gif') {
          return (
            <img
              src={file.url}
              alt={file.metadata?.altText || file.name}
              className="max-w-full max-h-96 object-contain rounded-lg"
              data-testid="animation-preview"
            />
          );
        }
        return (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <div className="text-4xl mb-2">🎭</div>
            <p className="text-gray-600">動畫預覽</p>
          </div>
        );
      
      default:
        return (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-gray-600">無法預覽此文件類型</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="home-link"
              >
                ← 返回主頁
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="dashboard-link"
              >
                功能儀表板
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
            多媒體支持系統
          </h1>
          <p className="text-gray-600 text-lg">
            完整的多媒體上傳、管理和預覽功能，支持圖片、音頻、視頻和動畫
          </p>
        </div>

        {/* 功能特色 */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">功能特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">📁</div>
              <div>
                <h3 className="font-medium text-gray-900">拖拽上傳</h3>
                <p className="text-sm text-gray-600">支持拖拽和批量上傳</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-green-600 text-xl">🖼️</div>
              <div>
                <h3 className="font-medium text-gray-900">多格式支持</h3>
                <p className="text-sm text-gray-600">圖片、音頻、視頻、動畫</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-purple-600 text-xl">👁️</div>
              <div>
                <h3 className="font-medium text-gray-900">實時預覽</h3>
                <p className="text-sm text-gray-600">即時預覽和播放</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-orange-600 text-xl">📊</div>
              <div>
                <h3 className="font-medium text-gray-900">智能管理</h3>
                <p className="text-sm text-gray-600">搜索、過濾、分類</p>
              </div>
            </div>
          </div>
        </div>

        {/* 標籤導航 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('upload')}
                data-testid="upload-tab"
              >
                文件上傳
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'library'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('library')}
                data-testid="library-tab"
              >
                媒體庫
              </button>
            </nav>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要內容 */}
          <div className="lg:col-span-2">
            {activeTab === 'upload' ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">上傳媒體文件</h2>
                <MediaUploader
                  onUploadComplete={handleUploadComplete}
                  multiple={true}
                  data-testid="main-media-uploader"
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">媒體庫</h2>
                <MediaLibrary
                  onFileSelect={handleFileSelect}
                  onFileDelete={handleFileDelete}
                  selectable={true}
                  deletable={true}
                  data-testid="main-media-library"
                />
              </div>
            )}
          </div>

          {/* 側邊欄 - 預覽區域 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {showPreview && selectedFile ? '文件預覽' : '選擇文件以預覽'}
              </h3>
              
              {showPreview && selectedFile ? (
                <div className="space-y-4" data-testid="file-preview-panel">
                  {/* 預覽內容 */}
                  <div className="preview-content">
                    {renderMediaPreview(selectedFile)}
                  </div>
                  
                  {/* 文件詳情 */}
                  <div className="file-details space-y-2 text-sm">
                    <div>
                      <strong>文件名:</strong> {selectedFile.name}
                    </div>
                    <div>
                      <strong>類型:</strong> {selectedFile.type}
                    </div>
                    <div>
                      <strong>大小:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    {selectedFile.dimensions && (
                      <div>
                        <strong>尺寸:</strong> {selectedFile.dimensions.width} × {selectedFile.dimensions.height}
                      </div>
                    )}
                    {selectedFile.duration && (
                      <div>
                        <strong>時長:</strong> {Math.floor(selectedFile.duration / 60)}:{(selectedFile.duration % 60).toFixed(0).padStart(2, '0')}
                      </div>
                    )}
                    <div>
                      <strong>上傳時間:</strong> {new Date(selectedFile.uploadedAt).toLocaleString('zh-TW')}
                    </div>
                  </div>
                  
                  {/* 操作按鈕 */}
                  <div className="flex space-x-2">
                    <button
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      onClick={() => window.open(selectedFile.url, '_blank')}
                      data-testid="open-file-btn"
                    >
                      打開文件
                    </button>
                    <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setShowPreview(false);
                      }}
                      data-testid="close-preview-btn"
                    >
                      關閉
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500" data-testid="no-preview">
                  <div className="text-4xl mb-2">👁️</div>
                  <p>從媒體庫中選擇文件以查看預覽</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 技術規格 */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">技術規格</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">支持的文件格式</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>圖片:</strong> JPG, PNG, GIF, WebP, SVG, BMP, TIFF</li>
                <li>• <strong>音頻:</strong> MP3, WAV, OGG, AAC, M4A, FLAC</li>
                <li>• <strong>視頻:</strong> MP4, WebM, OGG, AVI, MOV, WMV</li>
                <li>• <strong>動畫:</strong> GIF, MP4, WebM, Lottie JSON</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">功能特性</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 最大文件大小: 50MB</li>
                <li>• 支持批量上傳</li>
                <li>• 自動生成縮略圖</li>
                <li>• 拖拽上傳支持</li>
                <li>• 實時上傳進度</li>
                <li>• 智能搜索和過濾</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
