#!/usr/bin/env node

/**
 * EduCreate 響應式測試工作流整合腳本
 * 將響應式測試整合到現有的開發工作流中
 * 
 * 功能：
 * 1. 與 EduCreate-Test-Videos 系統整合
 * 2. 與 MCP 工具整合
 * 3. 自動觸發響應式測試
 * 4. 生成標準化報告
 */

const ResponsiveTestingWorkflow = require('./responsive-testing-workflow');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class WorkflowIntegration {
    constructor() {
        this.projectRoot = process.cwd();
        this.testVideosDir = path.join(this.projectRoot, 'EduCreate-Test-Videos');
        this.reportsDir = path.join(this.projectRoot, 'reports', 'visual-comparisons');
        this.config = {
            autoTrigger: true,
            mcpIntegration: true,
            videoRecording: true,
            reportGeneration: true
        };
    }

    async init() {
        console.log('🔧 初始化響應式測試工作流整合...');
        
        // 確保必要目錄存在
        await this.ensureDirectories();
        
        // 檢查依賴
        await this.checkDependencies();
        
        console.log('✅ 工作流整合初始化完成');
    }

    async ensureDirectories() {
        const dirs = [
            this.reportsDir,
            path.join(this.reportsDir, 'screenshots'),
            path.join(this.reportsDir, 'archives'),
            path.join(this.projectRoot, 'scripts', 'responsive-workflow'),
            path.join(this.projectRoot, 'templates', 'responsive')
        ];

        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    async checkDependencies() {
        const dependencies = ['playwright', '@playwright/test'];
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        
        try {
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            for (const dep of dependencies) {
                if (!allDeps[dep]) {
                    console.warn(`⚠️ 缺少依賴: ${dep}`);
                }
            }
        } catch (error) {
            console.warn('⚠️ 無法檢查 package.json 依賴');
        }
    }

    async runResponsiveTest(featureName, testUrl, options = {}) {
        console.log(`🚀 開始響應式測試: ${featureName}`);
        
        const workflow = new ResponsiveTestingWorkflow(featureName, testUrl);
        const result = await workflow.run();
        
        if (result.success) {
            console.log('✅ 響應式測試完成');
            
            // 整合到 EduCreate-Test-Videos 系統
            if (this.config.videoRecording) {
                await this.integrateWithTestVideos(result, featureName);
            }
            
            // MCP 工具整合
            if (this.config.mcpIntegration) {
                await this.integrateMCPTools(result, featureName);
            }
            
            // 存檔報告
            await this.archiveReport(result, featureName);
            
            return result;
        } else {
            console.error('❌ 響應式測試失敗:', result.error);
            throw new Error(result.error);
        }
    }

    async integrateWithTestVideos(result, featureName) {
        console.log('📹 整合到 EduCreate-Test-Videos 系統...');
        
        try {
            // 檢查 EduCreate-Test-Videos 目錄是否存在
            const testVideosExists = await fs.access(this.testVideosDir).then(() => true).catch(() => false);
            
            if (testVideosExists) {
                // 複製截圖到 test-videos 目錄
                const currentDir = path.join(this.testVideosDir, 'current', 'success');
                await fs.mkdir(currentDir, { recursive: true });
                
                for (const screenshot of result.screenshots) {
                    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                    const newFilename = `${timestamp}_響應式測試_${featureName}_成功_v1_${screenshot.device.code}.png`;
                    const destPath = path.join(currentDir, newFilename);
                    
                    await fs.copyFile(screenshot.path, destPath);
                    console.log(`📸 截圖已複製: ${newFilename}`);
                }
                
                // 生成報告
                const reportScript = path.join(this.testVideosDir, 'scripts', 'automation', 'generate-reports.js');
                const reportExists = await fs.access(reportScript).then(() => true).catch(() => false);
                
                if (reportExists) {
                    try {
                        execSync(`node "${reportScript}" all`, { cwd: this.projectRoot });
                        console.log('📊 EduCreate-Test-Videos 報告已生成');
                    } catch (error) {
                        console.warn('⚠️ 無法生成 EduCreate-Test-Videos 報告:', error.message);
                    }
                }
            } else {
                console.warn('⚠️ EduCreate-Test-Videos 目錄不存在，跳過整合');
            }
        } catch (error) {
            console.warn('⚠️ EduCreate-Test-Videos 整合失敗:', error.message);
        }
    }

    async integrateMCPTools(result, featureName) {
        console.log('🔧 整合 MCP 工具...');
        
        try {
            // Sequential Thinking MCP 整合
            const analysisData = {
                feature: featureName,
                testResults: result.testResults,
                screenshots: result.screenshots.length,
                timestamp: new Date().toISOString(),
                analysis: this.generateAnalysis(result)
            };
            
            // 本地記憶系統整合
            const memoryData = {
                type: 'responsive-test',
                feature: featureName,
                success: result.success,
                deviceCount: result.screenshots.length,
                timestamp: new Date().toISOString()
            };
            
            // 保存分析數據
            const analysisPath = path.join(this.reportsDir, 'mcp-analysis.json');
            let existingAnalysis = [];
            
            try {
                const existing = await fs.readFile(analysisPath, 'utf8');
                existingAnalysis = JSON.parse(existing);
            } catch (error) {
                // 文件不存在，使用空數組
            }
            
            existingAnalysis.push(analysisData);
            await fs.writeFile(analysisPath, JSON.stringify(existingAnalysis, null, 2));
            
            console.log('🧠 MCP 工具整合完成');
        } catch (error) {
            console.warn('⚠️ MCP 工具整合失敗:', error.message);
        }
    }

    generateAnalysis(result) {
        const successRate = (result.testResults.filter(r => r.status === 'success').length / result.testResults.length) * 100;
        
        return {
            successRate: successRate.toFixed(1),
            devicesTested: result.testResults.length,
            screenshotsCaptured: result.screenshots.length,
            insights: [
                `測試了 ${result.testResults.length} 種設備配置`,
                `成功率達到 ${successRate.toFixed(1)}%`,
                `生成了 ${result.screenshots.length} 張響應式截圖`,
                '完整的視覺對比報告已生成'
            ]
        };
    }

    async archiveReport(result, featureName) {
        console.log('📁 存檔報告...');
        
        try {
            const archiveDir = path.join(this.reportsDir, 'archives', new Date().getFullYear().toString());
            await fs.mkdir(archiveDir, { recursive: true });
            
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const archivePath = path.join(archiveDir, `${timestamp}_${featureName}_responsive-archive.json`);
            
            const archiveData = {
                feature: featureName,
                timestamp: new Date().toISOString(),
                result: result,
                metadata: {
                    version: '1.0',
                    generator: 'EduCreate 響應式測試工作流',
                    deviceCount: result.screenshots.length,
                    successRate: (result.testResults.filter(r => r.status === 'success').length / result.testResults.length) * 100
                }
            };
            
            await fs.writeFile(archivePath, JSON.stringify(archiveData, null, 2));
            console.log(`📁 報告已存檔: ${archivePath}`);
        } catch (error) {
            console.warn('⚠️ 報告存檔失敗:', error.message);
        }
    }

    async setupAutoTrigger() {
        console.log('⚙️ 設置自動觸發...');
        
        // 創建 package.json 腳本
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        
        try {
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }
            
            // 添加響應式測試腳本
            packageJson.scripts['test:responsive'] = 'node scripts/responsive-workflow/responsive-testing-workflow.js';
            packageJson.scripts['test:responsive:integration'] = 'node scripts/responsive-workflow/workflow-integration.js';
            
            await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log('✅ package.json 腳本已更新');
        } catch (error) {
            console.warn('⚠️ 無法更新 package.json:', error.message);
        }
    }

    async generateWorkflowDocumentation() {
        const docPath = path.join(this.projectRoot, 'docs', 'responsive-workflow.md');
        await fs.mkdir(path.dirname(docPath), { recursive: true });
        
        const documentation = `# EduCreate 響應式測試工作流

## 概述
自動化響應式佈局測試和視覺對比報告生成系統。

## 使用方法

### 基本使用
\`\`\`bash
# 運行響應式測試
npm run test:responsive

# 運行完整工作流整合
npm run test:responsive:integration
\`\`\`

### 自定義測試
\`\`\`bash
# 測試特定功能
node scripts/responsive-workflow/responsive-testing-workflow.js "功能名稱" "http://localhost:3000/path"
\`\`\`

## 功能特點
- 🔄 自動化 5 種設備配置測試
- 📸 自動截圖收集
- 📊 視覺對比報告生成
- 🔧 MCP 工具整合
- 📹 EduCreate-Test-Videos 系統整合

## 報告位置
- 主報告：\`reports/visual-comparisons/\`
- 截圖：\`reports/visual-comparisons/screenshots/\`
- 存檔：\`reports/visual-comparisons/archives/\`

## 設備配置
1. 📱 手機直向 (375x667)
2. 📱 手機橫向 (812x375)
3. 📱 平板直向 (768x1024)
4. 📱 平板橫向 (1024x768)
5. 🖥️ 桌面版 (1440x900)
`;
        
        await fs.writeFile(docPath, documentation);
        console.log(`📚 文檔已生成: ${docPath}`);
    }
}

// 命令行執行
if (require.main === module) {
    const integration = new WorkflowIntegration();
    
    async function main() {
        try {
            await integration.init();
            
            const command = process.argv[2];
            const featureName = process.argv[3] || '響應式佈局測試';
            const testUrl = process.argv[4] || 'http://localhost:3000';
            
            switch (command) {
                case 'test':
                    await integration.runResponsiveTest(featureName, testUrl);
                    break;
                case 'setup':
                    await integration.setupAutoTrigger();
                    await integration.generateWorkflowDocumentation();
                    break;
                default:
                    console.log('使用方法:');
                    console.log('  node workflow-integration.js test [功能名稱] [URL]');
                    console.log('  node workflow-integration.js setup');
            }
        } catch (error) {
            console.error('❌ 工作流整合失敗:', error);
            process.exit(1);
        }
    }
    
    main();
}

module.exports = WorkflowIntegration;
