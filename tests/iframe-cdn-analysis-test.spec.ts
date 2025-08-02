/**
 * iframe CDN 分析測試
 * 分析 http://localhost:3000/games/switcher 頁面的 iframe 是否使用 CDN
 */

import { test, expect } from '@playwright/test';

test.describe('🔍 iframe CDN 分析測試', () => {
  test('分析遊戲切換器頁面的 iframe CDN 狀況', async ({ page }) => {
    console.log('🔍 開始分析 iframe CDN 狀況');
    
    // 導航到遊戲切換器頁面
    await page.goto('http://localhost:3000/games/switcher');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ 頁面載入完成');
    
    // 等待 iframe 載入
    await page.waitForSelector('iframe', { timeout: 10000 });
    console.log('✅ iframe 元素已找到');
    
    // 分析 iframe 的詳細信息
    const iframeAnalysis = await page.evaluate(() => {
      const iframe = document.querySelector('iframe');
      
      if (!iframe) {
        return { error: 'No iframe found' };
      }
      
      try {
        const url = new URL(iframe.src);
        
        return {
          // 基本信息
          src: iframe.src,
          title: iframe.title,
          className: iframe.className,
          sandbox: iframe.sandbox ? iframe.sandbox.toString() : '',
          allow: iframe.allow || '',
          width: iframe.offsetWidth,
          height: iframe.offsetHeight,
          
          // URL 分析
          fullURL: iframe.src,
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port,
          pathname: url.pathname,
          origin: url.origin,
          
          // CDN 分析
          analysis: {
            isExternalCDN: url.hostname !== 'localhost' && 
                          url.hostname !== '127.0.0.1' && 
                          !url.hostname.includes('192.168') &&
                          !url.hostname.includes('10.') &&
                          !url.hostname.includes('172.'),
            isLocalDevelopment: url.hostname === 'localhost' || url.hostname === '127.0.0.1',
            isInternalNetwork: url.hostname.includes('192.168') || 
                              url.hostname.includes('10.') || 
                              url.hostname.includes('172.'),
            serverType: url.port === '3000' ? 'Next.js Main App' : 
                       url.port === '3001' ? 'Vite Dev Server' : 
                       url.port === '80' ? 'HTTP Server' :
                       url.port === '443' ? 'HTTPS Server' : 
                       'Unknown',
            isCDN: url.hostname !== 'localhost' && url.hostname !== '127.0.0.1',
            isHTTPS: url.protocol === 'https:',
            isHTTP: url.protocol === 'http:',
            
            // 常見 CDN 檢測
            isCommonCDN: url.hostname.includes('cdn') || 
                        url.hostname.includes('cloudflare') ||
                        url.hostname.includes('amazonaws') ||
                        url.hostname.includes('jsdelivr') ||
                        url.hostname.includes('unpkg') ||
                        url.hostname.includes('github.io') ||
                        url.hostname.includes('netlify') ||
                        url.hostname.includes('vercel'),
            
            // 判斷結果
            conclusion: (() => {
              if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                return 'Local Development Server';
              } else if (url.hostname.includes('192.168') || url.hostname.includes('10.') || url.hostname.includes('172.')) {
                return 'Internal Network Server';
              } else if (url.hostname.includes('cdn') || url.hostname.includes('cloudflare')) {
                return 'External CDN';
              } else {
                return 'External Server (possibly CDN)';
              }
            })()
          }
        };
      } catch (error) {
        return {
          error: 'Failed to parse URL: ' + error.message,
          src: iframe.src,
          title: iframe.title
        };
      }
    });
    
    console.log('📊 iframe 分析結果:', JSON.stringify(iframeAnalysis, null, 2));
    
    // 驗證分析結果
    expect(iframeAnalysis).toBeDefined();
    expect(iframeAnalysis.src).toBeDefined();
    
    // 輸出詳細分析
    if (iframeAnalysis.analysis) {
      console.log('🔍 CDN 分析詳情:');
      console.log(`   📍 URL: ${iframeAnalysis.fullURL}`);
      console.log(`   🌐 主機名: ${iframeAnalysis.hostname}`);
      console.log(`   🔌 端口: ${iframeAnalysis.port || '默認'}`);
      console.log(`   📁 路徑: ${iframeAnalysis.pathname}`);
      console.log(`   🔒 協議: ${iframeAnalysis.protocol}`);
      console.log(`   🏠 是否本地開發: ${iframeAnalysis.analysis.isLocalDevelopment ? '是' : '否'}`);
      console.log(`   🌍 是否外部 CDN: ${iframeAnalysis.analysis.isExternalCDN ? '是' : '否'}`);
      console.log(`   🏢 是否內網服務器: ${iframeAnalysis.analysis.isInternalNetwork ? '是' : '否'}`);
      console.log(`   🎯 服務器類型: ${iframeAnalysis.analysis.serverType}`);
      console.log(`   📡 是否常見 CDN: ${iframeAnalysis.analysis.isCommonCDN ? '是' : '否'}`);
      console.log(`   🎯 結論: ${iframeAnalysis.analysis.conclusion}`);
    }
    
    // 檢查網絡請求
    const networkRequests = await page.evaluate(() => {
      // 獲取頁面上所有的外部資源
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
      const links = Array.from(document.querySelectorAll('link[href]')).map(l => l.href);
      const images = Array.from(document.querySelectorAll('img[src]')).map(i => i.src);
      
      return {
        scripts,
        links,
        images,
        totalExternalResources: [...scripts, ...links, ...images].filter(url => 
          !url.startsWith('http://localhost') && 
          !url.startsWith('http://127.0.0.1') &&
          !url.startsWith('/')
        ).length
      };
    });
    
    console.log('🌐 網絡資源分析:', JSON.stringify(networkRequests, null, 2));
    
    // 截圖記錄
    await page.screenshot({ 
      path: 'test-results/iframe-cdn-analysis.png',
      fullPage: true 
    });
    
    // 生成分析報告
    const analysisReport = {
      timestamp: new Date().toISOString(),
      pageURL: 'http://localhost:3000/games/switcher',
      iframeAnalysis,
      networkRequests,
      summary: {
        isCDN: iframeAnalysis.analysis?.isExternalCDN || false,
        isLocalDev: iframeAnalysis.analysis?.isLocalDevelopment || false,
        serverType: iframeAnalysis.analysis?.serverType || 'Unknown',
        conclusion: iframeAnalysis.analysis?.conclusion || 'Unknown'
      }
    };
    
    console.log('📋 最終分析報告:', JSON.stringify(analysisReport, null, 2));
    
    // 根據分析結果給出明確答案
    if (iframeAnalysis.analysis?.isLocalDevelopment) {
      console.log('🎯 結論: 這不是 CDN，而是本地開發服務器');
    } else if (iframeAnalysis.analysis?.isExternalCDN) {
      console.log('🎯 結論: 這是外部 CDN');
    } else if (iframeAnalysis.analysis?.isInternalNetwork) {
      console.log('🎯 結論: 這是內網服務器');
    } else {
      console.log('🎯 結論: 無法確定服務器類型');
    }
    
    console.log('🎉 iframe CDN 分析完成');
  });
});
