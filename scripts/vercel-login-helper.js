const { chromium } = require('playwright');

async function autoVercelLogin() {
    console.log('🚀 啟動 Vercel 登入助手...');
    
    // 從終端輸出中提取登入 URL
    const loginUrl = 'https://vercel.com/oauth/device?user_code=KVFT-FXWS';
    
    const browser = await chromium.launch({ 
        headless: false,  // 顯示瀏覽器
        slowMo: 1000 
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🌐 打開 Vercel 登入頁面...');
        await page.goto(loginUrl);
        
        // 等待頁面載入
        await page.waitForLoadState('networkidle');
        
        console.log('📱 請在瀏覽器中完成以下步驟：');
        console.log('1. 點擊 "Continue with GitHub" 或其他登入方式');
        console.log('2. 完成 GitHub 授權');
        console.log('3. 等待頁面顯示成功訊息');
        console.log('');
        console.log('💡 登入完成後，請按 Enter 繼續...');
        
        // 等待用戶按 Enter
        await new Promise((resolve) => {
            process.stdin.once('data', () => {
                resolve();
            });
        });
        
        console.log('✅ 登入完成！關閉瀏覽器...');
        
    } catch (error) {
        console.error('❌ 登入過程出錯:', error);
    } finally {
        await browser.close();
    }
}

autoVercelLogin();
