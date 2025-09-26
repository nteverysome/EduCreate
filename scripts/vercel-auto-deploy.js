const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class VercelAutoDeployer {
    constructor() {
        this.browser = null;
        this.page = null;
        this.deployUrl = null;
    }

    async init() {
        console.log('🚀 啟動 Vercel 自動部署流程...');
        this.browser = await chromium.launch({ 
            headless: false,  // 顯示瀏覽器以便用戶看到登入過程
            slowMo: 1000 
        });
        this.page = await this.browser.newPage();
    }

    async handleVercelLogin() {
        console.log('🔐 處理 Vercel 登入...');
        
        try {
            // 啟動 vercel login 命令
            const vercelLogin = spawn('vercel', ['login'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let loginUrl = '';
            
            // 監聽輸出以獲取登入 URL
            vercelLogin.stdout.on('data', (data) => {
                const output = data.toString();
                console.log('Vercel 輸出:', output);
                
                // 尋找登入 URL
                const urlMatch = output.match(/Visit (https:\/\/vercel\.com\/oauth\/device\?user_code=[A-Z0-9-]+)/);
                if (urlMatch) {
                    loginUrl = urlMatch[1];
                    console.log('🔗 找到登入 URL:', loginUrl);
                    this.autoLogin(loginUrl);
                }
            });

            vercelLogin.stderr.on('data', (data) => {
                console.log('Vercel 錯誤:', data.toString());
            });

            // 等待登入完成
            return new Promise((resolve, reject) => {
                vercelLogin.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Vercel 登入成功！');
                        resolve();
                    } else {
                        reject(new Error(`Vercel 登入失敗，退出碼: ${code}`));
                    }
                });
            });

        } catch (error) {
            console.error('❌ Vercel 登入過程出錯:', error);
            throw error;
        }
    }

    async autoLogin(loginUrl) {
        console.log('🌐 自動打開登入頁面...');
        
        try {
            // 導航到登入頁面
            await this.page.goto(loginUrl);
            
            // 等待頁面載入
            await this.page.waitForLoadState('networkidle');
            
            console.log('📱 請在瀏覽器中完成登入...');
            console.log('💡 登入完成後，腳本會自動繼續部署');
            
            // 等待登入成功（檢查頁面變化）
            await this.page.waitForFunction(() => {
                return document.title.includes('Success') || 
                       document.body.innerText.includes('success') ||
                       document.body.innerText.includes('authenticated');
            }, { timeout: 300000 }); // 5分鐘超時
            
            console.log('✅ 登入頁面顯示成功！');
            
        } catch (error) {
            console.log('⚠️ 自動登入檢測超時，但可能已經成功');
            console.log('💡 請檢查終端中的 Vercel 輸出');
        }
    }

    async deployToVercel() {
        console.log('🚀 開始部署到 Vercel...');
        
        return new Promise((resolve, reject) => {
            const vercelDeploy = spawn('vercel', ['--prod'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
                cwd: process.cwd()
            });

            let deployOutput = '';

            vercelDeploy.stdout.on('data', (data) => {
                const output = data.toString();
                deployOutput += output;
                console.log('部署輸出:', output);
                
                // 尋找部署 URL
                const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.vercel\.app/);
                if (urlMatch) {
                    this.deployUrl = urlMatch[0];
                    console.log('🌐 部署 URL:', this.deployUrl);
                }
            });

            vercelDeploy.stderr.on('data', (data) => {
                console.log('部署錯誤:', data.toString());
            });

            vercelDeploy.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Vercel 部署成功！');
                    console.log('🌐 網站地址:', this.deployUrl);
                    resolve(this.deployUrl);
                } else {
                    reject(new Error(`部署失敗，退出碼: ${code}`));
                }
            });
        });
    }

    async createPlaywrightTest() {
        console.log('📝 創建 Playwright 測試腳本...');
        
        const testScript = `
const { test, expect, devices } = require('@playwright/test');

test.describe('Vercel 部署全螢幕測試', () => {
    test('手機環境全螢幕功能測試', async ({ browser }) => {
        // 模擬 iPhone
        const context = await browser.newContext({
            ...devices['iPhone 12'],
            permissions: ['camera', 'microphone']
        });
        
        const page = await context.newPage();
        
        console.log('🌐 訪問部署的網站...');
        await page.goto('${this.deployUrl}/mobile-postmessage-test.html');
        
        // 等待頁面載入
        await page.waitForLoadState('networkidle');
        
        // 等待 iframe 載入
        console.log('⏳ 等待遊戲載入...');
        await page.waitForSelector('#gameIframe', { timeout: 30000 });
        
        // 等待遊戲完全載入
        await page.waitForTimeout(5000);
        
        // 截圖：載入完成狀態
        await page.screenshot({ 
            path: 'test-results/01-loaded.png',
            fullPage: true 
        });
        
        console.log('🎮 測試遊戲內全螢幕按鈕...');
        
        // 切換到 iframe 內部
        const iframe = page.frameLocator('#gameIframe');
        
        // 尋找全螢幕按鈕
        const fullscreenBtn = iframe.locator('button').filter({ hasText: '⛶' }).or(
            iframe.locator('[onclick*="fullscreen"]')
        ).or(
            iframe.locator('.fullscreen-btn')
        );
        
        // 等待按鈕出現
        await fullscreenBtn.waitFor({ timeout: 10000 });
        
        console.log('🔍 找到全螢幕按鈕，準備點擊...');
        
        // 點擊全螢幕按鈕
        await fullscreenBtn.click();
        
        // 等待全螢幕效果
        await page.waitForTimeout(2000);
        
        // 截圖：全螢幕狀態
        await page.screenshot({ 
            path: 'test-results/02-fullscreen.png',
            fullPage: true 
        });
        
        console.log('🔄 測試退出全螢幕...');
        
        // 再次點擊退出全螢幕
        await fullscreenBtn.click();
        
        // 等待退出效果
        await page.waitForTimeout(2000);
        
        // 截圖：退出全螢幕狀態
        await page.screenshot({ 
            path: 'test-results/03-exit-fullscreen.png',
            fullPage: true 
        });
        
        console.log('✅ 全螢幕測試完成！');
        
        await context.close();
    });
    
    test('桌面環境全螢幕功能測試', async ({ page }) => {
        console.log('💻 桌面環境測試...');
        
        await page.goto('${this.deployUrl}/mobile-postmessage-test.html');
        await page.waitForLoadState('networkidle');
        
        // 測試手動全螢幕按鈕
        const manualBtn = page.locator('button:has-text("測試全螢幕請求")');
        if (await manualBtn.isVisible()) {
            await manualBtn.click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
                path: 'test-results/04-desktop-fullscreen.png',
                fullPage: true 
            });
        }
        
        console.log('✅ 桌面測試完成！');
    });
});
`;

        // 創建測試目錄
        const testDir = path.join(process.cwd(), 'tests', 'vercel');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        // 創建結果目錄
        const resultsDir = path.join(process.cwd(), 'test-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        // 寫入測試文件
        const testFile = path.join(testDir, 'fullscreen-vercel.spec.js');
        fs.writeFileSync(testFile, testScript);
        
        console.log('📝 測試腳本已創建:', testFile);
        return testFile;
    }

    async runPlaywrightTest(testFile) {
        console.log('🧪 運行 Playwright 測試...');
        
        return new Promise((resolve, reject) => {
            const playwrightTest = spawn('npx', ['playwright', 'test', testFile, '--headed'], {
                stdio: 'inherit',
                shell: true,
                cwd: process.cwd()
            });

            playwrightTest.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Playwright 測試完成！');
                    resolve();
                } else {
                    console.log('⚠️ 測試完成，退出碼:', code);
                    resolve(); // 即使有失敗也繼續
                }
            });
        });
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        try {
            await this.init();
            
            // 步驟1: 處理登入
            await this.handleVercelLogin();
            
            // 步驟2: 部署
            const deployUrl = await this.deployToVercel();
            
            if (!deployUrl) {
                throw new Error('無法獲取部署 URL');
            }
            
            // 步驟3: 創建測試
            const testFile = await this.createPlaywrightTest();
            
            // 步驟4: 運行測試
            await this.runPlaywrightTest(testFile);
            
            console.log('🎉 完整流程完成！');
            console.log('🌐 網站地址:', deployUrl);
            console.log('📱 你現在可以用手機訪問:', deployUrl + '/mobile-postmessage-test.html');
            
        } catch (error) {
            console.error('❌ 流程出錯:', error);
        } finally {
            await this.cleanup();
        }
    }
}

// 運行自動部署器
const deployer = new VercelAutoDeployer();
deployer.run();
