/**
 * VoiceRecorder - 語音錄製組件
 * 支持語音錄製、播放、語音識別和語音合成功能
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceManager, RecordingState, VoiceRecording, VoiceRecognitionResult } from '../../lib/audio/VoiceManager';
export interface VoiceRecorderProps {
  onRecordingComplete?: (recording: VoiceRecording) => void;
  onTranscriptUpdate?: (transcript: string) => void;
  enableSpeechRecognition?: boolean;
  enableSpeechSynthesis?: boolean;
  className?: string;
  'data-testid'?: string;
}
export default function VoiceRecorder({
  onRecordingComplete,
  onTranscriptUpdate,
  enableSpeechRecognition = true,
  enableSpeechSynthesis = true,
  className = '',
  'data-testid': testId = 'voice-recorder'
}: VoiceRecorderProps) {
  const [voiceManager] = useState(() => new VoiceManager());
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    volume: 0
  });
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechText, setSpeechText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  // 初始化
  useEffect(() => {
    const handleRecordingState = (state: RecordingState) => {
      setRecordingState(state);
    };
    const handleRecordingsUpdate = (newRecordings: VoiceRecording[]) => {
      setRecordings(newRecordings);
      if (newRecordings.length > 0) {
        const latestRecording = newRecordings[0];
        onRecordingComplete?.(latestRecording);
      }
    };
    const handleRecognitionResult = (result: VoiceRecognitionResult) => {
      if (result.isFinal) {
        setCurrentTranscript(prev => prev + result.transcript + ' ');
        onTranscriptUpdate?.(currentTranscript + result.transcript + ' ');
      }
    };
    voiceManager.addRecordingListener(handleRecordingState);
    voiceManager.addRecordingsListener(handleRecordingsUpdate);
    voiceManager.addRecognitionListener(handleRecognitionResult);
    // 載入可用語音
    const loadVoices = () => {
      const voices = voiceManager.getAvailableVoices();
      setAvailableVoices(voices);
      // 選擇中文語音作為默認
      const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') || voice.lang.includes('cmn')
      );
      if (chineseVoice) {
        setSelectedVoice(chineseVoice);
      }
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    // 載入現有錄音
    setRecordings(voiceManager.getAllRecordings());
    return () => {
      voiceManager.removeRecordingListener(handleRecordingState);
      voiceManager.removeRecordingsListener(handleRecordingsUpdate);
      voiceManager.removeRecognitionListener(handleRecognitionResult);
      voiceManager.destroy();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [voiceManager, onRecordingComplete, onTranscriptUpdate, currentTranscript]);
  // 音頻波形可視化
  useEffect(() => {
    if (recordingState.isRecording && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const drawWaveform = () => {
        const waveform = voiceManager.getAudioWaveform();
        if (!waveform) {
          animationRef.current = requestAnimationFrame(drawWaveform);
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = canvas.width / waveform.length;
        let x = 0;
        for (let i = 0; i < waveform.length; i++) {
          const barHeight = (waveform[i] / 255) * canvas.height;
          // 根據音量設置顏色
          const intensity = waveform[i] / 255;
          ctx.fillStyle = `hsl(${120 - intensity * 60}, 70%, 50%)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth;
        }
        animationRef.current = requestAnimationFrame(drawWaveform);
      };
      drawWaveform();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [recordingState.isRecording, voiceManager]);
  // 開始錄音
  const handleStartRecording = useCallback(async () => {
    try {
      await voiceManager.startRecording();
      if (enableSpeechRecognition && isRecognitionActive) {
        voiceManager.startSpeechRecognition();
      }
    } catch (error) {
      console.error('開始錄音失敗:', error);
      alert('無法開始錄音，請檢查麥克風權限');
    }
  }, [voiceManager, enableSpeechRecognition, isRecognitionActive]);
  // 停止錄音
  const handleStopRecording = useCallback(() => {
    voiceManager.stopRecording();
    if (isRecognitionActive) {
      voiceManager.stopSpeechRecognition();
    }
  }, [voiceManager, isRecognitionActive]);
  // 暫停/恢復錄音
  const handleTogglePause = useCallback(() => {
    voiceManager.toggleRecordingPause();
  }, [voiceManager]);
  // 播放錄音
  const handlePlayRecording = useCallback(async (recordingId: string) => {
    try {
      await voiceManager.playRecording(recordingId);
    } catch (error) {
      console.error('播放錄音失敗:', error);
      alert('播放錄音失敗');
    }
  }, [voiceManager]);
  // 刪除錄音
  const handleDeleteRecording = useCallback((recordingId: string) => {
    if (confirm('確定要刪除這個錄音嗎？')) {
      voiceManager.deleteRecording(recordingId);
    }
  }, [voiceManager]);
  // 切換語音識別
  const handleToggleRecognition = useCallback(() => {
    setIsRecognitionActive(!isRecognitionActive);
  }, [isRecognitionActive]);
  // 語音合成
  const handleSpeakText = useCallback(async () => {
    if (!speechText.trim()) return;
    try {
      await voiceManager.speakText({
        text: speechText,
        voice: selectedVoice || undefined,
        rate: 1,
        pitch: 1,
        volume: 1
      });
    } catch (error) {
      console.error('語音合成失敗:', error);
      alert('語音合成失敗');
    }
  }, [voiceManager, speechText, selectedVoice]);
  // 格式化時長
  const formatDuration = (seconds: number): string => {
    return voiceManager.formatDuration(seconds);
  };
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    return voiceManager.formatFileSize(bytes);
  };
  return (
    <div className={`voice-recorder bg-white rounded-lg shadow-sm p-6 ${className}`} data-testid={testId}>
      {/* 錄音控制區域 */}
      <div className="recording-controls mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">語音錄製</h3>
        {/* 錄音按鈕 */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          {!recordingState.isRecording ? (
            <button
              onClick={handleStartRecording}
              className="record-btn w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-2xl transition-colors"
              aria-label="開始錄音"
              data-testid="start-recording-btn"
            >
              🎤
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTogglePause}
                className="pause-btn w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label={recordingState.isPaused ? '恢復錄音' : '暫停錄音'}
                data-testid="pause-recording-btn"
              >
                {recordingState.isPaused ? '▶️' : '⏸️'}
              </button>
              <button
                onClick={handleStopRecording}
                className="stop-btn w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="停止錄音"
                data-testid="stop-recording-btn"
              >
                ⏹️
              </button>
            </div>
          )}
        </div>
        {/* 錄音狀態 */}
        <div className="recording-status text-center mb-4">
          <div className="text-lg font-medium text-gray-900" data-testid="recording-duration">
            {formatDuration(recordingState.duration)}
          </div>
          <div className="text-sm text-gray-600">
            {recordingState.isRecording 
              ? (recordingState.isPaused ? '錄音已暫停' : '正在錄音...') 
              : '點擊開始錄音'
            }
          </div>
          {recordingState.error && (
            <div className="text-red-600 text-sm mt-1" data-testid="recording-error">
              {recordingState.error}
            </div>
          )}
        </div>
        {/* 音頻波形可視化 */}
        <div className="waveform-container mb-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            className="w-full h-24 bg-gray-100 rounded border"
            data-testid="waveform-canvas"
          />
        </div>
        {/* 音量指示器 */}
        <div className="volume-indicator mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">音量:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${recordingState.volume * 100}%` }}
                data-testid="volume-bar"
              />
            </div>
            <span className="text-sm text-gray-600 w-12">
              {Math.round(recordingState.volume * 100)}%
            </span>
          </div>
        </div>
      </div>
      {/* 語音識別區域 */}
      {enableSpeechRecognition && (
        <div className="speech-recognition mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">語音識別</h4>
            <button
              onClick={handleToggleRecognition}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isRecognitionActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              data-testid="toggle-recognition-btn"
            >
              {isRecognitionActive ? '關閉識別' : '開啟識別'}
            </button>
          </div>
          <div className="transcript-area">
            <textarea
              value={currentTranscript}
              onChange={(e) => setCurrentTranscript(e.target.value)}
              placeholder="語音識別結果將顯示在這裡..."
              className="w-full h-24 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="transcript-textarea"
            />
          </div>
        </div>
      )}
      {/* 語音合成區域 */}
      {enableSpeechSynthesis && (
        <div className="speech-synthesis mb-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">語音合成</h4>
          <div className="space-y-3">
            {/* 語音選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                選擇語音
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = availableVoices.find(v => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                data-testid="voice-select"
              >
                <option value="">選擇語音...</option>
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            {/* 文本輸入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                要朗讀的文本
              </label>
              <textarea
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                placeholder="輸入要朗讀的文本..."
                className="w-full h-20 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                data-testid="speech-text-input"
              />
            </div>
            {/* 朗讀按鈕 */}
            <button
              onClick={handleSpeakText}
              disabled={!speechText.trim()}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              data-testid="speak-text-btn"
            >
              🔊 開始朗讀
            </button>
          </div>
        </div>
      )}
      {/* 錄音列表 */}
      <div className="recordings-list">
        <h4 className="font-medium text-gray-900 mb-3">錄音列表</h4>
        {recordings.length === 0 ? (
          <div className="text-center py-8 text-gray-500" data-testid="no-recordings">
            <div className="text-4xl mb-2">🎤</div>
            <p>還沒有錄音</p>
          </div>
        ) : (
          <div className="space-y-3" data-testid="recordings-list">
            {recordings.map((recording) => (
              <div key={recording.id} className="recording-item bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{recording.name}</h5>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>時長: {formatDuration(recording.duration)}</span>
                      <span>大小: {formatFileSize(recording.size)}</span>
                      <span>格式: {recording.format}</span>
                    </div>
                    {recording.transcript && (
                      <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border">
                        <strong>轉錄:</strong> {recording.transcript}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handlePlayRecording(recording.id)}
                      className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                      data-testid={`play-recording-${recording.id}`}
                    >
                      ▶️
                    </button>
                    <button
                      onClick={() => handleDeleteRecording(recording.id)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                      data-testid={`delete-recording-${recording.id}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
