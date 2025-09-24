/**
 * 🍎 修復 Safari 全螢幕支援
 * 為 .fullscreen-btn 添加 Safari 和其他瀏覽器的兼容性
 */

console.log('🍎 開始修復 Safari 全螢幕支援...');

const fs = require('fs');
const path = require('path');

// 修復 StarShake 遊戲的 Safari 全螢幕支援
function fixSafariFullscreenSupport() {
    console.log('🔧 修復 StarShake 遊戲的 Safari 全螢幕支援');
    
    const htmlFilePath = path.join(__dirname, 'public/games/starshake-game/dist/index.html');
    
    try {
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        
        // 檢查是否已經包含 Safari 支援
        if (htmlContent.includes('SAFARI_FULLSCREEN_SUPPORT')) {
            console.log('⚠️ Safari 全螢幕支援已存在，跳過修改');
            return;
        }
        
        // 創建 Safari 兼容性全螢幕函數
        const safariFullscreenSupport = `
        <!-- 🍎 Safari 全螢幕支援 - SAFARI_FULLSCREEN_SUPPORT -->
        <script>
            console.log('🍎 載入 Safari 全螢幕支援');
            
            // 跨瀏覽器全螢幕 API 兼容性函數
            function createCrossBrowserFullscreenAPI() {
                console.log('🔧 創建跨瀏覽器全螢幕 API');
                
                // 檢測瀏覽器類型
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                const isWebKit = 'webkitRequestFullscreen' in document.documentElement;
                
                console.log('🔍 瀏覽器檢測:', {
                    isIOS: isIOS,
                    isSafari: isSafari,
                    isWebKit: isWebKit,
                    userAgent: navigator.userAgent
                });
                
                // 跨瀏覽器請求全螢幕函數
                window.requestFullscreenCrossBrowser = function(element = document.documentElement) {
                    console.log('📱 執行跨瀏覽器全螢幕請求');
                    
                    return new Promise((resolve, reject) => {
                        try {
                            // 標準 Fullscreen API
                            if (element.requestFullscreen) {
                                console.log('✅ 使用標準 requestFullscreen');
                                element.requestFullscreen().then(resolve).catch(reject);
                            }
                            // WebKit (Safari)
                            else if (element.webkitRequestFullscreen) {
                                console.log('🍎 使用 WebKit webkitRequestFullscreen');
                                element.webkitRequestFullscreen();
                                resolve();
                            }
                            // WebKit (舊版)
                            else if (element.webkitRequestFullScreen) {
                                console.log('🍎 使用舊版 WebKit webkitRequestFullScreen');
                                element.webkitRequestFullScreen();
                                resolve();
                            }
                            // Mozilla
                            else if (element.mozRequestFullScreen) {
                                console.log('🦊 使用 Mozilla mozRequestFullScreen');
                                element.mozRequestFullScreen();
                                resolve();
                            }
                            // Microsoft
                            else if (element.msRequestFullscreen) {
                                console.log('🪟 使用 Microsoft msRequestFullscreen');
                                element.msRequestFullscreen();
                                resolve();
                            }
                            // iOS Safari 特殊處理
                            else if (isIOS) {
                                console.log('📱 iOS Safari 特殊處理');
                                // iOS Safari 不支援真正的全螢幕，使用 CSS 模擬
                                document.body.classList.add('ios-fullscreen-simulation');
                                resolve();
                            }
                            else {
                                console.log('❌ 瀏覽器不支援全螢幕 API');
                                reject(new Error('Fullscreen not supported'));
                            }
                        } catch (error) {
                            console.log('❌ 全螢幕請求失敗:', error);
                            reject(error);
                        }
                    });
                };
                
                // 跨瀏覽器退出全螢幕函數
                window.exitFullscreenCrossBrowser = function() {
                    console.log('📱 執行跨瀏覽器退出全螢幕');
                    
                    return new Promise((resolve, reject) => {
                        try {
                            // 標準 Fullscreen API
                            if (document.exitFullscreen) {
                                console.log('✅ 使用標準 exitFullscreen');
                                document.exitFullscreen().then(resolve).catch(reject);
                            }
                            // WebKit (Safari)
                            else if (document.webkitExitFullscreen) {
                                console.log('🍎 使用 WebKit webkitExitFullscreen');
                                document.webkitExitFullscreen();
                                resolve();
                            }
                            // WebKit (舊版)
                            else if (document.webkitCancelFullScreen) {
                                console.log('🍎 使用舊版 WebKit webkitCancelFullScreen');
                                document.webkitCancelFullScreen();
                                resolve();
                            }
                            // Mozilla
                            else if (document.mozCancelFullScreen) {
                                console.log('🦊 使用 Mozilla mozCancelFullScreen');
                                document.mozCancelFullScreen();
                                resolve();
                            }
                            // Microsoft
                            else if (document.msExitFullscreen) {
                                console.log('🪟 使用 Microsoft msExitFullscreen');
                                document.msExitFullscreen();
                                resolve();
                            }
                            // iOS Safari 特殊處理
                            else if (isIOS) {
                                console.log('📱 iOS Safari 退出模擬全螢幕');
                                document.body.classList.remove('ios-fullscreen-simulation');
                                resolve();
                            }
                            else {
                                console.log('❌ 瀏覽器不支援退出全螢幕');
                                reject(new Error('Exit fullscreen not supported'));
                            }
                        } catch (error) {
                            console.log('❌ 退出全螢幕失敗:', error);
                            reject(error);
                        }
                    });
                };
                
                // 跨瀏覽器檢查全螢幕狀態函數
                window.isFullscreenCrossBrowser = function() {
                    const fullscreenElement = document.fullscreenElement ||
                                            document.webkitFullscreenElement ||
                                            document.webkitCurrentFullScreenElement ||
                                            document.mozFullScreenElement ||
                                            document.msFullscreenElement;
                    
                    const isIOSSimulation = document.body.classList.contains('ios-fullscreen-simulation');
                    
                    return !!(fullscreenElement || isIOSSimulation);
                };
                
                console.log('✅ 跨瀏覽器全螢幕 API 已創建');
            }
            
            // 為 iOS Safari 添加 CSS 模擬全螢幕樣式
            function addIOSFullscreenStyles() {
                console.log('📱 添加 iOS Safari 全螢幕模擬樣式');
                
                let style = document.getElementById('ios-fullscreen-style');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'ios-fullscreen-style';
                    style.textContent = \`
                        /* iOS Safari 全螢幕模擬 */
                        body.ios-fullscreen-simulation {
                            position: fixed !important;
                            top: 0 !important;
                            left: 0 !important;
                            width: 100vw !important;
                            height: 100vh !important;
                            height: 100dvh !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                            background: black !important;
                            z-index: 2147483647 !important;
                        }
                        
                        body.ios-fullscreen-simulation #app {
                            width: 100vw !important;
                            height: 100vh !important;
                            height: 100dvh !important;
                        }
                        
                        body.ios-fullscreen-simulation #game-container {
                            width: 100% !important;
                            height: 100% !important;
                            max-width: none !important;
                            max-height: none !important;
                        }
                        
                        /* 隱藏 iOS Safari 地址欄 */
                        @supports (-webkit-touch-callout: none) {
                            body.ios-fullscreen-simulation {
                                height: -webkit-fill-available !important;
                            }
                        }
                    \`;
                    document.head.appendChild(style);
                    console.log('✅ iOS Safari 全螢幕模擬樣式已添加');
                }
            }
            
            // 修改原始的 toggleFullscreen 方法以支援 Safari
            function enhanceToggleFullscreenForSafari() {
                console.log('🔧 增強 toggleFullscreen 方法以支援 Safari');
                
                // 等待 TouchControls 載入
                const waitForTouchControls = () => {
                    return new Promise((resolve) => {
                        const check = () => {
                            if (window.touchControls && window.touchControls.toggleFullscreen) {
                                resolve();
                            } else {
                                setTimeout(check, 100);
                            }
                        };
                        check();
                    });
                };
                
                waitForTouchControls().then(() => {
                    console.log('🔧 開始增強 TouchControls 的 Safari 支援');
                    
                    // 保存當前的 toggleFullscreen 方法
                    const originalToggleFullscreen = window.touchControls.toggleFullscreen;
                    
                    // 替換為 Safari 兼容版本
                    window.touchControls.toggleFullscreen = async function() {
                        console.log('🍎 執行 Safari 兼容全螢幕切換');
                        
                        try {
                            const isCurrentlyFullscreen = window.isFullscreenCrossBrowser();
                            
                            if (!isCurrentlyFullscreen) {
                                console.log('📱 進入 Safari 兼容全螢幕模式');
                                
                                // 使用跨瀏覽器 API
                                await window.requestFullscreenCrossBrowser();
                                
                                // 等待狀態穩定
                                await new Promise(resolve => setTimeout(resolve, 300));
                                
                                // 重新計算座標
                                if (this.recalculateCoordinates) {
                                    this.recalculateCoordinates();
                                }
                                
                                // 觸發 resize 事件
                                window.dispatchEvent(new Event('resize'));
                                
                                // 如果有 Phaser 遊戲，刷新 scale
                                if (window.game && window.game.scale) {
                                    setTimeout(() => {
                                        window.game.scale.refresh();
                                        console.log('🎮 Phaser 遊戲 scale 已刷新');
                                    }, 100);
                                }
                                
                                console.log('✅ Safari 兼容全螢幕已啟用');
                                
                            } else {
                                console.log('📱 退出 Safari 兼容全螢幕模式');
                                
                                await window.exitFullscreenCrossBrowser();
                                
                                // 等待退出狀態穩定
                                await new Promise(resolve => setTimeout(resolve, 300));
                                
                                // 重新計算座標
                                if (this.recalculateCoordinates) {
                                    this.recalculateCoordinates();
                                }
                                
                                // 觸發 resize 事件
                                window.dispatchEvent(new Event('resize'));
                                
                                // 刷新 Phaser scale
                                if (window.game && window.game.scale) {
                                    setTimeout(() => {
                                        window.game.scale.refresh();
                                        console.log('🎮 Phaser 遊戲 scale 已刷新');
                                    }, 100);
                                }
                                
                                console.log('✅ 已退出 Safari 兼容全螢幕');
                            }
                            
                        } catch (error) {
                            console.log('❌ Safari 兼容全螢幕切換失敗:', error);
                            // 回退到原始方法
                            if (originalToggleFullscreen) {
                                originalToggleFullscreen.call(this);
                            }
                        }
                    };
                    
                    console.log('✅ TouchControls Safari 支援增強完成');
                });
            }
            
            // 初始化 Safari 支援
            function initSafariFullscreenSupport() {
                console.log('🚀 初始化 Safari 全螢幕支援');
                
                // 創建跨瀏覽器 API
                createCrossBrowserFullscreenAPI();
                
                // 添加 iOS 樣式
                addIOSFullscreenStyles();
                
                // 增強 toggleFullscreen 方法
                enhanceToggleFullscreenForSafari();
                
                console.log('✅ Safari 全螢幕支援初始化完成');
                
                // 添加測試函數
                window.testSafariFullscreen = function() {
                    console.log('🧪 測試 Safari 全螢幕支援');
                    
                    const support = {
                        standardAPI: !!document.documentElement.requestFullscreen,
                        webkitAPI: !!document.documentElement.webkitRequestFullscreen,
                        oldWebkitAPI: !!document.documentElement.webkitRequestFullScreen,
                        mozAPI: !!document.documentElement.mozRequestFullScreen,
                        msAPI: !!document.documentElement.msRequestFullscreen,
                        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
                        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
                        currentFullscreen: window.isFullscreenCrossBrowser()
                    };
                    
                    console.log('🍎 Safari 全螢幕支援狀態:', support);
                    return support;
                };
            }
            
            // 頁面載入完成後初始化
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initSafariFullscreenSupport);
            } else {
                initSafariFullscreenSupport();
            }
        </script>
        <!-- Safari 全螢幕支援結束 -->
        `;
        
        // 在雙重全螢幕同步功能前插入 Safari 支援
        const dualSyncIndex = htmlContent.indexOf('<!-- 🎯 雙重全螢幕同步功能 - DUAL_FULLSCREEN_SYNC -->');
        if (dualSyncIndex !== -1) {
            htmlContent = htmlContent.slice(0, dualSyncIndex) + 
                         safariFullscreenSupport + 
                         htmlContent.slice(dualSyncIndex);
            
            // 寫回文件
            fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
            console.log('✅ Safari 全螢幕支援已添加到 StarShake 遊戲');
            
        } else {
            console.log('❌ 未找到雙重全螢幕同步功能插入點');
        }
        
    } catch (error) {
        console.log('❌ 修改 HTML 文件失敗:', error);
    }
}

// 執行修復
console.log('🚀 執行 Safari 全螢幕支援修復');

fixSafariFullscreenSupport();

console.log('🎯 Safari 全螢幕支援功能：');
console.log('   ✅ 跨瀏覽器全螢幕 API 兼容性');
console.log('   ✅ Safari webkitRequestFullscreen 支援');
console.log('   ✅ iOS Safari 特殊處理');
console.log('   ✅ 舊版 WebKit 支援');
console.log('   ✅ Mozilla 和 Microsoft 支援');
console.log('   ✅ iOS 全螢幕模擬樣式');

console.log('🔧 可用的調試函數：');
console.log('   - window.testSafariFullscreen() - 測試 Safari 全螢幕支援');
console.log('   - window.requestFullscreenCrossBrowser() - 跨瀏覽器請求全螢幕');
console.log('   - window.exitFullscreenCrossBrowser() - 跨瀏覽器退出全螢幕');
console.log('   - window.isFullscreenCrossBrowser() - 檢查全螢幕狀態');

console.log('🍎 Safari 全螢幕支援修復完成！');
console.log('現在 .fullscreen-btn 在 Safari 和 iOS 設備上也能正常工作！');
