import React, { useState, useEffect, useRef } from 'react';

// 移動端檢測 Hook
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

// 觸摸手勢 Hook
export const useSwipeGesture = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (swipeDistance < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// 移動端導航組件
interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  items: Array<{ label: string; href: string; icon: string }>;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onToggle, items }) => {
  return (
    <>
      {/* 漢堡菜單按鈕 */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
        aria-label="切換菜單"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`} />
        </div>
      </button>

      {/* 側邊菜單 */}
      <div className={`fixed inset-y-0 right-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 pt-16">
          <nav className="space-y-4">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={onToggle}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-gray-900">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* 背景遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={onToggle}
        />
      )}
    </>
  );
};

// 移動端卡片組件
interface MobileCardProps {
  title: string;
  description: string;
  icon: string;
  action?: () => void;
  children?: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({ title, description, icon, action, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
          {action && (
            <button
              onClick={action}
              className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              開始使用
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 移動端底部導航
interface MobileBottomNavProps {
  items: Array<{ label: string; icon: string; active?: boolean; onClick: () => void }>;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ items }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
      <div className="flex justify-around">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              item.active 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// 移動端模態框
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const MobileModal: React.FC<MobileModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="inline-block w-full max-w-lg transform overflow-hidden rounded-t-xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle sm:rounded-xl">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 移動端輸入組件
interface MobileInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  required?: boolean;
}

export const MobileInput: React.FC<MobileInputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  required = false 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        style={{ fontSize: '16px' }} // 防止 iOS 縮放
      />
    </div>
  );
};

// 移動端選擇器
interface MobileSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}

export const MobileSelect: React.FC<MobileSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  required = false 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
        style={{ fontSize: '16px' }} // 防止 iOS 縮放
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// 移動端按鈕
interface MobileButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:border-gray-300 disabled:text-gray-300'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`}
    >
      {children}
    </button>
  );
};

// 移動端加載指示器
export const MobileLoader: React.FC<{ text?: string }> = ({ text = '載入中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
};

// 移動端吐司通知
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export const MobileToast: React.FC<ToastProps> = ({ message, type = 'info', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg ${typeClasses[type]} flex items-center space-x-2`}>
      <span>{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white opacity-70 hover:opacity-100">
        ×
      </button>
    </div>
  );
};

// 移動端優化的記憶增強系統組件
export const MobileMemoryEnhancement: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('analysis');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'analysis', label: '分析', icon: '🧠' },
    { id: 'recommendations', label: '推薦', icon: '💡' },
    { id: 'progress', label: '進度', icon: '📊' },
    { id: 'settings', label: '設置', icon: '⚙️' }
  ];

  const navItems = [
    { label: '首頁', href: '/', icon: '🏠' },
    { label: '遊戲', href: '/games-showcase', icon: '🎮' },
    { label: '創建', href: '/unified-content-manager.html', icon: '➕' },
    { label: '排行榜', href: '/leaderboard', icon: '🏆' }
  ];

  if (!isMobile) {
    return null; // 非移動端不顯示
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 移動端導航 */}
      <MobileNav 
        isOpen={isMenuOpen} 
        onToggle={() => setIsMenuOpen(!isMenuOpen)} 
        items={navItems}
      />

      {/* 主要內容 */}
      <div className="p-4 pt-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">記憶增強系統</h1>
        
        {/* 標籤內容 */}
        <div className="space-y-4">
          {activeTab === 'analysis' && (
            <MobileCard
              title="記憶類型分析"
              description="分析您的學習模式和記憶類型"
              icon="🧠"
              action={() => console.log('開始分析')}
            />
          )}
          
          {activeTab === 'recommendations' && (
            <MobileCard
              title="個性化推薦"
              description="基於您的學習習慣提供個性化建議"
              icon="💡"
              action={() => console.log('查看推薦')}
            />
          )}
          
          {activeTab === 'progress' && (
            <MobileCard
              title="學習進度"
              description="追蹤您的學習進度和成就"
              icon="📊"
              action={() => console.log('查看進度')}
            />
          )}
          
          {activeTab === 'settings' && (
            <MobileCard
              title="系統設置"
              description="自定義您的學習體驗"
              icon="⚙️"
              action={() => console.log('打開設置')}
            />
          )}
        </div>
      </div>

      {/* 底部導航 */}
      <MobileBottomNav
        items={tabs.map(tab => ({
          label: tab.label,
          icon: tab.icon,
          active: activeTab === tab.id,
          onClick: () => setActiveTab(tab.id)
        }))}
      />
    </div>
  );
};
