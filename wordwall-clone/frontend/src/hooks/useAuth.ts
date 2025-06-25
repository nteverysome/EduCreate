import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'TEACHER' | 'STUDENT';
  subscriptionType?: string;
  emailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName: string;
  role?: 'TEACHER' | 'STUDENT';
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const navigate = useNavigate();

  // 從 localStorage 獲取 token
  const getStoredTokens = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  };

  // 保存 token 到 localStorage
  const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  // 清除 token
  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // API 請求函數
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const { accessToken } = getStoredTokens();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // 如果是 token 過期，嘗試刷新
        if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // 重新發送原始請求
            const newConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${getStoredTokens().accessToken}`,
              },
            };
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, newConfig);
            return await retryResponse.json();
          }
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // 刷新訪問令牌
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const { refreshToken } = getStoredTokens();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      storeTokens(data.data.accessToken, data.data.refreshToken);
      setAuthState(prev => ({
        ...prev,
        user: data.data.user,
        isAuthenticated: true,
      }));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return false;
    }
  };

  // 登入
  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      storeTokens(data.data.accessToken, data.data.refreshToken);
      setAuthState({
        user: data.data.user,
        isLoading: false,
        isAuthenticated: true,
      });

      toast.success('登入成功！');
      return { success: true, user: data.data.user };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : '登入失敗';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 註冊
  const register = async (userData: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      storeTokens(data.data.accessToken, data.data.refreshToken);
      setAuthState({
        user: data.data.user,
        isLoading: false,
        isAuthenticated: true,
      });

      toast.success('註冊成功！');
      return { success: true, user: data.data.user };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : '註冊失敗';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 登出
  const logout = async () => {
    try {
      const { refreshToken } = getStoredTokens();
      
      if (refreshToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearTokens();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      toast.success('已登出');
      navigate('/');
    }
  };

  // 獲取用戶資料
  const getProfile = async () => {
    try {
      const data = await apiRequest('/auth/profile');
      setAuthState(prev => ({
        ...prev,
        user: data.data.user,
        isAuthenticated: true,
      }));
      return data.data.user;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  };

  // 更新用戶資料
  const updateProfile = async (updates: Partial<User>) => {
    try {
      const data = await apiRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      setAuthState(prev => ({
        ...prev,
        user: data.data.user,
      }));

      toast.success('資料更新成功！');
      return { success: true, user: data.data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新失敗';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 修改密碼
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      toast.success('密碼修改成功！');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '密碼修改失敗';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 演示登入
  const demoLogin = async (role: 'TEACHER' | 'STUDENT' = 'TEACHER') => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const data = await apiRequest('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });

      storeTokens(data.data.accessToken, data.data.refreshToken);
      setAuthState({
        user: data.data.user,
        isLoading: false,
        isAuthenticated: true,
      });

      toast.success(`以${role === 'TEACHER' ? '教師' : '學生'}身份登入！`);
      return { success: true, user: data.data.user };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error instanceof Error ? error.message : '演示登入失敗';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 檢查認證狀態（演示模式）
  const checkAuthStatus = useCallback(async () => {
    try {
      // 演示模式：直接設置為未認證狀態
      setTimeout(() => {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }, 100);
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // 初始化時檢查認證狀態
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    // 狀態
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    
    // 方法
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    demoLogin,
    refreshAccessToken,
    checkAuthStatus,
    
    // 工具方法
    apiRequest,
  };
};

export default useAuth;
