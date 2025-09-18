/**
 * Vercel 環境變數自動化配置腳本
 * 使用 Playwright 自動化配置 Vercel 項目的環境變數
 */

const { chromium } = require('playwright');

async function configureVercelEnvironmentVariables() {
    console.log('🚀 開始自動化配置 Vercel 環境變數...');
    
    // 環境變數配置
    const envVars = [
        {
            name: 'DATABASE_URL',
            value: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
            environments: ['Production', 'Preview', 'Development']
        },
        {
            name: 'NEXTAUTH_URL',
            value: 'https://edu-create-57xh685mp-minamisums-projects.vercel.app',
            environments: ['Production']
        },
        {
            name: 'NEXTAUTH_SECRET',
            value: '662c86e428aa5363751a9fa3edd0ec3bff135c8d64a75bd81449e9ae5a4e267e',
            environments: ['Production', 'Preview', 'Development']
        }
    ];

    const browser = await chromium.launch({ 
        headless: false,  // 顯示瀏覽器以便觀察過程
        slowMo: 1000     // 減慢操作速度以便觀察
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('📱 導航到 Vercel 登入頁面...');
        await page.goto('https://vercel.com/login');

        // 等待頁面載入
        await page.waitForLoadState('networkidle');

        console.log('🔐 請手動完成登入...');
        console.log('⏳ 等待登入完成（60秒超時）...');

        // 等待用戶登入，檢查是否出現儀表板
        try {
            await page.waitForURL('**/dashboard**', { timeout: 60000 });
            console.log('✅ 登入成功！');
        } catch (error) {
            console.log('⚠️ 未檢測到自動跳轉，嘗試直接導航到項目頁面...');
        }

        console.log('📱 導航到 Vercel 項目頁面...');
        await page.goto('https://vercel.com/minamisums-projects/edu-create');

        // 等待頁面載入
        await page.waitForLoadState('networkidle');

        console.log('⚙️ 尋找 Settings 標籤...');

        // 等待並點擊 Settings 標籤，使用更靈活的選擇器
        await page.waitForSelector('nav, [role="navigation"], a[href*="settings"]', { timeout: 10000 });

        // 嘗試多種方式找到 Settings 連結
        const settingsSelectors = [
            'a[href*="settings"]',
            'text=Settings',
            '[data-testid*="settings"]',
            'nav a:has-text("Settings")'
        ];

        let settingsFound = false;
        for (const selector of settingsSelectors) {
            try {
                await page.click(selector, { timeout: 5000 });
                settingsFound = true;
                console.log(`✅ 找到 Settings 使用選擇器: ${selector}`);
                break;
            } catch (error) {
                console.log(`⚠️ 選擇器 ${selector} 未找到，嘗試下一個...`);
            }
        }

        if (!settingsFound) {
            throw new Error('無法找到 Settings 標籤');
        }
        
        console.log('🔧 尋找 Environment Variables...');

        // 嘗試多種方式找到 Environment Variables
        const envVarSelectors = [
            'text=Environment Variables',
            'a[href*="environment-variables"]',
            '[data-testid*="environment"]',
            'text=Environment'
        ];

        let envVarFound = false;
        for (const selector of envVarSelectors) {
            try {
                await page.click(selector, { timeout: 5000 });
                envVarFound = true;
                console.log(`✅ 找到 Environment Variables 使用選擇器: ${selector}`);
                break;
            } catch (error) {
                console.log(`⚠️ 選擇器 ${selector} 未找到，嘗試下一個...`);
            }
        }

        if (!envVarFound) {
            throw new Error('無法找到 Environment Variables 選項');
        }

        // 等待環境變數頁面載入
        await page.waitForLoadState('networkidle');
        
        // 為每個環境變數添加配置
        for (const envVar of envVars) {
            console.log(`➕ 添加環境變數: ${envVar.name}`);
            
            try {
                // 點擊 "Add New" 按鈕
                await page.click('button:has-text("Add New")');
                
                // 等待表單出現
                await page.waitForSelector('input[placeholder*="NAME"]', { timeout: 5000 });
                
                // 填寫變數名稱
                await page.fill('input[placeholder*="NAME"]', envVar.name);
                
                // 填寫變數值
                await page.fill('input[placeholder*="VALUE"]', envVar.value);
                
                // 選擇環境
                for (const env of envVar.environments) {
                    await page.check(`input[type="checkbox"][value="${env}"]`);
                }
                
                // 保存環境變數
                await page.click('button:has-text("Save")');
                
                // 等待保存完成
                await page.waitForTimeout(2000);
                
                console.log(`✅ 成功添加環境變數: ${envVar.name}`);
                
            } catch (error) {
                console.log(`⚠️ 添加環境變數 ${envVar.name} 時出現問題: ${error.message}`);
                // 如果變數已存在，繼續下一個
                continue;
            }
        }
        
        console.log('🔄 觸發重新部署...');
        
        // 導航到 Deployments 頁面
        await page.click('text=Deployments');
        await page.waitForLoadState('networkidle');
        
        // 尋找最新的部署並點擊重新部署
        const deploymentRow = page.locator('[data-testid="deployment-row"]').first();
        await deploymentRow.locator('button[aria-label="More options"]').click();
        
        // 點擊 Redeploy
        await page.click('text=Redeploy');
        
        // 確認重新部署
        await page.click('button:has-text("Redeploy")');
        
        console.log('✅ 重新部署已觸發！');
        
        // 等待幾秒鐘讓用戶看到結果
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 自動化過程中出現錯誤:', error);
        
        // 截圖以便調試
        await page.screenshot({ 
            path: 'vercel-automation-error.png',
            fullPage: true 
        });
        
        console.log('📸 錯誤截圖已保存為 vercel-automation-error.png');
    } finally {
        console.log('🔚 關閉瀏覽器...');
        await browser.close();
    }
}

// 執行自動化腳本
if (require.main === module) {
    configureVercelEnvironmentVariables()
        .then(() => {
            console.log('🎉 Vercel 環境變數配置完成！');
            console.log('📋 請檢查以下內容：');
            console.log('   1. 環境變數是否正確添加');
            console.log('   2. 重新部署是否成功');
            console.log('   3. 網站功能是否正常');
            console.log('');
            console.log('🌐 測試您的網站：');
            console.log('   https://edu-create-57xh685mp-minamisums-projects.vercel.app');
        })
        .catch(error => {
            console.error('💥 腳本執行失敗:', error);
            process.exit(1);
        });
}

module.exports = { configureVercelEnvironmentVariables };
