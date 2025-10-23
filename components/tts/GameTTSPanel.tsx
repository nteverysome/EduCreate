/**
 * GameTTSPanel - 遊戲 TTS 控制面板
 * 
 * 用於在遊戲外部提供 TTS 控制功能
 * 
 * 功能:
 * 1. 顯示當前播放的單字
 * 2. 音量控制
 * 3. 播放速度控制
 * 4. 性別選擇 (男聲/女聲)
 * 5. 預加載進度顯示
 * 
 * 使用方法:
 * ```tsx
 * <GameTTSPanel 
 *   gameId="shimozurdo-game"
 *   vocabulary={words}
 *   onManagerReady={(manager) => {
 *     window.game.bilingualManager = manager;
 *   }}
 * />
 * ```
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BilingualTTSManager } from '@/lib/tts/BilingualTTSManager';

export interface Vocabulary {
  id: string;
  english: string;
  chinese: string;
  geptLevel?: 'ELEMENTARY' | 'INTERMEDIATE' | 'HIGH_INTERMEDIATE';
}

export interface GameTTSPanelProps {
  gameId: string;
  vocabulary?: Vocabulary[];
  onManagerReady?: (manager: BilingualTTSManager) => void;
  className?: string;
}

export function GameTTSPanel({
  gameId,
  vocabulary = [],
  onManagerReady,
  className = ''
}: GameTTSPanelProps) {
  const [manager, setManager] = useState<BilingualTTSManager | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [preloadProgress, setPreloadProgress] = useState<{
    loaded: number;
    total: number;
    isLoading: boolean;
  }>({ loaded: 0, total: 0, isLoading: false });
  const [currentWord, setCurrentWord] = useState<string>('');

  const managerRef = useRef<BilingualTTSManager | null>(null);

  // 初始化 TTS Manager
  useEffect(() => {
    const ttsManager = new BilingualTTSManager({
      volume,
      playbackRate,
      defaultGender: gender
    });

    managerRef.current = ttsManager;
    setManager(ttsManager);

    // 通知父組件 Manager 已準備好
    if (onManagerReady) {
      onManagerReady(ttsManager);
    }

    console.log('✅ GameTTSPanel: TTS Manager 初始化完成');

    return () => {
      ttsManager.stop();
    };
  }, []);

  // 更新 Manager 設置
  useEffect(() => {
    if (manager) {
      manager.setVolume(volume);
      manager.setPlaybackRate(playbackRate);
    }
  }, [manager, volume, playbackRate]);

  // 預加載詞彙
  const handlePreload = async () => {
    if (!manager || vocabulary.length === 0) {
      console.warn('⚠️ 無法預加載: Manager 未初始化或詞彙為空');
      return;
    }

    setPreloadProgress({ loaded: 0, total: vocabulary.length * 2, isLoading: true });

    try {
      const items = vocabulary.flatMap(word => [
        { text: word.english, language: 'en-US', geptLevel: word.geptLevel },
        { text: word.chinese, language: 'zh-TW', geptLevel: word.geptLevel }
      ]);

      await manager.preload(items);

      setPreloadProgress({ loaded: items.length, total: items.length, isLoading: false });
      console.log('✅ 詞彙預加載完成');
    } catch (error) {
      console.error('❌ 預加載失敗:', error);
      setPreloadProgress({ loaded: 0, total: 0, isLoading: false });
    }
  };

  // 測試播放
  const handleTestPlay = async () => {
    if (!manager || vocabulary.length === 0) {
      console.warn('⚠️ 無法測試播放: Manager 未初始化或詞彙為空');
      return;
    }

    const testWord = vocabulary[0];
    setCurrentWord(`${testWord.chinese} (${testWord.english})`);
    setIsPlaying(true);

    try {
      await manager.speakBilingual(testWord.english, testWord.chinese, gender);
      setIsPlaying(false);
      setCurrentWord('');
    } catch (error) {
      console.error('❌ 測試播放失敗:', error);
      setIsPlaying(false);
      setCurrentWord('');
    }
  };

  // 停止播放
  const handleStop = () => {
    if (manager) {
      manager.stop();
      setIsPlaying(false);
      setCurrentWord('');
    }
  };

  return (
    <div className={`game-tts-panel bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* 標題 */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">🔊 TTS 控制面板</h3>
        <p className="text-sm text-gray-600">遊戲: {gameId}</p>
      </div>

      {/* 當前播放 */}
      {currentWord && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">正在播放:</div>
          <div className="text-lg font-medium text-blue-800">{currentWord}</div>
        </div>
      )}

      {/* 控制按鈕 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleTestPlay}
          disabled={isPlaying || vocabulary.length === 0}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPlaying ? '播放中...' : '測試播放'}
        </button>
        <button
          onClick={handleStop}
          disabled={!isPlaying}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          停止
        </button>
      </div>

      {/* 預加載 */}
      <div className="mb-4">
        <button
          onClick={handlePreload}
          disabled={preloadProgress.isLoading || vocabulary.length === 0}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {preloadProgress.isLoading
            ? `預加載中... ${preloadProgress.loaded}/${preloadProgress.total}`
            : `預加載詞彙 (${vocabulary.length} 個)`}
        </button>
        {preloadProgress.total > 0 && !preloadProgress.isLoading && (
          <div className="mt-2 text-sm text-green-600">
            ✅ 已預加載 {preloadProgress.loaded}/{preloadProgress.total} 個音頻
          </div>
        )}
      </div>

      {/* 性別選擇 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          語音性別
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setGender('female')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              gender === 'female'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👩 女聲
          </button>
          <button
            onClick={() => setGender('male')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              gender === 'male'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👨 男聲
          </button>
        </div>
      </div>

      {/* 音量控制 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          音量: {Math.round(volume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* 播放速度控制 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          播放速度: {playbackRate.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* 統計信息 */}
      <div className="border-t pt-4">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>詞彙數量:</span>
            <span className="font-medium">{vocabulary.length}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>音頻數量:</span>
            <span className="font-medium">{vocabulary.length * 2}</span>
          </div>
          <div className="flex justify-between">
            <span>狀態:</span>
            <span className={`font-medium ${isPlaying ? 'text-green-600' : 'text-gray-600'}`}>
              {isPlaying ? '播放中' : '就緒'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameTTSPanel;

