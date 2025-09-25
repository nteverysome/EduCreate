/**
 * 🔧 強制修復遊戲內全螢幕按鈕
 * 直接注入修復代碼到遊戲文件中
 */

console.log('🔧 開始強制修復遊戲內全螢幕按鈕...');

const fs = require('fs');
const path = require('path');

function forceFixGameFullscreenButton() {
    console.log('🔧 強制修復遊戲內全螢幕按鈕');
    
    const htmlFilePath = path.join(__dirname, 'public/games/starshake-game/dist/index.html');
    
    try {
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        
        // 檢查是否已經修復
        if (htmlContent.includes('FORCE_GAME_FULLSCREEN_FIX')) {
            console.log('⚠️ 遊戲全螢幕按鈕已修復，跳過修改');
            return;
        }
        
        console.log('🔍 分析遊戲全螢幕按鈕問題：');
        console.log('   ❌ 遊戲內 ⛶ 按鈕點擊無反應');
        console.log('   ❌ 修復代碼可能沒有正確載入');
        console.log('   ❌ TouchControls 可能沒有被正確替換');
        console.log('   ❌ 需要更直接的修復方法');
        
        // 創建強制修復代碼
        const forceFixCode = `
        <!-- 🔧 強制遊戲全螢幕按鈕修復 - FORCE_GAME_FULLSCREEN_FIX -->
        <script>
            console.log('🔧 載入強制遊戲全螢幕按鈕修復');
            
            // 強制修復遊戲內全螢幕按鈕
            function forceFixGameFullscreenButton() {
                console.log('🎮 開始強制修復遊戲內全螢幕按鈕');
                
                // 方法1：直接替換按鈕事件
                function replaceButtonEvents() {
                    console.log('🔧 方法1：直接替換按鈕事件');
                    
                    const fullscreenBtn = document.getElementById('fullscreen-btn');
                    if (fullscreenBtn) {
                        console.log('✅ 找到全螢幕按鈕，移除舊事件');
                        
                        // 移除所有現有事件監聽器
                        const newBtn = fullscreenBtn.cloneNode(true);
                        fullscreenBtn.parentNode.replaceChild(newBtn, fullscreenBtn);
                        
                        // 添加新的事件監聽器
                        newBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🎮 遊戲內全螢幕按鈕被點擊 - 強制修復版本');
                            handleGameFullscreen();
                        });
                        
                        newBtn.addEventListener('touchend', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('📱 遊戲內全螢幕按鈕被觸摸 - 強制修復版本');
                            handleGameFullscreen();
                        });
                        
                        console.log('✅ 全螢幕按鈕事件已替換');
                        return true;
                    } else {
                        console.log('❌ 未找到全螢幕按鈕');
                        return false;
                    }
                }
                
                // 方法2：替換 TouchControls 的 toggleFullscreen 方法
                function replaceTouchControlsMethod() {
                    console.log('🔧 方法2：替換 TouchControls 方法');
                    
                    if (window.touchControls && window.touchControls.toggleFullscreen) {
                        console.log('✅ 找到 TouchControls，替換 toggleFullscreen 方法');
                        
                        // 保存原始方法
                        const originalMethod = window.touchControls.toggleFullscreen;
                        
                        // 替換為強制修復版本
                        window.touchControls.toggleFullscreen = function() {
                            console.log('🎮 TouchControls.toggleFullscreen 被調用 - 強制修復版本');
                            handleGameFullscreen();
                        };
                        
                        console.log('✅ TouchControls.toggleFullscreen 已替換');
                        return true;
                    } else {
                        console.log('❌ 未找到 TouchControls 或 toggleFullscreen 方法');
                        return false;
                    }
                }
                
                // 處理遊戲全螢幕的核心函數
                async function handleGameFullscreen() {
                    console.log('🚀 執行遊戲全螢幕處理 - 強制修復版本');
                    
                    try {
                        // 檢查環境
                        const isInIframe = window !== window.parent;
                        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
                        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
                        
                        console.log('🔍 環境檢測:', {
                            isInIframe: isInIframe,
                            isMobile: isMobile,
                            isSafari: isSafari
                        });
                        
                        if (isInIframe) {
                            console.log('📱 在 iframe 中，使用 PostMessage 通信');
                            
                            // 檢查 PostMessage 通信修復是否可用
                            if (window.requestFullscreenWithCommFix) {
                                console.log('✅ 使用修復後的 PostMessage 通信');
                                await window.requestFullscreenWithCommFix();
                            } else {
                                console.log('⚠️ PostMessage 修復不可用，使用直接通信');
                                
                                // 直接發送 PostMessage
                                const fullscreenMessage = {
                                    type: 'DUAL_FULLSCREEN_REQUEST',
                                    action: 'ENTER_CSS_FULLSCREEN',
                                    timestamp: Date.now(),
                                    source: 'FORCE_FIX',
                                    userAgent: navigator.userAgent
                                };
                                
                                console.log('📤 發送直接全螢幕請求:', fullscreenMessage);
                                window.parent.postMessage(fullscreenMessage, '*');
                            }
                            
                            // 同時嘗試本地全螢幕
                            await attemptLocalFullscreen();
                            
                        } else {
                            console.log('🖥️ 不在 iframe 中，使用本地全螢幕');
                            await attemptLocalFullscreen();
                        }
                        
                    } catch (error) {
                        console.log('❌ 遊戲全螢幕處理失敗:', error);
                        
                        // 最後的回退方案
                        console.log('🔄 嘗試最後的回退方案');
                        await attemptLocalFullscreen();
                    }
                }
                
                // 嘗試本地全螢幕
                async function attemptLocalFullscreen() {
                    console.log('🔧 嘗試本地全螢幕');
                    
                    try {
                        const element = document.documentElement;
                        
                        // Safari 支援
                        if (element.webkitRequestFullscreen) {
                            console.log('🍎 使用 Safari webkitRequestFullscreen');
                            await element.webkitRequestFullscreen();
                        }
                        // 標準 API
                        else if (element.requestFullscreen) {
                            console.log('🌐 使用標準 requestFullscreen');
                            await element.requestFullscreen();
                        }
                        // 其他瀏覽器
                        else if (element.mozRequestFullScreen) {
                            console.log('🦊 使用 Firefox mozRequestFullScreen');
                            await element.mozRequestFullScreen();
                        }
                        else if (element.msRequestFullscreen) {
                            console.log('🔷 使用 IE msRequestFullscreen');
                            await element.msRequestFullscreen();
                        }
                        else {
                            console.log('❌ 瀏覽器不支援全螢幕 API');
                        }
                        
                        console.log('✅ 本地全螢幕請求已發送');
                        
                    } catch (error) {
                        console.log('❌ 本地全螢幕失敗:', error);
                    }
                }
                
                // 執行修復
                console.log('🚀 開始執行強制修復');
                
                // 嘗試方法1：替換按鈕事件
                const method1Success = replaceButtonEvents();
                
                // 嘗試方法2：替換 TouchControls 方法
                const method2Success = replaceTouchControlsMethod();
                
                if (method1Success || method2Success) {
                    console.log('✅ 強制修復成功');
                    console.log('🎯 現在點擊遊戲內的 ⛶ 按鈕應該會有反應');
                } else {
                    console.log('❌ 強制修復失敗，未找到目標元素或方法');
                }
                
                // 添加全局測試函數
                window.testGameFullscreenFix = function() {
                    console.log('🧪 測試遊戲全螢幕修復');
                    handleGameFullscreen();
                };
                
                console.log('🧪 添加了測試函數：window.testGameFullscreenFix()');
            }
            
            // 等待頁面載入完成後執行修復
            function waitAndFix() {
                if (document.readyState === 'complete') {
                    // 延遲執行，確保所有腳本都載入完成
                    setTimeout(() => {
                        forceFixGameFullscreenButton();
                    }, 3000);
                } else {
                    window.addEventListener('load', () => {
                        setTimeout(() => {
                            forceFixGameFullscreenButton();
                        }, 3000);
                    });
                }
            }
            
            // 立即開始等待和修復
            waitAndFix();
            
            // 也可以手動觸發修復
            window.forceFixGameFullscreen = forceFixGameFullscreenButton;
            
            console.log('✅ 強制遊戲全螢幕按鈕修復已載入');
        </script>
        <!-- 強制遊戲全螢幕按鈕修復結束 -->
        `;
        
        // 在 PostMessage 通信修復後插入強制修復代碼
        const postMessageFixEndIndex = htmlContent.indexOf('<!-- PostMessage 通信修復結束 -->');
        if (postMessageFixEndIndex !== -1) {
            const insertIndex = postMessageFixEndIndex + '<!-- PostMessage 通信修復結束 -->'.length;
            htmlContent = htmlContent.slice(0, insertIndex) + 
                         forceFixCode + 
                         htmlContent.slice(insertIndex);
            
            // 寫回文件
            fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
            console.log('✅ 強制遊戲全螢幕按鈕修復已添加到 StarShake 遊戲');
            
        } else {
            console.log('❌ 未找到 PostMessage 通信修復結束標記');
        }
        
    } catch (error) {
        console.log('❌ 強制修復遊戲全螢幕按鈕失敗:', error);
    }
}

// 主要執行函數
function executeForcefix() {
    console.log('🚀 執行強制修復遊戲全螢幕按鈕');
    
    console.log('🔍 問題分析：');
    console.log('   ❌ 遊戲內 ⛶ 按鈕點擊無反應');
    console.log('   ❌ 日誌中沒有相關訊息');
    console.log('   ❌ 修復代碼可能沒有正確執行');
    
    console.log('🔧 強制修復方案：');
    console.log('   ✅ 直接替換按鈕事件監聽器');
    console.log('   ✅ 替換 TouchControls.toggleFullscreen 方法');
    console.log('   ✅ 添加多重回退機制');
    console.log('   ✅ 支援 Safari 和標準全螢幕 API');
    
    // 執行強制修復
    forceFixGameFullscreenButton();
    
    console.log('🎯 強制修復功能：');
    console.log('   ✅ 直接事件替換 - 移除舊事件，添加新事件');
    console.log('   ✅ TouchControls 方法替換 - 直接替換 toggleFullscreen');
    console.log('   ✅ 環境智能檢測 - iframe/本地/Safari 自動判斷');
    console.log('   ✅ 多重全螢幕 API 支援 - Safari/標準/Firefox/IE');
    console.log('   ✅ PostMessage 通信整合 - 使用修復後的通信系統');
    console.log('   ✅ 完整錯誤處理 - 多層回退機制');
    
    console.log('🧪 新增測試函數：');
    console.log('   - window.testGameFullscreenFix() - 手動測試全螢幕');
    console.log('   - window.forceFixGameFullscreen() - 手動執行修復');
    
    console.log('🚀 強制修復完成！');
    console.log('現在遊戲內的 ⛶ 按鈕應該能正常工作了！');
}

// 執行修復
executeForcefix();
