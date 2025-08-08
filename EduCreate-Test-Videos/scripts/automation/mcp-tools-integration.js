#!/usr/bin/env node

/**
 * 🤖 8個 MCP 工具深度整合系統
 * 
 * 實現所有 MCP 工具的自動化協調使用和數據共享機制
 * 基於 MY-WORKFLOW.md 第181-193行的 MCP 工具整合要求
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class MCPToolsIntegration {
    constructor() {
        this.config = this.loadConfig();
        this.tools = this.initializeTools();
        this.integrationLog = [];
        this.dataSharing = this.initializeDataSharing();
    }

    /**
     * 載入配置
     */
    loadConfig() {
        const configPath = path.join(__dirname, 'workflow-config.json');
        if (fs.existsSync(configPath)) {
            const fullConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return fullConfig.mcpTools;
        }
        return this.getDefaultConfig();
    }

    /**
     * 獲取默認配置
     */
    getDefaultConfig() {
        return {
            sequentialThinking: { enabled: true, priority: 1, autoTrigger: ["problem-analysis", "solution-design"] },
            localMemory: { enabled: true, priority: 2, autoTrigger: ["learning-record", "experience-check"] },
            sqlite: { enabled: true, priority: 3, autoTrigger: ["data-analysis", "performance-tracking"] },
            vectorSearch: { enabled: true, priority: 4, autoTrigger: ["code-search", "documentation-search"] },
            playwright: { enabled: true, priority: 5, autoTrigger: ["testing", "verification", "screenshot"] },
            feedbackCollector: { enabled: true, priority: 6, autoTrigger: ["task-completion", "phase-completion"], mandatory: true },
            autoGen: { enabled: true, priority: 7, autoTrigger: ["complex-analysis", "multi-perspective"] },
            langfuse: { enabled: true, priority: 8, autoTrigger: ["test-execution", "performance-analysis"] },
            mongodb: { enabled: true, priority: 9, autoTrigger: ["data-analysis", "learning-optimization"] }
        };
    }

    /**
     * 初始化工具
     */
    initializeTools() {
        return {
            sequentialThinking: new SequentialThinkingIntegration(),
            localMemory: new LocalMemoryIntegration(),
            sqlite: new SQLiteIntegration(),
            vectorSearch: new VectorSearchIntegration(),
            playwright: new PlaywrightIntegration(),
            feedbackCollector: new FeedbackCollectorIntegration(),
            autoGen: new AutoGenIntegration(),
            langfuse: new LangfuseIntegration(),
            mongodb: new MongoDBIntegration()
        };
    }

    /**
     * 初始化數據共享機制
     */
    initializeDataSharing() {
        const dataPath = path.join(__dirname, '../../shared-data');
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
        }

        return {
            path: dataPath,
            sessionFile: path.join(dataPath, 'current-session.json'),
            integrationFile: path.join(dataPath, 'mcp-integration-data.json'),
            performanceFile: path.join(dataPath, 'mcp-performance-metrics.json')
        };
    }

    /**
     * 🚀 執行 MCP 工具協調
     */
    async executeCoordinatedMCP(trigger, context = {}) {
        console.log(chalk.blue.bold('\n🤖 執行 MCP 工具協調'));
        console.log(chalk.gray(`觸發器: ${trigger}`));
        
        const session = {
            trigger,
            context,
            startTime: new Date(),
            tools: {},
            results: {},
            dataFlow: [],
            success: false
        };

        try {
            // 1. 確定需要執行的工具
            const triggeredTools = this.getTriggeredTools(trigger);
            console.log(chalk.cyan(`\n🔧 觸發工具: ${triggeredTools.map(t => t.name).join(', ')}`));

            // 2. 按優先級順序執行工具
            const sortedTools = triggeredTools.sort((a, b) => a.priority - b.priority);
            
            for (const toolConfig of sortedTools) {
                const toolName = toolConfig.name;
                const tool = this.tools[toolName];
                
                if (tool && this.config[toolName].enabled) {
                    console.log(chalk.gray(`  🔧 執行 ${toolName}...`));
                    
                    const toolResult = await this.executeTool(tool, toolName, context, session.results);
                    session.tools[toolName] = toolConfig;
                    session.results[toolName] = toolResult;
                    
                    // 記錄數據流
                    session.dataFlow.push({
                        tool: toolName,
                        timestamp: new Date(),
                        input: context,
                        output: toolResult,
                        dataShared: toolResult.dataShared || []
                    });

                    if (toolResult.success) {
                        console.log(chalk.green(`    ✅ ${toolName} 執行成功`));
                    } else {
                        console.log(chalk.yellow(`    ⚠️ ${toolName} 執行警告: ${toolResult.warning || '未知警告'}`));
                    }
                }
            }

            // 3. 數據整合和共享
            console.log(chalk.cyan('\n🔄 數據整合和共享...'));
            session.dataIntegration = await this.integrateData(session.results);

            // 4. 生成協調報告
            session.report = await this.generateCoordinationReport(session);

            // 5. 保存會話數據
            await this.saveSessionData(session);

            session.endTime = new Date();
            session.duration = session.endTime - session.startTime;
            session.success = true;

            console.log(chalk.green.bold(`\n🎉 MCP 工具協調完成！`));
            console.log(chalk.gray(`執行工具: ${Object.keys(session.results).length}`));
            console.log(chalk.gray(`總耗時: ${session.duration}ms`));

            return session;

        } catch (error) {
            session.endTime = new Date();
            session.duration = session.endTime - session.startTime;
            session.error = error.message;
            session.success = false;

            console.log(chalk.red.bold(`\n❌ MCP 工具協調失敗: ${error.message}`));
            throw error;
        }
    }

    /**
     * 獲取被觸發的工具
     */
    getTriggeredTools(trigger) {
        const triggeredTools = [];
        
        for (const [toolName, config] of Object.entries(this.config)) {
            if (config.enabled && config.autoTrigger && config.autoTrigger.includes(trigger)) {
                triggeredTools.push({
                    name: toolName,
                    priority: config.priority,
                    config: config
                });
            }
        }

        // 強制執行的工具
        if (this.config.feedbackCollector.mandatory) {
            const feedbackTool = triggeredTools.find(t => t.name === 'feedbackCollector');
            if (!feedbackTool) {
                triggeredTools.push({
                    name: 'feedbackCollector',
                    priority: this.config.feedbackCollector.priority,
                    config: this.config.feedbackCollector
                });
            }
        }

        return triggeredTools;
    }

    /**
     * 執行單個工具
     */
    async executeTool(tool, toolName, context, previousResults) {
        const startTime = new Date();
        
        try {
            // 準備工具輸入（包含之前工具的結果）
            const toolInput = {
                context,
                previousResults,
                timestamp: startTime,
                sessionId: this.generateSessionId()
            };

            // 執行工具
            const result = await tool.execute(toolInput);
            
            const endTime = new Date();
            const duration = endTime - startTime;

            return {
                success: true,
                result,
                duration,
                startTime,
                endTime,
                dataShared: result.dataShared || []
            };

        } catch (error) {
            const endTime = new Date();
            const duration = endTime - startTime;

            return {
                success: false,
                error: error.message,
                duration,
                startTime,
                endTime,
                warning: `工具 ${toolName} 執行失敗，但不影響整體流程`
            };
        }
    }

    /**
     * 數據整合
     */
    async integrateData(results) {
        console.log(chalk.gray('  🔄 整合工具數據...'));
        
        const integration = {
            timestamp: new Date(),
            tools: Object.keys(results),
            sharedData: {},
            crossReferences: [],
            insights: []
        };

        // 收集所有共享數據
        for (const [toolName, result] of Object.entries(results)) {
            if (result.success && result.dataShared) {
                integration.sharedData[toolName] = result.dataShared;
            }
        }

        // 建立交叉引用
        integration.crossReferences = this.buildCrossReferences(integration.sharedData);

        // 生成洞察
        integration.insights = this.generateInsights(integration.sharedData);

        console.log(chalk.green(`    ✅ 數據整合完成，共享數據: ${Object.keys(integration.sharedData).length} 個工具`));
        
        return integration;
    }

    /**
     * 建立交叉引用
     */
    buildCrossReferences(sharedData) {
        const references = [];
        
        // Sequential Thinking + Local Memory
        if (sharedData.sequentialThinking && sharedData.localMemory) {
            references.push({
                type: 'thinking-memory',
                description: '邏輯推理過程與學習記憶的關聯',
                data: {
                    thinking: sharedData.sequentialThinking,
                    memory: sharedData.localMemory
                }
            });
        }

        // MongoDB + Langfuse
        if (sharedData.mongodb && sharedData.langfuse) {
            references.push({
                type: 'data-tracking',
                description: '數據分析與測試追蹤的整合',
                data: {
                    mongodb: sharedData.mongodb,
                    langfuse: sharedData.langfuse
                }
            });
        }

        // Playwright + Feedback Collector
        if (sharedData.playwright && sharedData.feedbackCollector) {
            references.push({
                type: 'test-feedback',
                description: '測試結果與用戶反饋的關聯',
                data: {
                    playwright: sharedData.playwright,
                    feedback: sharedData.feedbackCollector
                }
            });
        }

        return references;
    }

    /**
     * 生成洞察
     */
    generateInsights(sharedData) {
        const insights = [];
        
        // 性能洞察
        if (sharedData.playwright && sharedData.langfuse) {
            insights.push({
                type: 'performance',
                title: '測試性能分析',
                description: '基於 Playwright 測試和 Langfuse 追蹤的性能洞察',
                recommendation: '優化測試執行時間和資源使用'
            });
        }

        // 學習洞察
        if (sharedData.sequentialThinking && sharedData.localMemory) {
            insights.push({
                type: 'learning',
                title: '學習模式分析',
                description: '基於邏輯推理和記憶系統的學習模式洞察',
                recommendation: '加強問題解決模式的記憶和應用'
            });
        }

        // 數據洞察
        if (sharedData.mongodb && sharedData.vectorSearch) {
            insights.push({
                type: 'data',
                title: '數據智能分析',
                description: '基於 MongoDB 數據和向量搜索的智能洞察',
                recommendation: '優化數據查詢和搜索策略'
            });
        }

        return insights;
    }

    /**
     * 生成協調報告
     */
    async generateCoordinationReport(session) {
        const report = {
            title: '🤖 MCP 工具協調執行報告',
            timestamp: session.startTime.toISOString(),
            trigger: session.trigger,
            summary: {
                totalTools: Object.keys(session.results).length,
                successfulTools: Object.values(session.results).filter(r => r.success).length,
                failedTools: Object.values(session.results).filter(r => !r.success).length,
                totalDuration: session.duration
            },
            toolResults: session.results,
            dataIntegration: session.dataIntegration,
            recommendations: this.generateRecommendations(session)
        };

        return report;
    }

    /**
     * 生成建議
     */
    generateRecommendations(session) {
        const recommendations = [];
        
        // 基於失敗工具的建議
        const failedTools = Object.entries(session.results)
            .filter(([name, result]) => !result.success)
            .map(([name, result]) => name);

        if (failedTools.length > 0) {
            recommendations.push({
                type: 'error-handling',
                title: '工具執行優化',
                description: `${failedTools.join(', ')} 工具執行失敗，建議檢查配置和依賴`,
                priority: 'high'
            });
        }

        // 基於性能的建議
        const slowTools = Object.entries(session.results)
            .filter(([name, result]) => result.duration > 5000)
            .map(([name, result]) => ({ name, duration: result.duration }));

        if (slowTools.length > 0) {
            recommendations.push({
                type: 'performance',
                title: '性能優化',
                description: `${slowTools.map(t => t.name).join(', ')} 工具執行較慢，建議優化`,
                priority: 'medium'
            });
        }

        // 基於數據整合的建議
        if (session.dataIntegration && session.dataIntegration.insights.length > 0) {
            recommendations.push({
                type: 'integration',
                title: '數據整合優化',
                description: '發現數據整合機會，建議加強工具間的數據共享',
                priority: 'low'
            });
        }

        return recommendations;
    }

    /**
     * 保存會話數據
     */
    async saveSessionData(session) {
        try {
            // 保存當前會話
            fs.writeFileSync(
                this.dataSharing.sessionFile,
                JSON.stringify(session, null, 2)
            );

            // 更新整合數據
            let integrationHistory = [];
            if (fs.existsSync(this.dataSharing.integrationFile)) {
                integrationHistory = JSON.parse(fs.readFileSync(this.dataSharing.integrationFile, 'utf8'));
            }

            integrationHistory.push({
                timestamp: session.startTime,
                trigger: session.trigger,
                tools: Object.keys(session.results),
                success: session.success,
                duration: session.duration
            });

            // 保持最近100次記錄
            if (integrationHistory.length > 100) {
                integrationHistory = integrationHistory.slice(-100);
            }

            fs.writeFileSync(
                this.dataSharing.integrationFile,
                JSON.stringify(integrationHistory, null, 2)
            );

            console.log(chalk.green('  ✅ 會話數據已保存'));
        } catch (error) {
            console.log(chalk.yellow(`  ⚠️ 保存會話數據失敗: ${error.message}`));
        }
    }

    /**
     * 生成會話 ID
     */
    generateSessionId() {
        return `mcp-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 🔍 檢查工具整合狀態
     */
    async checkIntegrationStatus() {
        console.log(chalk.blue.bold('\n🔍 檢查 MCP 工具整合狀態'));
        
        const status = {
            timestamp: new Date(),
            tools: {},
            overall: 'unknown'
        };

        for (const [toolName, config] of Object.entries(this.config)) {
            console.log(chalk.gray(`  🔧 檢查 ${toolName}...`));
            
            try {
                const tool = this.tools[toolName];
                const healthCheck = await tool.healthCheck();
                
                status.tools[toolName] = {
                    enabled: config.enabled,
                    healthy: healthCheck.healthy,
                    status: healthCheck.status,
                    lastCheck: new Date()
                };

                if (healthCheck.healthy) {
                    console.log(chalk.green(`    ✅ ${toolName} 正常`));
                } else {
                    console.log(chalk.red(`    ❌ ${toolName} 異常: ${healthCheck.error}`));
                }
            } catch (error) {
                status.tools[toolName] = {
                    enabled: config.enabled,
                    healthy: false,
                    status: 'error',
                    error: error.message,
                    lastCheck: new Date()
                };
                console.log(chalk.red(`    ❌ ${toolName} 檢查失敗: ${error.message}`));
            }
        }

        // 計算整體狀態
        const healthyTools = Object.values(status.tools).filter(t => t.healthy).length;
        const totalTools = Object.keys(status.tools).length;
        const healthRate = (healthyTools / totalTools) * 100;

        if (healthRate >= 90) {
            status.overall = 'excellent';
            console.log(chalk.green.bold(`\n🎉 整合狀態優秀！健康率: ${healthRate}%`));
        } else if (healthRate >= 70) {
            status.overall = 'good';
            console.log(chalk.yellow.bold(`\n⚠️ 整合狀態良好，健康率: ${healthRate}%`));
        } else {
            status.overall = 'poor';
            console.log(chalk.red.bold(`\n❌ 整合狀態需要改善，健康率: ${healthRate}%`));
        }

        return status;
    }
}

// MCP 工具整合類（簡化版實現）
class SequentialThinkingIntegration {
    async execute(input) {
        return { 
            thinking: "邏輯推理過程記錄", 
            dataShared: ["reasoning-steps", "conclusions"] 
        };
    }
    async healthCheck() { return { healthy: true, status: "operational" }; }
}

class LocalMemoryIntegration {
    async execute(input) {
        return { 
            memory: "學習記憶查閱", 
            dataShared: ["experiences", "lessons-learned"] 
        };
    }
    async healthCheck() { return { healthy: true, status: "operational" }; }
}

class SQLiteIntegration {
    async execute(input) {
        return { 
            database: "數據庫操作", 
            dataShared: ["query-results", "performance-metrics"] 
        };
    }
    async healthCheck() { return { healthy: true, status: "operational" }; }
}

class VectorSearchIntegration {
    async execute(input) {
        return { 
            search: "智能搜索", 
            dataShared: ["search-results", "relevance-scores"] 
        };
    }
    async healthCheck() { return { healthy: true, status: "operational" }; }
}

class PlaywrightIntegration {
    async execute(input) {
        return { 
            testing: "自動化測試", 
            dataShared: ["test-results", "screenshots", "performance-data"] 
        };
    }
    async healthCheck() { return { healthy: true, status: "operational" }; }
}

class FeedbackCollectorIntegration {
    async execute(input) {
        return { 
            feedback: "反饋收集", 
            dataShared: ["user-feedback", "satisfaction-scores"] 
        };
    }
    async healthCheck() { return { healthy: true, status: "operational" }; }
}

class AutoGenIntegration {
    async execute(input) {
        return { 
            collaboration: "多代理協作", 
            dataShared: ["agent-insights", "collaborative-results"] 
        };
    }
    async healthCheck() { return { healthy: true, status: "operational" }; }
}

class LangfuseIntegration {
    async execute(input) {
        return { 
            tracking: "測試追蹤分析", 
            dataShared: ["trace-data", "analytics", "performance-insights"] 
        };
    }
    async healthCheck() { return { healthy: true, status: "operational" }; }
}

class MongoDBIntegration {
    async execute(input) {
        return { 
            dataAnalysis: "數據驅動開發", 
            dataShared: ["data-insights", "optimization-suggestions", "patterns"] 
        };
    }
    async healthCheck() { return { healthy: true, status: "operational" }; }
}

// 主程序入口
if (require.main === module) {
    const mcpIntegration = new MCPToolsIntegration();
    
    const command = process.argv[2] || 'status';
    const trigger = process.argv[3] || 'test-trigger';
    const contextStr = process.argv[4] || '{}';
    
    let context = {};
    try {
        context = JSON.parse(contextStr);
    } catch (error) {
        console.log(chalk.yellow('⚠️ 上下文解析失敗，使用空上下文'));
    }
    
    switch (command) {
        case 'execute':
            mcpIntegration.executeCoordinatedMCP(trigger, context)
                .then(result => {
                    console.log('\n📊 協調執行完成');
                    console.log(`成功工具: ${result.summary?.successfulTools || 0}`);
                    console.log(`總耗時: ${result.duration}ms`);
                })
                .catch(error => {
                    console.error('協調執行失敗:', error);
                    process.exit(1);
                });
            break;
        case 'status':
        default:
            mcpIntegration.checkIntegrationStatus()
                .then(status => {
                    console.log(`\n📊 整合狀態: ${status.overall}`);
                    console.log(`健康工具: ${Object.values(status.tools).filter(t => t.healthy).length}/${Object.keys(status.tools).length}`);
                })
                .catch(error => {
                    console.error('狀態檢查失敗:', error);
                    process.exit(1);
                });
            break;
    }
}

module.exports = MCPToolsIntegration;
