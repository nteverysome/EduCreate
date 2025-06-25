import React from 'react';
import { clsx } from 'clsx';
import { ButtonProps } from '@/types';

/**
 * Button 組件 - 可重用的按鈕組件
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   點擊我
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const baseClasses = [
    'btn',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:transform-none',
  ];

  const variantClasses = {
    primary: [
      'bg-primary-600',
      'text-white',
      'border-transparent',
      'hover:bg-primary-700',
      'focus:ring-primary-500',
      'shadow-sm',
      'hover:shadow-md',
      'active:bg-primary-800',
    ],
    secondary: [
      'bg-white',
      'text-gray-700',
      'border-gray-300',
      'border',
      'hover:bg-gray-50',
      'focus:ring-primary-500',
      'shadow-sm',
      'hover:shadow-md',
    ],
    success: [
      'bg-success-600',
      'text-white',
      'border-transparent',
      'hover:bg-success-700',
      'focus:ring-success-500',
      'shadow-sm',
      'hover:shadow-md',
    ],
    warning: [
      'bg-warning-600',
      'text-white',
      'border-transparent',
      'hover:bg-warning-700',
      'focus:ring-warning-500',
      'shadow-sm',
      'hover:shadow-md',
    ],
    error: [
      'bg-error-600',
      'text-white',
      'border-transparent',
      'hover:bg-error-700',
      'focus:ring-error-500',
      'shadow-sm',
      'hover:shadow-md',
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'border-transparent',
      'hover:bg-gray-100',
      'focus:ring-primary-500',
    ],
  };

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm', 'rounded-md'],
    md: ['px-4', 'py-2', 'text-sm', 'rounded-lg'],
    lg: ['px-6', 'py-3', 'text-base', 'rounded-lg'],
    xl: ['px-8', 'py-4', 'text-lg', 'rounded-xl'],
  };

  const widthClasses = fullWidth ? ['w-full'] : [];

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    {
      'transform hover:scale-105': !disabled && !loading,
      'cursor-wait': loading,
    },
    className
  );

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

// 遊戲主題按鈕變體
export const GameButton: React.FC<ButtonProps & { gameType?: string }> = ({
  gameType = 'quiz',
  className,
  ...props
}) => {
  const gameClasses = {
    quiz: 'btn-game-quiz',
    match: 'btn-game-match',
    wheel: 'btn-game-wheel',
    sort: 'btn-game-sort',
    cards: 'btn-game-cards',
  };

  return (
    <Button
      className={clsx(gameClasses[gameType as keyof typeof gameClasses], className)}
      {...props}
    />
  );
};

// 圖標按鈕
export const IconButton: React.FC<ButtonProps & { icon: React.ReactNode }> = ({
  icon,
  children,
  size = 'md',
  ...props
}) => {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  };

  return (
    <Button size={size} {...props}>
      <span className={clsx(iconSizes[size], children ? 'mr-2' : '')}>
        {icon}
      </span>
      {children}
    </Button>
  );
};

export default Button;
