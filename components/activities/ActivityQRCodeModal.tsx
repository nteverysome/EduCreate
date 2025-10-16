'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, QrCode as QrCodeIcon } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  gameType: string;
  shareToken?: string;
}

interface ActivityQRCodeModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityQRCodeModal({ 
  activity, 
  isOpen, 
  onClose 
}: ActivityQRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const shareUrl = activity.shareToken
    ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app'}/share/${activity.id}/${activity.shareToken}`
    : '';

  // 生成 QR Code
  useEffect(() => {
    if (isOpen && shareUrl && !qrCodeDataUrl) {
      generateQRCode();
    }
  }, [isOpen, shareUrl]);

  const generateQRCode = async () => {
    if (!shareUrl) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: shareUrl,
          size: 256,
          format: 'png'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodeDataUrl(data.qrCodeDataUrl);
      } else {
        console.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `${activity.title}-QRCode.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  if (!activity.shareToken) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">📱 QR Code</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <QrCodeIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-4">此活動尚未開啟社區分享</p>
            <p className="text-sm text-gray-500">請先開啟社區分享功能才能生成 QR Code</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">📱 QR Code</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* 活動信息 */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {activity.title}
            </h3>
            <p className="text-sm text-gray-500">{activity.gameType}</p>
          </div>

          {/* QR Code 顯示 */}
          <div className="flex justify-center mb-6">
            {isLoading ? (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="w-56 h-56"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCodeIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* URL 顯示 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              遊戲連結
            </label>
            <div className="flex gap-2">
              <input 
                value={shareUrl}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
              />
              <button 
                onClick={copyToClipboard}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {copied ? '已複製' : '複製'}
                </span>
              </button>
            </div>
          </div>

          {/* 使用說明 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-2">📖 使用方式</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 📱 用手機掃描 QR Code 立即開始遊戲</li>
              <li>• 🖨️ 可下載 QR Code 圖片用於打印</li>
              <li>• 📺 適合投影到課堂螢幕讓學生掃描</li>
              <li>• 🎯 無需註冊，掃描即玩</li>
            </ul>
          </div>

          {/* 操作按鈕 */}
          {qrCodeDataUrl && (
            <div className="flex gap-3">
              <button
                onClick={downloadQRCode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                下載 QR Code
              </button>
              
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '已複製連結' : '複製連結'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
