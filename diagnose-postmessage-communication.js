/**
 * 🔍 PostMessage 通信診斷工具
 * 分析手機 Safari 全螢幕失敗的 PostMessage 通信問題
 */

console.log('🔍 開始診斷 PostMessage 通信問題...');

const fs = require('fs');
const path = require('path');

// 創建 PostMessage 通信診斷工具
function createPostMessageDiagnosticTool() {
    console.log('🛠️ 創建 PostMessage 通信診斷工具');
    
    const htmlFilePath = path.join(__dirname, 'public/games/starshake-game/dist/index.html');
    
    try {
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        
        // 檢查是否已經包含診斷工具
        if (htmlContent.includes('POSTMESSAGE_DIAGNOSTIC_TOOL')) {
            console.log('⚠️ PostMessage 診斷工具已存在，跳過修改');
            return;
        }
        
        // 創建診斷工具代碼
        const diagnosticTool = `
        <!-- 🔍 PostMessage 通信診斷工具 - POSTMESSAGE_DIAGNOSTIC_TOOL -->
        <script>
            console.log('🔍 載入 PostMessage 通信診斷工具');
            
            // PostMessage 通信診斷類
            class PostMessageDiagnostic {
                constructor() {
                    this.diagnosticResults = {
                        environment: {},
                        communication: {},
                        errors: [],
                        timeline: []
                    };
                    this.init();
                }
                
                init() {
                    console.log('🚀 初始化 PostMessage 診斷工具');
                    this.diagnoseEnvironment();
                    this.setupCommunicationTest();
                    this.addDiagnosticFunctions();
                }
                
                // 診斷環境
                diagnoseEnvironment() {
                    console.log('🔍 診斷環境設置');
                    
                    const env = {
                        timestamp: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                        isInIframe: window !== window.parent,
                        canAccessParent: this.canAccessParent(),
                        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
                        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
                        isMobile: /Mobi|Android/i.test(navigator.userAgent),
                        windowLocation: window.location.href,
                        parentLocation: this.getParentLocation(),
                        hasPostMessage: typeof window.postMessage === 'function',
                        hasParentPostMessage: this.hasParentPostMessage()
                    };
                    
                    this.diagnosticResults.environment = env;
                    console.log('🔍 環境診斷結果:', env);
                    
                    // 記錄關鍵發現
                    if (!env.isInIframe) {
                        this.addError('NOT_IN_IFRAME', '不在 iframe 環境中，PostMessage 通信不適用');
                    }
                    
                    if (!env.canAccessParent) {
                        this.addError('CANNOT_ACCESS_PARENT', '無法訪問父頁面，可能有跨域限制');
                    }
                    
                    if (env.isIOS && env.isSafari) {
                        this.addWarning('IOS_SAFARI_DETECTED', 'iOS Safari 檢測到，可能有特殊限制');
                    }
                }
                
                // 檢查是否能訪問父頁面
                canAccessParent() {
                    try {
                        return window.parent && window.parent !== window;
                    } catch (error) {
                        this.addError('PARENT_ACCESS_ERROR', error.message);
                        return false;
                    }
                }
                
                // 獲取父頁面位置
                getParentLocation() {
                    try {
                        return window.parent ? window.parent.location.href : 'N/A';
                    } catch (error) {
                        return 'BLOCKED_BY_CORS';
                    }
                }
                
                // 檢查父頁面是否有 postMessage
                hasParentPostMessage() {
                    try {
                        return window.parent && typeof window.parent.postMessage === 'function';
                    } catch (error) {
                        return false;
                    }
                }
                
                // 設置通信測試
                setupCommunicationTest() {
                    console.log('📡 設置通信測試');
                    
                    // 監聽來自父頁面的消息
                    window.addEventListener('message', (event) => {
                        this.handleIncomingMessage(event);
                    });
                    
                    // 如果在 iframe 中，設置定期測試
                    if (this.diagnosticResults.environment.isInIframe) {
                        this.startCommunicationTest();
                    }
                }
                
                // 處理接收到的消息
                handleIncomingMessage(event) {
                    const timestamp = new Date().toISOString();
                    console.log('📥 收到消息:', event.data, 'from:', event.origin);
                    
                    this.diagnosticResults.timeline.push({
                        timestamp: timestamp,
                        type: 'RECEIVED',
                        data: event.data,
                        origin: event.origin,
                        source: event.source === window.parent ? 'PARENT' : 'OTHER'
                    });
                    
                    // 如果是診斷響應
                    if (event.data.type === 'DIAGNOSTIC_RESPONSE') {
                        this.diagnosticResults.communication.parentResponse = {
                            received: true,
                            timestamp: timestamp,
                            data: event.data
                        };
                        console.log('✅ 父頁面響應已收到');
                    }
                }
                
                // 開始通信測試
                startCommunicationTest() {
                    console.log('🧪 開始通信測試');
                    
                    const testMessage = {
                        type: 'DIAGNOSTIC_REQUEST',
                        action: 'COMMUNICATION_TEST',
                        timestamp: new Date().toISOString(),
                        testId: Math.random().toString(36).substr(2, 9)
                    };
                    
                    try {
                        window.parent.postMessage(testMessage, '*');
                        
                        this.diagnosticResults.timeline.push({
                            timestamp: testMessage.timestamp,
                            type: 'SENT',
                            data: testMessage,
                            target: 'PARENT'
                        });
                        
                        console.log('📤 測試消息已發送:', testMessage);
                        
                        // 等待響應
                        setTimeout(() => {
                            if (!this.diagnosticResults.communication.parentResponse) {
                                this.addError('NO_PARENT_RESPONSE', '父頁面沒有響應測試消息');
                            }
                        }, 3000);
                        
                    } catch (error) {
                        this.addError('SEND_MESSAGE_ERROR', '發送消息失敗: ' + error.message);
                    }
                }
                
                // 測試雙重全螢幕通信
                testDualFullscreenCommunication() {
                    console.log('🎯 測試雙重全螢幕通信');
                    
                    if (!this.diagnosticResults.environment.isInIframe) {
                        console.log('⚠️ 不在 iframe 中，跳過雙重全螢幕通信測試');
                        return {
                            skipped: true,
                            reason: 'Not in iframe environment'
                        };
                    }
                    
                    const testMessage = {
                        type: 'DUAL_FULLSCREEN_REQUEST',
                        action: 'ENTER_CSS_FULLSCREEN',
                        timestamp: new Date().toISOString(),
                        testMode: true
                    };
                    
                    try {
                        window.parent.postMessage(testMessage, '*');
                        
                        this.diagnosticResults.timeline.push({
                            timestamp: testMessage.timestamp,
                            type: 'SENT',
                            data: testMessage,
                            target: 'PARENT'
                        });
                        
                        console.log('📤 雙重全螢幕測試消息已發送');
                        
                        return {
                            sent: true,
                            message: testMessage
                        };
                        
                    } catch (error) {
                        this.addError('DUAL_FULLSCREEN_SEND_ERROR', error.message);
                        return {
                            sent: false,
                            error: error.message
                        };
                    }
                }
                
                // 添加錯誤
                addError(code, message) {
                    const error = {
                        code: code,
                        message: message,
                        timestamp: new Date().toISOString()
                    };
                    this.diagnosticResults.errors.push(error);
                    console.log('❌ 診斷錯誤:', error);
                }
                
                // 添加警告
                addWarning(code, message) {
                    const warning = {
                        code: code,
                        message: message,
                        timestamp: new Date().toISOString(),
                        type: 'WARNING'
                    };
                    this.diagnosticResults.errors.push(warning);
                    console.log('⚠️ 診斷警告:', warning);
                }
                
                // 添加診斷函數到全局
                addDiagnosticFunctions() {
                    // 獲取完整診斷報告
                    window.getPostMessageDiagnostic = () => {
                        console.log('📊 PostMessage 診斷報告:', this.diagnosticResults);
                        return this.diagnosticResults;
                    };
                    
                    // 測試通信
                    window.testPostMessageCommunication = () => {
                        console.log('🧪 手動測試 PostMessage 通信');
                        return this.testDualFullscreenCommunication();
                    };
                    
                    // 檢查父頁面監聽器
                    window.checkParentListener = () => {
                        console.log('🔍 檢查父頁面監聽器');
                        
                        const checkMessage = {
                            type: 'LISTENER_CHECK',
                            timestamp: new Date().toISOString()
                        };
                        
                        try {
                            window.parent.postMessage(checkMessage, '*');
                            console.log('📤 監聽器檢查消息已發送');
                            return { sent: true };
                        } catch (error) {
                            console.log('❌ 監聽器檢查失敗:', error);
                            return { sent: false, error: error.message };
                        }
                    };
                    
                    // 強制診斷
                    window.forceDiagnostic = () => {
                        console.log('🔧 強制執行完整診斷');
                        this.diagnoseEnvironment();
                        this.startCommunicationTest();
                        return this.diagnosticResults;
                    };
                    
                    console.log('✅ PostMessage 診斷函數已添加到全局');
                }
                
                // 生成診斷報告
                generateReport() {
                    const report = {
                        summary: {
                            environment: this.diagnosticResults.environment.isInIframe ? 'IFRAME' : 'DIRECT',
                            canCommunicate: this.diagnosticResults.communication.parentResponse?.received || false,
                            errorCount: this.diagnosticResults.errors.filter(e => e.type !== 'WARNING').length,
                            warningCount: this.diagnosticResults.errors.filter(e => e.type === 'WARNING').length
                        },
                        details: this.diagnosticResults,
                        recommendations: this.generateRecommendations()
                    };
                    
                    console.log('📋 PostMessage 診斷報告:', report);
                    return report;
                }
                
                // 生成建議
                generateRecommendations() {
                    const recommendations = [];
                    
                    if (!this.diagnosticResults.environment.isInIframe) {
                        recommendations.push({
                            type: 'INFO',
                            message: '直接訪問模式：使用 Safari 原生 API，不需要 PostMessage 通信'
                        });
                    }
                    
                    if (this.diagnosticResults.environment.isIOS && this.diagnosticResults.environment.isSafari) {
                        recommendations.push({
                            type: 'WARNING',
                            message: 'iOS Safari：確保全螢幕由直接用戶手勢觸發'
                        });
                    }
                    
                    if (this.diagnosticResults.errors.some(e => e.code === 'CANNOT_ACCESS_PARENT')) {
                        recommendations.push({
                            type: 'ERROR',
                            message: '跨域限制：檢查 iframe 和父頁面的域名設置'
                        });
                    }
                    
                    if (!this.diagnosticResults.communication.parentResponse) {
                        recommendations.push({
                            type: 'ERROR',
                            message: '父頁面無響應：檢查 GameSwitcher 的消息監聽器'
                        });
                    }
                    
                    return recommendations;
                }
            }
            
            // 初始化診斷工具
            let postMessageDiagnostic;
            
            function initPostMessageDiagnostic() {
                console.log('🚀 初始化 PostMessage 診斷工具');
                postMessageDiagnostic = new PostMessageDiagnostic();
                
                // 5秒後生成初始報告
                setTimeout(() => {
                    const report = postMessageDiagnostic.generateReport();
                    console.log('📋 初始診斷報告已生成');
                }, 5000);
            }
            
            // 頁面載入完成後初始化
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initPostMessageDiagnostic);
            } else {
                initPostMessageDiagnostic();
            }
        </script>
        <!-- PostMessage 通信診斷工具結束 -->
        `;
        
        // 在 Safari 支援前插入診斷工具
        const safariIndex = htmlContent.indexOf('<!-- 🍎 Safari 全螢幕支援 - SAFARI_FULLSCREEN_SUPPORT -->');
        if (safariIndex !== -1) {
            htmlContent = htmlContent.slice(0, safariIndex) + 
                         diagnosticTool + 
                         htmlContent.slice(safariIndex);
            
            // 寫回文件
            fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
            console.log('✅ PostMessage 診斷工具已添加到 StarShake 遊戲');
            
        } else {
            console.log('❌ 未找到 Safari 支援插入點');
        }
        
    } catch (error) {
        console.log('❌ 修改 HTML 文件失敗:', error);
    }
}

// 檢查當前雙重全螢幕同步代碼的問題
function analyzeCurrentDualSyncCode() {
    console.log('🔍 分析當前雙重全螢幕同步代碼');
    
    const htmlFilePath = path.join(__dirname, 'public/games/starshake-game/dist/index.html');
    
    try {
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        
        // 檢查雙重同步代碼
        const hasDualSync = htmlContent.includes('DUAL_FULLSCREEN_SYNC');
        const hasCoordinateSync = htmlContent.includes('座標同步解決方案');
        const hasSafariSupport = htmlContent.includes('SAFARI_FULLSCREEN_SUPPORT');
        
        console.log('📊 代碼分析結果:');
        console.log('   - 雙重全螢幕同步:', hasDualSync ? '✅' : '❌');
        console.log('   - 座標同步解決方案:', hasCoordinateSync ? '✅' : '❌');
        console.log('   - Safari 支援:', hasSafariSupport ? '✅' : '❌');
        
        // 分析可能的問題
        const issues = [];
        
        if (hasDualSync && hasCoordinateSync) {
            // 檢查代碼順序和邏輯
            const dualSyncIndex = htmlContent.indexOf('DUAL_FULLSCREEN_SYNC');
            const coordinateIndex = htmlContent.indexOf('座標同步解決方案');
            
            if (dualSyncIndex < coordinateIndex) {
                issues.push('代碼順序問題：雙重同步在座標同步之前，可能導致依賴問題');
            }
            
            // 檢查是否有錯誤處理
            if (!htmlContent.includes('catch (error)')) {
                issues.push('缺少錯誤處理：PostMessage 通信失敗時沒有回退機制');
            }
            
            // 檢查是否有超時處理
            if (!htmlContent.includes('setTimeout')) {
                issues.push('缺少超時處理：PostMessage 通信可能無限等待');
            }
        }
        
        console.log('⚠️ 發現的問題:', issues);
        
        return {
            hasDualSync,
            hasCoordinateSync,
            hasSafariSupport,
            issues
        };
        
    } catch (error) {
        console.log('❌ 分析代碼失敗:', error);
        return null;
    }
}

// 主要執行函數
function diagnosePostMessageIssues() {
    console.log('🚀 開始 PostMessage 通信問題診斷');
    
    // 分析當前代碼
    const codeAnalysis = analyzeCurrentDualSyncCode();
    
    // 創建診斷工具
    createPostMessageDiagnosticTool();
    
    console.log('🎯 PostMessage 診斷功能：');
    console.log('   ✅ 環境檢測（iframe、Safari、iOS）');
    console.log('   ✅ 通信測試（發送、接收、響應）');
    console.log('   ✅ 錯誤追蹤和時間線記錄');
    console.log('   ✅ 父頁面監聽器檢查');
    console.log('   ✅ 雙重全螢幕通信測試');
    
    console.log('🔧 可用的診斷函數：');
    console.log('   - window.getPostMessageDiagnostic() - 獲取完整診斷報告');
    console.log('   - window.testPostMessageCommunication() - 測試通信');
    console.log('   - window.checkParentListener() - 檢查父頁面監聽器');
    console.log('   - window.forceDiagnostic() - 強制執行診斷');
    
    console.log('🚀 PostMessage 通信診斷工具已準備完成！');
    console.log('現在可以在手機 Safari 上測試並獲取詳細的診斷報告！');
    
    return codeAnalysis;
}

// 執行診斷
diagnosePostMessageIssues();
