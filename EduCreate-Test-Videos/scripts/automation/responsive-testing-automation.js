#!/usr/bin/env node

/**
 * 📱 響應式測試工作流程自動化
 * 
 * 基於 MY-WORKFLOW.md 第101-125行和第214-229行
 * 自動執行5種設備配置的響應式測試
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');

class ResponsiveTestingAutomation {
    constructor() {
        this.config = this.loadConfig();
        this.devices = this.config.devices;
        this.reportPath = this.config.reportPath;
        this.screenshotPath = this.config.screenshotPath;
        this.testResults = [];
    }

    /**
     * 載入配置
     */
    loadConfig() {
        const configPath = path.join(__dirname, 'workflow-config.json');
        if (fs.existsSync(configPath)) {
            const fullConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return fullConfig.responsiveTesting;
        }
        
        // 默認配置
        return {
            enabled: true,
            mandatory: true,
            command: "npm run test:responsive",
            devices: [
                { name: "手機直向", width: 375, height: 667, description: "iPhone SE 直向模式" },
                { name: "手機橫向", width: 812, height: 375, description: "iPhone SE 橫向模式" },
                { name: "平板直向", width: 768, height: 1024, description: "iPad 直向模式" },
                { name: "平板橫向", width: 1024, height: 768, description: "iPad 橫向模式" },
                { name: "桌面版", width: 1440, height: 900, description: "標準桌面解析度" }
            ],
            reportPath: "reports/visual-comparisons/",
            screenshotPath: "reports/visual-comparisons/screenshots/",
            successRate: 100,
            autoFix: true
        };
    }

    /**
     * 🚀 執行響應式測試
     */
    async executeResponsiveTesting(featureName, url) {
        console.log(chalk.blue.bold('\n📱 響應式測試工作流程自動化'));
        console.log(chalk.gray(`功能: ${featureName}`));
        console.log(chalk.gray(`URL: ${url}`));
        
        const testSession = {
            featureName,
            url,
            startTime: new Date(),
            devices: [],
            screenshots: [],
            report: null,
            success: false
        };

        try {
            // 1. 準備測試環境
            await this.prepareTestEnvironment();

            // 2. 執行5種設備配置測試
            for (const device of this.devices) {
                console.log(chalk.cyan(`\n🔧 測試設備: ${device.name} (${device.width}x${device.height})`));
                
                const deviceResult = await this.testDevice(device, featureName, url);
                testSession.devices.push(deviceResult);
                
                if (deviceResult.success) {
                    console.log(chalk.green(`  ✅ ${device.name} 測試成功`));
                } else {
                    console.log(chalk.red(`  ❌ ${device.name} 測試失敗: ${deviceResult.error}`));
                }
            }

            // 3. 收集截圖
            testSession.screenshots = await this.collectScreenshots(featureName);

            // 4. 生成視覺對比報告
            testSession.report = await this.generateVisualComparisonReport(testSession);

            // 5. 檢查成功率
            const successCount = testSession.devices.filter(d => d.success).length;
            const successRate = (successCount / testSession.devices.length) * 100;
            
            testSession.successRate = successRate;
            testSession.success = successRate >= this.config.successRate;

            // 6. 自動修復（如果需要）
            if (!testSession.success && this.config.autoFix) {
                console.log(chalk.yellow('\n🔧 檢測到響應式問題，嘗試自動修復...'));
                const fixResult = await this.autoFixResponsiveIssues(testSession);
                testSession.autoFix = fixResult;
            }

            testSession.endTime = new Date();
            testSession.duration = testSession.endTime - testSession.startTime;

            // 7. 保存測試結果
            await this.saveTestResults(testSession);

            if (testSession.success) {
                console.log(chalk.green.bold(`\n🎉 響應式測試完成！成功率: ${successRate}%`));
            } else {
                console.log(chalk.red.bold(`\n❌ 響應式測試失敗！成功率: ${successRate}%`));
            }

            return testSession;

        } catch (error) {
            testSession.endTime = new Date();
            testSession.duration = testSession.endTime - testSession.startTime;
            testSession.error = error.message;
            testSession.success = false;

            console.log(chalk.red.bold(`\n❌ 響應式測試執行失敗: ${error.message}`));
            throw error;
        }
    }

    /**
     * 準備測試環境
     */
    async prepareTestEnvironment() {
        console.log(chalk.gray('  🔧 準備測試環境...'));
        
        // 創建必要的目錄
        const dirs = [
            this.reportPath,
            this.screenshotPath,
            path.join(this.screenshotPath, 'mobile-portrait'),
            path.join(this.screenshotPath, 'mobile-landscape'),
            path.join(this.screenshotPath, 'tablet-portrait'),
            path.join(this.screenshotPath, 'tablet-landscape'),
            path.join(this.screenshotPath, 'desktop')
        ];

        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(chalk.gray(`    📁 創建目錄: ${dir}`));
            }
        }

        // 檢查服務器是否運行
        try {
            execSync('curl -f http://localhost:3000 > /dev/null 2>&1', { stdio: 'ignore' });
            console.log(chalk.green('    ✅ 服務器運行正常'));
        } catch (error) {
            throw new Error('服務器未運行，請先啟動 npm run dev');
        }
    }

    /**
     * 測試單個設備
     */
    async testDevice(device, featureName, url) {
        const deviceResult = {
            device,
            startTime: new Date(),
            screenshots: [],
            success: false,
            error: null
        };

        try {
            // 生成截圖文件名
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const deviceType = this.getDeviceType(device);
            const screenshotName = `${timestamp}_${featureName}_${deviceType}_${device.width}x${device.height}.png`;
            const screenshotPath = path.join(this.screenshotPath, deviceType, screenshotName);

            // 使用 Playwright 截圖
            const playwrightScript = this.generatePlaywrightScript(device, url, screenshotPath);
            const scriptPath = path.join(__dirname, 'temp-responsive-test.js');
            
            fs.writeFileSync(scriptPath, playwrightScript);
            
            // 執行 Playwright 測試
            const result = execSync(`npx playwright test ${scriptPath}`, { 
                encoding: 'utf8',
                cwd: process.cwd()
            });

            deviceResult.screenshots.push({
                path: screenshotPath,
                name: screenshotName,
                size: device
            });

            // 清理臨時腳本
            fs.unlinkSync(scriptPath);

            deviceResult.success = true;
            deviceResult.endTime = new Date();
            deviceResult.duration = deviceResult.endTime - deviceResult.startTime;

        } catch (error) {
            deviceResult.error = error.message;
            deviceResult.success = false;
            deviceResult.endTime = new Date();
            deviceResult.duration = deviceResult.endTime - deviceResult.startTime;
        }

        return deviceResult;
    }

    /**
     * 獲取設備類型
     */
    getDeviceType(device) {
        if (device.width <= 480) {
            return device.width < device.height ? 'mobile-portrait' : 'mobile-landscape';
        } else if (device.width <= 1024) {
            return device.width < device.height ? 'tablet-portrait' : 'tablet-landscape';
        } else {
            return 'desktop';
        }
    }

    /**
     * 生成 Playwright 測試腳本
     */
    generatePlaywrightScript(device, url, screenshotPath) {
        return `
const { test, expect } = require('@playwright/test');

test('響應式測試 - ${device.name}', async ({ page }) => {
    // 設置視窗大小
    await page.setViewportSize({ width: ${device.width}, height: ${device.height} });
    
    // 導航到頁面
    await page.goto('${url}');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 等待一秒確保所有動畫完成
    await page.waitForTimeout(1000);
    
    // 截圖
    await page.screenshot({ 
        path: '${screenshotPath}',
        fullPage: true
    });
    
    // 基本響應式檢查
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // 檢查是否有橫向滾動條（通常表示響應式問題）
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    
    if (scrollWidth > clientWidth + 10) {
        throw new Error('檢測到橫向滾動條，可能存在響應式問題');
    }
});
        `;
    }

    /**
     * 收集截圖
     */
    async collectScreenshots(featureName) {
        console.log(chalk.gray('  📸 收集截圖...'));
        
        const screenshots = [];
        const screenshotDirs = [
            'mobile-portrait', 'mobile-landscape', 
            'tablet-portrait', 'tablet-landscape', 
            'desktop'
        ];

        for (const dir of screenshotDirs) {
            const dirPath = path.join(this.screenshotPath, dir);
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath)
                    .filter(file => file.includes(featureName) && file.endsWith('.png'))
                    .sort()
                    .reverse(); // 最新的在前面

                for (const file of files.slice(0, 1)) { // 只取最新的
                    const filePath = path.join(dirPath, file);
                    const stats = fs.statSync(filePath);
                    
                    screenshots.push({
                        category: dir,
                        filename: file,
                        path: filePath,
                        size: stats.size,
                        created: stats.birthtime
                    });
                }
            }
        }

        console.log(chalk.green(`    ✅ 收集到 ${screenshots.length} 張截圖`));
        return screenshots;
    }

    /**
     * 生成視覺對比報告
     */
    async generateVisualComparisonReport(testSession) {
        console.log(chalk.gray('  📊 生成視覺對比報告...'));
        
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const reportName = `${timestamp}_${testSession.featureName}_responsive-report.html`;
        const reportPath = path.join(this.reportPath, reportName);

        const reportHtml = this.generateReportHTML(testSession);
        fs.writeFileSync(reportPath, reportHtml);

        console.log(chalk.green(`    ✅ 報告已生成: ${reportPath}`));
        
        return {
            name: reportName,
            path: reportPath,
            url: `file://${path.resolve(reportPath)}`
        };
    }

    /**
     * 生成報告 HTML
     */
    generateReportHTML(testSession) {
        const deviceResults = testSession.devices.map(device => {
            const screenshot = testSession.screenshots.find(s => 
                s.filename.includes(device.device.width + 'x' + device.device.height)
            );
            
            return `
                <div class="device-result ${device.success ? 'success' : 'failure'}">
                    <h3>${device.device.name} (${device.device.width}x${device.device.height})</h3>
                    <p class="description">${device.device.description}</p>
                    <div class="status ${device.success ? 'success' : 'failure'}">
                        ${device.success ? '✅ 測試成功' : '❌ 測試失敗'}
                        ${device.error ? `<br><small>錯誤: ${device.error}</small>` : ''}
                    </div>
                    ${screenshot ? `
                        <div class="screenshot">
                            <img src="${screenshot.path}" alt="${device.device.name} 截圖" 
                                 onclick="openFullscreen(this)" style="max-width: 300px; cursor: pointer;">
                            <p><small>點擊查看全螢幕</small></p>
                        </div>
                    ` : ''}
                    <div class="timing">
                        耗時: ${device.duration}ms
                    </div>
                </div>
            `;
        }).join('');

        return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>響應式測試報告 - ${testSession.featureName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .summary-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .devices { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
        .device-result { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .device-result.success { border-left: 4px solid #4CAF50; }
        .device-result.failure { border-left: 4px solid #f44336; }
        .status.success { color: #4CAF50; font-weight: bold; }
        .status.failure { color: #f44336; font-weight: bold; }
        .screenshot img { border: 1px solid #ddd; border-radius: 4px; transition: transform 0.2s; }
        .screenshot img:hover { transform: scale(1.05); }
        .fullscreen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); z-index: 1000; display: none; align-items: center; justify-content: center; }
        .fullscreen img { max-width: 95vw; max-height: 95vh; }
        .close-btn { position: absolute; top: 20px; right: 20px; color: white; font-size: 30px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📱 響應式測試報告</h1>
        <p><strong>功能:</strong> ${testSession.featureName}</p>
        <p><strong>URL:</strong> ${testSession.url}</p>
        <p><strong>測試時間:</strong> ${testSession.startTime.toLocaleString()}</p>
        <p><strong>總耗時:</strong> ${testSession.duration}ms</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>成功率</h3>
            <div style="font-size: 24px; color: ${testSession.successRate >= 100 ? '#4CAF50' : '#f44336'}">
                ${testSession.successRate}%
            </div>
        </div>
        <div class="summary-card">
            <h3>測試設備</h3>
            <div style="font-size: 24px;">${testSession.devices.length}</div>
        </div>
        <div class="summary-card">
            <h3>成功設備</h3>
            <div style="font-size: 24px; color: #4CAF50;">
                ${testSession.devices.filter(d => d.success).length}
            </div>
        </div>
        <div class="summary-card">
            <h3>失敗設備</h3>
            <div style="font-size: 24px; color: #f44336;">
                ${testSession.devices.filter(d => !d.success).length}
            </div>
        </div>
    </div>

    <div class="devices">
        ${deviceResults}
    </div>

    <div class="fullscreen" id="fullscreen" onclick="closeFullscreen()">
        <span class="close-btn" onclick="closeFullscreen()">&times;</span>
        <img id="fullscreen-img" src="" alt="">
    </div>

    <script>
        function openFullscreen(img) {
            document.getElementById('fullscreen-img').src = img.src;
            document.getElementById('fullscreen').style.display = 'flex';
        }
        
        function closeFullscreen() {
            document.getElementById('fullscreen').style.display = 'none';
        }
    </script>
</body>
</html>
        `;
    }

    /**
     * 自動修復響應式問題
     */
    async autoFixResponsiveIssues(testSession) {
        console.log(chalk.yellow('  🔧 分析響應式問題...'));
        
        const failedDevices = testSession.devices.filter(d => !d.success);
        const fixes = [];

        for (const failed of failedDevices) {
            if (failed.error && failed.error.includes('橫向滾動條')) {
                fixes.push({
                    device: failed.device.name,
                    issue: '橫向滾動條',
                    suggestion: '檢查 CSS 中的固定寬度、padding、margin 設置'
                });
            }
        }

        return {
            analyzed: true,
            issues: failedDevices.length,
            fixes: fixes,
            autoFixApplied: false // 實際修復需要更複雜的邏輯
        };
    }

    /**
     * 保存測試結果
     */
    async saveTestResults(testSession) {
        const resultsPath = path.join(__dirname, '../../reports/responsive-test-results.json');
        
        let allResults = [];
        if (fs.existsSync(resultsPath)) {
            allResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        }

        allResults.push(testSession);
        
        // 保持最近100次測試結果
        if (allResults.length > 100) {
            allResults = allResults.slice(-100);
        }

        fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
        console.log(chalk.green('  ✅ 測試結果已保存'));
    }
}

// 主程序入口
if (require.main === module) {
    const responsiveTesting = new ResponsiveTestingAutomation();
    
    const featureName = process.argv[2] || 'default-feature';
    const url = process.argv[3] || 'http://localhost:3000';
    
    responsiveTesting.executeResponsiveTesting(featureName, url)
        .then(result => {
            console.log('\n📊 測試完成，報告路徑:');
            console.log(result.report.path);
            
            if (result.success) {
                process.exit(0);
            } else {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('響應式測試失敗:', error);
            process.exit(1);
        });
}

module.exports = ResponsiveTestingAutomation;
