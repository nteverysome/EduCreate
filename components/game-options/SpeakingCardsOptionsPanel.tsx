'use client';

import React from 'react';

export interface SpeakingCardsOptions {
  timer: {
    type: 'none' | 'countUp' | 'countDown';  // 計時器類型
    minutes?: number;  // 倒計時分鐘數
    seconds?: number;  // 倒計時秒數
  };
  shuffle: boolean;  // 是否洗牌
  autoPlayAudio: boolean;  // 自動播放語音
  showTranslation: boolean;  // 顯示翻譯
  cardStyle: 'classic' | 'modern' | 'minimal';  // 卡片樣式
}

export const DEFAULT_SPEAKING_CARDS_OPTIONS: SpeakingCardsOptions = {
  timer: {
    type: 'none',
    minutes: 5,
    seconds: 0,
  },
  shuffle: true,
  autoPlayAudio: true,
  showTranslation: true,
  cardStyle: 'classic',
};

interface SpeakingCardsOptionsPanelProps {
  options: SpeakingCardsOptions;
  onChange: (options: SpeakingCardsOptions) => void;
  totalVocabulary?: number;
}

const SpeakingCardsOptionsPanel: React.FC<SpeakingCardsOptionsPanelProps> = ({
  options,
  onChange,
  totalVocabulary = 30,
}) => {
  const updateOptions = (updates: Partial<SpeakingCardsOptions>) => {
    onChange({ ...options, ...updates });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">🎴 Speaking Cards 遊戲選項</h3>

      <table className="w-full">
        <tbody>
          {/* 計時器選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium align-top">⏱️ 計時器</td>
            <td className="py-3">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="speaking-timer"
                    checked={options.timer.type === 'none'}
                    onChange={() => updateOptions({
                      timer: { ...options.timer, type: 'none' }
                    })}
                    className="cursor-pointer"
                  />
                  <span>無</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="speaking-timer"
                    checked={options.timer.type === 'countUp'}
                    onChange={() => updateOptions({
                      timer: { ...options.timer, type: 'countUp' }
                    })}
                    className="cursor-pointer"
                  />
                  <span>正向計時</span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="speaking-timer"
                    checked={options.timer.type === 'countDown'}
                    onChange={() => updateOptions({
                      timer: { ...options.timer, type: 'countDown' }
                    })}
                    className="cursor-pointer mt-1"
                  />
                  <div className="flex flex-col gap-2">
                    <span>倒數計時</span>

                    {options.timer.type === 'countDown' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={options.timer.minutes || 5}
                          onChange={(e) => updateOptions({
                            timer: {
                              ...options.timer,
                              minutes: Number(e.target.value)
                            }
                          })}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-600">m</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={options.timer.seconds || 0}
                          onChange={(e) => updateOptions({
                            timer: {
                              ...options.timer,
                              seconds: Number(e.target.value)
                            }
                          })}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-600">s</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </td>
          </tr>

          {/* 洗牌選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">🔀 洗牌順序</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.shuffle}
                  onChange={(e) => updateOptions({ shuffle: e.target.checked })}
                  className="cursor-pointer"
                />
                <span>每次開始時隨機排序卡片</span>
              </label>
            </td>
          </tr>

          {/* 自動播放語音 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">🔊 自動播放語音</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.autoPlayAudio}
                  onChange={(e) => updateOptions({ autoPlayAudio: e.target.checked })}
                  className="cursor-pointer"
                />
                <span>翻開卡片時自動播放發音</span>
              </label>
            </td>
          </tr>

          {/* 顯示翻譯 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">📝 顯示翻譯</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showTranslation}
                  onChange={(e) => updateOptions({ showTranslation: e.target.checked })}
                  className="cursor-pointer"
                />
                <span>在卡片上顯示中文翻譯</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 詞彙數量提示 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        📚 當前詞彙數量：<strong>{totalVocabulary}</strong> 個單字
      </div>
    </div>
  );
};

export default SpeakingCardsOptionsPanel;

