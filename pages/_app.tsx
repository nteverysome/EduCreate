import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { reportWebVitals, sendToAnalytics } from '../lib/webVitals';
import Head from 'next/head';
import { networkMonitor } from '../lib/networkMonitor';

// 報告Web Vitals性能指標
reportWebVitals(sendToAnalytics);

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  // 預加載關鍵頁面和初始化網絡監控
  useEffect(() => {
    // 預取常用路由
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
    checkApiEndpoints();
  }, []);

  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="EduCreate - 互動式教育資源創建平台" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* 預連接到關鍵域名 */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;