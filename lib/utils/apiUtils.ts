import { getSession } from 'next-auth/react';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
  status: number;
}

/**
 * 統一的 API 請求工具
 * 提供認證、錯誤處理、重試機制等功能
 */
export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor(baseURL = '/api', timeout = 10000, retries = 3) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
    this.defaultRetries = retries;
  }

  /**
   * 發送 API 請求
   */
  async request<T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = 1000,
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    // 獲取認證 token
    const session = await getSession();
    const authHeaders = session ? {
      'Authorization': `Bearer ${session.accessToken}`,
    } : {};

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    // 實現重試機制
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await this.parseResponse(response);

        if (!response.ok) {
          throw new Error(responseData.error || `HTTP ${response.status}`);
        }

        return {
          data: responseData,
          success: true,
          status: response.status,
        };

      } catch (error) {
        // 如果是最後一次嘗試，拋出錯誤
        if (attempt === retries) {
          return {
            data: null as T,
            success: false,
            error: this.getErrorMessage(error),
            status: 0,
          };
        }

        // 等待後重試
        await this.delay(retryDelay * Math.pow(2, attempt));
      }
    }

    // 這行代碼理論上不會執行到
    throw new Error('請求失敗');
  }

  /**
   * GET 請求
   */
  async get<T = any>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST 請求
   */
  async post<T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT 請求
   */
  async put<T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE 請求
   */
  async delete<T = any>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH 請求
   */
  async patch<T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * 批量請求
   */
  async batch<T = any>(requests: Array<{
    endpoint: string;
    options?: ApiOptions;
  }>): Promise<ApiResponse<T>[]> {
    const promises = requests.map(({ endpoint, options }) =>
      this.request<T>(endpoint, options)
    );

    return Promise.all(promises);
  }

  /**
   * 上傳文件
   */
  async upload<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    const session = await getSession();
    const authHeaders = session ? {
      'Authorization': `Bearer ${session.accessToken}`,
    } : {};

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        try {
          const responseData = JSON.parse(xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              data: responseData,
              success: true,
              status: xhr.status,
            });
          } else {
            resolve({
              data: null as T,
              success: false,
              error: responseData.error || `HTTP ${xhr.status}`,
              status: xhr.status,
            });
          }
        } catch (error) {
          resolve({
            data: null as T,
            success: false,
            error: '解析響應失敗',
            status: xhr.status,
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({
          data: null as T,
          success: false,
          error: '網絡錯誤',
          status: 0,
        });
      });

      xhr.open('POST', `${this.baseURL}${endpoint}`);
      
      // 設置認證頭
      Object.entries(authHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }

  /**
   * 解析響應
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }

  /**
   * 獲取錯誤消息
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return '請求超時';
      }
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return '未知錯誤';
  }

  /**
   * 延遲函數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 創建默認的 API 客戶端實例
export const apiClient = new ApiClient();

// 便捷的導出函數
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient.get<T>(endpoint, options),
  
  post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient.post<T>(endpoint, body, options),
  
  put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient.put<T>(endpoint, body, options),
  
  delete: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient.delete<T>(endpoint, options),
  
  patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiClient.patch<T>(endpoint, body, options),
  
  upload: <T = any>(endpoint: string, file: File, additionalData?: Record<string, any>, onProgress?: (progress: number) => void) =>
    apiClient.upload<T>(endpoint, file, additionalData, onProgress),
};

export default apiClient;
