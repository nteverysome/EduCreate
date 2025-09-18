/**
 * Vercel 環境變數引導式配置腳本
 * 打開瀏覽器並提供逐步指導
 */

const { chromium } = require('playwright');

async function guidedVercelSetup() {
    console.log('🎯 Vercel 環境變數引導式配置');
    console.log('=====================================');
    
    const envVars = [
        {
            name: 'DATABASE_URL',
            value: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
            environments: ['Production', 'Preview', 'Development'],
            description: '資料庫連接字串'
        },
        {
            name: 'NEXTAUTH_URL',
            value: 'https://edu-create-57xh685mp-minamisums-projects.vercel.app',
            environments: ['Production'],
            description: 'NextAuth 回調 URL'
        },
        {
            name: 'NEXTAUTH_SECRET',
            value: '662c86e428aa5363751a9fa3edd0ec3bff135c8d64a75bd81449e9ae5a4e267e',
            environments: ['Production', 'Preview', 'Development'],
            description: 'NextAuth 加密密鑰'
        }
    ];

    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    try {
        console.log('\n🚀 步驟 1: 打開 Vercel 項目頁面');
        await page.goto('https://vercel.com/minamisums-projects/edu-create');
        
        console.log('⏳ 請手動登入 Vercel（如果需要）...');
        console.log('按 Enter 鍵繼續到下一步...');
        await waitForUserInput();
        
        console.log('\n⚙️ 步驟 2: 導航到設置頁面');
        console.log('請點擊頁面上的 "Settings" 標籤');
        console.log('按 Enter 鍵確認已點擊...');
        await waitForUserInput();
        
        console.log('\n🔧 步驟 3: 進入環境變數設置');
        console.log('請點擊左側菜單的 "Environment Variables"');
        console.log('按 Enter 鍵確認已進入環境變數頁面...');
        await waitForUserInput();
        
        console.log('\n📝 步驟 4: 添加環境變數');
        console.log('現在將逐一添加以下環境變數：\n');
        
        for (let i = 0; i < envVars.length; i++) {
            const envVar = envVars[i];
            console.log(`\n--- 環境變數 ${i + 1}/${envVars.length} ---`);
            console.log(`名稱: ${envVar.name}`);
            console.log(`描述: ${envVar.description}`);
            console.log(`值: ${envVar.value}`);
            console.log(`環境: ${envVar.environments.join(', ')}`);
            console.log('\n請執行以下操作：');
            console.log('1. 點擊 "Add New" 按鈕');
            console.log(`2. 在 NAME 欄位輸入: ${envVar.name}`);
            console.log(`3. 在 VALUE 欄位輸入: ${envVar.value}`);
            console.log(`4. 選擇環境: ${envVar.environments.join(', ')}`);
            console.log('5. 點擊 "Save" 按鈕');
            console.log('\n按 Enter 鍵繼續下一個環境變數...');
            await waitForUserInput();
        }
        
        console.log('\n🔄 步驟 5: 觸發重新部署');
        console.log('請執行以下操作：');
        console.log('1. 點擊頁面頂部的 "Deployments" 標籤');
        console.log('2. 找到最新的部署記錄');
        console.log('3. 點擊該記錄右側的 "..." 按鈕');
        console.log('4. 選擇 "Redeploy"');
        console.log('5. 確認重新部署');
        console.log('\n按 Enter 鍵確認已觸發重新部署...');
        await waitForUserInput();
        
        console.log('\n✅ 配置完成！');
        console.log('\n📋 部署後檢查清單：');
        console.log('1. 等待重新部署完成（通常需要 2-5 分鐘）');
        console.log('2. 檢查部署狀態是否為 "Ready"');
        console.log('3. 測試網站功能');
        console.log('\n🌐 測試 URL：');
        console.log('- 主頁: https://edu-create-57xh685mp-minamisums-projects.vercel.app');
        console.log('- API 健康檢查: https://edu-create-57xh685mp-minamisums-projects.vercel.app/api/health');
        console.log('- 遊戲頁面: https://edu-create-57xh685mp-minamisums-projects.vercel.app/games');
        console.log('- Shimozurdo 遊戲: https://edu-create-57xh685mp-minamisums-projects.vercel.app/games/shimozurdo-game');
        
        console.log('\n按 Enter 鍵關閉瀏覽器...');
        await waitForUserInput();
        
    } catch (error) {
        console.error('❌ 引導過程中出現錯誤:', error);
        await page.screenshot({ 
            path: 'vercel-guided-error.png',
            fullPage: true 
        });
        console.log('📸 錯誤截圖已保存為 vercel-guided-error.png');
    } finally {
        await browser.close();
    }
}

function waitForUserInput() {
    return new Promise((resolve) => {
        process.stdin.once('data', () => {
            resolve();
        });
    });
}

// 執行引導式配置
if (require.main === module) {
    console.log('🎮 Vercel 環境變數引導式配置工具');
    console.log('這個工具將打開瀏覽器並提供逐步指導');
    console.log('請確保您已經登入 Vercel 帳戶');
    console.log('\n按 Enter 鍵開始...');
    
    process.stdin.once('data', () => {
        guidedVercelSetup()
            .then(() => {
                console.log('\n🎉 引導式配置完成！');
                process.exit(0);
            })
            .catch(error => {
                console.error('💥 配置失敗:', error);
                process.exit(1);
            });
    });
}

module.exports = { guidedVercelSetup };
