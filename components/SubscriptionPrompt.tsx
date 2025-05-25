import React from 'react';
import Link from 'next/link';

interface SubscriptionPromptProps {
  message?: string;
  showButton?: boolean;
  buttonText?: string;
  className?: string;
}

/**
 * 訂閱提示組件，用於提示用戶升級到付費訂閱
 */
const SubscriptionPrompt: React.FC<SubscriptionPromptProps> = ({
  message = '此功能需要訂閱專業版才能使用',
  showButton = true,
  buttonText = '查看訂閱方案',
  className = '',
}) => {
  return (
    <div className={`bg-indigo-50 border-l-4 border-indigo-500 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-indigo-700">{message}</p>
          {showButton && (
            <div className="mt-3">
              <Link
                href="/pricing"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {buttonText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPrompt;