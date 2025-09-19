// 簡單的圖標組件，替代 lucide-react 以減少依賴大小
import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// 常用的 SVG 圖標
export const PlayIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <polygon points="5,3 19,12 5,21" fill={color} />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="6" y="4" width="4" height="16" fill={color} />
    <rect x="14" y="4" width="4" height="16" fill={color} />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <path d="M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-6.5l-4.24 4.24M7.76 7.76L3.52 3.52m12.96 12.96l-4.24-4.24M7.76 16.24L3.52 20.48" stroke={color} strokeWidth="2" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth="2" fill="none" />
    <polyline points="9,22 9,12 15,12 15,22" stroke={color} strokeWidth="2" />
  </svg>
);

export const GamepadIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth="2" />
    <line x1="12" y1="6" x2="12" y2="18" stroke={color} strokeWidth="2" />
    <rect x="4" y="8" width="16" height="8" rx="4" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <polyline points="6,9 12,15 18,9" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

export const CloudIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

// 圖標映射，方便使用
export const Icons = {
  Play: PlayIcon,
  Pause: PauseIcon,
  Settings: SettingsIcon,
  Home: HomeIcon,
  Gamepad: GamepadIcon,
  ChevronDown: ChevronDownIcon,
  Cloud: CloudIcon,
};

export default Icons;
