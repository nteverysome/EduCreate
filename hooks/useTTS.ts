/**
 * useTTS - TTS (Text-to-Speech) React Hook
 * 
 * 功能:
 * 1. 查詢和播放 TTS 音頻
 * 2. 批次預加載音頻
 * 3. 音頻播放控制 (播放/暫停/停止)
 * 4. 自動緩存管理
 * 5. 錯誤處理和重試
 * 
 * 使用方法:
 * ```tsx
 * const { play, isPlaying, isLoading, error } = useTTS();
 * 
 * // 播放單個音頻
 * await play({ text: 'hello', language: 'en-US', voice: 'en-US-Neural2-D' });
 * 
 * // 批次預加載
 * await preload([
 *   { text: 'hello', language: 'en-US', voice: 'en-US-Neural2-D' },
 *   { text: 'world', language: 'en-US', voice: 'en-US-Neural2-D' }
 * ]);
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { API_ROUTES } from '@/lib/apiRoutes';

export interface TTSOptions {
  text: string;
  language: string;
  voice: string;
  geptLevel?: string;
}

export interface TTSResult {
  audioUrl: string;
  cached: boolean;
  hash: string;
  fileSize: number;
  hitCount: number;
}

export interface TTSBatchItem extends TTSOptions {
  audioUrl?: string | null;
  cached?: boolean;
}

export interface UseTTSReturn {
  // 播放控制
  play: (options: TTSOptions) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  
  // 批次操作
  preload: (items: TTSOptions[]) => Promise<void>;
  
  // 狀態
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
  currentText: string | null;
  
  // 音頻控制
  volume: number;
  setVolume: (volume: number) => void;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
}

export function useTTS(): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(1.0);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  /**
   * 生成緩存鍵
   */
  const getCacheKey = useCallback((options: TTSOptions): string => {
    return `${options.text}|${options.language}|${options.voice}`;
  }, []);

  /**
   * 從 API 獲取音頻 URL
   */
  const fetchAudioUrl = useCallback(async (options: TTSOptions): Promise<string> => {
    const cacheKey = getCacheKey(options);
    
    // 檢查本地緩存
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey)!;
    }

    // 調用 API
    const response = await fetch(API_ROUTES.TTS.GENERATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`TTS API 錯誤: ${response.statusText}`);
    }

    const data: TTSResult = await response.json();
    
    // 保存到本地緩存
    cacheRef.current.set(cacheKey, data.audioUrl);
    
    return data.audioUrl;
  }, [getCacheKey]);

  /**
   * 播放音頻
   */
  const play = useCallback(async (options: TTSOptions) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentText(options.text);

      // 停止當前播放
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // 獲取音頻 URL
      const audioUrl = await fetchAudioUrl(options);

      // 創建新的音頻元素
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      
      audioRef.current = audio;

      // 設置事件監聽器
      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setIsLoading(false);
      };

      audio.onpause = () => {
        setIsPaused(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentText(null);
      };

      audio.onerror = () => {
        setError('音頻播放失敗');
        setIsPlaying(false);
        setIsLoading(false);
      };

      // 播放音頻
      await audio.play();

    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤');
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [fetchAudioUrl, volume, playbackRate]);

  /**
   * 暫停播放
   */
  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  /**
   * 恢復播放
   */
  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
    }
  }, []);

  /**
   * 停止播放
   */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentText(null);
    }
  }, []);

  /**
   * 批次預加載音頻
   */
  const preload = useCallback(async (items: TTSOptions[]) => {
    try {
      setIsLoading(true);
      setError(null);

      // 調用批次 API
      const response = await fetch(API_ROUTES.TTS.BATCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error(`批次預加載失敗: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 保存到本地緩存
      data.results.forEach((result: TTSBatchItem) => {
        if (result.audioUrl) {
          const cacheKey = getCacheKey(result);
          cacheRef.current.set(cacheKey, result.audioUrl);
        }
      });

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '預加載失敗');
      setIsLoading(false);
    }
  }, [getCacheKey]);

  /**
   * 設置音量
   */
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  /**
   * 設置播放速度
   */
  const setPlaybackRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2, rate));
    setPlaybackRateState(clampedRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = clampedRate;
    }
  }, []);

  /**
   * 清理
   */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    play,
    pause,
    resume,
    stop,
    preload,
    isPlaying,
    isPaused,
    isLoading,
    error,
    currentText,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
  };
}

