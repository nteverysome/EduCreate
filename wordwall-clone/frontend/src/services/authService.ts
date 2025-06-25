import { apiClient } from './apiClient';
import { User, AuthResponse, ApiResponse } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName: string;
  role?: 'STUDENT' | 'TEACHER';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * 認證服務
 * 
 * 提供所有認證相關的 API 調用
 */
class AuthService {
  private readonly baseUrl = '/auth';

  /**
   * 用戶登入
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      `${this.baseUrl}/login`,
      { email, password }
    );
    
    return response.data.data;
  }

  /**
   * 用戶註冊
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      `${this.baseUrl}/register`,
      userData
    );
    
    return response.data.data;
  }

  /**
   * 刷新訪問令牌
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      `${this.baseUrl}/refresh`,
      { refreshToken }
    );
    
    return response.data.data;
  }

  /**
   * 用戶登出
   */
  async logout(refreshToken?: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/logout`, {
      refreshToken,
    });
  }

  /**
   * 獲取當前用戶資料
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      `${this.baseUrl}/profile`
    );
    
    return response.data.data.user;
  }

  /**
   * 更新用戶資料
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<{ user: User }>>(
      `${this.baseUrl}/profile`,
      data
    );
    
    return response.data.data.user;
  }

  /**
   * 修改密碼
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post(`${this.baseUrl}/change-password`, data);
  }

  /**
   * 驗證電子郵件
   */
  async verifyEmail(verificationCode: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/verify-email`, {
      verificationCode,
    });
  }

  /**
   * 重新發送驗證郵件
   */
  async resendVerificationEmail(): Promise<void> {
    await apiClient.post(`${this.baseUrl}/resend-verification`);
  }

  /**
   * 忘記密碼
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/forgot-password`, { email });
  }

  /**
   * 重設密碼
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  /**
   * 獲取用戶的所有活躍會話
   */
  async getSessions(): Promise<Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    expiresAt: string;
  }>> {
    const response = await apiClient.get<ApiResponse<{
      sessions: Array<{
        id: string;
        ipAddress: string;
        userAgent: string;
        createdAt: string;
        expiresAt: string;
      }>;
    }>>(`${this.baseUrl}/sessions`);
    
    return response.data.data.sessions;
  }

  /**
   * 刪除指定會話
   */
  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/sessions/${sessionId}`);
  }

  /**
   * 刪除所有其他會話（保留當前會話）
   */
  async deleteOtherSessions(): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/sessions/others`);
  }

  /**
   * 檢查用戶名是否可用
   */
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
        `${this.baseUrl}/check-username`,
        { params: { username } }
      );
      
      return response.data.data.available;
    } catch (error) {
      return false;
    }
  }

  /**
   * 檢查電子郵件是否可用
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
        `${this.baseUrl}/check-email`,
        { params: { email } }
      );
      
      return response.data.data.available;
    } catch (error) {
      return false;
    }
  }

  /**
   * 獲取用戶統計信息
   */
  async getUserStats(): Promise<{
    totalActivities: number;
    totalPlays: number;
    averageScore: number;
    favoriteTemplates: string[];
    recentActivity: any[];
  }> {
    const response = await apiClient.get<ApiResponse<{
      stats: {
        totalActivities: number;
        totalPlays: number;
        averageScore: number;
        favoriteTemplates: string[];
        recentActivity: any[];
      };
    }>>(`${this.baseUrl}/stats`);
    
    return response.data.data.stats;
  }

  /**
   * 上傳用戶頭像
   */
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      `${this.baseUrl}/upload-avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.data.avatarUrl;
  }

  /**
   * 刪除用戶帳戶
   */
  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/account`, {
      data: { password },
    });
  }

  /**
   * 導出用戶數據
   */
  async exportUserData(): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/export-data`, {
      responseType: 'blob',
    });
    
    return response.data;
  }
}

// 創建並導出服務實例
export const authService = new AuthService();

// 便捷函數
export const login = (email: string, password: string) => 
  authService.login(email, password);

export const register = (userData: RegisterRequest) => 
  authService.register(userData);

export const logout = (refreshToken?: string) => 
  authService.logout(refreshToken);

export const getProfile = () => 
  authService.getProfile();

export const updateProfile = (data: UpdateProfileRequest) => 
  authService.updateProfile(data);

export const changePassword = (data: ChangePasswordRequest) => 
  authService.changePassword(data);

export default authService;
