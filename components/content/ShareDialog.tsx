/**
 * 分享對話框組件
 * 提供完整的分享和嵌入功能界面
 */

import React, { useState, useEffect } from 'react';
import { 
  SharingManager, 
  ShareSettings, 
  EmbedOptions, 
  SocialShareOptions 
} from '../../lib/content/SharingManager';

interface ShareDialogProps {
  activityId: string;
  activityTitle: string;
  activityDescription?: string;
  onClose: () => void;
  existingShare?: ShareSettings;
}

export const ShareDialog = ({
  activityId,
  activityTitle,
  activityDescription,
  onClose,
  existingShare
}: ShareDialogProps) => {
  const [activeTab, setActiveTab] = useState<'link' | 'embed' | 'social' | 'settings'>('link');
  const [shareSettings, setShareSettings] = useState<ShareSettings | null>(existingShare || null);
  const [embedOptions, setEmbedOptions] = useState<EmbedOptions>({
    width: '100%',
    height: '600px',
    responsive: true,
    autoResize: true,
    showTitle: true,
    showDescription: false,
    showBranding: true,
    theme: 'auto'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string>('');

  const tabs = [
    { id: 'link', name: '分享鏈接', icon: '🔗' },
    { id: 'embed', name: '嵌入代碼', icon: '📋' },
    { id: 'social', name: '社交分享', icon: '📱' },
    { id: 'settings', name: '分享設置', icon: '⚙️' }
  ];

  const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-sky-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-green-500' },
    { id: 'email', name: 'Email', icon: '📧', color: 'bg-gray-600' }
  ];

  // 創建或更新分享
  const createShare = async () => {
    if (shareSettings) return;

    setIsCreating(true);
    try {
      const newShare = await SharingManager.createShare(
        activityId,
        {
          isPublic: true,
          allowCopy: false,
          allowEdit: false,
          allowComments: false,
          customization: {
            showBranding: true,
            customTitle: activityTitle,
            customDescription: activityDescription,
            autoStart: false,
            showResults: true,
            allowRestart: true
          }
        },
        'demo-user'
      );
      setShareSettings(newShare);
    } catch (error) {
      console.error('創建分享失敗:', error);
      alert('創建分享失敗，請重試');
    } finally {
      setIsCreating(false);
    }
  };

  // 複製到剪貼板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('複製失敗:', error);
    }
  };

  // 生成嵌入代碼
  const generateEmbedCode = () => {
    if (!shareSettings) return '';
    return SharingManager.generateEmbedCode(
      shareSettings.shareCode,
      embedOptions.showBranding,
      embedOptions
    );
  };

  // 社交分享
  const handleSocialShare = (platform: string) => {
    if (!shareSettings) return;

    const options: SocialShareOptions = {
      platform: platform as any,
      title: activityTitle,
      description: activityDescription,
      hashtags: ['教育遊戲', 'EduCreate', '互動學習']
    };

    const shareUrl = SharingManager.generateSocialShareUrl(shareSettings.shareUrl, options);
    
    if (platform === 'copy') {
      copyToClipboard(shareSettings.shareUrl, 'social');
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // 初始化時創建分享
  useEffect(() => {
    if (!existingShare) {
      createShare();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 頭部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">分享活動</h2>
            <p className="text-gray-600 mt-1">{activityTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 標籤導航 */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* 主要內容 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isCreating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">正在創建分享鏈接...</p>
            </div>
          ) : !shareSettings ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔗</div>
              <p className="text-gray-600">無法創建分享鏈接</p>
              <button
                onClick={createShare}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                重試
              </button>
            </div>
          ) : (
            <>
              {/* 分享鏈接標籤 */}
              {activeTab === 'link' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">公開分享鏈接</h3>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={shareSettings.shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                      <button
                        onClick={() => copyToClipboard(shareSettings.shareUrl, 'link')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {copySuccess === 'link' ? '已複製!' : '複製'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      任何人都可以通過此鏈接訪問您的活動
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">分享統計</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{shareSettings.analytics.totalViews}</div>
                        <div className="text-blue-700">總瀏覽量</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{shareSettings.analytics.completions}</div>
                        <div className="text-green-700">完成次數</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {shareSettings.analytics.averageScore.toFixed(1)}
                        </div>
                        <div className="text-purple-700">平均分數</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(shareSettings.analytics.averageTime)}s
                        </div>
                        <div className="text-orange-700">平均時間</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 嵌入代碼標籤 */}
              {activeTab === 'embed' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">嵌入代碼</h3>
                    <p className="text-gray-600 mb-4">將此代碼複製到您的網站中以嵌入活動</p>
                  </div>

                  {/* 嵌入選項 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">寬度</label>
                      <input
                        type="text"
                        value={embedOptions.width}
                        onChange={(e) => setEmbedOptions(prev => ({ ...prev, width: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">高度</label>
                      <input
                        type="text"
                        value={embedOptions.height}
                        onChange={(e) => setEmbedOptions(prev => ({ ...prev, height: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={embedOptions.responsive}
                        onChange={(e) => setEmbedOptions(prev => ({ ...prev, responsive: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">響應式</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={embedOptions.showTitle}
                        onChange={(e) => setEmbedOptions(prev => ({ ...prev, showTitle: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">顯示標題</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={embedOptions.showBranding}
                        onChange={(e) => setEmbedOptions(prev => ({ ...prev, showBranding: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">顯示品牌</span>
                    </label>
                  </div>

                  {/* 嵌入代碼 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">嵌入代碼</label>
                      <button
                        onClick={() => copyToClipboard(generateEmbedCode(), 'embed')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {copySuccess === 'embed' ? '已複製!' : '複製代碼'}
                      </button>
                    </div>
                    <textarea
                      value={generateEmbedCode()}
                      readOnly
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {/* 社交分享標籤 */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">社交媒體分享</h3>
                    <p className="text-gray-600 mb-4">在社交媒體平台上分享您的活動</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialPlatforms.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => handleSocialShare(platform.id)}
                        className={`flex items-center p-4 rounded-lg text-white hover:opacity-90 transition-opacity ${platform.color}`}
                      >
                        <span className="text-2xl mr-3">{platform.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">分享到 {platform.name}</div>
                          <div className="text-sm opacity-90">在 {platform.name} 上分享此活動</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">直接複製鏈接</h4>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={shareSettings.shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                      />
                      <button
                        onClick={() => handleSocialShare('copy')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {copySuccess === 'social' ? '已複製!' : '複製'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 分享設置標籤 */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">分享設置</h3>
                    <p className="text-gray-600 mb-4">配置分享的權限和限制</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">公開分享</h4>
                        <p className="text-sm text-gray-600">允許任何人通過鏈接訪問</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={shareSettings.isPublic}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        readOnly
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">允許複製</h4>
                        <p className="text-sm text-gray-600">允許其他人複製此活動</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={shareSettings.allowCopy}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        readOnly
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">允許編輯</h4>
                        <p className="text-sm text-gray-600">允許其他人編輯此活動</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={shareSettings.allowEdit}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        readOnly
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">允許評論</h4>
                        <p className="text-sm text-gray-600">允許其他人對此活動發表評論</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={shareSettings.allowComments}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ 注意</h4>
                    <p className="text-sm text-yellow-700">
                      分享設置的修改功能將在後續版本中提供。目前顯示的是默認設置。
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {shareSettings && (
              <span>分享代碼: {shareSettings.shareCode}</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              關閉
            </button>
            {shareSettings && (
              <button
                onClick={() => window.open(shareSettings.shareUrl, '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                預覽分享
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
