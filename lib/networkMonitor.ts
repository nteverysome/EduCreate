/**
 * 網絡監控工具
 * 用於診斷API連接問題和監控網絡請求
 */

// 網絡請求狀態類型
type RequestStatus = 'pending' | 'success' | 'error';

// 網絡請求信息接口
interface RequestInfo {
  url: string;
  method: string;
  status: RequestStatus;
  statusCode?: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
}

// 網絡監控配置接口
interface NetworkMonitorConfig {
  maxLogSize?: number;
  enableConsoleLogging?: boolean;
  apiBasePath?: string;
}

/**
 * 網絡監控類
 * 用於跟踪和診斷API請求
 */
class NetworkMonitor {
  private requests: RequestInfo[] = [];
  private config: NetworkMonitorConfig;
  private static instance: NetworkMonitor;

  constructor(config: NetworkMonitorConfig = {}) {
    this.config = {
      maxLogSize: 100,
      enableConsoleLogging: true,
      apiBasePath: '/api',
      ...config
    };
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(config?: NetworkMonitorConfig): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor(config);
    }
    return NetworkMonitor.instance;
  }

  /**
   * 記錄請求開始
   */
  public logRequestStart(url: string, method: string = 'GET'): string {
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const requestInfo: RequestInfo = {
      url,
      method,
      status: 'pending',
      startTime: Date.now()
    };

    this.requests.unshift(requestInfo);

    // 限制日誌大小
    if (this.requests.length > (this.config.maxLogSize || 100)) {
      this.requests = this.requests.slice(0, this.config.maxLogSize);
    }

    if (this.config.enableConsoleLogging) {
      console.log(`🌐 請求開始: ${method} ${url}`);
    }

    return requestId;
  }

  /**
   * 記錄請求成功
   */
  public logRequestSuccess(url: string, statusCode: number = 200): void {
    const request = this.findRequest(url);
    if (request) {
      request.status = 'success';
      request.statusCode = statusCode;
      request.endTime = Date.now();
      request.duration = request.endTime - request.startTime;

      if (this.config.enableConsoleLogging) {
        console.log(`✅ 請求成功: ${request.method} ${url} (${request.duration}ms)`);
      }
    }
  }

  /**
   * 記錄請求失敗
   */
  public logRequestError(url: string, error: string, statusCode?: number): void {
    const request = this.findRequest(url);
    if (request) {
      request.status = 'error';
      request.statusCode = statusCode;
      request.error = error;
      request.endTime = Date.now();
      request.duration = request.endTime - request.startTime;

      if (this.config.enableConsoleLogging) {
        console.error(`❌ 請求失敗: ${request.method} ${url} (${request.duration}ms)\n錯誤: ${error}`);
      }
    }
  }

  /**
   * 查找請求記錄
   */
  private findRequest(url: string): RequestInfo | undefined {
    return this.requests.find(req => req.url === url && !req.endTime);
  }

  /**
   * 獲取所有請求記錄
   */
  public getRequests(): RequestInfo[] {
    return [...this.requests];
  }

  /**
   * 獲取API請求記錄
   */
  public getApiRequests(): RequestInfo[] {
    return this.requests.filter(req => req.url.startsWith(this.config.apiBasePath || '/api'));
  }

  /**
   * 獲取失敗的請求記錄
   */
  public getFailedRequests(): RequestInfo[] {
    return this.requests.filter(req => req.status === 'error');
  }

  /**
   * 獲取API健康狀態報告
   */
  public getApiHealthReport(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    recentErrors: RequestInfo[];
  } {
    const apiRequests = this.getApiRequests();
    const completedRequests = apiRequests.filter(req => req.endTime);
    const successfulRequests = apiRequests.filter(req => req.status === 'success');
    const failedRequests = apiRequests.filter(req => req.status === 'error');

    const totalResponseTime = completedRequests.reduce(
      (total, req) => total + (req.duration || 0),
      0
    );

    return {
      totalRequests: apiRequests.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      averageResponseTime: completedRequests.length
        ? totalResponseTime / completedRequests.length
        : 0,
      recentErrors: failedRequests.slice(0, 5)
    };
  }

  /**
   * 清除所有請求記錄
   */
  public clearLogs(): void {
    this.requests = [];
    if (this.config.enableConsoleLogging) {
      console.log('🧹 網絡監控日誌已清除');
    }
  }

  /**
   * 檢測API連接狀態
   * 返回Promise，解析為布爾值，表示API是否可連接
   */
  public async checkApiConnection(endpoint: string = '/api/search'): Promise<{
    connected: boolean;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5秒超時
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        connected: response.ok,
        statusCode: response.status,
        responseTime
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        connected: false,
        responseTime,
        error: error instanceof Error ? error.message : '未知錯誤'
      };
    }
  }
}

// 導出單例實例
export const networkMonitor = NetworkMonitor.getInstance();

// 導出監控函數
export async function checkApiHealth(): Promise<{
  searchApiStatus: { connected: boolean; responseTime?: number; error?: string };
  advancedSearchApiStatus: { connected: boolean; responseTime?: number; error?: string };
  overallHealth: 'good' | 'degraded' | 'down';
  message: string;
}> {
  const searchApiStatus = await networkMonitor.checkApiConnection('/api/search');
  const advancedSearchApiStatus = await networkMonitor.checkApiConnection('/api/search/advanced');

  let overallHealth: 'good' | 'degraded' | 'down' = 'good';
  let message = '所有API服務正常運行';

  if (!searchApiStatus.connected && !advancedSearchApiStatus.connected) {
    overallHealth = 'down';
    message = '搜索API服務不可用，請檢查服務器狀態';
  } else if (!searchApiStatus.connected || !advancedSearchApiStatus.connected) {
    overallHealth = 'degraded';
    message = '部分搜索API服務不可用，可能影響某些功能';
  } else if (
    (searchApiStatus.responseTime && searchApiStatus.responseTime > 2000) ||
    (advancedSearchApiStatus.responseTime && advancedSearchApiStatus.responseTime > 2000)
  ) {
    overallHealth = 'degraded';
    message = '搜索API響應時間較長，可能影響用戶體驗';
  }

  return {
    searchApiStatus,
    advancedSearchApiStatus,
    overallHealth,
    message
  };
}