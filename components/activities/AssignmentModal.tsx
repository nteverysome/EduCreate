'use client';

import React, { useState } from 'react';
import { X, ArrowLeft, Play } from 'lucide-react';
import { Activity } from '@/types/activity';

interface AssignmentModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onStartAssignment: (assignmentConfig: AssignmentConfig) => void;
}

export interface AssignmentConfig {
  resultTitle: string;
  registrationType: 'name' | 'anonymous' | 'google-classroom';
  hasDeadline: boolean;
  deadlineTime?: string;
  deadlineDate?: string;
  showAnswers: boolean;
  showLeaderboard: boolean;
  allowRestart: boolean;
}

export default function AssignmentModal({ 
  activity, 
  isOpen, 
  onClose, 
  onStartAssignment 
}: AssignmentModalProps) {
  const [config, setConfig] = useState<AssignmentConfig>({
    resultTitle: `"${activity.title}"的結果`,
    registrationType: 'name',
    hasDeadline: false,
    deadlineTime: '09:00',
    deadlineDate: '',
    showAnswers: true,
    showLeaderboard: false,
    allowRestart: true,
  });

  const handleStartAssignment = () => {
    onStartAssignment(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">課業設置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 結果標題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結果標題
            </label>
            <input
              type="text"
              value={config.resultTitle}
              onChange={(e) => setConfig({ ...config, resultTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 註冊選項 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              註冊
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="registration"
                  value="name"
                  checked={config.registrationType === 'name'}
                  onChange={(e) => setConfig({ ...config, registrationType: e.target.value as 'name' })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">輸入名稱</div>
                  <div className="text-sm text-gray-500">學生必須在開始之前輸入姓名。</div>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="registration"
                  value="anonymous"
                  checked={config.registrationType === 'anonymous'}
                  onChange={(e) => setConfig({ ...config, registrationType: e.target.value as 'anonymous' })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">匿名</div>
                  <div className="text-sm text-gray-500">無需註冊或命名 - 只需播放它。</div>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="registration"
                  value="google-classroom"
                  checked={config.registrationType === 'google-classroom'}
                  onChange={(e) => setConfig({ ...config, registrationType: e.target.value as 'google-classroom' })}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Google課堂</div>
                  <div className="text-sm text-gray-500">在Google課堂上分享此活動</div>
                </div>
              </label>
            </div>
          </div>

          {/* 最後期限 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              最後期限
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="deadline"
                  checked={!config.hasDeadline}
                  onChange={() => setConfig({ ...config, hasDeadline: false })}
                />
                <span>沒有</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="deadline"
                  checked={config.hasDeadline}
                  onChange={() => setConfig({ ...config, hasDeadline: true })}
                />
                <select
                  value={config.deadlineTime}
                  onChange={(e) => setConfig({ ...config, deadlineTime: e.target.value })}
                  disabled={!config.hasDeadline}
                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                  <option value="23:59">23:59</option>
                </select>
                <input
                  type="date"
                  value={config.deadlineDate}
                  onChange={(e) => setConfig({ ...config, deadlineDate: e.target.value })}
                  disabled={!config.hasDeadline}
                  className="px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* 遊戲結束選項 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              遊戲結束
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showAnswers}
                  onChange={(e) => setConfig({ ...config, showAnswers: e.target.checked })}
                />
                <span>顯示答案</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showLeaderboard}
                  onChange={(e) => setConfig({ ...config, showLeaderboard: e.target.checked })}
                />
                <span>排行榜</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.allowRestart}
                  onChange={(e) => setConfig({ ...config, allowRestart: e.target.checked })}
                />
                <span>重新開始</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <button
            onClick={handleStartAssignment}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            開始
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
