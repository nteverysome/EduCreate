'use client';

import React from 'react';

export interface MatchUpOptions {
  itemsPerPage: number;  // 每頁顯示的詞彙數量 (3-30)
  autoProceed: boolean;  // 標記後自動繼續
  timer: {
    type: 'none' | 'countUp' | 'countDown';  // 計時器類型
    minutes?: number;  // 倒計時分鐘數
    seconds?: number;  // 倒計時秒數
  };
  layout: 'separated' | 'mixed';  // 佈局：分離（左右）或混合
  random: 'different' | 'same';  // 隨機：每次不同或總是相同
  showAnswers: boolean;  // 遊戲結束時顯示答案
}

export const DEFAULT_MATCH_UP_OPTIONS: MatchUpOptions = {
  itemsPerPage: 7,
  autoProceed: true,
  timer: {
    type: 'none',
    minutes: 5,
    seconds: 0,
  },
  layout: 'separated',
  random: 'different',
  showAnswers: false,
};

interface MatchUpOptionsPanelProps {
  options: MatchUpOptions;
  onChange: (options: MatchUpOptions) => void;
  totalVocabulary?: number; // 總詞彙數量
}

const MatchUpOptionsPanel: React.FC<MatchUpOptionsPanelProps> = ({
  options,
  onChange,
  totalVocabulary = 30,
}) => {
  const updateOptions = (updates: Partial<MatchUpOptions>) => {
    onChange({ ...options, ...updates });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">Match-up 遊戲選項</h3>

      <table className="w-full">
        <tbody>
          {/* 計時器選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium align-top">計時器</td>
            <td className="py-3">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="matchup-timer"
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
                    name="matchup-timer"
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
                    name="matchup-timer"
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

          {/* 佈局選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium align-top">佈局</td>
            <td className="py-3">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="matchup-layout"
                    checked={options.layout === 'separated'}
                    onChange={() => updateOptions({ layout: 'separated' })}
                    className="cursor-pointer"
                  />
                  <span>分離（左右）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="matchup-layout"
                    checked={options.layout === 'mixed'}
                    onChange={() => updateOptions({ layout: 'mixed' })}
                    className="cursor-pointer"
                  />
                  <span>混合</span>
                </label>
              </div>
            </td>
          </tr>

          {/* 隨機選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium align-top">隨機</td>
            <td className="py-3">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="matchup-random"
                    checked={options.random === 'different'}
                    onChange={() => updateOptions({ random: 'different' })}
                    className="cursor-pointer"
                  />
                  <span>每次不同的佈局</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="matchup-random"
                    checked={options.random === 'same'}
                    onChange={() => updateOptions({ random: 'same' })}
                    className="cursor-pointer"
                  />
                  <span>總是相同的佈局</span>
                </label>
              </div>
            </td>
          </tr>

          {/* 遊戲結束選項 */}
          <tr className="border-b border-gray-200">
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

          {/* 每頁匹配數選項 */}
          <tr className="border-b border-gray-200">
            <td className="py-3 pr-4 font-medium">每頁匹配數</td>
            <td className="py-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="3"
                  max={Math.min(30, totalVocabulary)}
                  value={options.itemsPerPage}
                  onChange={(e) => updateOptions({ itemsPerPage: Number(e.target.value) })}
                  className="flex-1 cursor-pointer"
                />
                <span className="w-8 text-center font-semibold text-lg">{options.itemsPerPage}</span>
              </div>
            </td>
          </tr>

          {/* 標記後自動繼續選項 */}
          <tr>
            <td className="py-3 pr-4 font-medium">標記後自動繼續</td>
            <td className="py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.autoProceed}
                  onChange={(e) => updateOptions({ autoProceed: e.target.checked })}
                  className="cursor-pointer"
                />
                <span>完成當前頁後自動進入下一頁</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default MatchUpOptionsPanel;

