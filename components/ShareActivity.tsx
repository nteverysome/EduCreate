import { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface ShareActivityProps {
  activityId: string;
  activityTitle: string;
  onClose: () => void;
}

export default function ShareActivity({ activityId, activityTitle, onClose }: ShareActivityProps) {
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  
  // 生成分享鏈接
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/activity/${activityId}` 
    : `/activity/${activityId}`;
  
  // 複製鏈接到剪貼板
  const handleCopyLink = () => {
    if (linkInputRef.current) {
      linkInputRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      toast.success('鏈接已複製到剪貼板');
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // 分享到社交媒體
  const handleShareToSocial = (platform: string) => {
    let shareLink = '';
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(`來看看我在 EduCreate 創建的「${activityTitle}」活動！`);
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'wechat':
        setShowQRCode(true);
        return;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">分享活動</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">分享鏈接</label>
          <div className="flex">
            <input
              ref={linkInputRef}
              type="text"
              value={shareUrl}
              readOnly
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-r-md ${copied ? 'bg-green-500' : 'bg-indigo-600'} text-white`}
            >
              {copied ? '已複製' : '複製'}
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">分享到社交媒體</label>
          <div className="flex space-x-4">
            <button 
              onClick={() => handleShareToSocial('facebook')}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              aria-label="分享到 Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </button>
            <button 
              onClick={() => handleShareToSocial('twitter')}
              className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500"
              aria-label="分享到 Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </button>
            <button 
              onClick={() => handleShareToSocial('linkedin')}
              className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
              aria-label="分享到 LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
            <button 
              onClick={() => handleShareToSocial('wechat')}
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
              aria-label="分享到微信"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 00.197-.066l2.256-1.294a.599.599 0 01.495-.05c.907.26 1.887.402 2.902.402 4.801 0 8.691-3.289 8.691-7.342 0-4.055-3.89-7.343-8.691-7.343zM5.85 7.05c.602 0 1.029.422 1.029.989 0 .566-.427.989-1.029.989-.601 0-1.028-.423-1.028-.989 0-.567.427-.989 1.028-.989zm5.486 0c.602 0 1.028.422 1.028.989 0 .566-.426.989-1.028.989-.602 0-1.028-.423-1.028-.989 0-.567.426-.989 1.028-.989zm12.585 5.568c0-3.328-3.334-6.094-7.434-6.094-4.1 0-7.435 2.766-7.435 6.094 0 3.327 3.335 6.093 7.435 6.093.852 0 1.667-.122 2.418-.34a.488.488 0 01.404.042l1.865 1.088a.268.268 0 00.161.054c.132 0 .24-.108.24-.246 0-.06-.023-.118-.039-.176l-.324-1.224a.494.494 0 01.175-.55c1.514-1.103 2.535-2.727 2.535-4.741zm-9.905-1.564c-.501 0-.904-.352-.904-.823 0-.47.403-.823.904-.823s.904.352.904.823c0 .471-.403.823-.904.823zm4.94 0c-.501 0-.904-.352-.904-.823 0-.47.403-.823.904-.823s.904.352.904.823c0 .471-.403.823-.904.823z" />
              </svg>
            </button>
          </div>
        </div>
        
        {showQRCode && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">掃描二維碼分享到微信</p>
            <div className="inline-block p-2 bg-white border rounded-md">
              <Image 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`} 
                alt="QR Code" 
                width={128}
                height={128}
                className="w-32 h-32"
              />
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}