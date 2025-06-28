import { useState, useCallback, useRef } from 'react';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: unknown, rollbackData: T) => void;
  onFinally?: () => void;
}

interface OptimisticUpdateResult<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  updateOptimistically: (
    optimisticData: T,
    asyncFn: () => Promise<T>,
    options?: OptimisticUpdateOptions<T>
  ) => Promise<void>;
  setData: (data: T) => void;
  clearError: () => void;
}

/**
 * 樂觀更新 Hook
 * 提供樂觀更新功能，在 API 調用完成前先更新 UI，失敗時回滾
 */
export function useOptimisticUpdate<T>(initialData: T): OptimisticUpdateResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousDataRef = useRef<T>(initialData);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateOptimistically = useCallback(async (
    optimisticData: T,
    asyncFn: () => Promise<T>,
    options: OptimisticUpdateOptions<T> = {}
  ) => {
    const { onSuccess, onError, onFinally } = options;
    
    // 保存當前數據以便回滾
    previousDataRef.current = data;
    
    // 樂觀更新
    setData(optimisticData);
    setIsLoading(true);
    setError(null);

    try {
      // 執行異步操作
      const result = await asyncFn();
      
      // 成功時更新為實際數據
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      // 失敗時回滾到之前的數據
      setData(previousDataRef.current);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'string' 
          ? err 
          : '操作失敗';
      
      setError(errorMessage);
      
      if (onError) {
        onError(err, previousDataRef.current);
      }
    } finally {
      setIsLoading(false);
      
      if (onFinally) {
        onFinally();
      }
    }
  }, [data]);

  return {
    data,
    isLoading,
    error,
    updateOptimistically,
    setData,
    clearError,
  };
}

export default useOptimisticUpdate;
