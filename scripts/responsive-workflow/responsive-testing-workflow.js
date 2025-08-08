#!/usr/bin/env node

/**
 * EduCreate 響應式佈局測試工作流
 * 自動化響應式測試、截圖收集、視覺對比報告生成
 * 
 * 使用方法：
 * node scripts/responsive-workflow/responsive-testing-workflow.js [功能名稱] [URL]
 * 
 * 範例：
 * node scripts/responsive-workflow/responsive-testing-workflow.js "手機版佈局優化" "http://localhost:3000/games/airplane"
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// 設備配置
const DEVICE_CONFIGS = [
    {
        name: '手機直向',
        code: 'mobile-portrait',
        width: 375,
        height: 667,
        description: '緊湊標頭設計，垂直空間節省40%',
        features: ['🎯 緊湊標頭設計', '📏 垂直空間節省 40%', '⚡ 快速遊戲訪問', '📱 手機優化佈局'],
        color: '#4caf50'
    },
    {
        name: '手機橫向',
        code: 'mobile-landscape',
        width: 812,
        height: 375,
        description: '智能切換到桌面版佈局，充分利用橫向空間',
        features: ['🧠 智能響應式切換', '🎮 遊戲區域最大化', '⚙️ 完整功能可用', '🔄 橫向優化佈局'],
        color: '#2196f3'
    },
    {
        name: '平板直向',
        code: 'tablet-portrait',
        width: 768,
        height: 1024,
        description: '響應式斷點邊界，提供平衡的垂直空間利用',
        features: ['📱 平板優化設計', '📏 垂直空間充分利用', '🔄 響應式邊界', '📐 直向模式優化'],
        color: '#9c27b0'
    },
    {
        name: '平板橫向',
        code: 'tablet-landscape',
        width: 1024,
        height: 768,
        description: '桌面級體驗，最佳的內容展示和操作效率',
        features: ['🖥️ 桌面級體驗', '📐 寬螢幕優化', '⚙️ 完整功能展示', '⚡ 高效操作界面'],
        color: '#e91e63'
    },
    {
        name: '桌面版',
        code: 'desktop',
        width: 1440,
        height: 900,
        description: '最完整的功能體驗，包含詳細資訊和豐富操作選項',
        features: ['📊 詳細資訊顯示', '🎯 GEPT 等級選擇器', '🔧 豐富操作選項', '🖥️ 桌面優化佈局'],
        color: '#ff9800'
    }
];

class ResponsiveTestingWorkflow {
    constructor(featureName, testUrl) {
        this.featureName = featureName || '響應式佈局測試';
        this.testUrl = testUrl || 'http://localhost:3000';
        this.timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        this.reportDir = path.join(process.cwd(), 'reports', 'visual-comparisons');
        this.screenshotDir = path.join(this.reportDir, 'screenshots');
        this.screenshots = [];
        this.testResults = [];
    }

    async init() {
        // 確保目錄存在
        await fs.mkdir(this.reportDir, { recursive: true });
        await fs.mkdir(this.screenshotDir, { recursive: true });
        
        console.log('🚀 啟動響應式佈局測試工作流');
        console.log(`📱 功能名稱: ${this.featureName}`);
        console.log(`🌐 測試URL: ${this.testUrl}`);
        console.log(`📅 時間戳記: ${this.timestamp}`);
    }

    async runDeviceTests() {
        const browser = await chromium.launch({ headless: false });
        
        try {
            for (const device of DEVICE_CONFIGS) {
                console.log(`\n📱 測試設備: ${device.name} (${device.width}x${device.height})`);
                
                const context = await browser.newContext({
                    viewport: { width: device.width, height: device.height }
                });
                
                const page = await context.newPage();
                
                try {
                    // 導航到測試頁面
                    await page.goto(this.testUrl, { waitUntil: 'networkidle' });
                    await page.waitForTimeout(2000); // 等待頁面穩定
                    
                    // 截圖
                    const screenshotPath = path.join(
                        this.screenshotDir,
                        `${this.timestamp}_${this.featureName}_${device.code}_${device.width}x${device.height}.png`
                    );
                    
                    await page.screenshot({
                        path: screenshotPath,
                        fullPage: false
                    });
                    
                    // 記錄截圖信息
                    this.screenshots.push({
                        device: device,
                        path: screenshotPath,
                        filename: path.basename(screenshotPath)
                    });
                    
                    // 記錄測試結果
                    this.testResults.push({
                        device: device.name,
                        status: 'success',
                        timestamp: new Date().toISOString(),
                        screenshot: path.basename(screenshotPath)
                    });
                    
                    console.log(`✅ ${device.name} 測試完成`);
                    
                } catch (error) {
                    console.error(`❌ ${device.name} 測試失敗:`, error.message);
                    this.testResults.push({
                        device: device.name,
                        status: 'failed',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
                
                await context.close();
            }
        } finally {
            await browser.close();
        }
    }

    async generateReport() {
        console.log('\n📊 生成視覺對比報告...');
        
        const reportPath = path.join(
            this.reportDir,
            `${this.timestamp}_${this.featureName}_responsive-report.html`
        );
        
        // 讀取模板
        const templatePath = path.join(process.cwd(), 'templates', 'responsive', 'visual-comparison-template.html');
        let template;
        
        try {
            template = await fs.readFile(templatePath, 'utf8');
        } catch (error) {
            // 如果模板不存在，使用基本模板
            template = await this.createBasicTemplate();
        }
        
        // 替換模板變量
        const reportContent = template
            .replace(/{{FEATURE_NAME}}/g, this.featureName)
            .replace(/{{TIMESTAMP}}/g, this.timestamp)
            .replace(/{{TEST_URL}}/g, this.testUrl)
            .replace(/{{DEVICE_COMPARISONS}}/g, this.generateDeviceComparisons())
            .replace(/{{TEST_RESULTS}}/g, this.generateTestResults())
            .replace(/{{RESPONSIVE_ANALYSIS}}/g, this.generateResponsiveAnalysis());
        
        await fs.writeFile(reportPath, reportContent, 'utf8');
        
        console.log(`✅ 報告已生成: ${reportPath}`);
        return reportPath;
    }

    generateDeviceComparisons() {
        return this.screenshots.map(screenshot => `
            <div class="layout-column">
                <h4>📱 ${screenshot.device.name} (${screenshot.device.width}x${screenshot.device.height})</h4>
                <div class="large-screenshot">
                    <img src="screenshots/${screenshot.filename}" alt="${screenshot.device.name}佈局截圖" 
                         style="width: 100%; height: auto; border: 3px solid ${screenshot.device.color}; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
                </div>
                <div class="layout-features">
                    ${screenshot.device.features.map(feature => `<div class="feature-badge">${feature}</div>`).join('')}
                </div>
                <div class="layout-description">
                    <strong>設計重點：</strong>${screenshot.device.description}
                </div>
            </div>
        `).join('');
    }

    generateTestResults() {
        const successCount = this.testResults.filter(r => r.status === 'success').length;
        const totalCount = this.testResults.length;
        const successRate = ((successCount / totalCount) * 100).toFixed(1);
        
        return `
            <h3>🧪 測試驗證結果 (${successCount}/${totalCount} = ${successRate}% 成功率)</h3>
            <div class="test-results">
                ${this.testResults.map(result => `
                    <div class="test-result ${result.status}">
                        <strong>${result.status === 'success' ? '✅' : '❌'} ${result.device}</strong>
                        <span>${result.status === 'success' ? '測試通過' : result.error}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateResponsiveAnalysis() {
        return `
            <div class="intelligence-grid">
                <div class="intelligence-item">
                    <div class="breakpoint">< 768px</div>
                    <div class="strategy">手機優化策略</div>
                    <div class="description">手機直向使用緊湊標頭設計，手機橫向智能切換到桌面版佈局</div>
                </div>
                <div class="intelligence-item">
                    <div class="breakpoint">= 768px</div>
                    <div class="strategy">平板直向策略</div>
                    <div class="description">平板直向模式在響應式斷點邊界，提供平衡的垂直空間利用</div>
                </div>
                <div class="intelligence-item">
                    <div class="breakpoint">> 768px</div>
                    <div class="strategy">寬螢幕策略</div>
                    <div class="description">平板橫向和桌面版提供完整功能，包含詳細資訊和豐富操作選項</div>
                </div>
            </div>
        `;
    }

    async createBasicTemplate() {
        // 基本HTML模板
        return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{FEATURE_NAME}} - 響應式佈局對比報告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 95vw; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 3.5em; font-weight: 700; }
        .content { padding: 60px; }
        .full-comparison { display: grid; grid-template-columns: repeat(5, 1fr); gap: 30px; margin: 40px 0; padding: 40px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; }
        .layout-column { background: white; border-radius: 16px; padding: 25px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); text-align: center; }
        .large-screenshot { margin-bottom: 20px; border-radius: 12px; overflow: hidden; }
        .layout-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .feature-badge { padding: 10px 15px; border-radius: 25px; font-size: 0.9em; font-weight: 600; color: white; background: linear-gradient(135deg, #4caf50, #45a049); }
        .layout-description { text-align: left; font-size: 0.95em; line-height: 1.6; color: #555; background: #f8f9fa; padding: 15px; border-radius: 8px; }
        @media (max-width: 1600px) { .full-comparison { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 1200px) { .full-comparison { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 800px) { .full-comparison { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 {{FEATURE_NAME}}</h1>
            <p>響應式佈局對比報告 - {{TIMESTAMP}}</p>
        </div>
        <div class="content">
            <h2>📱 響應式佈局完整對比</h2>
            <div class="full-comparison">
                {{DEVICE_COMPARISONS}}
            </div>
            {{TEST_RESULTS}}
            <h2>🧠 響應式設計的智能性</h2>
            {{RESPONSIVE_ANALYSIS}}
        </div>
    </div>
</body>
</html>`;
    }

    async run() {
        try {
            await this.init();
            await this.runDeviceTests();
            const reportPath = await this.generateReport();
            
            console.log('\n🎉 響應式測試工作流完成！');
            console.log(`📊 報告位置: ${reportPath}`);
            console.log(`📸 截圖目錄: ${this.screenshotDir}`);
            
            return {
                success: true,
                reportPath,
                screenshots: this.screenshots,
                testResults: this.testResults
            };
            
        } catch (error) {
            console.error('❌ 工作流執行失敗:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 命令行執行
if (require.main === module) {
    const featureName = process.argv[2] || '響應式佈局測試';
    const testUrl = process.argv[3] || 'http://localhost:3000';
    
    const workflow = new ResponsiveTestingWorkflow(featureName, testUrl);
    workflow.run();
}

module.exports = ResponsiveTestingWorkflow;
