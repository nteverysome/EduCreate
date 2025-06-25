import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { InputProps } from '@/types';

/**
 * Input 組件 - 可重用的輸入框組件
 * 
 * @example
 * ```tsx
 * <Input
 *   label="電子郵件"
 *   type="email"
 *   placeholder="請輸入您的電子郵件"
 *   value={email}
 *   onChange={setEmail}
 *   error={emailError}
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  placeholder,
  type = 'text',
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  disabled = false,
  required = false,
  className,
  icon,
  rightIcon,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseClasses = [
    'block',
    'w-full',
    'px-3',
    'py-2',
    'text-sm',
    'placeholder-gray-400',
    'transition-all',
    'duration-200',
    'border',
    'rounded-lg',
    'shadow-sm',
    'focus:outline-none',
    'focus:ring-1',
    'disabled:bg-gray-50',
    'disabled:text-gray-500',
    'disabled:cursor-not-allowed',
  ];

  const stateClasses = {
    default: [
      'border-gray-300',
      'focus:border-primary-500',
      'focus:ring-primary-500',
    ],
    error: [
      'border-error-500',
      'focus:border-error-500',
      'focus:ring-error-500',
      'text-error-900',
      'placeholder-error-300',
    ],
    success: [
      'border-success-500',
      'focus:border-success-500',
      'focus:ring-success-500',
    ],
  };

  const getStateClass = () => {
    if (error) return stateClasses.error;
    if (success) return stateClasses.success;
    return stateClasses.default;
  };

  const paddingClasses = {
    withLeftIcon: 'pl-10',
    withRightIcon: 'pr-10',
    withBothIcons: 'pl-10 pr-10',
    default: 'px-3',
  };

  const getPaddingClass = () => {
    if (icon && (rightIcon || type === 'password')) return paddingClasses.withBothIcons;
    if (icon) return paddingClasses.withLeftIcon;
    if (rightIcon || type === 'password') return paddingClasses.withRightIcon;
    return paddingClasses.default;
  };

  const inputClasses = clsx(
    baseClasses,
    getStateClass(),
    getPaddingClass(),
    className
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* 左側圖標 */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={clsx(
              'h-5 w-5',
              error ? 'text-error-400' : 'text-gray-400'
            )}>
              {icon}
            </span>
          </div>
        )}

        {/* 輸入框 */}
        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          {...props}
        />

        {/* 右側圖標或密碼切換 */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {type === 'password' && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          )}
          
          {rightIcon && type !== 'password' && (
            <span className={clsx(
              'h-5 w-5 pointer-events-none',
              error ? 'text-error-400' : 'text-gray-400'
            )}>
              {rightIcon}
            </span>
          )}
        </div>
      </div>

      {/* 錯誤或成功消息 */}
      {error && (
        <p className="mt-1 text-sm text-error-600 flex items-center">
          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {success && !error && (
        <p className="mt-1 text-sm text-success-600 flex items-center">
          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// 搜索輸入框
export const SearchInput: React.FC<InputProps & { onSearch?: (query: string) => void }> = ({
  onSearch,
  placeholder = '搜索...',
  ...props
}) => {
  const [query, setQuery] = useState('');

  const handleChange = (value: string) => {
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query);
    }
  };

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      icon={
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      {...props}
    />
  );
};

export default Input;
