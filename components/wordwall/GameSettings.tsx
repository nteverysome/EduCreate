/**
 * WordWall 風格遊戲設置組件
 * 模仿 WordWall 的遊戲配置界面
 */

'use client';

import React from 'react';
import { GameSettings } from '@/lib/wordwall/TemplateManager';

interface GameSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  templateType?: string;
}

export const GameSettingsPanel: React.FC<GameSettingsProps> = ({
  settings,
  onSettingsChange,
  templateType
}) => {
  const handleChange = (key: keyof GameSettings, value: any) => {
    onSettingsChange({ [key]: value });
  };

  return (
    <div className="game-settings bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">遊戲選項</h3>
      
      <div className="space-y-6">
        {/* 計時器設置 */}
        <div className="setting-group">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            計時器
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="timerType"
                value="NONE"
                checked={settings.timerType === 'NONE'}
                onChange={(e) => handleChange('timerType', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">無</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="timerType"
                value="COUNT_UP"
                checked={settings.timerType === 'COUNT_UP'}
                onChange={(e) => handleChange('timerType', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">計時</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="timerType"
                value="COUNT_DOWN"
                checked={settings.timerType === 'COUNT_DOWN'}
                onChange={(e) => handleChange('timerType', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">倒計時</span>
            </label>
          </div>
          
          {settings.timerType === 'COUNT_DOWN' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                倒計時時間（秒）
              </label>
              <input
                type="number"
                min="10"
                max="600"
                value={settings.timerDuration || 60}
                onChange={(e) => handleChange('timerDuration', parseInt(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* 生命值設置 */}
        <div className="setting-group">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            生命值
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="10"
              value={settings.livesCount}
              onChange={(e) => handleChange('livesCount', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-700 w-16">
              {settings.livesCount === 0 ? '無限' : settings.livesCount}
            </span>
          </div>
        </div>

        {/* 隨機化選項 */}
        <div className="setting-group">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            隨機
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.shuffleQuestions}
                onChange={(e) => handleChange('shuffleQuestions', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">打亂問題順序</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.shuffleAnswers}
                onChange={(e) => handleChange('shuffleAnswers', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">打亂答案順序</span>
            </label>
          </div>
        </div>

        {/* 自動進行 */}
        <div className="setting-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.autoProceed}
              onChange={(e) => handleChange('autoProceed', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">自動進行下一題</span>
          </label>
        </div>

        {/* 遊戲結束選項 */}
        <div className="setting-group">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.showAnswers}
              onChange={(e) => handleChange('showAnswers', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">遊戲結束時顯示答案</span>
          </label>
        </div>

        {/* 答案標籤 */}
        <div className="setting-group">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            答案字母
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="answerLabels"
                value="ABC"
                checked={settings.answerLabels === 'ABC'}
                onChange={(e) => handleChange('answerLabels', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">A, B, C</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="answerLabels"
                value="NUMBERS"
                checked={settings.answerLabels === 'NUMBERS'}
                onChange={(e) => handleChange('answerLabels', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">1, 2, 3</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="answerLabels"
                value="NONE"
                checked={settings.answerLabels === 'NONE'}
                onChange={(e) => handleChange('answerLabels', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">無</span>
            </label>
          </div>
        </div>

        {/* 音效和動畫 */}
        <div className="setting-group">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            效果
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableSounds}
                onChange={(e) => handleChange('enableSounds', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">啟用音效</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableAnimations}
                onChange={(e) => handleChange('enableAnimations', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">啟用動畫</span>
            </label>
          </div>
        </div>

        {/* 高級選項 */}
        <div className="setting-group">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            高級選項
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowRetry}
                onChange={(e) => handleChange('allowRetry', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">允許重試</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showProgress}
                onChange={(e) => handleChange('showProgress', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">顯示進度</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showScore}
                onChange={(e) => handleChange('showScore', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">顯示分數</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
