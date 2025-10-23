'use client';

import React, { useState } from 'react';
import { X, Volume2, Loader2, Check } from 'lucide-react';

interface AddSoundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  onSoundGenerated: (audioUrl: string) => void;
}

// 語言選項（專注於核心 5 種語言）
const LANGUAGE_OPTIONS = [
  { value: 'zh-TW', label: '🇹🇼 繁體中文（台灣）', code: 'cmn-TW' },
  { value: 'zh-CN', label: '🇨🇳 簡體中文', code: 'cmn-CN' },
  { value: 'en-US', label: '🇺🇸 英語（美國）', code: 'en-US' },
  { value: 'en-GB', label: '🇬🇧 英語（英國）', code: 'en-GB' },
  { value: 'ja-JP', label: '🇯🇵 日語', code: 'ja-JP' },
];

// 性別選項（擴展版）
const VOICE_OPTIONS = [
  { value: 'male-adult', label: '👨 男聲（成人）', description: '適合高中、成人' },
  { value: 'female-adult', label: '👩 女聲（成人）', description: '適合高中、成人' },
  { value: 'male-child', label: '👦 男聲（兒童）', description: '適合國小、國中' },
  { value: 'female-child', label: '👧 女聲（兒童）', description: '適合國小、國中' },
];

const AddSoundDialog: React.FC<AddSoundDialogProps> = ({
  isOpen,
  onClose,
  text,
  onSoundGenerated,
}) => {
  const [inputText, setInputText] = useState(text);
  const [language, setLanguage] = useState('en-US');
  const [voice, setVoice] = useState('female-adult');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false); // 預覽模式狀態
  const [isPlaying, setIsPlaying] = useState(false); // 播放狀態
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null); // 音頻元素

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('請輸入文字');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // 根據語言和性別選擇對應的 Google Cloud TTS 語音
      const voiceMap: Record<string, Record<string, string>> = {
        'en-US': {
          'male-adult': 'en-US-Neural2-D',
          'female-adult': 'en-US-Neural2-F',
          'male-child': 'en-US-Neural2-A',
          'female-child': 'en-US-Neural2-C',
        },
        'en-GB': {
          'male-adult': 'en-GB-Neural2-B',
          'female-adult': 'en-GB-Neural2-A',
          'male-child': 'en-GB-Neural2-D',
          'female-child': 'en-GB-Neural2-C',
        },
        'zh-TW': {
          'male-adult': 'cmn-TW-Wavenet-C',
          'female-adult': 'cmn-TW-Wavenet-A',
          'male-child': 'cmn-TW-Wavenet-B',
          'female-child': 'cmn-TW-Wavenet-A',
        },
        'zh-CN': {
          'male-adult': 'cmn-CN-Wavenet-C',
          'female-adult': 'cmn-CN-Wavenet-A',
          'male-child': 'cmn-CN-Wavenet-B',
          'female-child': 'cmn-CN-Wavenet-A',
        },
        'ja-JP': {
          'male-adult': 'ja-JP-Neural2-C',
          'female-adult': 'ja-JP-Neural2-A',
          'male-child': 'ja-JP-Neural2-D',
          'female-child': 'ja-JP-Neural2-B',
        },
      };

      const selectedVoice = voiceMap[language]?.[voice] || voiceMap['en-US']['female-adult'];

      // 調用 TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          language,
          voice: selectedVoice,
        }),
      });

      if (!response.ok) {
        throw new Error('生成語音失敗');
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      setSuccess(true);

      // 進入預覽模式（類似 Wordwall 的第二個模態框）
      setPreviewMode(true);
    } catch (err) {
      console.error('生成語音錯誤:', err);
      setError('生成語音時出錯，請稍後再試');
    } finally {
      setGenerating(false);
    }
  };

  const handlePlayPreview = () => {
    if (audioUrl) {
      // 停止當前播放
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      // 創建新的音頻元素
      const audio = new Audio(audioUrl);
      setAudioElement(audio);
      setIsPlaying(true);

      // 播放音頻
      audio.play();

      // 監聽播放結束
      audio.onended = () => {
        setIsPlaying(false);
      };

      // 監聽錯誤
      audio.onerror = () => {
        setIsPlaying(false);
        setError('播放音頻時出錯');
      };
    }
  };

  const handleStopPreview = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleBackToEdit = () => {
    // 返回編輯模式
    setPreviewMode(false);
    setSuccess(false);
    setAudioUrl(null);
    handleStopPreview();
  };

  const handleConfirm = () => {
    // 確認並添加語音
    if (audioUrl) {
      onSoundGenerated(audioUrl);
      handleStopPreview();
      onClose();
    }
  };

  const handleClose = () => {
    handleStopPreview();
    setPreviewMode(false);
    setSuccess(false);
    setAudioUrl(null);
    onClose();
  };

  if (!isOpen) return null;

  // 預覽模態框（第二個模態框）
  if (previewMode && audioUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* 標題欄 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-blue-600" />
              預覽語音
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 內容區域 */}
          <div className="px-6 py-8 flex flex-col items-center justify-center space-y-6">
            {/* 語音信息 */}
            <div className="w-full space-y-2 text-center">
              <p className="text-sm text-gray-500">文字</p>
              <p className="text-lg font-medium text-gray-900">{inputText}</p>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">語言</p>
                <p className="text-base font-medium text-gray-900">
                  {LANGUAGE_OPTIONS.find(opt => opt.value === language)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">語音類型</p>
                <p className="text-base font-medium text-gray-900">
                  {VOICE_OPTIONS.find(opt => opt.value === voice)?.label}
                </p>
              </div>
            </div>

            {/* 播放按鈕和聲波動畫 */}
            <div className="flex flex-col items-center gap-4">
              {/* 聲波動畫（播放時顯示） */}
              {isPlaying && (
                <div className="flex items-center justify-center gap-1.5 h-20">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full"
                      style={{
                        animation: `wave 0.8s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`,
                        height: '20px',
                      }}
                    />
                  ))}
                </div>
              )}
              <style jsx>{`
                @keyframes wave {
                  0%, 100% {
                    height: 20px;
                  }
                  50% {
                    height: 60px;
                  }
                }
              `}</style>

              {/* 播放按鈕 */}
              <button
                onClick={isPlaying ? handleStopPreview : handlePlayPreview}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                } shadow-lg hover:shadow-xl`}
              >
                {isPlaying ? (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-2 h-8 bg-white rounded-sm mr-2"></div>
                    <div className="w-2 h-8 bg-white rounded-sm"></div>
                  </div>
                ) : (
                  <div className="w-0 h-0 border-t-[16px] border-t-transparent border-l-[24px] border-l-white border-b-[16px] border-b-transparent ml-2"></div>
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500">
              {isPlaying ? '正在播放...' : '點擊播放預覽語音'}
            </p>
          </div>

          {/* 底部按鈕 */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleBackToEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              返回編輯
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              確認
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 第一個模態框（輸入和配置）
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* 標題欄 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-blue-600" />
            加入聲音
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={generating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="px-6 py-4 space-y-4">
          {/* 錯誤提示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-600">語音生成成功！</p>
            </div>
          )}

          {/* 文字輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              輸入文字 *
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="輸入要轉換為語音的文字..."
              rows={3}
              disabled={generating || success}
            />
            <p className="mt-1 text-xs text-gray-500">
              字符數: {inputText.length} / 1000
            </p>
          </div>

          {/* 語言選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              語言 *
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={generating || success}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 性別選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              語音類型 *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {VOICE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setVoice(option.value)}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    voice === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={generating || success}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 提示 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              💡 提示：生成的語音將自動保存並關聯到此單字。
            </p>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={generating}
          >
            取消
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !inputText.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>生成語音</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSoundDialog;

