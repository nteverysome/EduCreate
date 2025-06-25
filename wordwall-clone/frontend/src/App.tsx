import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// 樣式
import './index.css';

// 頁面組件
import SimpleHomePage from './pages/SimpleHomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateActivityPage from './pages/CreateActivityPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import EditActivityPage from './pages/EditActivityPage';
import ExplorePage from './pages/ExplorePage';
import PlayActivityPage from './pages/PlayActivityPage';
import ProfilePage from './pages/ProfilePage';

// 佈局和保護組件
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// 創建 React Query 客戶端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 分鐘
    },
  },
});

/**
 * 主應用組件
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* 公開路由 */}
            <Route path="/" element={<Layout />}>
              <Route index element={<SimpleHomePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="activities/:id" element={<ActivityDetailPage />} />
              <Route path="play/:activityId" element={<PlayActivityPage />} />

              {/* 認證路由 */}
              <Route path="login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="register" element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } />
            </Route>

            {/* 需要認證的路由 */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="create" element={<CreateActivityPage />} />
              <Route path="activities/:id/edit" element={<EditActivityPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* 404 頁面 */}
            <Route path="*" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">頁面不存在</h1>
                  <p className="text-gray-600 mb-6">您訪問的頁面可能已被移動或刪除</p>
                  <a
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    返回首頁
                  </a>
                </div>
              </div>
            } />
          </Routes>

          {/* 全局 Toast 通知 */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                borderRadius: '0.75rem',
                padding: '16px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
