// 統一的 API 客戶端 - 支持本地和遠程 API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/backend'  // 生產環境使用統一的 Vercel API
  : '/api/backend'; // 開發環境也使用統一的本地 API

// 舊的 Railway API URL（逐步淘汰）
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || 'https://your-railway-app.railway.app';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    
    // 從 localStorage 獲取 token（僅在客戶端）
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}`,
          status: 'error'
        };
      }

      return {
        data,
        status: 'success'
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 'error'
      };
    }
  }

  // 認證相關
  async register(userData: { name: string; email: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  // 活動相關
  async getActivities(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    
    const query = searchParams.toString();
    return this.request(`/activities${query ? `?${query}` : ''}`);
  }

  async getActivity(id: string) {
    return this.request(`/activities/${id}`);
  }

  async createActivity(activityData: any) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async updateActivity(id: string, activityData: any) {
    return this.request(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    });
  }

  async deleteActivity(id: string) {
    return this.request(`/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // 遊戲相關
  async getGames() {
    return this.request('/games');
  }

  async getGameStats(params?: { sessionId?: string; userId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.sessionId) searchParams.set('sessionId', params.sessionId);
    if (params?.userId) searchParams.set('userId', params.userId);
    
    const query = searchParams.toString();
    return this.request(`/games/stats${query ? `?${query}` : ''}`);
  }

  async saveGameStats(statsData: any) {
    return this.request('/games/stats', {
      method: 'POST',
      body: JSON.stringify(statsData),
    });
  }

  async updateGameStats(sessionId: string, statsData: any) {
    return this.request(`/games/stats/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(statsData),
    });
  }

  // 用戶相關
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData: { name?: string; image?: string }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // 健康檢查
  async healthCheck() {
    return this.request('/health');
  }
}

// 導出單例實例
export const apiClient = new ApiClient();

// 導出類型和工廠函數
export { ApiClient };
export default apiClient;
