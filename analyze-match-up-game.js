const ChromeController = require('./chrome-controller.js');

/**
 * Match-up 遊戲詳細分析腳本
 * 分析遊戲初始化、詞彙數據和音頻功能
 */
class MatchUpGameAnalyzer {
    constructor() {
        this.controller = new ChromeController();
        this.results = {
            gameInitialization: {},
            vocabularyData: {},
            audioFunctionality: {},
            errors: []
        };
    }

    async connect() {
        return await this.controller.connect();
    }

    async analyzeGameInitialization() {
        console.log('\n🎮 分析遊戲初始化狀態...');
        
        const eduPage = this.controller.pages.find(page => 
            page.url().includes('edu-create.vercel.app')
        );

        if (!eduPage) {
            this.results.errors.push('未找到 EduCreate 頁面');
            return;
        }

        try {
            const gameState = await eduPage.evaluate(() => {
                return {
                    // URL 和參數
                    url: window.location.href,
                    urlParams: Object.fromEntries(new URLSearchParams(window.location.search)),
                    
                    // Phaser 遊戲狀態
                    phaserGame: {
                        exists: typeof window.game !== 'undefined',
                        isRunning: typeof window.game !== 'undefined' ? window.game.isRunning : false,
                        scenes: typeof window.game !== 'undefined' && window.game.scene ? 
                               Object.keys(window.game.scene.scenes) : []
                    },
                    
                    // Canvas 元素
                    canvas: {
                        count: document.querySelectorAll('canvas').length,
                        elements: Array.from(document.querySelectorAll('canvas')).map(canvas => ({
                            width: canvas.width,
                            height: canvas.height,
                            style: canvas.style.cssText
                        }))
                    },
                    
                    // 遊戲容器
                    gameContainer: {
                        exists: !!document.getElementById('game-container'),
                        innerHTML: document.getElementById('game-container')?.innerHTML.substring(0, 200)
                    },
                    
                    // 全域變數
                    globalVars: {
                        vocabularyData: typeof window.vocabularyData !== 'undefined' ? 
                                      (Array.isArray(window.vocabularyData) ? window.vocabularyData.length : 'exists') : null,
                        gameOptions: typeof window.gameOptions !== 'undefined' ? window.gameOptions : null,
                        activityId: typeof window.activityId !== 'undefined' ? window.activityId : null
                    },
                    
                    // 存儲數據
                    storage: {
                        localStorage: Object.keys(localStorage).reduce((acc, key) => {
                            acc[key] = localStorage.getItem(key)?.substring(0, 100);
                            return acc;
                        }, {}),
                        sessionStorage: Object.keys(sessionStorage).reduce((acc, key) => {
                            acc[key] = sessionStorage.getItem(key)?.substring(0, 100);
                            return acc;
                        }, {})
                    }
                };
            });

            this.results.gameInitialization = gameState;
            console.log('✅ 遊戲初始化分析完成');
            
            // 輸出關鍵信息
            console.log(`📍 URL: ${gameState.url}`);
            console.log(`🎯 Activity ID: ${gameState.urlParams.activityId || '未找到'}`);
            console.log(`🎮 Phaser 遊戲: ${gameState.phaserGame.exists ? '已初始化' : '未初始化'}`);
            console.log(`🖼️ Canvas 數量: ${gameState.canvas.count}`);
            
        } catch (error) {
            this.results.errors.push(`遊戲初始化分析失敗: ${error.message}`);
            console.error('❌ 遊戲初始化分析失敗:', error.message);
        }
    }

    async analyzeVocabularyData() {
        console.log('\n📚 分析詞彙數據...');
        
        const eduPage = this.controller.pages.find(page => 
            page.url().includes('edu-create.vercel.app')
        );

        if (!eduPage) return;

        try {
            const vocabAnalysis = await eduPage.evaluate(() => {
                const analysis = {
                    vocabularySource: null,
                    dataStructure: null,
                    audioUrls: [],
                    imageUrls: [],
                    sampleData: null
                };

                // 檢查全域詞彙數據
                if (typeof window.vocabularyData !== 'undefined') {
                    analysis.vocabularySource = 'window.vocabularyData';
                    analysis.dataStructure = Array.isArray(window.vocabularyData) ? 
                                           'array' : typeof window.vocabularyData;
                    
                    if (Array.isArray(window.vocabularyData) && window.vocabularyData.length > 0) {
                        const sample = window.vocabularyData[0];
                        analysis.sampleData = sample;
                        
                        // 檢查音頻和圖片 URL
                        window.vocabularyData.forEach(item => {
                            if (item.audioUrl) analysis.audioUrls.push(item.audioUrl);
                            if (item.imageUrl) analysis.imageUrls.push(item.imageUrl);
                        });
                    }
                }

                // 檢查 localStorage 中的詞彙數據
                const storedVocab = localStorage.getItem('vocabularyData');
                if (storedVocab) {
                    try {
                        const parsed = JSON.parse(storedVocab);
                        analysis.vocabularySource = analysis.vocabularySource ? 
                                                  analysis.vocabularySource + ' + localStorage' : 'localStorage';
                        if (!analysis.sampleData && Array.isArray(parsed) && parsed.length > 0) {
                            analysis.sampleData = parsed[0];
                        }
                    } catch (e) {
                        // 忽略解析錯誤
                    }
                }

                return analysis;
            });

            this.results.vocabularyData = vocabAnalysis;
            console.log('✅ 詞彙數據分析完成');
            
            // 輸出關鍵信息
            console.log(`📊 數據來源: ${vocabAnalysis.vocabularySource || '未找到'}`);
            console.log(`🔊 音頻文件: ${vocabAnalysis.audioUrls.length} 個`);
            console.log(`🖼️ 圖片文件: ${vocabAnalysis.imageUrls.length} 個`);
            
            if (vocabAnalysis.sampleData) {
                console.log('📝 樣本數據:');
                console.log(`   問題: ${vocabAnalysis.sampleData.question || 'N/A'}`);
                console.log(`   答案: ${vocabAnalysis.sampleData.answer || 'N/A'}`);
                console.log(`   音頻: ${vocabAnalysis.sampleData.audioUrl ? '有' : '無'}`);
                console.log(`   圖片: ${vocabAnalysis.sampleData.imageUrl ? '有' : '無'}`);
            }

        } catch (error) {
            this.results.errors.push(`詞彙數據分析失敗: ${error.message}`);
            console.error('❌ 詞彙數據分析失敗:', error.message);
        }
    }

    async checkConsoleErrors() {
        console.log('\n🔍 檢查控制台錯誤...');
        
        const eduPage = this.controller.pages.find(page => 
            page.url().includes('edu-create.vercel.app')
        );

        if (!eduPage) return;

        try {
            // 監聽控制台消息
            const consoleLogs = [];
            
            eduPage.on('console', msg => {
                consoleLogs.push({
                    type: msg.type(),
                    text: msg.text(),
                    timestamp: new Date().toISOString()
                });
            });

            // 等待一段時間收集日誌
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.results.consoleLogs = consoleLogs;
            
            const errors = consoleLogs.filter(log => log.type === 'error');
            const warnings = consoleLogs.filter(log => log.type === 'warning');
            
            console.log(`📊 控制台消息: ${consoleLogs.length} 條`);
            console.log(`❌ 錯誤: ${errors.length} 條`);
            console.log(`⚠️ 警告: ${warnings.length} 條`);
            
            if (errors.length > 0) {
                console.log('\n🚨 錯誤詳情:');
                errors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error.text}`);
                });
            }

        } catch (error) {
            this.results.errors.push(`控制台錯誤檢查失敗: ${error.message}`);
            console.error('❌ 控制台錯誤檢查失敗:', error.message);
        }
    }

    async generateReport() {
        console.log('\n📋 生成分析報告...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                gameInitialized: this.results.gameInitialization?.phaserGame?.exists || false,
                vocabularyDataFound: !!this.results.vocabularyData?.vocabularySource,
                audioFilesCount: this.results.vocabularyData?.audioUrls?.length || 0,
                errorsCount: this.results.errors.length
            },
            details: this.results
        };

        // 保存報告到文件
        const fs = require('fs');
        const reportPath = 'match-up-game-analysis-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`✅ 報告已保存: ${reportPath}`);
        
        // 輸出摘要
        console.log('\n📊 分析摘要:');
        console.log(`🎮 遊戲初始化: ${report.summary.gameInitialized ? '✅ 成功' : '❌ 失敗'}`);
        console.log(`📚 詞彙數據: ${report.summary.vocabularyDataFound ? '✅ 找到' : '❌ 未找到'}`);
        console.log(`🔊 音頻文件: ${report.summary.audioFilesCount} 個`);
        console.log(`❌ 錯誤數量: ${report.summary.errorsCount} 個`);

        return report;
    }

    async disconnect() {
        await this.controller.disconnect();
    }
}

// 主執行函數
async function main() {
    const analyzer = new MatchUpGameAnalyzer();
    
    console.log('🚀 開始 Match-up 遊戲分析...');
    
    if (!await analyzer.connect()) {
        console.error('❌ 無法連接到 Chrome');
        return;
    }

    try {
        await analyzer.analyzeGameInitialization();
        await analyzer.analyzeVocabularyData();
        await analyzer.checkConsoleErrors();
        
        const report = await analyzer.generateReport();
        
        console.log('\n🎉 分析完成！');
        
    } catch (error) {
        console.error('❌ 分析過程中發生錯誤:', error);
    } finally {
        await analyzer.disconnect();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = MatchUpGameAnalyzer;