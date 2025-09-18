const { chromium } = require('playwright');

async function checkVercelPage() {
  console.log('🚀 連接到現有瀏覽器...');
  
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ 成功連接到現有瀏覽器');
    
    const contexts = browser.contexts();
    if (contexts.length === 0) {
      console.log('❌ 沒有找到瀏覽器上下文');
      return;
    }
    
    const context = contexts[0];
    const pages = context.pages();
    
    if (pages.length === 0) {
      console.log('❌ 沒有找到打開的頁面');
      return;
    }
    
    // 使用第一個頁面
    const page = pages[0];
    
    console.log('📍 當前頁面信息:');
    console.log('   標題:', await page.title());
    console.log('   URL:', page.url());
    
    // 如果不在 Vercel 頁面，導航到 Vercel
    if (!page.url().includes('vercel.com')) {
      console.log('🔄 導航到 Vercel 項目頁面...');
      await page.goto('https://vercel.com/minamisums-projects/edu-create');
      await page.waitForTimeout(3000);
    }
    
    // 獲取頁面的主要文本內容
    console.log('📄 獲取頁面內容...');
    const bodyText = await page.locator('body').textContent();
    
    // 檢查是否包含錯誤相關的關鍵詞
    const errorKeywords = ['error', 'failed', 'Error', 'Failed', '250MB', 'function size', 'serverless'];
    
    console.log('🔍 搜索錯誤相關內容:');
    errorKeywords.forEach(keyword => {
      if (bodyText.toLowerCase().includes(keyword.toLowerCase())) {
        console.log(`   ✅ 找到關鍵詞: ${keyword}`);
        
        // 提取包含該關鍵詞的行
        const lines = bodyText.split('\n');
        const relevantLines = lines.filter(line => 
          line.toLowerCase().includes(keyword.toLowerCase()) && 
          line.trim().length > 10
        );
        
        relevantLines.slice(0, 3).forEach((line, index) => {
          console.log(`      ${index + 1}. ${line.trim()}`);
        });
      }
    });
    
    // 截圖保存
    console.log('📸 保存當前頁面截圖...');
    await page.screenshot({ path: 'vercel-current-page.png', fullPage: true });
    
    console.log('🔚 完成檢查');
    await browser.close();
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  }
}

checkVercelPage().catch(console.error);
