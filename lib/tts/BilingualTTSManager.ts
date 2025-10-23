/**
 * BilingualTTSManager - 雙語 TTS 管理器
 * 
 * 用於替換遊戲中的 BilingualManager,使用我們的 TTS API
 * 
 * 功能:
 * 1. 播放單語音頻 (speak)
 * 2. 播放雙語音頻 (speakBilingual)
 * 3. 預加載詞彙音頻 (preload)
 * 4. 停止播放 (stop)
 * 
 * 使用方法:
 * ```typescript
 * const manager = new BilingualTTSManager();
 * await manager.speak('hello', 'en-US');
 * await manager.speakBilingual('hello', '你好');
 * ```
 */

import { API_ROUTES } from '@/lib/apiRoutes';

export interface TTSOptions {
  text: string;
  language: string;
  voice: string;
  geptLevel?: 'ELEMENTARY' | 'INTERMEDIATE' | 'HIGH_INTERMEDIATE';
}

export interface TTSResponse {
  audioUrl: string;
  cached: boolean;
  hash: string;
  fileSize?: number;
  hitCount?: number;
}

export class BilingualTTSManager {
  private currentAudio: HTMLAudioElement | null = null;
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying: boolean = false;
  private volume: number = 1.0;
  private playbackRate: number = 1.0;

  // 語音配置
  private voiceConfig = {
    'en-US': {
      male: 'en-US-Neural2-D',
      female: 'en-US-Neural2-F'
    },
    'zh-TW': {
      male: 'cmn-TW-Wavenet-C',
      female: 'cmn-TW-Wavenet-A'
    }
  };

  // 默認使用女聲
  private defaultGender: 'male' | 'female' = 'female';

  constructor(options?: {
    volume?: number;
    playbackRate?: number;
    defaultGender?: 'male' | 'female';
  }) {
    if (options?.volume !== undefined) {
      this.volume = options.volume;
    }
    if (options?.playbackRate !== undefined) {
      this.playbackRate = options.playbackRate;
    }
    if (options?.defaultGender !== undefined) {
      this.defaultGender = options.defaultGender;
    }
  }

  /**
   * 獲取語音名稱
   */
  private getVoice(language: string, gender?: 'male' | 'female'): string {
    const selectedGender = gender || this.defaultGender;
    
    if (language === 'zh-TW' || language === 'zh-CN') {
      return this.voiceConfig['zh-TW'][selectedGender];
    } else {
      return this.voiceConfig['en-US'][selectedGender];
    }
  }

  /**
   * 從 TTS API 獲取音頻 URL
   */
  private async fetchAudioUrl(options: TTSOptions): Promise<string> {
    try {
      const response = await fetch(API_ROUTES.TTS.GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          language: options.language,
          voice: options.voice,
          geptLevel: options.geptLevel || 'ELEMENTARY'
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API 錯誤: ${response.status}`);
      }

      const data: TTSResponse = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('❌ 獲取 TTS 音頻失敗:', error);
      throw error;
    }
  }

  /**
   * 播放單語音頻
   */
  async speak(text: string, language: string, gender?: 'male' | 'female'): Promise<void> {
    try {
      const voice = this.getVoice(language, gender);
      const audioUrl = await this.fetchAudioUrl({
        text,
        language,
        voice,
        geptLevel: 'ELEMENTARY'
      });

      // 停止當前播放
      this.stop();

      // 創建新音頻
      const audio = new Audio(audioUrl);
      audio.volume = this.volume;
      audio.playbackRate = this.playbackRate;
      this.currentAudio = audio;
      this.isPlaying = true;

      // 播放結束後清理
      audio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
      };

      // 播放音頻
      await audio.play();
      console.log('🔊 播放 TTS:', text, language);
    } catch (error) {
      console.error('❌ 播放 TTS 失敗:', error);
      this.isPlaying = false;
      this.currentAudio = null;
      throw error;
    }
  }

  /**
   * 播放雙語音頻 (先中文,再英文)
   */
  async speakBilingual(
    englishText: string,
    chineseText: string,
    gender?: 'male' | 'female'
  ): Promise<void> {
    try {
      // 先播放中文
      await this.speak(chineseText, 'zh-TW', gender);
      
      // 等待中文播放完成
      await this.waitForPlaybackEnd();
      
      // 短暫延遲
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 再播放英文
      await this.speak(englishText, 'en-US', gender);
      
      console.log('🔊 播放雙語 TTS:', chineseText, '→', englishText);
    } catch (error) {
      console.error('❌ 播放雙語 TTS 失敗:', error);
      throw error;
    }
  }

  /**
   * 等待當前播放結束
   */
  private waitForPlaybackEnd(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isPlaying || !this.currentAudio) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (!this.isPlaying) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  /**
   * 暫停播放
   */
  pause(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * 恢復播放
   */
  resume(): void {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play();
      this.isPlaying = true;
    }
  }

  /**
   * 設置音量
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  /**
   * 設置播放速度
   */
  setPlaybackRate(rate: number): void {
    this.playbackRate = Math.max(0.5, Math.min(2, rate));
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.playbackRate;
    }
  }

  /**
   * 預加載詞彙音頻
   */
  async preload(items: Array<{ text: string; language: string; geptLevel?: string }>): Promise<void> {
    try {
      console.log(`🔄 開始預加載 ${items.length} 個音頻...`);
      
      const batchItems = items.map(item => ({
        text: item.text,
        language: item.language,
        voice: this.getVoice(item.language),
        geptLevel: item.geptLevel || 'ELEMENTARY'
      }));

      const response = await fetch(API_ROUTES.TTS.BATCH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: batchItems }),
      });

      if (!response.ok) {
        throw new Error(`批次查詢失敗: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ 預加載完成: ${data.stats.cached}/${data.stats.total} 已緩存`);
    } catch (error) {
      console.error('❌ 預加載失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取當前播放狀態
   */
  getPlaybackState(): {
    isPlaying: boolean;
    volume: number;
    playbackRate: number;
  } {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      playbackRate: this.playbackRate
    };
  }
}

export default BilingualTTSManager;

