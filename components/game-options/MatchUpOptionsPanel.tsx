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
  return (
    <div className="match-up-options-panel bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mt-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🎮 Match-up 遊戲選項
      </h3>

      <div className="space-y-6">
        {/* 計時器 */}
        <div className="option-group">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ⏱️ 計時器
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="timer"
                checked={options.timer.type === 'none'}
                onChange={() => {
                  onChange({
                    ...options,
                    timer: { ...options.timer, type: 'none' },
                  });
                }}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">無</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="timer"
                checked={options.timer.type === 'countUp'}
                onChange={() => {
                  onChange({
                    ...options,
                    timer: { ...options.timer, type: 'countUp' },
                  });
                }}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">正計時</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="timer"
                checked={options.timer.type === 'countDown'}
                onChange={() => {
                  onChange({
                    ...options,
                    timer: { ...options.timer, type: 'countDown' },
                  });
                }}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">倒計時</span>
            </label>
            {options.timer.type === 'countDown' && (
              <div className="ml-6 mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={options.timer.minutes || 5}
                  onChange={(e) => {
                    onChange({
                      ...options,
                      timer: {
                        ...options.timer,
                        minutes: parseInt(e.target.value, 10),
                      },
                    });
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-600">分</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={options.timer.seconds || 0}
                  onChange={(e) => {
                    onChange({
                      ...options,
                      timer: {
                        ...options.timer,
                        seconds: parseInt(e.target.value, 10),
                      },
                    });
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-600">秒</span>
              </div>
            )}
          </div>
        </div>

        {/* 佈局 */}
        <div className="option-group">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            📐 佈局
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="layout"
                checked={options.layout === 'separated'}
                onChange={() => {
                  onChange({
                    ...options,
                    layout: 'separated',
                  });
                }}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">分離（左右）</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="layout"
                checked={options.layout === 'mixed'}
                onChange={() => {
                  onChange({
                    ...options,
                    layout: 'mixed',
                  });
                }}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">混合</span>
            </label>
          </div>
        </div>

        {/* 隨機的 */}
        <div className="option-group">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            🎲 隨機的
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="random"
                checked={options.random === 'different'}
                onChange={() => {
                  onChange({
                    ...options,
                    random: 'different',
                  });
                }}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">每次不同的佈局</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="random"
                checked={options.random === 'same'}
                onChange={() => {
                  onChange({
                    ...options,
                    random: 'same',
                  });
                }}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700">總是相同的佈局</span>
            </label>
          </div>
        </div>

        {/* 遊戲結束 */}
        <div className="option-group">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.showAnswers}
              onChange={(e) => {
                onChange({
                  ...options,
                  showAnswers: e.target.checked,
                });
              }}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">
                📝 遊戲結束時顯示答案
              </div>
            </div>
          </label>
        </div>

        {/* 每頁匹配數滑桿 */}
        <div className="option-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📄 每頁匹配數
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="3"
              max={Math.min(30, totalVocabulary)}
              value={options.itemsPerPage}
              onChange={(e) => {
                const newValue = parseInt(e.target.value, 10);
                onChange({
                  ...options,
                  itemsPerPage: newValue,
                });
              }}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((options.itemsPerPage - 3) / (Math.min(30, totalVocabulary) - 3)) * 100}%, #e5e7eb ${((options.itemsPerPage - 3) / (Math.min(30, totalVocabulary) - 3)) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600 min-w-[3rem] text-center">
                {options.itemsPerPage}
              </span>
              <span className="text-sm text-gray-500">
                / {totalVocabulary}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {options.itemsPerPage === totalVocabulary
              ? '顯示全部詞彙（不分頁）'
              : `每頁顯示 ${options.itemsPerPage} 個配對，共 ${Math.ceil(totalVocabulary / options.itemsPerPage)} 頁`}
          </div>
        </div>

        {/* 標記後自動繼續 */}
        <div className="option-group">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.autoProceed}
              onChange={(e) => {
                onChange({
                  ...options,
                  autoProceed: e.target.checked,
                });
              }}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <div>
              <div className="text-sm font-medium text-gray-700">
                ⏭️ 標記後自動繼續
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {options.autoProceed
                  ? '完成當前頁後自動進入下一頁'
                  : '完成當前頁後需要手動點擊「下一頁」按鈕'}
              </div>
            </div>
          </label>
        </div>

        {/* 選項說明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-lg flex-shrink-0">ℹ️</span>
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">選項說明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>計時器</strong>：選擇無計時、正計時或倒計時。倒計時可設定時間限制。
                </li>
                <li>
                  <strong>佈局</strong>：分離模式將英文和中文分別放在左右兩側；混合模式將所有卡片混合顯示。
                </li>
                <li>
                  <strong>隨機的</strong>：每次不同會隨機排列卡片；總是相同會保持固定順序。
                </li>
                <li>
                  <strong>遊戲結束</strong>：開啟後，遊戲結束時會顯示所有正確答案。
                </li>
                <li>
                  <strong>每頁匹配數</strong>：控制每頁顯示多少個詞彙配對。
                  設置為最大值時將顯示所有詞彙（不分頁）。
                </li>
                <li>
                  <strong>標記後自動繼續</strong>：開啟後，完成當前頁的所有配對會自動進入下一頁。
                  關閉後需要手動點擊「下一頁」按鈕。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchUpOptionsPanel;

