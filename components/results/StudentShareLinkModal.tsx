'use client';

import React, { useState } from 'react';
import {
  XMarkIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  QrCodeIcon,
  EyeIcon,
  ArrowDownTrayIcon
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

interface StudentShareLinkModalProps {
  result: AssignmentResult;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentShareLinkModal: React.FC<StudentShareLinkModalProps> = ({
  result,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

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

  // 預覽連結
  const handlePreviewLink = () => {
    window.open(shareLink, '_blank');
  };

  // 下載 QR Code
  const handleDownloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">學生分享連結</h2>
            <p className="text-sm text-gray-500 mt-1">分享此連結給學生開始遊戲</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-6 space-y-6">
          {/* 結果信息卡片 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
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
                    : 'bg-purple-600 text-white hover:bg-purple-700'
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

          {/* QR Code 區域 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                QR Code
              </label>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showQRCode ? '隱藏' : '顯示'} QR Code
              </button>
            </div>

            {showQRCode && (
              <div className="bg-white border-2 border-purple-200 rounded-lg p-6 flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={shareLink}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-600 text-center">
                  學生可以掃描此 QR Code 直接進入遊戲
                </p>
                <button
                  onClick={handleDownloadQRCode}
                  className="flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  下載 QR Code
                </button>
              </div>
            )}
          </div>

          {/* 使用說明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">📝 使用說明</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 複製連結並分享給學生</li>
              <li>• 學生點擊連結即可開始遊戲</li>
              <li>• 遊戲結果會自動記錄到此結果中</li>
              <li>• 您可以在結果詳情頁面查看所有學生的表現</li>
            </ul>
          </div>

          {/* 分享方式建議 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-purple-300 transition-colors">
              <div className="text-2xl mb-2">📧</div>
              <p className="text-xs font-medium text-gray-700">電子郵件</p>
              <p className="text-xs text-gray-500 mt-1">透過郵件發送</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-purple-300 transition-colors">
              <div className="text-2xl mb-2">💬</div>
              <p className="text-xs font-medium text-gray-700">即時通訊</p>
              <p className="text-xs text-gray-500 mt-1">Line、Teams等</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-purple-300 transition-colors">
              <div className="text-2xl mb-2">🔗</div>
              <p className="text-xs font-medium text-gray-700">學習平台</p>
              <p className="text-xs text-gray-500 mt-1">Google Classroom</p>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handlePreviewLink}
              className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="w-5 h-5 mr-2" />
              預覽遊戲
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentShareLinkModal;

