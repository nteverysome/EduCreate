/**
 * Vercel 配置助手 - 打開瀏覽器並顯示配置信息
 */

const { chromium } = require('playwright');

async function openVercelConfigHelper() {
    console.log('🚀 啟動 Vercel 配置助手...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 }
    });
    
    // 打開 Vercel 項目頁面
    const vercelPage = await context.newPage();
    await vercelPage.goto('https://vercel.com/minamisums-projects/edu-create');
    
    // 打開配置信息頁面
    const configPage = await context.newPage();
    
    // 創建一個包含所有配置信息的 HTML 頁面
    const configHTML = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vercel 環境變數配置指南</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #fafafa;
                line-height: 1.6;
            }
            .header {
                background: linear-gradient(135deg, #000, #333);
                color: white;
                padding: 30px;
                border-radius: 12px;
                margin-bottom: 30px;
                text-align: center;
            }
            .step {
                background: white;
                padding: 25px;
                margin-bottom: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-left: 4px solid #0070f3;
            }
            .env-var {
                background: #f8f9fa;
                padding: 20px;
                margin: 15px 0;
                border-radius: 6px;
                border: 1px solid #e1e8ed;
            }
            .env-name {
                font-weight: bold;
                color: #0070f3;
                font-size: 18px;
                margin-bottom: 10px;
            }
            .env-value {
                background: #1a1a1a;
                color: #00ff00;
                padding: 10px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                word-break: break-all;
                margin: 10px 0;
            }
            .env-environments {
                color: #666;
                font-style: italic;
            }
            .copy-btn {
                background: #0070f3;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-left: 10px;
            }
            .copy-btn:hover {
                background: #0051cc;
            }
            .success {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 6px;
                margin: 10px 0;
            }
            .warning {
                background: #fff3cd;
                color: #856404;
                padding: 15px;
                border-radius: 6px;
                margin: 10px 0;
            }
            .test-links {
                background: #e7f3ff;
                padding: 20px;
                border-radius: 8px;
                margin-top: 30px;
            }
            .test-links a {
                display: block;
                color: #0070f3;
                text-decoration: none;
                padding: 8px 0;
                border-bottom: 1px solid #e1e8ed;
            }
            .test-links a:hover {
                background: #f0f8ff;
                padding-left: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚀 Vercel 環境變數配置指南</h1>
            <p>EduCreate 項目部署配置</p>
        </div>

        <div class="step">
            <h2>📋 步驟 1: 導航到環境變數設置</h2>
            <p>在 Vercel 項目頁面中：</p>
            <ol>
                <li>點擊 <strong>Settings</strong> 標籤</li>
                <li>在左側菜單點擊 <strong>Environment Variables</strong></li>
            </ol>
        </div>

        <div class="step">
            <h2>🔧 步驟 2: 添加環境變數</h2>
            <p>點擊 <strong>Add New</strong> 按鈕，然後逐一添加以下環境變數：</p>

            <div class="env-var">
                <div class="env-name">DATABASE_URL</div>
                <div class="env-value" id="db-url">postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require</div>
                <div class="env-environments">環境: Production, Preview, Development</div>
                <button class="copy-btn" onclick="copyToClipboard('db-url')">複製</button>
            </div>

            <div class="env-var">
                <div class="env-name">NEXTAUTH_URL</div>
                <div class="env-value" id="auth-url">https://edu-create-57xh685mp-minamisums-projects.vercel.app</div>
                <div class="env-environments">環境: Production</div>
                <button class="copy-btn" onclick="copyToClipboard('auth-url')">複製</button>
            </div>

            <div class="env-var">
                <div class="env-name">NEXTAUTH_SECRET</div>
                <div class="env-value" id="auth-secret">662c86e428aa5363751a9fa3edd0ec3bff135c8d64a75bd81449e9ae5a4e267e</div>
                <div class="env-environments">環境: Production, Preview, Development</div>
                <button class="copy-btn" onclick="copyToClipboard('auth-secret')">複製</button>
            </div>
        </div>

        <div class="step">
            <h2>🔄 步驟 3: 重新部署</h2>
            <p>配置完環境變數後：</p>
            <ol>
                <li>點擊 <strong>Deployments</strong> 標籤</li>
                <li>找到最新的部署記錄</li>
                <li>點擊右側的 <strong>...</strong> 按鈕</li>
                <li>選擇 <strong>Redeploy</strong></li>
                <li>確認重新部署</li>
            </ol>
        </div>

        <div class="success">
            <h3>✅ 部署信息</h3>
            <p><strong>生產 URL:</strong> https://edu-create-57xh685mp-minamisums-projects.vercel.app</p>
            <p><strong>項目頁面:</strong> https://vercel.com/minamisums-projects/edu-create</p>
        </div>

        <div class="test-links">
            <h3>🧪 部署後測試連結</h3>
            <a href="https://edu-create-57xh685mp-minamisums-projects.vercel.app" target="_blank">🏠 主頁</a>
            <a href="https://edu-create-57xh685mp-minamisums-projects.vercel.app/api/health" target="_blank">💚 API 健康檢查</a>
            <a href="https://edu-create-57xh685mp-minamisums-projects.vercel.app/games" target="_blank">🎮 遊戲頁面</a>
            <a href="https://edu-create-57xh685mp-minamisums-projects.vercel.app/games/shimozurdo-game" target="_blank">🚀 Shimozurdo 遊戲</a>
        </div>

        <div class="warning">
            <h3>⚠️ 注意事項</h3>
            <ul>
                <li>重新部署通常需要 2-5 分鐘</li>
                <li>確保所有環境變數都正確保存</li>
                <li>如果遇到問題，檢查 Vercel 部署日誌</li>
            </ul>
        </div>

        <script>
            function copyToClipboard(elementId) {
                const element = document.getElementById(elementId);
                const text = element.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    const btn = element.nextElementSibling.nextElementSibling;
                    const originalText = btn.textContent;
                    btn.textContent = '已複製!';
                    btn.style.background = '#28a745';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '#0070f3';
                    }, 2000);
                });
            }
        </script>
    </body>
    </html>
    `;
    
    await configPage.setContent(configHTML);
    
    console.log('✅ 配置助手已啟動！');
    console.log('📱 已打開兩個標籤頁：');
    console.log('   1. Vercel 項目頁面 - 用於配置');
    console.log('   2. 配置指南頁面 - 包含所有需要的信息');
    console.log('');
    console.log('🎯 請按照配置指南頁面的步驟進行操作');
    console.log('💡 您可以直接點擊 "複製" 按鈕來複製環境變數值');
    
    // 保持瀏覽器開啟
    console.log('');
    console.log('⏳ 瀏覽器將保持開啟狀態...');
    console.log('   完成配置後可以手動關閉瀏覽器');
    
    // 等待用戶完成配置（10分鐘超時）
    await new Promise(resolve => setTimeout(resolve, 600000));
    
    await browser.close();
}

// 執行配置助手
openVercelConfigHelper()
    .then(() => {
        console.log('🎉 配置助手會話結束');
    })
    .catch(error => {
        console.error('❌ 配置助手出現錯誤:', error);
    });
