import { useState, useCallback } from 'react';

interface ErrorState {
  error: string | null;
  isLoading: boolean;
}

interface ErrorHandler {
  error: string | null;
  isLoading: boolean;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  handleError: (error: unknown) => void;
  clearError: () => void;
  executeWithErrorHandling: <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: string) => void
  ) => Promise<void>;
}

/**
 * 統一錯誤處理 Hook
 * 提供一致的錯誤處理邏輯和加載狀態管理
 */
export function useErrorHandler(): ErrorHandler {
  const [state, setState] = useState<ErrorState>({
    error: null,
    isLoading: false,
  });

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const handleError = useCallback((error: unknown) => {
    let errorMessage = '發生未知錯誤';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      if ((error as any).message && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      } else if ((error as any).error && typeof (error as any).error === 'string') {
        errorMessage = (error as any).error;
      } else if ((error as any).response?.data?.error) {
        errorMessage = (error as any).response.data.error;
      }
    }
    
    setError(errorMessage);
    console.error('Error handled by useErrorHandler:', error);
  }, [setError]);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: string) => void
  ) => {
    try {
      setLoading(true);
      clearError();
      
      const result = await asyncFn();
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      handleError(error);
      
      if (onError) {
        const errorMessage = typeof error === 'string' 
          ? error 
          : (error as any)?.message || '操作失敗';
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleError]);

  return {
    error: state.error,
    isLoading: state.isLoading,
    setError,
    setLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
  };
}

export default useErrorHandler;
