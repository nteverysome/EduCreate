const { chromium } = require('playwright');

async function connectToExistingChrome() {
    try {
        console.log('🔗 正在連接到你的 Chrome...');
        
        // 連接到你已開啟的 Chrome (DevTools Protocol)
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        
        console.log('✅ 成功連接到 Chrome!');
        
        // 獲取所有頁面
        const contexts = browser.contexts();
        const pages = [];
        for (const context of contexts) {
            pages.push(...context.pages());
        }
        
        console.log(`📄 找到 ${pages.length} 個頁面:`);
        
        // 顯示所有頁面
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const title = await page.title();
            const url = page.url();
            console.log(`  ${i + 1}. ${title} - ${url}`);
        }
        
        // 找到 EduCreate 頁面
        const eduCreatePage = pages.find(page => 
            page.url().includes('edu-create.vercel.app')
        );
        
        if (eduCreatePage) {
            console.log('\n🎯 找到 EduCreate 頁面，正在操作...');
            
            // 導航到主頁
            await eduCreatePage.goto('https://edu-create.vercel.app');
            console.log('✅ 導航到主頁完成');
            
            // 獲取頁面內容
            const title = await eduCreatePage.title();
            console.log(`📋 頁面標題: ${title}`);
            
            // 截圖
            await eduCreatePage.screenshot({ 
                path: 'chrome-controlled-screenshot.png',
                fullPage: true 
            });
            console.log('📸 截圖已保存: chrome-controlled-screenshot.png');
            
            // 獲取頁面文本內容
            const textContent = await eduCreatePage.evaluate(() => {
                return document.body.innerText.substring(0, 500);
            });
            console.log('📝 頁面內容預覽:');
            console.log(textContent);
            
        } else {
            console.log('❌ 未找到 EduCreate 頁面');
        }
        
        // 不關閉瀏覽器，保持你的 Chrome 開啟
        console.log('🔄 保持 Chrome 開啟，斷開連接');
        await browser.close();
        
    } catch (error) {
        console.error('❌ 連接失敗:', error.message);
        console.log('\n💡 請確保:');
        console.log('1. Chrome 已啟動並開啟 DevTools Protocol (--remote-debugging-port=9222)');
        console.log('2. 訪問了 https://edu-create.vercel.app');
    }
}

// 執行連接
connectToExistingChrome();