import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { authService } from '@/services/authService';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    displayName: string;
    role?: 'STUDENT' | 'TEACHER';
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenAction: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;

  // State
  isInitialized: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * 認證狀態管理 Store
 * 
 * 功能：
 * - 用戶登入/登出
 * - Token 管理
 * - 用戶資料管理
 * - 持久化存儲
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,
      accessToken: null,
      refreshToken: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login(email, password);
          
          set({
            user: response.user,
            isAuthenticated: true,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.register(userData);
          
          set({
            user: response.user,
            isAuthenticated: true,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            error: null,
          });
        }
      },

      refreshTokenAction: async () => {
        try {
          const { refreshToken } = get();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          const response = await authService.refreshToken(refreshToken);
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          console.error('Token refresh failed:', error);
          
          // 如果 refresh token 無效，清除所有認證狀態
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            error: 'Session expired. Please log in again.',
          });
          
          throw error;
        }
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const updatedUser = await authService.updateProfile(data);
          
          set((state) => ({
            user: { ...state.user, ...updatedUser },
            isLoading: false,
            error: null,
          }));
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Profile update failed',
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: async () => {
        try {
          const { accessToken, refreshToken } = get();
          
          if (!accessToken || !refreshToken) {
            set({ isInitialized: true });
            return;
          }

          // 嘗試獲取用戶資料
          try {
            const user = await authService.getProfile();
            set({
              user,
              isAuthenticated: true,
              isInitialized: true,
              error: null,
            });
          } catch (error) {
            // 如果獲取用戶資料失敗，嘗試刷新 token
            try {
              await get().refreshTokenAction();
              const user = await authService.getProfile();
              set({
                user,
                isAuthenticated: true,
                isInitialized: true,
                error: null,
              });
            } catch (refreshError) {
              // 如果刷新也失敗，清除認證狀態
              set({
                user: null,
                isAuthenticated: false,
                accessToken: null,
                refreshToken: null,
                isInitialized: true,
                error: null,
              });
            }
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            isInitialized: true,
            error: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        // 在重新水化後初始化認證狀態
        if (state) {
          state.initialize();
        }
      },
    }
  )
);

// 便捷的 hooks
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    isInitialized: store.isInitialized,
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateProfile: store.updateProfile,
    clearError: store.clearError,
  };
};

export const useUser = () => {
  return useAuthStore((state) => state.user);
};

export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};

export const useAuthError = () => {
  return useAuthStore((state) => state.error);
};

export const useAuthLoading = () => {
  return useAuthStore((state) => state.isLoading);
};

// Token 管理
export const getAccessToken = () => {
  return useAuthStore.getState().accessToken;
};

export const getRefreshToken = () => {
  return useAuthStore.getState().refreshToken;
};

// 自動 token 刷新
let refreshPromise: Promise<void> | null = null;

export const ensureValidToken = async (): Promise<string | null> => {
  const { accessToken, refreshToken: refresh } = useAuthStore.getState();
  
  if (!accessToken || !refresh) {
    return null;
  }

  // 檢查 token 是否即將過期（提前 5 分鐘刷新）
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    
    // 如果 token 在 5 分鐘內過期，刷新它
    if (timeUntilExpiry < 5 * 60 * 1000) {
      if (!refreshPromise) {
        refreshPromise = useAuthStore.getState().refreshTokenAction();
      }
      
      await refreshPromise;
      refreshPromise = null;
      
      return useAuthStore.getState().accessToken;
    }
    
    return accessToken;
  } catch (error) {
    console.error('Token validation failed:', error);
    return null;
  }
};

export default useAuthStore;
