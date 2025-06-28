import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { reportWebVitals, sendToAnalytics } from '../lib/webVitals';
import Head from 'next/head';
import { networkMonitor } from '../lib/networkMonitor';
import { performanceMonitor, perf } from '../lib/utils/performanceMonitor';
import { useAppStore } from '../lib/store/useAppStore';
import { ErrorBoundary } from '../components/ErrorBoundary';
import PerformanceMonitor from '../components/monitoring/PerformanceMonitor';

// 報告Web Vitals性能指標
reportWebVitals((metric) => {
  sendToAnalytics(metric);
  // 同時記錄到性能監控系統
  perf.webVital(metric.name, metric.value);
});

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const { setUser, setLoading } = useAppStore();

  // 初始化應用和性能監控
  useEffect(() => {
    perf.start('app_initialization');

    // 註冊 Service Worker (PWA 離線支持)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker 註冊成功:', registration);
          perf.mark('service_worker_registered');

          // 監聽 Service Worker 更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 有新版本可用，可以提示用戶刷新
                  console.log('🔄 新版本可用，建議刷新頁面');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker 註冊失敗:', error);
          perf.error(error, 'service_worker_registration_failed');
        });
    }

    // 設置全局錯誤處理
    const handleGlobalError = (event: ErrorEvent) => {
      perf.error(new Error(event.message), 'global_error', {
        filename: event.filename,
        lineno: event.lineno?.toString(),
        colno: event.colno?.toString(),
      });

      // 發送到錯誤追蹤 API
      fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: event.message,
          stack: event.error?.stack,
          url: window.location.href,
          severity: 'high',
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      }).catch(console.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      perf.error(
        new Error(event.reason?.toString() || 'Unhandled Promise Rejection'),
        'unhandled_promise_rejection'
      );

      // 發送到錯誤追蹤 API
      fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          url: window.location.href,
          severity: 'medium',
          context: {
            reason: event.reason,
            timestamp: new Date().toISOString()
          }
        })
      }).catch(console.error);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 用戶會話管理
  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'USER',
        image: session.user.image,
      });
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  // 預加載關鍵頁面和初始化網絡監控
  useEffect(() => {
    // 預取常用路由（使用性能監控）
    perf.measure('route_prefetch', () => {
      const prefetchRoutes = [
        '/dashboard',
        '/activities',
        '/templates',
        '/create',
      ];

      prefetchRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    });
    
    // 初始化網絡監控並檢查API健康狀態
    const checkApiEndpoints = async () => {
      try {
        // 在開發環境中獲取測試令牌
        if (process.env.NODE_ENV !== 'production') {
          try {
            const testTokenResponse = await fetch('/api/auth/test-token');
            if (testTokenResponse.ok) {
              const tokenData = await testTokenResponse.json();
              console.log('開發環境：已獲取測試令牌');
              localStorage.setItem('eduCreateTestToken', tokenData.token);
              
              // 設置默認的請求頭，包含測試令牌
              const originalFetch = window.fetch;
              window.fetch = function(input, init = {}) {
                const headers = new Headers(init.headers);
                if (!headers.has('Authorization') && tokenData.token) {
                  headers.set('Authorization', `Bearer ${tokenData.token}`);
                }
                return originalFetch(input, { ...init, headers });
              };
            }
          } catch (tokenError) {
            console.warn('獲取測試令牌失敗:', tokenError);
          }
        }
        
        // 檢查基本搜索API
        const searchApiStatus = await networkMonitor.checkApiConnection('/api/search');
        console.log('基本搜索API狀態:', searchApiStatus.connected ? '正常' : '連接失敗');
        
        // 檢查高級搜索API
        const advancedSearchApiStatus = await networkMonitor.checkApiConnection('/api/search/advanced');
        console.log('高級搜索API狀態:', advancedSearchApiStatus.connected ? '正常' : '連接失敗');
        
        // 如果API連接失敗，記錄詳細信息
        if (!searchApiStatus.connected || !advancedSearchApiStatus.connected) {
          console.warn('API連接問題:', {
            search: searchApiStatus,
            advancedSearch: advancedSearchApiStatus
          });
        }
      } catch (error) {
        console.error('API健康檢查失敗:', error);
      }
    };
    
    // 執行API健康檢查
    perf.measureAsync('api_health_check', checkApiEndpoints);

    // 完成應用初始化
    perf.end('app_initialization');
  }, []);

  return (
    <ErrorBoundary>
      <PerformanceMonitor enabled={process.env.NODE_ENV === 'production'}>
        <SessionProvider session={session}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="EduCreate - 互動式教育資源創建平台" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.ico" />

            {/* 預連接到關鍵域名 */}
            <link rel="preconnect" href="https://res.cloudinary.com" />
            <link rel="dns-prefetch" href="https://res.cloudinary.com" />

            {/* 性能優化 */}
            <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="" />
          </Head>
          <Component {...pageProps} />
        </SessionProvider>
      </PerformanceMonitor>
    </ErrorBoundary>
  );
}

export default MyApp;