/**
 * BatchAudioProcessor - 批量音頻處理組件
 * 支持批量轉換格式、音量調整、音頻合併等功能
 */
import React, { useState, useCallback } from 'react';
import { VoiceRecording } from '../../lib/audio/VoiceManager';

export interface BatchProcessingOptions {
  format?: 'mp3' | 'wav' | 'ogg' | 'webm';
  volume?: number;
  normalize?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  trimSilence?: boolean;
  merge?: boolean;
}

export interface BatchAudioProcessorProps {
  recordings: VoiceRecording[];
  onProcessComplete?: (processedRecordings: VoiceRecording[]) => void;
  onProgress?: (progress: number) => void;
  className?: string;
  'data-testid'?: string;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentFile: string;
  error?: string;
}

const BatchAudioProcessor = ({
  recordings,
  onProcessComplete,
  onProgress,
  className = '',
  'data-testid': testId = 'batch-audio-processor'
}: BatchAudioProcessorProps) {
  const [selectedRecordings, setSelectedRecordings] = useState<Set<string>>(new Set());
  const [processingOptions, setProcessingOptions] = useState<BatchProcessingOptions>({
    format: 'mp3',
    volume: 1,
    normalize: false,
    fadeIn: 0,
    fadeOut: 0,
    trimSilence: false,
    merge: false
  });
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    currentFile: ''
  });

  const handleSelectAll = useCallback(() => {
    if (selectedRecordings.size === recordings.length) {
      setSelectedRecordings(new Set());
    } else {
      setSelectedRecordings(new Set(recordings.map(r => r.id)));
    }
  }, [recordings, selectedRecordings.size]);

  const handleSelectRecording = useCallback((recordingId: string) => {
    const newSelected = new Set(selectedRecordings);
    if (newSelected.has(recordingId)) {
      newSelected.delete(recordingId);
    } else {
      newSelected.add(recordingId);
    }
    setSelectedRecordings(newSelected);
  }, [selectedRecordings]);

  const handleOptionsChange = useCallback((key: keyof BatchProcessingOptions, value: any) => {
    setProcessingOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const processAudio = useCallback(async (recording: VoiceRecording): Promise<VoiceRecording> => {
    // 模擬音頻處理（實際實現需要 Web Audio API 或服務器端處理）
    return new Promise((resolve) => {
      setTimeout(() => {
        const processedRecording: VoiceRecording = {
          ...recording,
          id: `processed_${recording.id}`,
          name: `${recording.name} (已處理)`,
          createdAt: Date.now(),
          metadata: {
            ...recording.metadata,
            processedWith: processingOptions,
            originalId: recording.id
          }
        };
        resolve(processedRecording);
      }, 1000 + Math.random() * 2000); // 模擬處理時間
    });
  }, [processingOptions]);

  const handleStartProcessing = useCallback(async () => {
    const selectedRecordingsList = recordings.filter(r => selectedRecordings.has(r.id));
    
    if (selectedRecordingsList.length === 0) {
      alert('請選擇要處理的音頻文件');
      return;
    }

    setProcessingState({
      isProcessing: true,
      progress: 0,
      currentFile: ''
    });

    try {
      const processedRecordings: VoiceRecording[] = [];
      
      for (let i = 0; i < selectedRecordingsList.length; i++) {
        const recording = selectedRecordingsList[i];
        
        setProcessingState(prev => ({
          ...prev,
          currentFile: recording.name,
          progress: (i / selectedRecordingsList.length) * 100
        }));
        
        onProgress?.((i / selectedRecordingsList.length) * 100);
        
        const processedRecording = await processAudio(recording);
        processedRecordings.push(processedRecording);
      }

      // 如果選擇合併，創建合併的音頻
      if (processingOptions.merge && processedRecordings.length > 1) {
        const mergedRecording: VoiceRecording = {
          id: `merged_${Date.now()}`,
          name: `合併音頻 (${processedRecordings.length} 個文件)`,
          blob: new Blob(), // 實際實現需要合併音頻數據
          url: '', // 實際實現需要生成合併後的 URL
          duration: processedRecordings.reduce((sum, r) => sum + r.duration, 0),
          format: processingOptions.format || 'mp3',
          size: processedRecordings.reduce((sum, r) => sum + r.size, 0),
          createdAt: Date.now(),
          metadata: {
            mergedFrom: processedRecordings.map(r => r.id),
            processedWith: processingOptions
          }
        };
        
        onProcessComplete?.([mergedRecording]);
      } else {
        onProcessComplete?.(processedRecordings);
      }

      setProcessingState({
        isProcessing: false,
        progress: 100,
        currentFile: ''
      });

      onProgress?.(100);

    } catch (error) {
      console.error('批量處理失敗:', error);
      setProcessingState({
        isProcessing: false,
        progress: 0,
        currentFile: '',
        error: '處理失敗，請重試'
      });
    }
  }, [recordings, selectedRecordings, processingOptions, onProcessComplete, onProgress, processAudio]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`batch-audio-processor bg-white rounded-lg shadow-sm p-6 ${className}`} data-testid={testId}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">批量音頻處理</h3>
        <div className="text-sm text-gray-500">
          已選擇 {selectedRecordings.size} / {recordings.length} 個文件
        </div>
      </div>

      {/* 文件選擇 */}
      <div className="file-selection mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900">選擇文件</h4>
          <button
            onClick={handleSelectAll}
            className="text-blue-600 hover:text-blue-800 text-sm"
            data-testid="select-all-btn"
          >
            {selectedRecordings.size === recordings.length ? '取消全選' : '全選'}
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedRecordings.has(recording.id) ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleSelectRecording(recording.id)}
              data-testid={`recording-item-${recording.id}`}
            >
              <input
                type="checkbox"
                checked={selectedRecordings.has(recording.id)}
                onChange={() => handleSelectRecording(recording.id)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{recording.name}</div>
                <div className="text-sm text-gray-500">
                  {formatDuration(recording.duration)} • {formatFileSize(recording.size)} • {recording.format}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 處理選項 */}
      <div className="processing-options mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">處理選項</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 格式和質量 */}
          <div className="format-options">
            <h5 className="text-sm font-medium text-gray-700 mb-3">格式和質量</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">輸出格式</label>
                <select
                  value={processingOptions.format}
                  onChange={(e) => handleOptionsChange('format', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  data-testid="format-select"
                >
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                  <option value="ogg">OGG</option>
                  <option value="webm">WebM</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  音量調整: {Math.round((processingOptions.volume || 1) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={processingOptions.volume || 1}
                  onChange={(e) => handleOptionsChange('volume', parseFloat(e.target.value))}
                  className="w-full"
                  data-testid="volume-slider"
                />
              </div>
            </div>
          </div>

          {/* 音頻效果 */}
          <div className="audio-effects">
            <h5 className="text-sm font-medium text-gray-700 mb-3">音頻效果</h5>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={processingOptions.normalize}
                  onChange={(e) => handleOptionsChange('normalize', e.target.checked)}
                  className="mr-2"
                  data-testid="normalize-checkbox"
                />
                <span className="text-sm text-gray-600">音量標準化</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={processingOptions.trimSilence}
                  onChange={(e) => handleOptionsChange('trimSilence', e.target.checked)}
                  className="mr-2"
                  data-testid="trim-silence-checkbox"
                />
                <span className="text-sm text-gray-600">移除靜音</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={processingOptions.merge}
                  onChange={(e) => handleOptionsChange('merge', e.target.checked)}
                  className="mr-2"
                  data-testid="merge-checkbox"
                />
                <span className="text-sm text-gray-600">合併為單個文件</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 處理進度 */}
      {processingState.isProcessing && (
        <div className="processing-progress mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">處理中...</span>
            <span className="text-sm text-blue-700">{Math.round(processingState.progress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingState.progress}%` }}
            />
          </div>
          {processingState.currentFile && (
            <div className="text-sm text-blue-700">
              正在處理: {processingState.currentFile}
            </div>
          )}
        </div>
      )}

      {/* 錯誤信息 */}
      {processingState.error && (
        <div className="error-message mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">{processingState.error}</div>
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="actions flex justify-end space-x-3">
        <button
          onClick={handleStartProcessing}
          disabled={processingState.isProcessing || selectedRecordings.size === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          data-testid="start-processing-btn"
        >
          {processingState.isProcessing ? '處理中...' : '開始處理'}
        </button>
      </div>

      {/* 處理摘要 */}
      <div className="processing-summary mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-2">處理摘要</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">選擇文件:</span>
            <span className="ml-2 font-medium">{selectedRecordings.size} 個</span>
          </div>
          <div>
            <span className="text-gray-600">輸出格式:</span>
            <span className="ml-2 font-medium">{processingOptions.format?.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-gray-600">音量調整:</span>
            <span className="ml-2 font-medium">{Math.round((processingOptions.volume || 1) * 100)}%</span>
          </div>
          <div>
            <span className="text-gray-600">合併文件:</span>
            <span className="ml-2 font-medium">{processingOptions.merge ? '是' : '否'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchAudioProcessor;
