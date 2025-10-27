'use client';

import React from 'react';

export interface MatchUpOptions {
  itemsPerPage: number;  // 每頁顯示的詞彙數量 (3-30)
  autoProceed: boolean;  // 標記後自動繼續
}

export const DEFAULT_MATCH_UP_OPTIONS: MatchUpOptions = {
  itemsPerPage: 7,
  autoProceed: true,
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

