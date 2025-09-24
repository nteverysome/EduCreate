/**
 * 🔧 PostMessage 通信修復工具
 * 專門解決手機環境下的 PostMessage 通信問題
 */

console.log('🔧 開始修復 PostMessage 通信問題...');

const fs = require('fs');
const path = require('path');

// 修復 PostMessage 通信
function fixPostMessageCommunication() {
    console.log('🔧 修復 PostMessage 通信');
    
    const htmlFilePath = path.join(__dirname, 'public/games/starshake-game/dist/index.html');
    
    try {
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        
        // 檢查是否已經修復
        if (htmlContent.includes('POSTMESSAGE_COMMUNICATION_FIXED')) {
            console.log('⚠️ PostMessage 通信已修復，跳過修改');
            return;
        }
        
        console.log('🔍 分析 PostMessage 通信問題：');
        console.log('   ❌ 手機環境下 PostMessage 通信失敗');
        console.log('   ❌ 可能的跨域限制');
        console.log('   ❌ 父頁面監聽器缺失');
        console.log('   ❌ 消息格式不匹配');
        console.log('   ❌ 手機瀏覽器額外限制');
        
        // 創建強化的 PostMessage 通信修復代碼
        const postMessageCommFix = `
        <!-- 🔧 PostMessage 通信修復 - POSTMESSAGE_COMMUNICATION_FIXED -->
        <script>
            console.log('🔧 載入 PostMessage 通信修復');
            
            // 強化的 PostMessage 通信修復系統
            function initPostMessageCommFix() {
                console.log('🚀 初始化 PostMessage 通信修復系統');
                
                // 通信狀態管理
                window.postMessageCommStatus = {
                    initialized: false,
                    parentListenerActive: false,
                    communicationWorking: false,
                    lastTestTime: null,
                    retryCount: 0,
                    maxRetries: 10,
                    testResults: []
                };
                
                // 強化的父頁面監聽器設置
                window.setupParentListener = function() {
                    console.log('📡 設置強化的父頁面監聽器');
                    
                    try {
                        // 檢查是否在 iframe 中
                        const isInIframe = window !== window.parent;
                        
                        if (!isInIframe) {
                            console.log('⚠️ 不在 iframe 中，跳過父頁面監聽器設置');
                            return false;
                        }
                        
                        // 嘗試通知父頁面設置監聽器
                        const setupMessage = {
                            type: 'SETUP_PARENT_LISTENER',
                            timestamp: Date.now(),
                            userAgent: navigator.userAgent,
                            location: window.location.href
                        };
                        
                        console.log('📤 發送父頁面監聽器設置請求:', setupMessage);
                        window.parent.postMessage(setupMessage, '*');
                        
                        // 等待父頁面響應
                        return new Promise((resolve) => {
                            const timeout = setTimeout(() => {
                                console.log('⏰ 父頁面監聽器設置超時');
                                resolve(false);
                            }, 3000);
                            
                            const responseHandler = (event) => {
                                if (event.data && event.data.type === 'PARENT_LISTENER_READY') {
                                    console.log('✅ 父頁面監聽器已就緒');
                                    clearTimeout(timeout);
                                    window.removeEventListener('message', responseHandler);
                                    window.postMessageCommStatus.parentListenerActive = true;
                                    resolve(true);
                                }
                            };
                            
                            window.addEventListener('message', responseHandler);
                        });
                        
                    } catch (error) {
                        console.log('❌ 設置父頁面監聽器失敗:', error);
                        return false;
                    }
                };
                
                // 強化的通信測試
                window.testPostMessageCommEnhanced = async function() {
                    console.log('🧪 執行強化的 PostMessage 通信測試');
                    
                    const testId = 'test_' + Date.now();
                    const testResult = {
                        testId: testId,
                        timestamp: Date.now(),
                        success: false,
                        error: null,
                        responseTime: null,
                        retryCount: window.postMessageCommStatus.retryCount
                    };
                    
                    try {
                        const isInIframe = window !== window.parent;
                        
                        if (!isInIframe) {
                            testResult.error = 'NOT_IN_IFRAME';
                            console.log('⚠️ 不在 iframe 環境中');
                            return testResult;
                        }
                        
                        // 發送測試消息
                        const testMessage = {
                            type: 'COMMUNICATION_TEST',
                            testId: testId,
                            timestamp: Date.now(),
                            userAgent: navigator.userAgent,
                            isMobile: /Mobi|Android/i.test(navigator.userAgent),
                            isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
                            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
                        };
                        
                        console.log('📤 發送強化測試消息:', testMessage);
                        
                        const startTime = Date.now();
                        window.parent.postMessage(testMessage, '*');
                        
                        // 等待響應
                        const response = await new Promise((resolve, reject) => {
                            const timeout = setTimeout(() => {
                                reject(new Error('COMMUNICATION_TIMEOUT'));
                            }, 5000);
                            
                            const responseHandler = (event) => {
                                if (event.data && 
                                    event.data.type === 'COMMUNICATION_TEST_RESPONSE' && 
                                    event.data.testId === testId) {
                                    
                                    clearTimeout(timeout);
                                    window.removeEventListener('message', responseHandler);
                                    resolve(event.data);
                                }
                            };
                            
                            window.addEventListener('message', responseHandler);
                        });
                        
                        testResult.success = true;
                        testResult.responseTime = Date.now() - startTime;
                        window.postMessageCommStatus.communicationWorking = true;
                        
                        console.log('✅ 強化通信測試成功:', response);
                        console.log('⏱️ 響應時間:', testResult.responseTime + 'ms');
                        
                    } catch (error) {
                        testResult.error = error.message;
                        console.log('❌ 強化通信測試失敗:', error);
                    }
                    
                    window.postMessageCommStatus.testResults.push(testResult);
                    window.postMessageCommStatus.lastTestTime = Date.now();
                    
                    return testResult;
                };
                
                // 自動重試通信建立
                window.autoRetryCommSetup = async function() {
                    console.log('🔄 自動重試通信建立');
                    
                    while (window.postMessageCommStatus.retryCount < window.postMessageCommStatus.maxRetries) {
                        console.log(\`🔄 重試 \${window.postMessageCommStatus.retryCount + 1}/\${window.postMessageCommStatus.maxRetries}\`);
                        
                        // 1. 設置父頁面監聽器
                        const listenerSetup = await window.setupParentListener();
                        
                        if (listenerSetup) {
                            // 2. 測試通信
                            const testResult = await window.testPostMessageCommEnhanced();
                            
                            if (testResult.success) {
                                console.log('✅ 通信建立成功！');
                                return true;
                            }
                        }
                        
                        window.postMessageCommStatus.retryCount++;
                        
                        // 等待後重試
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    
                    console.log('❌ 通信建立失敗，已達最大重試次數');
                    return false;
                };
                
                // 強化的全螢幕請求（使用修復後的通信）
                window.requestFullscreenWithCommFix = async function() {
                    console.log('🍎 使用修復後的通信請求全螢幕');
                    
                    try {
                        // 確保通信正常
                        if (!window.postMessageCommStatus.communicationWorking) {
                            console.log('🔄 通信未建立，嘗試自動修復');
                            const commFixed = await window.autoRetryCommSetup();
                            
                            if (!commFixed) {
                                console.log('❌ 通信修復失敗，使用本地全螢幕');
                                // 回退到本地全螢幕
                                if (window.touchControls && window.touchControls.toggleFullscreen) {
                                    window.touchControls.toggleFullscreen();
                                }
                                return;
                            }
                        }
                        
                        // 發送全螢幕請求
                        const fullscreenMessage = {
                            type: 'DUAL_FULLSCREEN_REQUEST',
                            action: 'ENTER_CSS_FULLSCREEN',
                            timestamp: Date.now(),
                            enhanced: true,
                            userAgent: navigator.userAgent
                        };
                        
                        console.log('📤 發送強化全螢幕請求:', fullscreenMessage);
                        window.parent.postMessage(fullscreenMessage, '*');
                        
                        // 同時觸發本地全螢幕
                        if (window.touchControls && window.touchControls.toggleFullscreen) {
                            // 使用 Safari 增強版本
                            window.touchControls.toggleFullscreen();
                        }
                        
                        console.log('✅ 強化全螢幕請求已發送');
                        
                    } catch (error) {
                        console.log('❌ 強化全螢幕請求失敗:', error);
                        
                        // 回退到本地全螢幕
                        if (window.touchControls && window.touchControls.toggleFullscreen) {
                            window.touchControls.toggleFullscreen();
                        }
                    }
                };
                
                // 通信狀態監控
                window.monitorCommStatus = function() {
                    console.log('📊 PostMessage 通信狀態監控');
                    
                    const status = {
                        ...window.postMessageCommStatus,
                        currentTime: Date.now(),
                        environment: {
                            isInIframe: window !== window.parent,
                            userAgent: navigator.userAgent,
                            isMobile: /Mobi|Android/i.test(navigator.userAgent),
                            isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
                            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
                        }
                    };
                    
                    console.log('📊 通信狀態:', status);
                    return status;
                };
                
                // 初始化完成
                window.postMessageCommStatus.initialized = true;
                console.log('✅ PostMessage 通信修復系統初始化完成');
                
                // 自動嘗試建立通信
                setTimeout(() => {
                    console.log('🚀 自動嘗試建立 PostMessage 通信');
                    window.autoRetryCommSetup();
                }, 1000);
            }
            
            // 頁面載入完成後初始化
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initPostMessageCommFix);
            } else {
                setTimeout(initPostMessageCommFix, 500);
            }
        </script>
        <!-- PostMessage 通信修復結束 -->
        `;
        
        // 在 Safari 整合順序修復後插入通信修復代碼
        const safariFixEndIndex = htmlContent.indexOf('<!-- Safari 整合順序修復結束 -->');
        if (safariFixEndIndex !== -1) {
            const insertIndex = safariFixEndIndex + '<!-- Safari 整合順序修復結束 -->'.length;
            htmlContent = htmlContent.slice(0, insertIndex) + 
                         postMessageCommFix + 
                         htmlContent.slice(insertIndex);
            
            // 寫回文件
            fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
            console.log('✅ PostMessage 通信修復已添加到 StarShake 遊戲');
            
        } else {
            console.log('❌ 未找到 Safari 整合順序修復結束標記');
        }
        
    } catch (error) {
        console.log('❌ 修復 PostMessage 通信失敗:', error);
    }
}

// 創建父頁面監聽器代碼
function createParentPageListener() {
    console.log('🔧 創建父頁面監聽器代碼');
    
    const parentListenerCode = `
<!-- 父頁面 PostMessage 監聽器 -->
<script>
console.log('📡 載入父頁面 PostMessage 監聽器');

// 父頁面監聽器
window.addEventListener('message', function(event) {
    console.log('📨 父頁面收到消息:', event.data);
    
    try {
        if (!event.data || typeof event.data !== 'object') {
            return;
        }
        
        const message = event.data;
        
        // 處理監聽器設置請求
        if (message.type === 'SETUP_PARENT_LISTENER') {
            console.log('🔧 處理監聽器設置請求');
            
            // 響應監聽器已就緒
            event.source.postMessage({
                type: 'PARENT_LISTENER_READY',
                timestamp: Date.now(),
                parentUserAgent: navigator.userAgent
            }, event.origin);
            
            console.log('✅ 父頁面監聽器已就緒響應已發送');
        }
        
        // 處理通信測試
        else if (message.type === 'COMMUNICATION_TEST') {
            console.log('🧪 處理通信測試:', message.testId);
            
            // 響應測試
            event.source.postMessage({
                type: 'COMMUNICATION_TEST_RESPONSE',
                testId: message.testId,
                timestamp: Date.now(),
                parentUserAgent: navigator.userAgent,
                receivedAt: Date.now(),
                originalMessage: message
            }, event.origin);
            
            console.log('✅ 通信測試響應已發送');
        }
        
        // 處理全螢幕請求
        else if (message.type === 'DUAL_FULLSCREEN_REQUEST') {
            console.log('🍎 處理全螢幕請求:', message.action);
            
            if (message.action === 'ENTER_CSS_FULLSCREEN') {
                // 添加 CSS 強制全螢幕
                document.body.style.position = 'fixed';
                document.body.style.top = '0';
                document.body.style.left = '0';
                document.body.style.width = '100vw';
                document.body.style.height = '100vh';
                document.body.style.zIndex = '9999';
                document.body.style.backgroundColor = '#000';
                
                console.log('✅ CSS 強制全螢幕已啟用');
                
            } else if (message.action === 'EXIT_CSS_FULLSCREEN') {
                // 移除 CSS 強制全螢幕
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.width = '';
                document.body.style.height = '';
                document.body.style.zIndex = '';
                document.body.style.backgroundColor = '';
                
                console.log('✅ CSS 強制全螢幕已退出');
            }
        }
        
    } catch (error) {
        console.log('❌ 父頁面消息處理失敗:', error);
    }
});

console.log('✅ 父頁面 PostMessage 監聽器已載入');
</script>
`;
    
    // 保存父頁面監聽器代碼到文件
    const parentListenerPath = path.join(__dirname, 'parent-page-listener.html');
    fs.writeFileSync(parentListenerPath, parentListenerCode, 'utf8');
    console.log('✅ 父頁面監聽器代碼已保存到 parent-page-listener.html');
}

// 主要執行函數
function fixPostMessageIssues() {
    console.log('🚀 修復 PostMessage 通信問題');
    
    console.log('🔍 問題分析：');
    console.log('   ❌ 手機環境下 PostMessage 通信失敗');
    console.log('   ❌ 父頁面監聽器可能缺失或不正確');
    console.log('   ❌ 跨域限制可能阻止通信');
    console.log('   ❌ 消息格式可能不匹配');
    console.log('   ❌ 手機瀏覽器可能有額外限制');
    
    console.log('🔧 修復方案：');
    console.log('   ✅ 強化的 PostMessage 通信系統');
    console.log('   ✅ 自動父頁面監聽器設置');
    console.log('   ✅ 多重重試機制');
    console.log('   ✅ 通信狀態實時監控');
    console.log('   ✅ 備用全螢幕方案');
    
    // 修復 PostMessage 通信
    fixPostMessageCommunication();
    
    // 創建父頁面監聽器
    createParentPageListener();
    
    console.log('🎯 PostMessage 通信修復功能：');
    console.log('   ✅ 強化的通信建立系統');
    console.log('   ✅ 自動重試機制（最多10次）');
    console.log('   ✅ 父頁面監聽器自動設置');
    console.log('   ✅ 實時通信狀態監控');
    console.log('   ✅ 手機環境特殊處理');
    console.log('   ✅ 備用全螢幕方案');
    
    console.log('🔧 新增測試函數：');
    console.log('   - window.testPostMessageCommEnhanced() - 強化通信測試');
    console.log('   - window.autoRetryCommSetup() - 自動重試通信建立');
    console.log('   - window.monitorCommStatus() - 通信狀態監控');
    console.log('   - window.requestFullscreenWithCommFix() - 修復後的全螢幕請求');
    
    console.log('🚀 PostMessage 通信修復完成！');
    console.log('現在手機上的 PostMessage 通信應該能正常工作了！');
}

// 執行修復
fixPostMessageIssues();
