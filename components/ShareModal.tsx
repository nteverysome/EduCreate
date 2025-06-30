import React, { useState, useEffect } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
  gameType: string;
}

export default function ShareModal({ isOpen, onClose, gameId, gameTitle, gameType }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState<'url' | 'embed' | null>(null);
  const [shareStats, setShareStats] = useState({
    views: 0,
    plays: 0,
    shares: 0
  });

  useEffect(() => {
    if (isOpen) {
      generateShareContent();
      loadShareStats();
    }
  }, [isOpen, gameId]);

  const generateShareContent = () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/play/${gameId}`;
    setShareUrl(url);

    const embed = `<iframe 
  src="${url}?embed=true" 
  width="800" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>`;
    setEmbedCode(embed);
  };

  const loadShareStats = () => {
    // 從 localStorage 獲取分享統計（演示用）
    const stats = localStorage.getItem(`share_stats_${gameId}`);
    if (stats) {
      setShareStats(JSON.parse(stats));
    } else {
      // 生成演示數據
      const demoStats = {
        views: Math.floor(Math.random() * 1000) + 50,
        plays: Math.floor(Math.random() * 500) + 20,
        shares: Math.floor(Math.random() * 100) + 5
      };
      setShareStats(demoStats);
      localStorage.setItem(`share_stats_${gameId}`, JSON.stringify(demoStats));
    }
  };

  const copyToClipboard = async (text: string, type: 'url' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `查看這個有趣的 ${gameType} 遊戲：${gameTitle}`;
    const url = shareUrl;
    
    let shareUrl_social = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl_social = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl_social = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl_social = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl_social = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }
    
    if (shareUrl_social) {
      window.open(shareUrl_social, '_blank', 'width=600,height=400');
      
      // 更新分享統計
      const newStats = { ...shareStats, shares: shareStats.shares + 1 };
      setShareStats(newStats);
      localStorage.setItem(`share_stats_${gameId}`, JSON.stringify(newStats));
    }
  };

  const togglePublic = () => {
    setIsPublic(!isPublic);
    // 這裡可以調用 API 更新遊戲的公開狀態
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">分享遊戲</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Game Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900">{gameTitle}</h3>
            <p className="text-gray-600 text-sm">遊戲類型: {gameType}</p>
          </div>

          {/* Public Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">公開遊戲</h4>
                <p className="text-sm text-gray-600">允許其他人發現和遊玩這個遊戲</p>
              </div>
              <button
                onClick={togglePublic}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Share URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分享連結
            </label>
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyToClipboard(shareUrl, 'url')}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 text-sm"
              >
                {copied === 'url' ? '已複製!' : '複製'}
              </button>
            </div>
          </div>

          {/* Social Share */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              分享到社交媒體
            </label>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span className="text-xl">📘</span>
              </button>
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center justify-center p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
              >
                <span className="text-xl">🐦</span>
              </button>
              <button
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center justify-center p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
              >
                <span className="text-xl">💼</span>
              </button>
              <button
                onClick={() => shareToSocial('whatsapp')}
                className="flex items-center justify-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <span className="text-xl">💬</span>
              </button>
            </div>
          </div>

          {/* Embed Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              嵌入代碼
            </label>
            <div className="relative">
              <textarea
                value={embedCode}
                readOnly
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(embedCode, 'embed')}
                className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                {copied === 'embed' ? '已複製!' : '複製'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              將此代碼貼到您的網站或部落格中以嵌入遊戲
            </p>
          </div>

          {/* Share Statistics */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">分享統計</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{shareStats.views}</div>
                <div className="text-xs text-gray-600">瀏覽次數</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{shareStats.plays}</div>
                <div className="text-xs text-gray-600">遊戲次數</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{shareStats.shares}</div>
                <div className="text-xs text-gray-600">分享次數</div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">QR 碼</h4>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">QR 碼</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  掃描 QR 碼在手機上快速開啟遊戲
                </p>
                <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
                  下載 QR 碼
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              關閉
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              查看分享頁面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
