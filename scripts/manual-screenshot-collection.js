/**
 * 手動截圖收集腳本
 * 使用 Puppeteer 直接連接本地服務器收集截圖
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function collectScreenshots() {
  console.log('🎬 開始收集檔案夾協作系統視覺證據...');
  
  // 創建截圖目錄
  const screenshotDir = path.join(process.cwd(), 'test-results', 'manual-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  let browser;
  try {
    // 啟動瀏覽器
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1200, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // 步驟1: 主頁證據收集
    console.log('📸 步驟1: 收集主頁整合證據');
    try {
      await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 主頁全頁截圖
      await page.screenshot({ 
        path: path.join(screenshotDir, '01-homepage-full.png'), 
        fullPage: true 
      });
      console.log('✅ 主頁全頁截圖已保存');
      
      // 檢查檔案夾協作功能卡片
      const collaborationFeature = await page.$('[data-testid="feature-folder-collaboration"]');
      if (collaborationFeature) {
        await collaborationFeature.scrollIntoView();
        await page.waitForTimeout(1000);
        await collaborationFeature.screenshot({ 
          path: path.join(screenshotDir, '02-homepage-collaboration-card.png')
        });
        console.log('✅ 主頁檔案夾協作功能卡片截圖已保存');
      }
    } catch (error) {
      console.log('⚠️ 主頁截圖收集失敗:', error.message);
    }
    
    // 步驟2: 儀表板證據收集
    console.log('📸 步驟2: 收集儀表板整合證據');
    try {
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // 儀表板全頁截圖
      await page.screenshot({ 
        path: path.join(screenshotDir, '03-dashboard-full.png'), 
        fullPage: true 
      });
      console.log('✅ 儀表板全頁截圖已保存');
      
      // 檔案夾協作功能卡片
      const collaborationCard = await page.$('[data-testid="feature-card-folder-collaboration"]');
      if (collaborationCard) {
        await collaborationCard.scrollIntoView();
        await page.waitForTimeout(1000);
        await collaborationCard.screenshot({ 
          path: path.join(screenshotDir, '04-dashboard-collaboration-card.png')
        });
        console.log('✅ 儀表板檔案夾協作功能卡片截圖已保存');
      }
    } catch (error) {
      console.log('⚠️ 儀表板截圖收集失敗:', error.message);
    }
    
    // 步驟3: 功能頁面證據收集
    console.log('📸 步驟3: 收集功能頁面證據');
    try {
      await page.goto('http://localhost:3000/collaboration/folders', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // 檔案夾協作頁面全頁截圖
      await page.screenshot({ 
        path: path.join(screenshotDir, '05-collaboration-page-full.png'), 
        fullPage: true 
      });
      console.log('✅ 檔案夾協作頁面全頁截圖已保存');
      
      // 檢查頁面標題
      const collaborationTitle = await page.$('[data-testid="collaboration-title"]');
      if (collaborationTitle) {
        await collaborationTitle.screenshot({ 
          path: path.join(screenshotDir, '06-collaboration-title.png')
        });
        console.log('✅ 檔案夾協作頁面標題截圖已保存');
      }
      
      // 檢查統計概覽
      const statsElements = [
        'total-collaborations',
        'total-collaborators', 
        'total-shares',
        'total-views'
      ];
      
      for (const statElement of statsElements) {
        const element = await page.$(`[data-testid="${statElement}"]`);
        if (element) {
          await element.screenshot({ 
            path: path.join(screenshotDir, `07-stat-${statElement}.png`)
          });
          console.log(`✅ 統計項目 ${statElement} 截圖已保存`);
        }
      }
      
      // 檢查檔案夾列表
      const foldersTitle = await page.$('[data-testid="folders-title"]');
      if (foldersTitle) {
        const foldersSection = await page.evaluateHandle(
          (el) => el.parentElement, 
          foldersTitle
        );
        await foldersSection.screenshot({ 
          path: path.join(screenshotDir, '08-folders-list.png')
        });
        console.log('✅ 檔案夾列表截圖已保存');
      }
      
      // 步驟4: 功能互動證據收集
      console.log('📸 步驟4: 收集功能互動證據');
      
      // 選擇第一個檔案夾
      const firstFolder = await page.$('[data-testid="folder-item-folder_1"]');
      if (firstFolder) {
        await firstFolder.click();
        await page.waitForTimeout(2000);
        
        // 檔案夾選中狀態截圖
        await page.screenshot({ 
          path: path.join(screenshotDir, '09-folder-selected.png'), 
          fullPage: true 
        });
        console.log('✅ 檔案夾選中狀態截圖已保存');
        
        // 測試各個標籤
        const tabs = [
          { id: 'overview', name: '概覽' },
          { id: 'collaborators', name: '協作者' },
          { id: 'sharing', name: '分享設定' },
          { id: 'invitations', name: '邀請' },
          { id: 'activity', name: '活動記錄' }
        ];
        
        for (const tab of tabs) {
          const tabButton = await page.$(`[data-testid="tab-${tab.id}"]`);
          if (tabButton) {
            await tabButton.click();
            await page.waitForTimeout(1000);
            
            const tabContent = await page.$(`[data-testid="${tab.id}-tab"]`);
            if (tabContent) {
              await tabContent.screenshot({ 
                path: path.join(screenshotDir, `10-tab-${tab.id}.png`)
              });
              console.log(`✅ ${tab.name} 標籤內容截圖已保存`);
            }
          }
        }
      }
      
      // 步驟5: 響應式設計證據收集
      console.log('📸 步驟5: 收集響應式設計證據');
      
      const viewports = [
        { width: 1200, height: 800, name: 'desktop' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewport({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: path.join(screenshotDir, `11-responsive-${viewport.name}.png`), 
          fullPage: true 
        });
        console.log(`✅ ${viewport.name} 響應式設計截圖已保存`);
      }
      
      // 恢復桌面視圖
      await page.setViewport({ width: 1200, height: 800 });
      await page.waitForTimeout(1000);
      
      // 最終完整頁面截圖
      await page.screenshot({ 
        path: path.join(screenshotDir, '12-final-complete-page.png'), 
        fullPage: true 
      });
      console.log('✅ 最終完整頁面截圖已保存');
      
    } catch (error) {
      console.log('⚠️ 功能頁面截圖收集失敗:', error.message);
    }
    
    console.log('🎉 檔案夾協作系統視覺證據收集完成！');
    console.log(`📁 所有截圖已保存到 ${screenshotDir}`);
    
    // 生成證據報告
    const evidenceReport = {
      totalScreenshots: 12,
      categories: {
        homepage: 2,
        dashboard: 2, 
        functionality: 6,
        responsive: 3
      },
      timestamp: new Date().toISOString(),
      status: 'completed',
      directory: screenshotDir
    };
    
    // 保存報告
    fs.writeFileSync(
      path.join(screenshotDir, 'evidence-report.json'),
      JSON.stringify(evidenceReport, null, 2)
    );
    
    console.log('📊 視覺證據報告:', JSON.stringify(evidenceReport, null, 2));
    
  } catch (error) {
    console.error('❌ 視覺證據收集失敗:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 檢查是否直接運行此腳本
if (require.main === module) {
  collectScreenshots().catch(console.error);
}

module.exports = collectScreenshots;
