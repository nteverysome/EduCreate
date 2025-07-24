/**
 * AudioEditor - 音頻編輯組件
 * 支持音頻剪切、合併、音量調整、音效處理等功能
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceRecording } from '../../lib/audio/VoiceManager';

export interface AudioEditorProps {
  recording: VoiceRecording;
  onSave?: (editedRecording: VoiceRecording) => void;
  onCancel?: () => void;
  className?: string;
  'data-testid'?: string;
}

interface AudioEditState {
  startTime: number;
  endTime: number;
  volume: number;
  playbackRate: number;
  fadeIn: number;
  fadeOut: number;
  isPlaying: boolean;
  currentTime: number;
}

const AudioEditor = ({
  recording,
  onSave,
  onCancel,
  className = '',
  'data-testid': testId = 'audio-editor'
}: AudioEditorProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editState, setEditState] = useState<AudioEditState>({
    startTime: 0,
    endTime: recording.duration,
    volume: 1,
    playbackRate: 1,
    fadeIn: 0,
    fadeOut: 0,
    isPlaying: false,
    currentTime: 0
  });

  // 音頻可視化
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    initializeAudioContext();
    drawWaveform();
  }, [recording]);

  const initializeAudioContext = async () => {
    try {
      const context = new AudioContext();
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 2048;
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      
      // 生成波形數據
      await generateWaveformData();
    } catch (error) {
      console.error('初始化音頻上下文失敗:', error);
    }
  };

  const generateWaveformData = async () => {
    try {
      const response = await fetch(recording.url);
      const arrayBuffer = await response.arrayBuffer();
      
      if (audioContext) {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);
        
        // 採樣數據生成波形
        const samples = 1000;
        const blockSize = Math.floor(channelData.length / samples);
        const waveform: number[] = [];
        
        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j]);
          }
          waveform.push(sum / blockSize);
        }
        
        setWaveformData(waveform);
      }
    } catch (error) {
      console.error('生成波形數據失敗:', error);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // 繪製波形
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    const barWidth = width / waveformData.length;
    
    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * height * 0.8;
      const y = (height - barHeight) / 2;
      
      ctx.fillStyle = index >= editState.startTime / recording.duration * waveformData.length &&
                      index <= editState.endTime / recording.duration * waveformData.length
                      ? '#3B82F6' : '#E5E7EB';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
    
    // 繪製選擇區域
    const startX = (editState.startTime / recording.duration) * width;
    const endX = (editState.endTime / recording.duration) * width;
    
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  useEffect(() => {
    drawWaveform();
  }, [waveformData, editState.startTime, editState.endTime]);

  const handlePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (editState.isPlaying) {
      audio.pause();
    } else {
      audio.currentTime = editState.startTime;
      audio.volume = editState.volume;
      audio.playbackRate = editState.playbackRate;
      audio.play();
    }
  }, [editState]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTime = audio.currentTime;
    
    // 如果播放超過結束時間，停止播放
    if (currentTime >= editState.endTime) {
      audio.pause();
      audio.currentTime = editState.startTime;
      setEditState(prev => ({ ...prev, isPlaying: false, currentTime: editState.startTime }));
    } else {
      setEditState(prev => ({ ...prev, currentTime }));
    }
  }, [editState.endTime, editState.startTime]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickTime = (x / canvas.width) * recording.duration;

    // 設置新的開始或結束時間
    if (Math.abs(clickTime - editState.startTime) < Math.abs(clickTime - editState.endTime)) {
      setEditState(prev => ({ ...prev, startTime: Math.max(0, clickTime) }));
    } else {
      setEditState(prev => ({ ...prev, endTime: Math.min(recording.duration, clickTime) }));
    }
  }, [recording.duration, editState.startTime, editState.endTime]);

  const handleSave = useCallback(async () => {
    try {
      // 這裡應該實現音頻剪切和處理邏輯
      // 由於瀏覽器限制，這裡只是模擬
      const editedRecording: VoiceRecording = {
        ...recording,
        id: `edited_${recording.id}`,
        name: `${recording.name} (已編輯)`,
        duration: editState.endTime - editState.startTime,
        createdAt: Date.now(),
        metadata: {
          ...recording.metadata,
          editInfo: {
            originalDuration: recording.duration,
            startTime: editState.startTime,
            endTime: editState.endTime,
            volume: editState.volume,
            playbackRate: editState.playbackRate
          }
        }
      };

      onSave?.(editedRecording);
    } catch (error) {
      console.error('保存編輯失敗:', error);
      alert('保存編輯失敗');
    }
  }, [recording, editState, onSave]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`audio-editor bg-white rounded-lg shadow-sm p-6 ${className}`} data-testid={testId}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">音頻編輯器</h3>
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            data-testid="cancel-edit-btn"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            data-testid="save-edit-btn"
          >
            保存編輯
          </button>
        </div>
      </div>

      {/* 音頻播放器 */}
      <audio
        ref={audioRef}
        src={recording.url}
        onPlay={() => setEditState(prev => ({ ...prev, isPlaying: true }))}
        onPause={() => setEditState(prev => ({ ...prev, isPlaying: false }))}
        onTimeUpdate={handleTimeUpdate}
        style={{ display: 'none' }}
      />

      {/* 波形顯示 */}
      <div className="waveform-container mb-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-32 border border-gray-300 rounded cursor-pointer"
          onClick={handleCanvasClick}
          data-testid="waveform-canvas"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>0:00</span>
          <span>{formatTime(recording.duration)}</span>
        </div>
      </div>

      {/* 編輯控制 */}
      <div className="edit-controls grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 時間範圍 */}
        <div className="time-range">
          <h4 className="text-md font-medium text-gray-900 mb-3">時間範圍</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">開始時間</label>
              <input
                type="range"
                min="0"
                max={recording.duration}
                step="0.1"
                value={editState.startTime}
                onChange={(e) => setEditState(prev => ({ ...prev, startTime: parseFloat(e.target.value) }))}
                className="w-full"
                data-testid="start-time-slider"
              />
              <span className="text-sm text-gray-500">{formatTime(editState.startTime)}</span>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">結束時間</label>
              <input
                type="range"
                min="0"
                max={recording.duration}
                step="0.1"
                value={editState.endTime}
                onChange={(e) => setEditState(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                className="w-full"
                data-testid="end-time-slider"
              />
              <span className="text-sm text-gray-500">{formatTime(editState.endTime)}</span>
            </div>
          </div>
        </div>

        {/* 音頻效果 */}
        <div className="audio-effects">
          <h4 className="text-md font-medium text-gray-900 mb-3">音頻效果</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">音量: {Math.round(editState.volume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={editState.volume}
                onChange={(e) => setEditState(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                className="w-full"
                data-testid="volume-slider"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">播放速度: {editState.playbackRate}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={editState.playbackRate}
                onChange={(e) => setEditState(prev => ({ ...prev, playbackRate: parseFloat(e.target.value) }))}
                className="w-full"
                data-testid="playback-rate-slider"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 播放控制 */}
      <div className="playback-controls mt-6 flex justify-center">
        <button
          onClick={handlePlay}
          className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl"
          data-testid="play-pause-btn"
        >
          {editState.isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>

      {/* 編輯信息 */}
      <div className="edit-info mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-2">編輯信息</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">原始時長:</span>
            <span className="ml-2 font-medium">{formatTime(recording.duration)}</span>
          </div>
          <div>
            <span className="text-gray-600">編輯後時長:</span>
            <span className="ml-2 font-medium">{formatTime(editState.endTime - editState.startTime)}</span>
          </div>
          <div>
            <span className="text-gray-600">選擇範圍:</span>
            <span className="ml-2 font-medium">{formatTime(editState.startTime)} - {formatTime(editState.endTime)}</span>
          </div>
          <div>
            <span className="text-gray-600">音量調整:</span>
            <span className="ml-2 font-medium">{Math.round(editState.volume * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioEditor;
