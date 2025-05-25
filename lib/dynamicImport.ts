import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * 動態導入組件的工具函數
 * 用於實現代碼分割，減少初始加載時間
 * 
 * @param importFunc 導入函數
 * @param options 配置選項
 * @returns 動態加載的組件
 */
export function dynamicComponent<T>(importFunc: () => Promise<{ default: ComponentType<T> }>, options: {
  ssr?: boolean;
  loading?: ComponentType;
  displayName?: string;
} = {}) {
  const {
    ssr = true,
    loading: LoadingComponent,
    displayName,
  } = options;

  const DynamicComponent = dynamic(importFunc, {
    ssr,
    loading: LoadingComponent,
  });

  // 設置顯示名稱，便於調試
  if (displayName) {
    DynamicComponent.displayName = displayName;
  }

  return DynamicComponent;
}

/**
 * 預加載組件
 * 用於提前加載將要使用的組件
 * 
 * @param importFunc 導入函數
 */
export function preloadComponent(importFunc: () => Promise<{ default: ComponentType<any> }>) {
  importFunc().catch(err => console.error('預加載組件失敗:', err));
}