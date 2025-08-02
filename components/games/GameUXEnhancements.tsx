/**
 * GameUXEnhancements - 遊戲用戶體驗增強組件
 * 提供載入動畫、進度指示器、錯誤處理、性能監控顯示等功能
 * 提升遊戲切換的用戶體驗
 */

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, CpuChipIcon } from '@heroicons/react/24/outline';

// 載入狀態類型
export interface LoadingState {
  isLoading: boolean;
  progress: number;
  stage: 'initializing' | 'loading_assets' | 'creating_game' | 'finalizing' | 'complete';
  message: string;
  estimatedTime: number;
  elapsedTime: number;
}

// 錯誤狀態類型
export interface ErrorState {
  hasError: boolean;
  errorType: 'network' | 'memory' | 'compatibility' | 'timeout' | 'unknown';
  message: string;
  details?: string;
  retryCount: number;
  canRetry: boolean;
}

// 性能狀態類型
export interface PerformanceState {
  memoryUsage: number;
  memoryLimit: number;
  activeGames: number;
  fps: number;
  loadTime: number;
  switchTime: number;
}

// 組件 Props
interface GameUXEnhancementsProps {
  loadingState: LoadingState;
  errorState: ErrorState;
  performanceState?: PerformanceState;
  onRetry?: () => void;
  onCancel?: () => void;
  showPerformanceInfo?: boolean;
  className?: string;
}

// 載入階段配置
const LOADING_STAGES = {
  initializing: { icon: '🔄', label: '初始化中', color: 'blue' },
  loading_assets: { icon: '📦', label: '載入資源', color: 'indigo' },
  creating_game: { icon: '🎮', label: '創建遊戲', color: 'purple' },
  finalizing: { icon: '✨', label: '最終處理', color: 'green' },
  complete: { icon: '✅', label: '完成', color: 'green' }
};

// 錯誤類型配置
const ERROR_TYPES = {
  network: { icon: '🌐', label: '網絡錯誤', color: 'red', canRetry: true },
  memory: { icon: '💾', label: '記憶體不足', color: 'orange', canRetry: false },
  compatibility: { icon: '⚠️', label: '兼容性問題', color: 'yellow', canRetry: false },
  timeout: { icon: '⏰', label: '載入超時', color: 'red', canRetry: true },
  unknown: { icon: '❓', label: '未知錯誤', color: 'gray', canRetry: true }
};

// 載入動畫組件
const LoadingAnimation: React.FC<{ stage: LoadingState['stage']; progress: number }> = ({ stage, progress }) => {
  const stageConfig = LOADING_STAGES[stage];
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 主要載入動畫 */}
      <div className="relative">
        <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin">
          <div 
            className={`absolute inset-0 border-4 border-${stageConfig.color}-500 rounded-full border-t-transparent animate-spin`}
            style={{ 
              transform: `rotate(${progress * 3.6}deg)`,
              transition: 'transform 0.3s ease-out'
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {stageConfig.icon}
        </div>
      </div>
      
      {/* 進度條 */}
      <div className="w-64 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full bg-${stageConfig.color}-500 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* 階段指示器 */}
      <div className="flex space-x-2">
        {Object.entries(LOADING_STAGES).map(([key, config], index) => (
          <div
            key={key}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              key === stage ? `bg-${config.color}-500` :
              index < Object.keys(LOADING_STAGES).indexOf(stage) ? 'bg-green-400' :
              'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// 錯誤顯示組件
const ErrorDisplay: React.FC<{ 
  errorState: ErrorState; 
  onRetry?: () => void; 
  onCancel?: () => void; 
}> = ({ errorState, onRetry, onCancel }) => {
  const errorConfig = ERROR_TYPES[errorState.errorType];
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-6xl mb-4">{errorConfig.icon}</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">{errorConfig.label}</h3>
      <p className="text-red-600 mb-4">{errorState.message}</p>
      
      {errorState.details && (
        <div className="bg-red-100 rounded p-3 mb-4 text-sm text-red-700">
          <strong>詳細信息：</strong> {errorState.details}
        </div>
      )}
      
      <div className="flex justify-center space-x-3">
        {errorState.canRetry && onRetry && (
          <button
            onClick={onRetry}
            disabled={errorState.retryCount >= 3}
            className={`px-6 py-2 rounded-lg font-medium ${
              errorState.retryCount >= 3
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {errorState.retryCount >= 3 ? '重試次數已達上限' : `重試 (${errorState.retryCount}/3)`}
          </button>
        )}
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            取消
          </button>
        )}
      </div>
    </div>
  );
};

// 性能信息顯示組件
const PerformanceInfo: React.FC<{ performanceState: PerformanceState }> = ({ performanceState }) => {
  const memoryPercentage = (performanceState.memoryUsage / performanceState.memoryLimit) * 100;
  const memoryColor = memoryPercentage > 80 ? 'red' : memoryPercentage > 60 ? 'yellow' : 'green';
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-gray-900 flex items-center">
        <CpuChipIcon className="w-4 h-4 mr-2" />
        系統性能
      </h4>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* 記憶體使用 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600">記憶體使用</span>
            <span className={`font-semibold text-${memoryColor}-600`}>
              {Math.round(performanceState.memoryUsage)}MB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-${memoryColor}-500 transition-all duration-300`}
              style={{ width: `${Math.min(memoryPercentage, 100)}%` }}
            />
          </div>
        </div>
        
        {/* FPS */}
        <div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">FPS</span>
            <span className={`font-semibold ${
              performanceState.fps >= 50 ? 'text-green-600' :
              performanceState.fps >= 30 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {performanceState.fps}
            </span>
          </div>
        </div>
        
        {/* 活躍遊戲 */}
        <div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">活躍遊戲</span>
            <span className="font-semibold text-blue-600">
              {performanceState.activeGames}/3
            </span>
          </div>
        </div>
        
        {/* 載入時間 */}
        <div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">載入時間</span>
            <span className={`font-semibold ${
              performanceState.loadTime < 1000 ? 'text-green-600' :
              performanceState.loadTime < 2000 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {Math.round(performanceState.loadTime)}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 主組件
const GameUXEnhancements: React.FC<GameUXEnhancementsProps> = ({
  loadingState,
  errorState,
  performanceState,
  onRetry,
  onCancel,
  showPerformanceInfo = false,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // 如果有錯誤，顯示錯誤界面
  if (errorState.hasError) {
    return (
      <div className={`game-ux-enhancements ${className}`}>
        <ErrorDisplay 
          errorState={errorState}
          onRetry={onRetry}
          onCancel={onCancel}
        />
        
        {showPerformanceInfo && performanceState && (
          <div className="mt-4">
            <PerformanceInfo performanceState={performanceState} />
          </div>
        )}
      </div>
    );
  }
  
  // 如果正在載入，顯示載入界面
  if (loadingState.isLoading) {
    const stageConfig = LOADING_STAGES[loadingState.stage];
    
    return (
      <div className={`game-ux-enhancements ${className}`}>
        <div className="text-center py-8">
          <LoadingAnimation 
            stage={loadingState.stage}
            progress={loadingState.progress}
          />
          
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {stageConfig.label}
            </h3>
            <p className="text-gray-600">{loadingState.message}</p>
            
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                已用時: {Math.round(loadingState.elapsedTime / 1000)}s
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                預估: {Math.round(loadingState.estimatedTime / 1000)}s
              </div>
            </div>
          </div>
          
          {/* 詳細信息切換 */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {showDetails ? '隱藏詳細信息' : '顯示詳細信息'}
          </button>
          
          {showDetails && showPerformanceInfo && performanceState && (
            <div className="mt-4">
              <PerformanceInfo performanceState={performanceState} />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // 載入完成，只顯示性能信息（如果需要）
  if (showPerformanceInfo && performanceState) {
    return (
      <div className={`game-ux-enhancements ${className}`}>
        <PerformanceInfo performanceState={performanceState} />
      </div>
    );
  }
  
  return null;
};

export default GameUXEnhancements;
