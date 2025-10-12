'use client';

import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  ClipboardDocumentIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface AssignmentSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentTitle: string;
  shareUrl: string;
  onGoToResults: () => void;
}

export default function AssignmentSetModal({
  isOpen,
  onClose,
  assignmentTitle,
  shareUrl,
  onGoToResults
}: AssignmentSetModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleShareToPinterest = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(assignmentTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareToGoogleClassroom = () => {
    const url = `https://classroom.google.com/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleComplete = () => {
    onGoToResults();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="p-6">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            課業集
          </h1>

          {/* Success indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-8 h-8 mr-3" />
              <h2 className="text-xl font-semibold">全部完成</h2>
            </div>
          </div>

          {/* Share URL section */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              向學生提供以下連結:
            </p>
            <div className="flex items-center border border-gray-300 rounded-md">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border-0 rounded-l-md focus:outline-none"
              />
              <button
                onClick={handleCopyUrl}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-r-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                {copied ? '已複製' : '複製'}
              </button>
            </div>
          </div>

          {/* Social sharing section */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">分享或嵌入:</p>
            <div className="flex items-center space-x-3">
              {/* Pinterest */}
              <button
                onClick={handleShareToPinterest}
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                title="分享到 Pinterest"
              >
                <span className="text-white text-sm font-bold">P</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleShareToFacebook}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                title="在臉書上分享"
              >
                <span className="text-white text-sm font-bold">f</span>
              </button>

              {/* Google Classroom */}
              <button
                onClick={handleShareToGoogleClassroom}
                className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                title="在谷歌課堂上分享"
              >
                <span className="text-white text-sm font-bold">G</span>
              </button>

              {/* QR Code placeholder */}
              <button
                className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                title="QR 代碼"
              >
                <span className="text-white text-xs">QR</span>
              </button>

              {/* Embed placeholder */}
              <button
                className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
                title="嵌入"
              >
                <span className="text-white text-xs">&lt;/&gt;</span>
              </button>

              {/* Email placeholder */}
              <button
                className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors"
                title="電子郵件"
              >
                <span className="text-white text-sm">@</span>
              </button>
            </div>
          </div>

          {/* Results notification */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              已將項目添加到{' '}
              <button
                onClick={onGoToResults}
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                我的結果
              </button>
              {' '}中
            </p>
          </div>

          {/* Complete button */}
          <div className="flex justify-center">
            <button
              onClick={handleComplete}
              className="px-8 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
