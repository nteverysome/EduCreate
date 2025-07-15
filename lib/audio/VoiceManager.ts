/**
 * VoiceManager - 語音錄製和編輯系統
 * 實現語音錄製、播放、編輯、語音識別和語音合成功能
 */

export interface VoiceRecording {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  format: string;
  size: number;
  createdAt: number;
  transcript?: string; // 語音識別結果
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    language?: string;
  };
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  volume: number;
  error?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface VoiceSynthesisOptions {
  text: string;
  voice?: SpeechSynthesisVoice;
  rate?: number; // 0.1 - 10
  pitch?: number; // 0 - 2
  volume?: number; // 0 - 1
  language?: string;
}

export class VoiceManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private recordings: Map<string, VoiceRecording> = new Map();
  
  // 狀態管理
  private recordingState: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    volume: 0
  };
  
  private playbackState: PlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1
  };

  // 語音識別
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;

  // 事件監聽器
  private recordingListeners: Set<(state: RecordingState) => void> = new Set();
  private playbackListeners: Set<(state: PlaybackState) => void> = new Set();
  private recognitionListeners: Set<(result: VoiceRecognitionResult) => void> = new Set();
  private recordingsListeners: Set<(recordings: VoiceRecording[]) => void> = new Set();

  // 音頻分析
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  constructor() {
    this.initializeAudioContext();
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
    this.loadRecordings();
  }

  /**
   * 初始化音頻上下文
   */
  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      console.error('音頻上下文初始化失敗:', error);
    }
  }

  /**
   * 初始化語音識別
   */
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'zh-TW';

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const recognitionResult: VoiceRecognitionResult = {
          transcript: result[0].transcript,
          confidence: result[0].confidence,
          isFinal: result.isFinal,
          alternatives: Array.from(result).map(alt => ({
            transcript: alt.transcript,
            confidence: alt.confidence
          }))
        };
        
        this.notifyRecognitionListeners(recognitionResult);
      };

      this.recognition.onerror = (event) => {
        console.error('語音識別錯誤:', event.error);
      };
    }
  }

  /**
   * 初始化語音合成
   */
  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * 開始錄音
   */
  async startRecording(): Promise<void> {
    try {
      // 請求麥克風權限
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // 設置音頻分析
      if (this.audioContext && this.analyser) {
        const source = this.audioContext.createMediaStreamSource(this.audioStream);
        source.connect(this.analyser);
      }

      // 創建媒體錄製器
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: this.getSupportedMimeType()
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processRecording();
      };

      this.mediaRecorder.start(100); // 每100ms收集一次數據

      // 更新狀態
      this.recordingState = {
        isRecording: true,
        isPaused: false,
        duration: 0,
        volume: 0
      };

      this.startRecordingTimer();
      this.startVolumeMonitoring();
      this.notifyRecordingListeners();

    } catch (error) {
      this.recordingState.error = '無法訪問麥克風';
      this.notifyRecordingListeners();
      throw error;
    }
  }

  /**
   * 停止錄音
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.recordingState.isRecording) {
      this.mediaRecorder.stop();
      
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => track.stop());
        this.audioStream = null;
      }

      this.recordingState = {
        isRecording: false,
        isPaused: false,
        duration: this.recordingState.duration,
        volume: 0
      };

      this.notifyRecordingListeners();
    }
  }

  /**
   * 暫停/恢復錄音
   */
  toggleRecordingPause(): void {
    if (!this.mediaRecorder) return;

    if (this.recordingState.isPaused) {
      this.mediaRecorder.resume();
      this.recordingState.isPaused = false;
    } else {
      this.mediaRecorder.pause();
      this.recordingState.isPaused = true;
    }

    this.notifyRecordingListeners();
  }

  /**
   * 處理錄音完成
   */
  private processRecording(): void {
    const blob = new Blob(this.audioChunks, { 
      type: this.getSupportedMimeType() 
    });
    
    const recording: VoiceRecording = {
      id: this.generateId(),
      name: `錄音_${new Date().toLocaleString('zh-TW')}`,
      blob,
      url: URL.createObjectURL(blob),
      duration: this.recordingState.duration,
      format: this.getSupportedMimeType(),
      size: blob.size,
      createdAt: Date.now()
    };

    this.recordings.set(recording.id, recording);
    this.saveRecordings();
    this.notifyRecordingsListeners();
  }

  /**
   * 播放錄音
   */
  async playRecording(recordingId: string): Promise<void> {
    const recording = this.recordings.get(recordingId);
    if (!recording) {
      throw new Error('錄音不存在');
    }

    const audio = new Audio(recording.url);
    
    audio.addEventListener('loadedmetadata', () => {
      this.playbackState.duration = audio.duration;
      this.notifyPlaybackListeners();
    });

    audio.addEventListener('timeupdate', () => {
      this.playbackState.currentTime = audio.currentTime;
      this.notifyPlaybackListeners();
    });

    audio.addEventListener('play', () => {
      this.playbackState.isPlaying = true;
      this.playbackState.isPaused = false;
      this.notifyPlaybackListeners();
    });

    audio.addEventListener('pause', () => {
      this.playbackState.isPlaying = false;
      this.playbackState.isPaused = true;
      this.notifyPlaybackListeners();
    });

    audio.addEventListener('ended', () => {
      this.playbackState.isPlaying = false;
      this.playbackState.isPaused = false;
      this.playbackState.currentTime = 0;
      this.notifyPlaybackListeners();
    });

    audio.volume = this.playbackState.volume;
    audio.playbackRate = this.playbackState.playbackRate;

    await audio.play();
  }

  /**
   * 語音識別
   */
  startSpeechRecognition(language: string = 'zh-TW'): void {
    if (!this.recognition) {
      throw new Error('瀏覽器不支持語音識別');
    }

    this.recognition.lang = language;
    this.recognition.start();
  }

  /**
   * 停止語音識別
   */
  stopSpeechRecognition(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * 語音合成
   */
  async speakText(options: VoiceSynthesisOptions): Promise<void> {
    if (!this.synthesis) {
      throw new Error('瀏覽器不支持語音合成');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(options.text);
      
      if (options.voice) utterance.voice = options.voice;
      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.volume) utterance.volume = options.volume;
      if (options.language) utterance.lang = options.language;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.synthesis.speak(utterance);
    });
  }

  /**
   * 獲取可用的語音
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * 獲取音頻波形數據
   */
  getAudioWaveform(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) return null;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  /**
   * 刪除錄音
   */
  deleteRecording(recordingId: string): void {
    const recording = this.recordings.get(recordingId);
    if (recording) {
      URL.revokeObjectURL(recording.url);
      this.recordings.delete(recordingId);
      this.saveRecordings();
      this.notifyRecordingsListeners();
    }
  }

  /**
   * 更新錄音元數據
   */
  updateRecordingMetadata(recordingId: string, metadata: VoiceRecording['metadata']): void {
    const recording = this.recordings.get(recordingId);
    if (recording) {
      recording.metadata = { ...recording.metadata, ...metadata };
      this.saveRecordings();
      this.notifyRecordingsListeners();
    }
  }

  /**
   * 獲取支持的MIME類型
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // 默認
  }

  /**
   * 開始錄音計時器
   */
  private startRecordingTimer(): void {
    const startTime = Date.now();
    const timer = setInterval(() => {
      if (!this.recordingState.isRecording) {
        clearInterval(timer);
        return;
      }

      if (!this.recordingState.isPaused) {
        this.recordingState.duration = (Date.now() - startTime) / 1000;
        this.notifyRecordingListeners();
      }
    }, 100);
  }

  /**
   * 開始音量監控
   */
  private startVolumeMonitoring(): void {
    const monitor = () => {
      if (!this.recordingState.isRecording) return;

      const waveform = this.getAudioWaveform();
      if (waveform) {
        const average = waveform.reduce((sum, value) => sum + value, 0) / waveform.length;
        this.recordingState.volume = average / 255;
      }

      requestAnimationFrame(monitor);
    };

    monitor();
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 通知錄音狀態監聽器
   */
  private notifyRecordingListeners(): void {
    this.recordingListeners.forEach(listener => listener(this.recordingState));
  }

  /**
   * 通知播放狀態監聽器
   */
  private notifyPlaybackListeners(): void {
    this.playbackListeners.forEach(listener => listener(this.playbackState));
  }

  /**
   * 通知語音識別監聽器
   */
  private notifyRecognitionListeners(result: VoiceRecognitionResult): void {
    this.recognitionListeners.forEach(listener => listener(result));
  }

  /**
   * 通知錄音列表監聽器
   */
  private notifyRecordingsListeners(): void {
    const recordings = Array.from(this.recordings.values());
    this.recordingsListeners.forEach(listener => listener(recordings));
  }

  /**
   * 保存錄音到本地存儲
   */
  private saveRecordings(): void {
    try {
      const data = Array.from(this.recordings.entries()).map(([id, recording]) => [
        id,
        {
          ...recording,
          blob: undefined, // 不保存 Blob 到 localStorage
          url: undefined   // URL 會重新生成
        }
      ]);
      localStorage.setItem('voice_recordings', JSON.stringify(data));
    } catch (error) {
      console.error('保存錄音失敗:', error);
    }
  }

  /**
   * 從本地存儲載入錄音
   */
  private loadRecordings(): void {
    try {
      const saved = localStorage.getItem('voice_recordings');
      if (saved) {
        const data = JSON.parse(saved);
        // 注意：從 localStorage 載入的錄音沒有 blob 和 url，需要重新處理
        this.recordings = new Map(data);
      }
    } catch (error) {
      console.error('載入錄音失敗:', error);
    }
  }

  // 監聽器管理方法
  addRecordingListener(listener: (state: RecordingState) => void): void {
    this.recordingListeners.add(listener);
  }

  removeRecordingListener(listener: (state: RecordingState) => void): void {
    this.recordingListeners.delete(listener);
  }

  addPlaybackListener(listener: (state: PlaybackState) => void): void {
    this.playbackListeners.add(listener);
  }

  removePlaybackListener(listener: (state: PlaybackState) => void): void {
    this.playbackListeners.delete(listener);
  }

  addRecognitionListener(listener: (result: VoiceRecognitionResult) => void): void {
    this.recognitionListeners.add(listener);
  }

  removeRecognitionListener(listener: (result: VoiceRecognitionResult) => void): void {
    this.recognitionListeners.delete(listener);
  }

  addRecordingsListener(listener: (recordings: VoiceRecording[]) => void): void {
    this.recordingsListeners.add(listener);
  }

  removeRecordingsListener(listener: (recordings: VoiceRecording[]) => void): void {
    this.recordingsListeners.delete(listener);
  }

  /**
   * 獲取所有錄音
   */
  getAllRecordings(): VoiceRecording[] {
    return Array.from(this.recordings.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 獲取錄音狀態
   */
  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }

  /**
   * 獲取播放狀態
   */
  getPlaybackState(): PlaybackState {
    return { ...this.playbackState };
  }

  /**
   * 格式化時長
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 清理資源
   */
  destroy(): void {
    this.stopRecording();
    this.stopSpeechRecognition();

    if (this.synthesis) {
      this.synthesis.cancel();
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    // 清理所有 URL
    this.recordings.forEach(recording => {
      if (recording.url) {
        URL.revokeObjectURL(recording.url);
      }
    });

    this.recordingListeners.clear();
    this.playbackListeners.clear();
    this.recognitionListeners.clear();
    this.recordingsListeners.clear();
  }
}
