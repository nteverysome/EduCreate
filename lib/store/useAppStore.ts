import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  content: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  id: string;
  status: string;
  plan: string;
  expiresAt?: string;
}

interface AppState {
  // 用戶狀態
  user: User | null;
  isAuthenticated: boolean;
  
  // 訂閱狀態
  subscription: Subscription | null;
  hasSubscription: boolean;
  activityCount: number;
  activityLimit: number;
  
  // 活動狀態
  activities: Activity[];
  currentActivity: Activity | null;
  
  // UI 狀態
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // 緩存狀態
  lastFetchTime: number;
  cacheValid: boolean;
}

interface AppActions {
  // 用戶操作
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  
  // 訂閱操作
  setSubscription: (subscription: Subscription | null) => void;
  updateSubscriptionStatus: (status: {
    hasSubscription: boolean;
    activityCount: number;
    activityLimit: number;
  }) => void;
  
  // 活動操作
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  removeActivity: (id: string) => void;
  setCurrentActivity: (activity: Activity | null) => void;
  
  // UI 操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // 緩存操作
  invalidateCache: () => void;
  updateCacheTime: () => void;
  
  // 重置操作
  reset: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  subscription: null,
  hasSubscription: false,
  activityCount: 0,
  activityLimit: 5,
  activities: [],
  currentActivity: null,
  isLoading: false,
  error: null,
  sidebarOpen: false,
  theme: 'light',
  lastFetchTime: 0,
  cacheValid: false,
};

/**
 * 全局應用狀態管理 Store
 * 使用 Zustand 提供統一的狀態管理
 */
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 用戶操作
        setUser: (user) => set(
          (state) => ({
            user,
            isAuthenticated: !!user,
          }),
          false,
          'setUser'
        ),

        updateUser: (updates) => set(
          (state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          }),
          false,
          'updateUser'
        ),

        logout: () => set(
          () => ({
            user: null,
            isAuthenticated: false,
            subscription: null,
            hasSubscription: false,
            activities: [],
            currentActivity: null,
            activityCount: 0,
          }),
          false,
          'logout'
        ),

        // 訂閱操作
        setSubscription: (subscription) => set(
          () => ({
            subscription,
            hasSubscription: !!subscription && subscription.status === 'active',
          }),
          false,
          'setSubscription'
        ),

        updateSubscriptionStatus: (status) => set(
          () => status,
          false,
          'updateSubscriptionStatus'
        ),

        // 活動操作
        setActivities: (activities) => set(
          () => ({
            activities,
            activityCount: activities.length,
          }),
          false,
          'setActivities'
        ),

        addActivity: (activity) => set(
          (state) => ({
            activities: [activity, ...state.activities],
            activityCount: state.activityCount + 1,
          }),
          false,
          'addActivity'
        ),

        updateActivity: (id, updates) => set(
          (state) => ({
            activities: state.activities.map(activity =>
              activity.id === id ? { ...activity, ...updates } : activity
            ),
            currentActivity: state.currentActivity?.id === id
              ? { ...state.currentActivity, ...updates }
              : state.currentActivity,
          }),
          false,
          'updateActivity'
        ),

        removeActivity: (id) => set(
          (state) => ({
            activities: state.activities.filter(activity => activity.id !== id),
            currentActivity: state.currentActivity?.id === id ? null : state.currentActivity,
            activityCount: Math.max(0, state.activityCount - 1),
          }),
          false,
          'removeActivity'
        ),

        setCurrentActivity: (activity) => set(
          () => ({ currentActivity: activity }),
          false,
          'setCurrentActivity'
        ),

        // UI 操作
        setLoading: (isLoading) => set(
          () => ({ isLoading }),
          false,
          'setLoading'
        ),

        setError: (error) => set(
          () => ({ error }),
          false,
          'setError'
        ),

        toggleSidebar: () => set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          'toggleSidebar'
        ),

        setSidebarOpen: (sidebarOpen) => set(
          () => ({ sidebarOpen }),
          false,
          'setSidebarOpen'
        ),

        setTheme: (theme) => set(
          () => ({ theme }),
          false,
          'setTheme'
        ),

        // 緩存操作
        invalidateCache: () => set(
          () => ({ cacheValid: false }),
          false,
          'invalidateCache'
        ),

        updateCacheTime: () => set(
          () => ({
            lastFetchTime: Date.now(),
            cacheValid: true,
          }),
          false,
          'updateCacheTime'
        ),

        // 重置操作
        reset: () => set(
          () => initialState,
          false,
          'reset'
        ),
      }),
      {
        name: 'educreate-app-store',
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: 'EduCreate App Store',
    }
  )
);

// 選擇器 hooks
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useSubscription = () => useAppStore((state) => ({
  subscription: state.subscription,
  hasSubscription: state.hasSubscription,
  activityCount: state.activityCount,
  activityLimit: state.activityLimit,
}));
export const useActivities = () => useAppStore((state) => state.activities);
export const useCurrentActivity = () => useAppStore((state) => state.currentActivity);
export const useUIState = () => useAppStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
  sidebarOpen: state.sidebarOpen,
  theme: state.theme,
}));

export default useAppStore;
