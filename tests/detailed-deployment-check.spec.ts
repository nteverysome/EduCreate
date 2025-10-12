import { test, expect } from '@playwright/test';

test.describe('詳細部署狀況檢查', () => {
  
  test('檢查網站各個頁面的實際狀況', async ({ page }) => {
    console.log('🔍 開始詳細檢查網站各頁面狀況...');
    
    const testPages = [
      { url: 'https://edu-create.vercel.app', name: '主頁' },
      { url: 'https://edu-create.vercel.app/create', name: '創建頁面' },
      { url: 'https://edu-create.vercel.app/create/shimozurdo-game', name: 'Shimozurdo遊戲頁面' },
      { url: 'https://edu-create.vercel.app/games/switcher', name: '遊戲切換器' },
      { url: 'https://edu-create.vercel.app/gept', name: 'GEPT頁面' }
    ];
    
    const results = [];
    
    for (const testPage of testPages) {
      console.log(`\n📄 檢查 ${testPage.name}: ${testPage.url}`);
      
      try {
        const response = await page.goto(testPage.url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        const status = response?.status();
        console.log(`   HTTP 狀態: ${status}`);
        
        // 等待頁面完全載入
        await page.waitForTimeout(3000);
        
        // 檢查頁面標題
        const title = await page.title();
        console.log(`   頁面標題: ${title}`);
        
        // 檢查頁面內容
        const bodyText = await page.locator('body').textContent();
        const contentLength = bodyText?.length || 0;
        console.log(`   內容長度: ${contentLength} 字符`);
        
        // 檢查是否有錯誤信息
        const errorIndicators = [
          'Application error', 'Internal Server Error', '500', '404', 
          'Not Found', 'Error', 'Failed to load', 'Something went wrong',
          '應用程式錯誤', '內部伺服器錯誤', '找不到頁面', '載入失敗'
        ];
        
        let hasError = false;
        let errorType = '';
        
        for (const indicator of errorIndicators) {
          if (title.includes(indicator) || bodyText?.includes(indicator)) {
            hasError = true;
            errorType = indicator;
            break;
          }
        }
        
        // 檢查是否有 Next.js 錯誤
        const nextjsError = await page.locator('.next-error-h1').isVisible();
        if (nextjsError) {
          hasError = true;
          errorType = 'Next.js Error';
          const errorCode = await page.locator('.next-error-h1').textContent();
          console.log(`   Next.js 錯誤碼: ${errorCode}`);
        }
        
        // 檢查是否有載入中狀態
        const loadingIndicators = ['載入中', 'Loading', 'loading'];
        let isLoading = false;
        
        for (const indicator of loadingIndicators) {
          if (bodyText?.includes(indicator)) {
            isLoading = true;
            break;
          }
        }
        
        // 截圖
        const filename = testPage.name.replace(/[^a-zA-Z0-9]/g, '-');
        await page.screenshot({ 
          path: `test-results/page-check-${filename}.png`,
          fullPage: true 
        });
        
        const result = {
          name: testPage.name,
          url: testPage.url,
          status: status,
          title: title,
          contentLength: contentLength,
          hasError: hasError,
          errorType: errorType,
          isLoading: isLoading,
          success: status === 200 && !hasError && contentLength > 100
        };
        
        results.push(result);
        
        if (result.success) {
          console.log(`   ✅ ${testPage.name} 正常`);
        } else {
          console.log(`   ❌ ${testPage.name} 異常: ${errorType || '未知錯誤'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${testPage.name} 訪問失敗: ${error}`);
        results.push({
          name: testPage.name,
          url: testPage.url,
          status: 0,
          title: '',
          contentLength: 0,
          hasError: true,
          errorType: 'Network Error',
          isLoading: false,
          success: false
        });
      }
      
      await page.waitForTimeout(1000);
    }
    
    // 生成總結報告
    console.log('\n📊 檢查結果總結:');
    console.log('==================');
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`總頁面數: ${totalCount}`);
    console.log(`正常頁面: ${successCount}`);
    console.log(`異常頁面: ${totalCount - successCount}`);
    console.log(`成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`);
    
    console.log('\n詳細結果:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.status} - ${result.errorType || '正常'}`);
    });
    
    // 如果有失敗的頁面，記錄詳細信息
    const failedPages = results.filter(r => !r.success);
    if (failedPages.length > 0) {
      console.log('\n❌ 失敗頁面詳情:');
      failedPages.forEach(page => {
        console.log(`   ${page.name}:`);
        console.log(`     URL: ${page.url}`);
        console.log(`     狀態碼: ${page.status}`);
        console.log(`     錯誤類型: ${page.errorType}`);
        console.log(`     內容長度: ${page.contentLength}`);
      });
    }
    
    // 至少要有一半的頁面正常才算通過
    expect(successCount).toBeGreaterThanOrEqual(Math.ceil(totalCount / 2));
  });

  test('檢查 Shimozurdo Game 響應式功能', async ({ page }) => {
    console.log('📱 檢查 Shimozurdo Game 響應式功能...');
    
    const url = 'https://edu-create.vercel.app/create/shimozurdo-game';
    
    // 測試不同設備尺寸
    const devices = [
      { name: '手機', width: 375, height: 812 },
      { name: '平板', width: 768, height: 1024 },
      { name: '桌面', width: 1920, height: 1080 }
    ];
    
    for (const device of devices) {
      console.log(`\n📱 測試 ${device.name} (${device.width}x${device.height})`);
      
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // 截圖
      await page.screenshot({ 
        path: `test-results/responsive-${device.name}-${device.width}x${device.height}.png`,
        fullPage: true 
      });
      
      // 檢查頁面是否正常顯示
      const bodyText = await page.locator('body').textContent();
      const hasContent = bodyText && bodyText.length > 100;
      
      // 檢查是否有水平滾動
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      const hasHorizontalScroll = scrollWidth > clientWidth + 20;
      
      console.log(`   內容正常: ${hasContent ? '✅' : '❌'}`);
      console.log(`   無水平滾動: ${!hasHorizontalScroll ? '✅' : '❌'}`);
      console.log(`   視窗寬度: ${clientWidth}px, 內容寬度: ${scrollWidth}px`);
      
      if (hasContent && !hasHorizontalScroll) {
        console.log(`   ✅ ${device.name} 響應式測試通過`);
      } else {
        console.log(`   ❌ ${device.name} 響應式測試失敗`);
      }
    }
  });
});
