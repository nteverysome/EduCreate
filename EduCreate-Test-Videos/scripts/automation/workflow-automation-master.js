#!/usr/bin/env node

/**
 * 🚀 EduCreate 自動化開發助手系統 - 主控制腳本
 * 
 * 基於 MY-WORKFLOW.md 核心工作原則的完整自動化系統
 * 將編程從"猜測式開發"轉變為"數據驅動的智能開發"
 * 
 * 核心工作原則：看到問題 → 深度分析根本原因 → 基於經驗思考 → 設計正確方案 → 實施修復
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');
const CoreWorkflowPrinciples = require('./core-workflow-principles');

class WorkflowAutomationMaster {
    constructor() {
        this.config = this.loadConfig();
        this.currentPhase = null;
        this.executionLog = [];
        this.mcpTools = this.initializeMCPTools();
        this.coreWorkflow = new CoreWorkflowPrinciples();
        this.startTime = new Date();

        console.log(chalk.blue.bold('🚀 EduCreate 自動化開發助手系統啟動'));
        console.log(chalk.gray(`啟動時間: ${this.startTime.toISOString()}`));
    }

    /**
     * 載入配置文件
     */
    loadConfig() {
        const configPath = path.join(__dirname, 'workflow-config.json');
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        
        // 創建默認配置
        const defaultConfig = this.createDefaultConfig();
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }

    /**
     * 創建默認配置
     */
    createDefaultConfig() {
        return {
            "version": "1.0.0",
            "coreWorkflowPrinciples": {
                "enabled": true,
                "forceAnalysis": true,
                "requireMemoryCheck": true,
                "preventDirectFix": true
            },
            "mcpTools": {
                "sequentialThinking": { "enabled": true, "priority": 1 },
                "localMemory": { "enabled": true, "priority": 2 },
                "sqlite": { "enabled": true, "priority": 3 },
                "vectorSearch": { "enabled": true, "priority": 4 },
                "playwright": { "enabled": true, "priority": 5 },
                "feedbackCollector": { "enabled": true, "priority": 6 },
                "autoGen": { "enabled": true, "priority": 7 },
                "langfuse": { "enabled": true, "priority": 8 },
                "mongodb": { "enabled": true, "priority": 9 }
            },
            "phaser3Detection": {
                "enabled": true,
                "keywords": ["phaser", "Phaser", "phaser3", "Phaser 3", "遊戲", "game", "Game", "gaming", "AirplaneCollisionGame", "GameScene", "sprite"],
                "pathPatterns": ["/games/", "Game.tsx", ".phaser."],
                "autoReminder": true
            },
            "responsiveTesting": {
                "enabled": true,
                "mandatory": true,
                "devices": [
                    { "name": "手機直向", "width": 375, "height": 667 },
                    { "name": "手機橫向", "width": 812, "height": 375 },
                    { "name": "平板直向", "width": 768, "height": 1024 },
                    { "name": "平板橫向", "width": 1024, "height": 768 },
                    { "name": "桌面版", "width": 1440, "height": 900 }
                ]
            },
            "errorDetection": {
                "enabled": true,
                "keywords": ["Error", "Failed", "timeout", "did not find", "ECONNREFUSED", "404", "500"],
                "autoFix": true,
                "tools": ["diagnostics", "codebase-retrieval", "view"]
            },
            "testVideoManagement": {
                "enabled": true,
                "autoProcess": true,
                "autoReport": true,
                "namingFormat": "YYYYMMDD_模組_功能_結果_版本_序號.webm"
            }
        };
    }

    /**
     * 初始化 MCP 工具
     */
    initializeMCPTools() {
        return {
            sequentialThinking: new SequentialThinkingTool(),
            localMemory: new LocalMemoryTool(),
            sqlite: new SQLiteTool(),
            vectorSearch: new VectorSearchTool(),
            playwright: new PlaywrightTool(),
            feedbackCollector: new FeedbackCollectorTool(),
            autoGen: new AutoGenTool(),
            langfuse: new LangfuseTool(),
            mongodb: new MongoDBTool()
        };
    }

    /**
     * 🧠 核心工作原則自動執行
     * 基於 MY-WORKFLOW.md 第36-40行的強制執行規則
     */
    async executeCoreWorkflowPrinciples(problem, context = {}) {
        console.log(chalk.yellow.bold('\n🧠 執行核心工作原則（強制第一步）'));

        // 使用 CoreWorkflowPrinciples 類來執行完整的分析
        return await this.coreWorkflow.execute(problem, context);
    }

    /**
     * 🔍 深度分析根本原因
     */
    async deepRootCauseAnalysis(problem, context) {
        const analysis = {
            whyAnalysis: [],
            memoryCheck: null,
            timelineAnalysis: null,
            stateComparison: null
        };

        // 先問為什麼（5個為什麼分析法）
        console.log(chalk.gray('  📝 執行5個為什麼分析...'));
        for (let i = 1; i <= 5; i++) {
            const why = await this.askWhy(problem, i, analysis.whyAnalysis);
            analysis.whyAnalysis.push(why);
            console.log(chalk.gray(`    ${i}. 為什麼: ${why}`));
        }

        // 查閱學習記憶
        console.log(chalk.gray('  🧠 查閱學習記憶系統...'));
        analysis.memoryCheck = await this.checkLearningMemory(problem);

        // 事件時序分析
        console.log(chalk.gray('  ⏰ 事件時序分析...'));
        analysis.timelineAnalysis = await this.analyzeTimeline(problem, context);

        // 狀態對比分析
        console.log(chalk.gray('  🔄 狀態對比分析...'));
        analysis.stateComparison = await this.compareStates(problem, context);

        return analysis;
    }

    /**
     * 🧠 基於經驗思考
     */
    async experienceBasedThinking(rootCauseAnalysis) {
        const thinking = {
            memoryInsights: null,
            multiAngleAnalysis: null,
            assumptionChallenges: null,
            principleUnderstanding: null
        };

        // 利用學習記憶系統
        console.log(chalk.gray('  🧠 利用學習記憶系統...'));
        thinking.memoryInsights = await this.getMemoryInsights(rootCauseAnalysis);

        // 多角度思考
        console.log(chalk.gray('  🔍 多角度分析...'));
        thinking.multiAngleAnalysis = await this.multiAngleAnalysis(rootCauseAnalysis);

        // 質疑假設
        console.log(chalk.gray('  ❓ 質疑假設...'));
        thinking.assumptionChallenges = await this.challengeAssumptions(rootCauseAnalysis);

        // 理解底層原理
        console.log(chalk.gray('  ⚙️ 理解底層原理...'));
        thinking.principleUnderstanding = await this.understandPrinciples(rootCauseAnalysis);

        return thinking;
    }

    /**
     * 🎯 設計正確方案
     */
    async designCorrectSolution(experienceBasedThinking) {
        const solutionDesign = {
            alternatives: [],
            selectedSolution: null,
            verification: null
        };

        // 多種方案對比
        console.log(chalk.gray('  🔄 生成多種解決方案...'));
        solutionDesign.alternatives = await this.generateAlternatives(experienceBasedThinking);

        // 選擇根本性解決方案
        console.log(chalk.gray('  🎯 選擇根本性解決方案...'));
        solutionDesign.selectedSolution = await this.selectRootSolution(solutionDesign.alternatives);

        // 經驗驗證
        console.log(chalk.gray('  ✅ 經驗驗證...'));
        solutionDesign.verification = await this.verifyWithExperience(solutionDesign.selectedSolution);

        return solutionDesign;
    }

    /**
     * 🔧 實施修復
     */
    async implementSolution(solutionDesign) {
        const implementation = {
            steps: [],
            results: [],
            verification: null,
            learning: null
        };

        console.log(chalk.gray('  🔧 謹慎實施解決方案...'));
        
        // 執行解決方案步驟
        for (const step of solutionDesign.selectedSolution.steps) {
            const result = await this.executeStep(step);
            implementation.steps.push(step);
            implementation.results.push(result);
            console.log(chalk.gray(`    ✅ ${step.description}: ${result.status}`));
        }

        // 測試驗證
        console.log(chalk.gray('  🧪 測試驗證...'));
        implementation.verification = await this.verifyImplementation(implementation);

        // 記錄學習
        console.log(chalk.gray('  📝 記錄學習經驗...'));
        implementation.learning = await this.recordImplementationLearning(implementation);

        return implementation;
    }

    /**
     * 🎯 Phaser 3 自動檢測和提醒
     */
    async detectPhaser3AndRemind(input) {
        if (!this.config.phaser3Detection.enabled) return false;

        const keywords = this.config.phaser3Detection.keywords;
        const pathPatterns = this.config.phaser3Detection.pathPatterns;

        // 檢測關鍵詞
        const hasKeyword = keywords.some(keyword => 
            input.toLowerCase().includes(keyword.toLowerCase())
        );

        // 檢測路徑模式
        const hasPathPattern = pathPatterns.some(pattern => 
            input.includes(pattern)
        );

        if (hasKeyword || hasPathPattern) {
            console.log(chalk.magenta.bold('\n🎮 Phaser 3 檢測觸發！'));
            
            if (this.config.phaser3Detection.autoReminder) {
                await this.executePhaser3Reminder();
            }
            
            return true;
        }

        return false;
    }

    /**
     * 執行 Phaser 3 提醒
     */
    async executePhaser3Reminder() {
        try {
            console.log(chalk.gray('  🧠 執行 Phaser 3 學習提醒...'));
            const result = execSync(
                'node EduCreate-Test-Videos/scripts/phaser3-learning-persistence.js reminder',
                { encoding: 'utf8', cwd: process.cwd() }
            );
            console.log(chalk.green('  ✅ Phaser 3 提醒執行完成'));
            return result;
        } catch (error) {
            console.log(chalk.red(`  ❌ Phaser 3 提醒執行失敗: ${error.message}`));
            return null;
        }
    }

    /**
     * 🚨 錯誤自動檢測和修復
     */
    async detectAndFixErrors(output) {
        if (!this.config.errorDetection.enabled) return false;

        const errorKeywords = this.config.errorDetection.keywords;
        const hasError = errorKeywords.some(keyword => 
            output.includes(keyword)
        );

        if (hasError) {
            console.log(chalk.red.bold('\n🚨 錯誤檢測觸發！'));
            console.log(chalk.red(`檢測到錯誤關鍵詞: ${output.substring(0, 200)}...`));
            
            if (this.config.errorDetection.autoFix) {
                return await this.executeErrorFix(output);
            }
        }

        return false;
    }

    /**
     * 執行錯誤修復
     */
    async executeErrorFix(errorOutput) {
        console.log(chalk.yellow('🔧 執行自動錯誤修復流程...'));
        
        // 使用核心工作原則分析錯誤
        const analysis = await this.executeCoreWorkflowPrinciples(
            `檢測到錯誤: ${errorOutput}`,
            { type: 'error', output: errorOutput }
        );

        // 執行修復工具
        const tools = this.config.errorDetection.tools;
        const results = {};

        for (const tool of tools) {
            try {
                console.log(chalk.gray(`  🔧 執行 ${tool}...`));
                results[tool] = await this.executeTool(tool, errorOutput);
            } catch (error) {
                console.log(chalk.red(`  ❌ ${tool} 執行失敗: ${error.message}`));
                results[tool] = { error: error.message };
            }
        }

        return { analysis, toolResults: results };
    }

    /**
     * 📋 Phase 1: 功能開發自動化
     */
    async executePhase1(options = {}) {
        console.log(chalk.blue.bold('\n📋 Phase 1: 功能開發階段'));

        const phase1Config = this.config.workflowPhases.phase1;
        const results = {};

        // 0. 執行核心工作原則（強制第一步）
        if (options.problem) {
            results.coreWorkflowPrinciples = await this.executeCoreWorkflowPrinciples(
                options.problem,
                options.context || {}
            );
        }

        // 1. 查看任務列表
        console.log(chalk.cyan('📋 查看任務列表...'));
        results.taskList = await this.executeViewTasklist();

        // 2. 開始新任務
        if (options.taskId) {
            console.log(chalk.cyan('🚀 開始新任務...'));
            results.taskUpdate = await this.executeUpdateTasks(options.taskId, 'IN_PROGRESS');
        }

        // 3. Phaser 3 專門檢查
        results.phaser3Check = await this.detectPhaser3AndRemind(
            JSON.stringify(options)
        );

        // 4. 使用 codebase-retrieval 分析現有代碼
        if (options.analysisRequest) {
            console.log(chalk.cyan('🔍 分析現有代碼...'));
            results.codebaseAnalysis = await this.executeCodebaseRetrieval(options.analysisRequest);
        }

        // 5. 創建新組件和功能
        if (options.createComponents) {
            console.log(chalk.cyan('🔧 創建新組件...'));
            results.componentCreation = await this.createComponents(options.createComponents);
        }

        // 6. 整合到現有系統
        if (options.integration) {
            console.log(chalk.cyan('🔗 整合到現有系統...'));
            results.systemIntegration = await this.integrateToSystem(options.integration);
        }

        return results;
    }

    /**
     * 🧪 Phase 2: 測試驗證自動化
     */
    async executePhase2(options = {}) {
        console.log(chalk.blue.bold('\n🧪 Phase 2: 測試驗證階段'));

        const results = {};

        // 1. 初始化測試影片管理系統
        console.log(chalk.cyan('🎬 初始化測試系統...'));
        results.testSystemInit = await this.initializeTestSystem();

        // 2. 修復前截圖
        if (options.beforeScreenshot) {
            console.log(chalk.cyan('📸 修復前截圖...'));
            results.beforeScreenshot = await this.takeBeforeScreenshot(options.beforeScreenshot);
        }

        // 3. 代碼修改
        if (options.codeChanges) {
            console.log(chalk.cyan('💻 執行代碼修改...'));
            results.codeModification = await this.executeCodeChanges(options.codeChanges);
        }

        // 4. 修復後截圖
        if (options.afterScreenshot) {
            console.log(chalk.cyan('📸 修復後截圖...'));
            results.afterScreenshot = await this.takeAfterScreenshot(options.afterScreenshot);
        }

        // 5. 截圖比對分析
        if (results.beforeScreenshot && results.afterScreenshot) {
            console.log(chalk.cyan('🔍 截圖比對分析...'));
            results.screenshotComparison = await this.compareScreenshots(
                results.beforeScreenshot,
                results.afterScreenshot
            );
        }

        // 6. 響應式佈局測試（強制執行）
        console.log(chalk.cyan('📱 響應式佈局測試...'));
        results.responsiveTesting = await this.executeResponsiveTesting(options.feature || 'default');

        // 7. Playwright 測試
        if (options.playwrightTest) {
            console.log(chalk.cyan('🎭 Playwright 測試...'));
            results.playwrightTesting = await this.executePlaywrightTesting(options.playwrightTest);
        }

        // 8. 錯誤檢查（強制執行）
        console.log(chalk.cyan('🚨 錯誤檢查...'));
        results.errorDetection = await this.performErrorCheck();

        // 9. 功能驗證測試
        if (options.functionalTest) {
            console.log(chalk.cyan('✅ 功能驗證測試...'));
            results.functionalVerification = await this.executeFunctionalTest(options.functionalTest);
        }

        // 10. 處理測試影片
        console.log(chalk.cyan('🎬 處理測試影片...'));
        results.testVideoProcessing = await this.processTestVideos();

        // 11. 生成完整報告
        console.log(chalk.cyan('📊 生成完整報告...'));
        results.reportGeneration = await this.generateReports();

        return results;
    }

    /**
     * 📝 Phase 3: 記錄反饋自動化
     */
    async executePhase3(options = {}) {
        console.log(chalk.blue.bold('\n📝 Phase 3: 記錄反饋階段'));

        const results = {};

        // 1. 查看測試結果
        console.log(chalk.cyan('📊 查看測試結果...'));
        results.testResults = await this.viewTestResults();

        // 2. 檢查 MCP 整合記錄
        console.log(chalk.cyan('🔗 檢查 MCP 整合記錄...'));
        results.mcpIntegration = await this.checkMCPIntegration();

        // 3. 查看響應式測試報告
        console.log(chalk.cyan('📱 查看響應式測試報告...'));
        results.responsiveReport = await this.viewResponsiveReport();

        // 4. 生成完整測試報告
        console.log(chalk.cyan('📋 生成完整測試報告...'));
        results.completeReport = await this.generateCompleteTestReport(results);

        // 5. 使用 mcp-feedback-collector 收集反饋（強制執行）
        console.log(chalk.cyan('💬 收集用戶反饋...'));
        results.feedbackCollection = await this.collectFeedback(results.completeReport);

        // 6. 完成任務
        if (options.taskId) {
            console.log(chalk.cyan('✅ 完成任務...'));
            results.taskCompletion = await this.executeUpdateTasks(options.taskId, 'COMPLETE');
        }

        return results;
    }

    /**
     * 🚀 完整工作流程自動化
     */
    async executeFullWorkflow(options = {}) {
        console.log(chalk.blue.bold('\n🚀 執行完整工作流程'));

        const fullResults = {
            startTime: new Date(),
            phases: {}
        };

        try {
            // Phase 1: 功能開發
            fullResults.phases.phase1 = await this.executePhase1(options.phase1 || {});

            // Phase 2: 測試驗證
            fullResults.phases.phase2 = await this.executePhase2(options.phase2 || {});

            // Phase 3: 記錄反饋
            fullResults.phases.phase3 = await this.executePhase3(options.phase3 || {});

            fullResults.endTime = new Date();
            fullResults.duration = fullResults.endTime - fullResults.startTime;
            fullResults.success = true;

            console.log(chalk.green.bold(`\n🎉 完整工作流程執行成功！`));
            console.log(chalk.gray(`總耗時: ${fullResults.duration}ms`));

            return fullResults;

        } catch (error) {
            fullResults.endTime = new Date();
            fullResults.duration = fullResults.endTime - fullResults.startTime;
            fullResults.success = false;
            fullResults.error = error.message;

            console.log(chalk.red.bold(`\n❌ 完整工作流程執行失敗！`));
            console.log(chalk.red(`錯誤: ${error.message}`));

            throw error;
        }
    }

    /**
     * 主要執行方法
     */
    async execute(command, options = {}) {
        console.log(chalk.blue.bold(`\n🚀 執行命令: ${command}`));

        try {
            // Phaser 3 檢測
            await this.detectPhaser3AndRemind(command);

            // 根據命令類型執行不同的工作流程
            switch (command) {
                case 'phase1':
                    return await this.executePhase1(options);
                case 'phase2':
                    return await this.executePhase2(options);
                case 'phase3':
                    return await this.executePhase3(options);
                case 'full-workflow':
                    return await this.executeFullWorkflow(options);
                default:
                    return await this.executeCustomCommand(command, options);
            }
        } catch (error) {
            console.log(chalk.red.bold(`❌ 執行失敗: ${error.message}`));

            // 自動錯誤檢測和修復
            await this.detectAndFixErrors(error.message);

            throw error;
        }
    }
}

// 工具類定義（簡化版，實際實現會更複雜）
class SequentialThinkingTool {
    async execute(input) { return { tool: 'sequentialThinking', input, result: 'executed' }; }
}

class LocalMemoryTool {
    async execute(input) { return { tool: 'localMemory', input, result: 'executed' }; }
}

class SQLiteTool {
    async execute(input) { return { tool: 'sqlite', input, result: 'executed' }; }
}

class VectorSearchTool {
    async execute(input) { return { tool: 'vectorSearch', input, result: 'executed' }; }
}

class PlaywrightTool {
    async execute(input) { return { tool: 'playwright', input, result: 'executed' }; }
}

class FeedbackCollectorTool {
    async execute(input) { return { tool: 'feedbackCollector', input, result: 'executed' }; }
}

class AutoGenTool {
    async execute(input) { return { tool: 'autoGen', input, result: 'executed' }; }
}

class LangfuseTool {
    async execute(input) { return { tool: 'langfuse', input, result: 'executed' }; }
}

class MongoDBTool {
    async execute(input) { return { tool: 'mongodb', input, result: 'executed' }; }
}

// 主程序入口
if (require.main === module) {
    const master = new WorkflowAutomationMaster();
    
    const command = process.argv[2] || 'help';
    const options = {};
    
    // 解析命令行參數
    for (let i = 3; i < process.argv.length; i += 2) {
        const key = process.argv[i]?.replace('--', '');
        const value = process.argv[i + 1];
        if (key && value) {
            options[key] = value;
        }
    }
    
    if (command === 'help') {
        console.log(chalk.blue.bold('\n🚀 EduCreate 自動化開發助手系統'));
        console.log(chalk.gray('用法: node workflow-automation-master.js <command> [options]'));
        console.log(chalk.gray('\n可用命令:'));
        console.log(chalk.gray('  phase1           - 執行 Phase 1 功能開發流程'));
        console.log(chalk.gray('  phase2           - 執行 Phase 2 測試驗證流程'));
        console.log(chalk.gray('  phase3           - 執行 Phase 3 記錄反饋流程'));
        console.log(chalk.gray('  full-workflow    - 執行完整工作流程'));
        console.log(chalk.gray('  help             - 顯示此幫助信息'));
    } else {
        master.execute(command, options)
            .then(result => {
                console.log(chalk.green.bold('\n✅ 執行完成'));
                console.log(result);
            })
            .catch(error => {
                console.log(chalk.red.bold('\n❌ 執行失敗'));
                console.error(error);
                process.exit(1);
            });
    }
}

module.exports = WorkflowAutomationMaster;
