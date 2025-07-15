/**
 * 語音錄製和編輯系統頁面
 * 展示完整的語音錄製、播放、語音識別和語音合成功能
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import VoiceRecorder from '../../../components/audio/VoiceRecorder';
import { VoiceRecording } from '../../../lib/audio/VoiceManager';

export default function VoiceRecordingPage() {
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  const handleRecordingComplete = (recording: VoiceRecording) => {
    console.log('錄音完成:', recording);
    setRecordings(prev => [recording, ...prev]);
  };

  const handleTranscriptUpdate = (transcript: string) => {
    setCurrentTranscript(transcript);
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
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  showAdvancedFeatures 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                data-testid="advanced-features-toggle"
              >
                {showAdvancedFeatures ? '隱藏高級功能' : '顯示高級功能'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
            語音錄製和編輯系統
          </h1>
          <p className="text-gray-600 text-lg">
            完整的語音錄製、播放、語音識別和語音合成功能，支持多種音頻格式
          </p>
        </div>

        {/* 功能特色 */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">功能特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <div className="text-red-600 text-xl">🎤</div>
              <div>
                <h3 className="font-medium text-gray-900">語音錄製</h3>
                <p className="text-sm text-gray-600">高品質音頻錄製和編輯</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">🎵</div>
              <div>
                <h3 className="font-medium text-gray-900">音頻播放</h3>
                <p className="text-sm text-gray-600">支持多種音頻格式播放</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-green-600 text-xl">📝</div>
              <div>
                <h3 className="font-medium text-gray-900">語音識別</h3>
                <p className="text-sm text-gray-600">語音轉文字功能</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-purple-600 text-xl">🔊</div>
              <div>
                <h3 className="font-medium text-gray-900">語音合成</h3>
                <p className="text-sm text-gray-600">文字轉語音朗讀</p>
              </div>
            </div>
          </div>
        </div>

        {/* 主要功能區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 語音錄製器 */}
          <div className="lg:col-span-2">
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              onTranscriptUpdate={handleTranscriptUpdate}
              enableSpeechRecognition={true}
              enableSpeechSynthesis={true}
              data-testid="main-voice-recorder"
            />
          </div>

          {/* 側邊欄 - 統計和信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">錄音統計</h3>
              
              <div className="space-y-4" data-testid="recording-stats">
                <div className="stat-item">
                  <div className="text-2xl font-bold text-blue-600" data-testid="total-recordings">
                    {recordings.length}
                  </div>
                  <div className="text-sm text-gray-600">總錄音數</div>
                </div>
                
                <div className="stat-item">
                  <div className="text-2xl font-bold text-green-600" data-testid="total-duration">
                    {recordings.reduce((total, recording) => total + recording.duration, 0).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">總時長</div>
                </div>
                
                <div className="stat-item">
                  <div className="text-2xl font-bold text-purple-600" data-testid="total-size">
                    {(recordings.reduce((total, recording) => total + recording.size, 0) / 1024 / 1024).toFixed(2)}MB
                  </div>
                  <div className="text-sm text-gray-600">總大小</div>
                </div>
              </div>

              {/* 當前轉錄文本 */}
              {currentTranscript && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">當前轉錄</h4>
                  <div className="text-sm text-blue-800 max-h-32 overflow-y-auto" data-testid="current-transcript">
                    {currentTranscript}
                  </div>
                </div>
              )}

              {/* 快速操作 */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">快速操作</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setCurrentTranscript('')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    data-testid="clear-transcript-btn"
                  >
                    🗑️ 清空轉錄文本
                  </button>
                  
                  <button
                    onClick={() => {
                      const text = recordings.map(r => r.transcript).filter(Boolean).join('\n');
                      navigator.clipboard.writeText(text);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    data-testid="copy-all-transcripts-btn"
                  >
                    📋 複製所有轉錄
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 高級功能 */}
        {showAdvancedFeatures && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">高級功能</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 音頻格式支持 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">支持的音頻格式</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>WebM (Opus) - 推薦</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>WebM - 標準</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>MP4 - 兼容</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>OGG (Opus) - 兼容</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>WAV - 備用</span>
                  </div>
                </div>
              </div>

              {/* 語音識別語言 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">語音識別語言</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>繁體中文 (zh-TW)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>簡體中文 (zh-CN)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>英語 (en-US)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>日語 (ja-JP)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>韓語 (ko-KR)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 技術規格 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">技術規格</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <strong>採樣率:</strong> 48kHz
                </div>
                <div>
                  <strong>位深度:</strong> 16-bit
                </div>
                <div>
                  <strong>聲道:</strong> 單聲道/立體聲
                </div>
                <div>
                  <strong>編碼:</strong> Opus, AAC, PCM
                </div>
                <div>
                  <strong>延遲:</strong> &lt;100ms
                </div>
                <div>
                  <strong>識別準確率:</strong> &gt;95%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 使用說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">使用說明</h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>點擊紅色麥克風按鈕開始錄音，支持暫停和恢復功能</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>開啟語音識別功能可以實時將語音轉換為文字</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>使用語音合成功能可以將文字轉換為語音播放</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">4.</span>
              <span>錄音完成後可以播放、刪除或查看轉錄結果</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">5.</span>
              <span>音頻波形可視化顯示實時錄音狀態和音量</span>
            </div>
          </div>
        </div>

        {/* 無障礙說明 */}
        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">無障礙功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-green-800">
            <div>
              <h3 className="font-medium mb-2">鍵盤控制</h3>
              <ul className="text-sm space-y-1">
                <li>• 空格鍵：開始/停止錄音</li>
                <li>• Enter鍵：播放選中的錄音</li>
                <li>• Delete鍵：刪除選中的錄音</li>
                <li>• Tab鍵：在控件間導航</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">輔助功能</h3>
              <ul className="text-sm space-y-1">
                <li>• 完整的ARIA標籤支持</li>
                <li>• 螢幕閱讀器友好</li>
                <li>• 高對比度模式支持</li>
                <li>• 語音狀態播報</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
