/**
 * 移動端優化布局組件
 * 提供響應式設計和移動端特定功能
 */
import React, { useState, useEffect, useRef } from 'react';
import { PWAManager } from '../../lib/mobile/PWAManager';
interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBottomNav?: boolean;
  showHeader?: boolean;
  enableSwipeGestures?: boolean;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}
export default function MobileOptimizedLayout({
  children,
  title = 'EduCreate',
  showBottomNav = true,
  showHeader = true,
  enableSwipeGestures = true,
  enablePullToRefresh = true,
  onRefresh
}: MobileOptimizedLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [pwaStatus, setPwaStatus] = useState(PWAManager.getStatus());
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);
  // 檢測移動端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // 更新 PWA 狀態
  useEffect(() => {
    const updatePWAStatus = () => {
      setPwaStatus(PWAManager.getStatus());
    };
    const interval = setInterval(updatePWAStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  // 設置下拉刷新
  useEffect(() => {
    if (!enablePullToRefresh || !isMobile) return;
    const container = containerRef.current;
    if (!container) return;
    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;
      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
        e.preventDefault();
      }
    };
    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;
      if (pullDistance > 80 && onRefresh) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
    };
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePullToRefresh, isMobile, pullDistance, onRefresh]);
  // 處理安裝提示
  const handleInstallApp = async () => {
    const success = await PWAManager.promptInstall();
    if (success) {
      setShowInstallPrompt(false);
    }
  };
  const bottomNavItems = [
    { id: 'home', label: '首頁', icon: '🏠' },
    { id: 'activities', label: '活動', icon: '🎮' },
    { id: 'progress', label: '進度', icon: '📊' },
    { id: 'profile', label: '我的', icon: '👤' }
  ];
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 頭部 */}
      {showHeader && (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* 網絡狀態指示器 */}
              <div className={`w-2 h-2 rounded-full ${
                pwaStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} title={pwaStatus.isOnline ? '在線' : '離線'}></div>
              {/* 離線隊列指示器 */}
              {pwaStatus.offlineQueueSize > 0 && (
                <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {pwaStatus.offlineQueueSize}
                </div>
              )}
              {/* 安裝按鈕 */}
              {pwaStatus.canInstall && !pwaStatus.isInstalled && (
                <button
                  onClick={() => setShowInstallPrompt(true)}
                  className="text-blue-600 hover:text-blue-800"
                  title="安裝應用"
                >
                  📱
                </button>
              )}
            </div>
          </div>
        </header>
      )}
      {/* 下拉刷新指示器 */}
      {enablePullToRefresh && isMobile && (pullDistance > 0 || isRefreshing) && (
        <div 
          className="flex items-center justify-center bg-blue-50 transition-all duration-200"
          style={{ height: Math.min(pullDistance, 80) }}
        >
          {isRefreshing ? (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">刷新中...</span>
            </div>
          ) : (
            <div className="text-blue-600 text-sm">
              {pullDistance > 80 ? '釋放刷新' : '下拉刷新'}
            </div>
          )}
        </div>
      )}
      {/* 主要內容 */}
      <main 
        ref={containerRef}
        className={`flex-1 overflow-auto ${showBottomNav && isMobile ? 'pb-16' : ''}`}
      >
        {children}
      </main>
      {/* 底部導航 (僅移動端) */}
      {showBottomNav && isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex">
            {bottomNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 py-2 px-1 text-center transition-colors ${
                  activeTab === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-xs font-medium">{item.label}</div>
              </button>
            ))}
          </div>
        </nav>
      )}
      {/* 安裝提示對話框 */}
      {showInstallPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                安裝 {title}
              </h3>
              <p className="text-gray-600 mb-6">
                將應用添加到主屏幕，獲得更好的使用體驗
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleInstallApp}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  立即安裝
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  稍後再說
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 觸覺反饋組件 */}
      <HapticFeedback />
      {/* 手勢處理組件 */}
      {enableSwipeGestures && <SwipeGestureHandler />}
    </div>
  );
}
// 觸覺反饋組件
function HapticFeedback() {
  useEffect(() => {
    // 為按鈕添加觸覺反饋
    const addHapticToButtons = () => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          // 觸覺反饋 (僅支持的設備)
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
        });
      });
    };
    addHapticToButtons();
    // 監聽動態添加的按鈕
    const observer = new MutationObserver(addHapticToButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
// 手勢處理組件
function SwipeGestureHandler() {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      // 最小滑動距離
      const minSwipeDistance = 50;
      if (absDeltaX > minSwipeDistance && absDeltaX > absDeltaY) {
        if (deltaX > 0) {
          // 向右滑動
          window.dispatchEvent(new CustomEvent('swipeRight'));
        } else {
          // 向左滑動
          window.dispatchEvent(new CustomEvent('swipeLeft'));
        }
      } else if (absDeltaY > minSwipeDistance && absDeltaY > absDeltaX) {
        if (deltaY > 0) {
          // 向下滑動
          window.dispatchEvent(new CustomEvent('swipeDown'));
        } else {
          // 向上滑動
          window.dispatchEvent(new CustomEvent('swipeUp'));
        }
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  return null;
}
// 移動端優化的卡片組件
export function MobileCard({ 
  children, 
  className = '', 
  onClick,
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
        onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : ''
      } transition-all duration-200 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
// 移動端優化的按鈕組件
export function MobileButton({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 active:scale-95 touch-manipulation';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-300',
    ghost: 'text-blue-600 hover:bg-blue-50 disabled:text-gray-300'
  };
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };
  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
// 移動端優化的輸入框組件
export function MobileInput({
  label,
  error,
  className = '',
  ...props
}: {
  label?: string;
  error?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 text-base border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          touch-manipulation
          ${error ? 'border-red-500' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
