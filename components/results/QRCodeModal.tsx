'use client';

import React, { useState } from 'react';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  assignmentId: string;
  activityId: string;
}

interface QRCodeModalProps {
  result: AssignmentResult;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  result,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  // 生成學生分享連結
  const getStudentShareLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/play/${result.activityId}/${result.assignmentId}`;
  };

  const shareLink = getStudentShareLink();

  // 複製連結到剪貼板
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('複製失敗:', error);
      // 降級方案
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 下載 QR Code
  const handleDownloadQRCode = () => {
    const svg = document.getElementById('qr-code-modal-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-${result.title}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <span className="text-xl sm:text-2xl mr-2">📱</span>
              QR Code
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">掃描 QR Code 直接進入遊戲</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* 結果信息卡片 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-3xl">🎮</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {result.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  活動：{result.activityName}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <span className="mr-1">👥</span>
                    {result.participantCount} 位參與者
                  </span>
                  <span className={`px-2 py-1 rounded-full ${
                    result.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : result.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {result.status === 'active' ? '進行中' : 
                     result.status === 'completed' ? '已完成' : '已過期'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code 顯示區域 */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl p-4 sm:p-8 flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
              <QRCodeSVG
                id="qr-code-modal-svg"
                value={shareLink}
                size={window.innerWidth < 640 ? 180 : 240}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-700">
                📱 使用手機掃描此 QR Code
              </p>
              <p className="text-xs text-gray-500">
                學生可以直接進入遊戲，無需輸入連結
              </p>
            </div>
          </div>

          {/* 連結顯示區域 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              遊戲連結
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
                <LinkIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
              </div>
              <button
                onClick={handleCopyLink}
                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-5 h-5 mr-2" />
                    已複製
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-5 h-5 mr-2" />
                    複製
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 flex items-center">
                <CheckIcon className="w-4 h-4 mr-1" />
                連結已複製到剪貼板！
              </p>
            )}
          </div>

          {/* 使用場景 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2 sm:mb-3 flex items-center">
              <span className="mr-2">💡</span>
              使用場景
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                <div className="text-lg sm:text-xl mb-1">📺</div>
                <p className="text-xs font-medium text-gray-700">課堂投影</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">投影到大屏幕讓學生掃描</p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                <div className="text-lg sm:text-xl mb-1">🖨️</div>
                <p className="text-xs font-medium text-gray-700">打印分發</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">下載後打印到作業單</p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                <div className="text-lg sm:text-xl mb-1">💬</div>
                <p className="text-xs font-medium text-gray-700">線上分享</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">通過通訊軟件發送</p>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                <div className="text-lg sm:text-xl mb-1">🏫</div>
                <p className="text-xs font-medium text-gray-700">學習平台</p>
                <p className="text-xs text-gray-500 mt-1 hidden sm:block">上傳到 Classroom</p>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
            <button
              onClick={handleDownloadQRCode}
              className="flex-1 flex items-center justify-center px-4 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              下載 QR Code
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

