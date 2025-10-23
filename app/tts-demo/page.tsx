/**
 * TTS 示範頁面
 * 
 * 展示所有 TTS 功能和組件
 * 
 * 功能:
 * 1. TTSButton 組件示範
 * 2. TTSPlayer 組件示範
 * 3. BilingualTTSManager 示範
 * 4. GameTTSPanel 示範
 * 5. 使用文檔
 */

'use client';

import React, { useState } from 'react';
import { TTSButton } from '@/components/tts/TTSButton';
import { TTSPlayer } from '@/components/tts/TTSPlayer';
import { GameTTSPanel } from '@/components/tts/GameTTSPanel';
import type { TTSOptions } from '@/hooks/useTTS';

export default function TTSDemoPage() {
  const [activeTab, setActiveTab] = useState<'button' | 'player' | 'panel' | 'docs'>('button');

  // 示範詞彙
  const demoWords = [
    { id: '1', english: 'hello', chinese: '你好', geptLevel: 'ELEMENTARY' as const },
    { id: '2', english: 'world', chinese: '世界', geptLevel: 'ELEMENTARY' as const },
    { id: '3', english: 'apple', chinese: '蘋果', geptLevel: 'ELEMENTARY' as const },
    { id: '4', english: 'banana', chinese: '香蕉', geptLevel: 'ELEMENTARY' as const },
    { id: '5', english: 'cat', chinese: '貓', geptLevel: 'ELEMENTARY' as const },
  ];

  // TTSPlayer 播放列表
  const playerItems: TTSOptions[] = demoWords.map(word => ({
    text: word.english,
    language: 'en-US',
    voice: 'en-US-Neural2-D',
    geptLevel: word.geptLevel
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔊 TTS 功能示範
          </h1>
          <p className="text-lg text-gray-600">
            展示 EduCreate 平台的 Text-to-Speech 功能和組件
          </p>
        </div>

        {/* 標籤導航 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('button')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'button'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              TTSButton 組件
            </button>
            <button
              onClick={() => setActiveTab('player')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'player'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              TTSPlayer 組件
            </button>
            <button
              onClick={() => setActiveTab('panel')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'panel'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              GameTTSPanel 組件
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'docs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              使用文檔
            </button>
          </nav>
        </div>

        {/* 內容區域 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* TTSButton 示範 */}
          {activeTab === 'button' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                TTSButton 組件示範
              </h2>
              <p className="text-gray-600 mb-6">
                簡單的 TTS 按鈕組件,點擊播放音頻
              </p>

              <div className="space-y-8">
                {/* 基本用法 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    基本用法
                  </h3>
                  <div className="flex gap-4 items-center">
                    <TTSButton
                      text="hello"
                      language="en-US"
                      voice="en-US-Neural2-D"
                    />
                    <span className="text-gray-600">hello</span>
                  </div>
                </div>

                {/* 不同尺寸 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    不同尺寸
                  </h3>
                  <div className="flex gap-4 items-center">
                    <TTSButton
                      text="small"
                      language="en-US"
                      voice="en-US-Neural2-D"
                      size="sm"
                    />
                    <TTSButton
                      text="medium"
                      language="en-US"
                      voice="en-US-Neural2-D"
                      size="md"
                    />
                    <TTSButton
                      text="large"
                      language="en-US"
                      voice="en-US-Neural2-D"
                      size="lg"
                    />
                  </div>
                </div>

                {/* 不同變體 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    不同變體
                  </h3>
                  <div className="flex gap-4 items-center">
                    <TTSButton
                      text="primary"
                      language="en-US"
                      voice="en-US-Neural2-D"
                      variant="primary"
                    />
                    <TTSButton
                      text="secondary"
                      language="en-US"
                      voice="en-US-Neural2-D"
                      variant="secondary"
                    />
                    <TTSButton
                      text="ghost"
                      language="en-US"
                      voice="en-US-Neural2-D"
                      variant="ghost"
                    />
                  </div>
                </div>

                {/* 中文示範 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    中文語音
                  </h3>
                  <div className="flex gap-4 items-center">
                    <TTSButton
                      text="你好"
                      language="zh-TW"
                      voice="cmn-TW-Wavenet-A"
                    />
                    <span className="text-gray-600">你好</span>
                  </div>
                </div>

                {/* 詞彙列表 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    詞彙列表示範
                  </h3>
                  <div className="space-y-2">
                    {demoWords.map(word => (
                      <div key={word.id} className="flex gap-4 items-center p-3 bg-gray-50 rounded-lg">
                        <TTSButton
                          text={word.english}
                          language="en-US"
                          voice="en-US-Neural2-D"
                          size="sm"
                        />
                        <span className="font-medium text-gray-800">{word.english}</span>
                        <TTSButton
                          text={word.chinese}
                          language="zh-TW"
                          voice="cmn-TW-Wavenet-A"
                          size="sm"
                        />
                        <span className="text-gray-600">{word.chinese}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TTSPlayer 示範 */}
          {activeTab === 'player' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                TTSPlayer 組件示範
              </h2>
              <p className="text-gray-600 mb-6">
                高級 TTS 播放器,支持播放列表、音量控制、播放速度控制
              </p>

              <div className="max-w-md mx-auto">
                <TTSPlayer
                  items={playerItems}
                  autoPlay={false}
                  loop={false}
                  showControls={true}
                  showPlaylist={true}
                />
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  功能說明
                </h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>播放/暫停/停止控制</li>
                  <li>上一個/下一個切換</li>
                  <li>音量調整</li>
                  <li>播放速度調整</li>
                  <li>播放列表顯示</li>
                  <li>自動播放下一個</li>
                </ul>
              </div>
            </div>
          )}

          {/* GameTTSPanel 示範 */}
          {activeTab === 'panel' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                GameTTSPanel 組件示範
              </h2>
              <p className="text-gray-600 mb-6">
                遊戲 TTS 控制面板,用於遊戲外部控制 TTS 功能
              </p>

              <div className="max-w-md mx-auto">
                <GameTTSPanel
                  gameId="demo-game"
                  vocabulary={demoWords}
                />
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  功能說明
                </h3>
                <ul className="list-disc list-inside text-green-800 space-y-1">
                  <li>預加載詞彙音頻</li>
                  <li>測試播放功能</li>
                  <li>性別選擇 (男聲/女聲)</li>
                  <li>音量控制</li>
                  <li>播放速度控制</li>
                  <li>統計信息顯示</li>
                </ul>
              </div>
            </div>
          )}

          {/* 使用文檔 */}
          {activeTab === 'docs' && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                使用文檔
              </h2>

              {/* TTSButton 文檔 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  TTSButton 組件
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`import { TTSButton } from '@/components/tts/TTSButton';

<TTSButton 
  text="hello" 
  language="en-US" 
  voice="en-US-Neural2-D"
  size="md"
  variant="primary"
  showIcon={true}
  showText={false}
/>`}
                  </pre>
                </div>
              </div>

              {/* TTSPlayer 文檔 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  TTSPlayer 組件
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`import { TTSPlayer } from '@/components/tts/TTSPlayer';

<TTSPlayer 
  items={[
    { text: 'hello', language: 'en-US', voice: 'en-US-Neural2-D' },
    { text: 'world', language: 'en-US', voice: 'en-US-Neural2-D' }
  ]}
  autoPlay={true}
  loop={false}
  showControls={true}
  showPlaylist={true}
/>`}
                  </pre>
                </div>
              </div>

              {/* GameTTSPanel 文檔 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  GameTTSPanel 組件
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
{`import { GameTTSPanel } from '@/components/tts/GameTTSPanel';

<GameTTSPanel 
  gameId="shimozurdo-game"
  vocabulary={words}
  onManagerReady={(manager) => {
    window.game.bilingualManager = manager;
  }}
/>`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

