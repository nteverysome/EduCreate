'use client';

import React from 'react';

export interface FlyingFruitOptions {
  timer: {
    type: 'none' | 'countUp' | 'countDown';
    minutes?: number;
    seconds?: number;
  };
  lives: number;  // 生命值 1-5
  speed: number;  // 速度 1-10
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
  speed: 10,
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
      <h3 className="text-lg font-semibold mb-4">選項</h3>

      <table className="w-full">
        <tbody>
          {/* Timer 選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium align-top">計時器</td>
            <td className="py-3">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timer"
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
                    name="timer"
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
                    name="timer"
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

          {/* Lives 選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">生命值</td>
            <td className="py-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={options.lives}
                  onChange={(e) => updateOptions({ lives: Number(e.target.value) })}
                  className="flex-1 cursor-pointer"
                />
                <span className="w-8 text-center font-semibold text-lg">{options.lives}</span>
              </div>
            </td>
          </tr>

          {/* Speed 選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">速度</td>
            <td className="py-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={options.speed}
                  onChange={(e) => updateOptions({ speed: Number(e.target.value) })}
                  className="flex-1 cursor-pointer"
                />
                <span className="w-8 text-center font-semibold text-lg">{options.speed}</span>
              </div>
            </td>
          </tr>

          {/* Retry 選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">答錯重試</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.retryOnWrong}
                  onChange={(e) => updateOptions({ retryOnWrong: e.target.checked })}
                  className="cursor-pointer"
                />
                <span>開啟</span>
              </label>
            </td>
          </tr>

          {/* Random 選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">隨機</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.shuffle}
                  onChange={(e) => updateOptions({ shuffle: e.target.checked })}
                  className="cursor-pointer"
                />
                <span>打亂題目順序</span>
              </label>
            </td>
          </tr>

          {/* End of game 選項 */}
          <tr>
            <td className="py-3 pr-4 font-medium">遊戲結束</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showAnswers}
                  onChange={(e) => updateOptions({ showAnswers: e.target.checked })}
                  className="cursor-pointer"
                />
                <span>顯示答案</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FlyingFruitOptionsPanel;

