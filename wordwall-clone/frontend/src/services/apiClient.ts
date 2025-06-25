import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import { getAccessToken, ensureValidToken } from '@/store/authStore';

// API 基礎配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const API_TIMEOUT = 30000; // 30 秒

/**
 * API 客戶端類
 * 
 * 功能：
 * - 自動添加認證 header
 * - 自動處理 token 刷新
 * - 統一錯誤處理
 * - 請求/響應攔截
 * - 重試機制
 */
class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 設置請求和響應攔截器
   */
  private setupInterceptors() {
    // 請求攔截器
    this.instance.interceptors.request.use(
      async (config) => {
        // 添加認證 token
        const token = await ensureValidToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加請求 ID 用於追蹤
        config.headers['X-Request-ID'] = this.generateRequestId();

        // 添加時間戳
        config.headers['X-Request-Time'] = new Date().toISOString();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 響應攔截器
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // 處理 401 錯誤（未授權）
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 如果正在刷新 token，將請求加入隊列
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await ensureValidToken();
            this.processQueue(null, newToken);
            
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            // 重定向到登入頁面
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // 處理其他錯誤
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 處理隊列中的請求
   */
  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * 生成請求 ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 統一錯誤處理
   */
  private handleError(error: any) {
    if (!error.response) {
      // 網絡錯誤
      toast.error('網絡連接失敗，請檢查您的網絡設置');
      return;
    }

    const { status, data } = error.response;
    const message = data?.error || data?.message || '發生未知錯誤';

    switch (status) {
      case 400:
        toast.error(`請求錯誤: ${message}`);
        break;
      case 401:
        // 401 錯誤在攔截器中處理
        break;
      case 403:
        toast.error('權限不足，無法執行此操作');
        break;
      case 404:
        toast.error('請求的資源不存在');
        break;
      case 409:
        toast.error(`衝突: ${message}`);
        break;
      case 422:
        // 驗證錯誤，通常由表單處理
        break;
      case 429:
        toast.error('請求過於頻繁，請稍後再試');
        break;
      case 500:
        toast.error('服務器內部錯誤，請稍後再試');
        break;
      case 502:
      case 503:
      case 504:
        toast.error('服務暫時不可用，請稍後再試');
        break;
      default:
        toast.error(`錯誤 ${status}: ${message}`);
    }
  }

  /**
   * GET 請求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  /**
   * POST 請求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  /**
   * PUT 請求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  /**
   * PATCH 請求
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  /**
   * DELETE 請求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  /**
   * 上傳文件
   */
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.instance.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  /**
   * 下載文件
   */
  async download(url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: 'blob',
    });

    // 創建下載鏈接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * 批量請求
   */
  async batch<T = any>(requests: Array<() => Promise<AxiosResponse<T>>>): Promise<AxiosResponse<T>[]> {
    return Promise.all(requests.map(request => request()));
  }

  /**
   * 重試請求
   */
  async retry<T = any>(
    requestFn: () => Promise<AxiosResponse<T>>,
    maxRetries = 3,
    delay = 1000
  ): Promise<AxiosResponse<T>> {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }

  /**
   * 取消請求
   */
  createCancelToken() {
    return axios.CancelToken.source();
  }

  /**
   * 檢查請求是否被取消
   */
  isCancel(error: any): boolean {
    return axios.isCancel(error);
  }

  /**
   * 獲取原始 axios 實例
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// 創建並導出 API 客戶端實例
export const apiClient = new ApiClient();

// 便捷函數
export const get = <T = any>(url: string, config?: AxiosRequestConfig) => 
  apiClient.get<T>(url, config);

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
  apiClient.post<T>(url, data, config);

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
  apiClient.put<T>(url, data, config);

export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
  apiClient.patch<T>(url, data, config);

export const del = <T = any>(url: string, config?: AxiosRequestConfig) => 
  apiClient.delete<T>(url, config);

export default apiClient;
