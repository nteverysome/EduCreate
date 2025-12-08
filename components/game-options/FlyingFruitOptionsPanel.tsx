'use client';

import React from 'react';

export interface FlyingFruitOptions {
  timer: {
    type: 'none' | 'countUp' | 'countDown';
    minutes?: number;
    seconds?: number;
  };
  lives: number;  // 生命值 1-5
  speed: number;  // 速度 1-5
  retryOnWrong: boolean;  // 答錯後重試
  shuffle: boolean;  // 打亂問題順序
  showAnswers: boolean;  // 遊戲結束顯示答案
}

export const DEFAULT_FLYING_FRUIT_OPTIONS: FlyingFruitOptions = {
  timer: {
    type: 'countUp',
    minutes: 5,
    seconds: 0,
  },
  lives: 3,
  speed: 2,
  retryOnWrong: true,
  shuffle: true,
  showAnswers: true,
};

interface FlyingFruitOptionsPanelProps {
  options: FlyingFruitOptions;
  onChange: (options: FlyingFruitOptions) => void;
  totalVocabulary?: number;
}

const FlyingFruitOptionsPanel: React.FC<FlyingFruitOptionsPanelProps> = ({
  options,
  onChange,
  totalVocabulary = 30,
}) => {
  const updateOptions = (updates: Partial<FlyingFruitOptions>) => {
    onChange({ ...options, ...updates });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">🍎 Flying Fruit 遊戲選項</h3>

      <table className="w-full">
        <tbody>
          {/* 計時器選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium align-top w-24">定時器</td>
            <td className="py-3">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flying-timer"
                    checked={options.timer.type === 'none'}
                    onChange={() => updateOptions({ timer: { ...options.timer, type: 'none' } })}
                    className="cursor-pointer"
                  />
                  <span>沒有任何</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flying-timer"
                    checked={options.timer.type === 'countUp'}
                    onChange={() => updateOptions({ timer: { ...options.timer, type: 'countUp' } })}
                    className="cursor-pointer"
                  />
                  <span>數起來</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flying-timer"
                    checked={options.timer.type === 'countDown'}
                    onChange={() => updateOptions({ timer: { ...options.timer, type: 'countDown' } })}
                    className="cursor-pointer"
                  />
                  <span>倒數計時</span>
                </label>
                {options.timer.type === 'countDown' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={options.timer.minutes || 5}
                      onChange={(e) => updateOptions({ timer: { ...options.timer, minutes: Number(e.target.value) } })}
                      className="w-14 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span>分</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={options.timer.seconds || 0}
                      onChange={(e) => updateOptions({ timer: { ...options.timer, seconds: Number(e.target.value) } })}
                      className="w-14 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span>s</span>
                  </div>
                )}
              </div>
            </td>
          </tr>

          {/* 生命值 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">生命</td>
            <td className="py-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={options.lives}
                  onChange={(e) => updateOptions({ lives: Number(e.target.value) })}
                  className="w-48 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={options.lives}
                  onChange={(e) => updateOptions({ lives: Math.min(5, Math.max(1, Number(e.target.value))) })}
                  className="w-14 px-2 py-1 border border-gray-300 rounded text-center"
                />
              </div>
            </td>
          </tr>

          {/* 速度 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">速度</td>
            <td className="py-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={options.speed}
                  onChange={(e) => updateOptions({ speed: Number(e.target.value) })}
                  className="w-48 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={options.speed}
                  onChange={(e) => updateOptions({ speed: Math.min(5, Math.max(1, Number(e.target.value))) })}
                  className="w-14 px-2 py-1 border border-gray-300 rounded text-center"
                />
              </div>
            </td>
          </tr>

          {/* 答錯後重試 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium"></td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.retryOnWrong}
                  onChange={(e) => updateOptions({ retryOnWrong: e.target.checked })}
                  className="cursor-pointer w-4 h-4"
                />
                <span>答錯後嘗重試</span>
              </label>
            </td>
          </tr>

          {/* 隨機順序 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">隨機的</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.shuffle}
                  onChange={(e) => updateOptions({ shuffle: e.target.checked })}
                  className="cursor-pointer w-4 h-4"
                />
                <span>打亂問題順序</span>
              </label>
            </td>
          </tr>

          {/* 遊戲結束顯示答案 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">遊戲結束</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showAnswers}
                  onChange={(e) => updateOptions({ showAnswers: e.target.checked })}
                  className="cursor-pointer w-4 h-4"
                />
                <span>顯示答案</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 詞彙數量提示 */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
        🍎 當前詞彙數量：<strong>{totalVocabulary}</strong> 個單字
      </div>
    </div>
  );
};

export default FlyingFruitOptionsPanel;

