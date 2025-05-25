/**
 * 網絡請求工具函數
 * 提供統一的API請求處理，包括錯誤處理、超時和重試機制
 */

// 默認請求配置
const DEFAULT_TIMEOUT = 15000; // 15秒
const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_RETRY_DELAY = 1000; // 1秒

// 請求選項接口
interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// 響應處理接口
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
}

/**
 * 增強的fetch函數，支持超時、重試和統一錯誤處理
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRY_COUNT,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  // 創建AbortController用於超時控制
  const controller = new AbortController();
  const { signal } = controller;

  // 設置超時
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  // 初始化響應對象
  const response: ApiResponse<T> = {
    data: null,
    error: null,
    status: 0,
    ok: false
  };

  let currentTry = 0;

  while (currentTry <= retries) {
    try {
      // 如果不是第一次嘗試，等待指定的延遲時間
      if (currentTry > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        console.log(`重試API請求 (${currentTry}/${retries}): ${url}`);
      }

      currentTry++;

      // 發送請求
      const fetchResponse = await fetch(url, {
        ...fetchOptions,
        signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...fetchOptions.headers,
        },
      });

      // 更新響應狀態
      response.status = fetchResponse.status;
      response.ok = fetchResponse.ok;

      // 處理成功響應
      if (fetchResponse.ok) {
        try {
          // 嘗試解析JSON響應
          response.data = await fetchResponse.json() as T;
          break; // 成功獲取數據，跳出重試循環
        } catch (parseError) {
          // JSON解析錯誤
          response.error = `無法解析API響應: ${parseError instanceof Error ? parseError.message : '未知錯誤'}`;
          console.error('JSON解析錯誤:', parseError);
          // 不重試解析錯誤，直接返回
          break;
        }
      } else {
        // 處理HTTP錯誤
        let errorMessage = `請求失敗: ${fetchResponse.status} ${fetchResponse.statusText}`;
        
        try {
          // 嘗試從響應中獲取詳細錯誤信息
          const errorData = await fetchResponse.json();
          if (errorData && (errorData.error || errorData.message)) {
            errorMessage += ` - ${errorData.error || errorData.message}`;
          }
        } catch {
          // 如果無法解析JSON，嘗試獲取文本
          try {
            const errorText = await fetchResponse.text();
            if (errorText) {
              errorMessage += ` - ${errorText}`;
            }
          } catch {}
        }
        
        response.error = errorMessage;
        
        // 根據狀態碼決定是否重試
        // 對於5xx服務器錯誤和部分4xx錯誤(如429 Too Many Requests)進行重試
        if (fetchResponse.status >= 500 || fetchResponse.status === 429) {
          // 繼續重試循環
          continue;
        } else {
          // 對於其他客戶端錯誤(4xx)，不再重試
          break;
        }
      }
    } catch (error) {
      // 處理網絡錯誤或超時
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          response.error = '請求超時，請檢查您的網絡連接';
        } else {
          response.error = `網絡錯誤: ${error.message}`;
        }
      } else {
        response.error = '發生未知錯誤';
      }
      
      console.error('請求錯誤:', error);
      
      // 對於網絡錯誤，繼續重試
      if (currentTry <= retries) {
        continue;
      }
    } finally {
      if (currentTry >= retries) {
        // 最後一次嘗試後清除超時
        clearTimeout(timeoutId);
      }
    }
  }

  // 確保超時被清除
  clearTimeout(timeoutId);
  
  return response;
}

/**
 * 發送GET請求
 */
export async function get<T>(url: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  return fetchWithTimeout<T>(url, {
    method: 'GET',
    ...options,
  });
}

/**
 * 發送POST請求
 */
export async function post<T>(url: string, data: any, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  return fetchWithTimeout<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * 發送PUT請求
 */
export async function put<T>(url: string, data: any, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  return fetchWithTimeout<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * 發送DELETE請求
 */
export async function del<T>(url: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  return fetchWithTimeout<T>(url, {
    method: 'DELETE',
    ...options,
  });
}