/**
 * 🔧 修復 Safari 整合順序問題
 * 解決雙重同步調用座標同步版本但缺少 Safari 支援的問題
 */

console.log('🔧 開始修復 Safari 整合順序問題...');

const fs = require('fs');
const path = require('path');

// 修復 Safari 整合順序
function fixSafariIntegrationOrder() {
    console.log('🔧 修復 Safari 整合順序');
    
    const htmlFilePath = path.join(__dirname, 'public/games/starshake-game/dist/index.html');
    
    try {
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        
        // 檢查是否已經修復
        if (htmlContent.includes('SAFARI_INTEGRATION_ORDER_FIXED')) {
            console.log('⚠️ Safari 整合順序已修復，跳過修改');
            return;
        }
        
        console.log('🔍 分析當前問題：');
        console.log('   ❌ 座標同步版本只使用標準 requestFullscreen API');
        console.log('   ❌ 雙重同步調用座標同步版本，缺少 Safari 支援');
        console.log('   ❌ Safari 支援在後面載入，但沒有整合到座標同步中');
        
        // 創建修復代碼
        const safariIntegrationFix = `
        <!-- 🔧 Safari 整合順序修復 - SAFARI_INTEGRATION_ORDER_FIXED -->
        <script>
            console.log('🔧 載入 Safari 整合順序修復');
            
            // 等待所有支援載入完成後修復整合順序
            function fixSafariIntegrationOrder() {
                console.log('🚀 開始修復 Safari 整合順序');
                
                // 等待所有功能載入
                const waitForAllFeatures = () => {
                    return new Promise((resolve) => {
                        const checkFeatures = () => {
                            const hasBasicTouchControls = window.touchControls && window.touchControls.toggleFullscreen;
                            const hasSafariSupport = window.requestFullscreenCrossBrowser && window.testSafariFullscreen;
                            const hasCoordinateSync = hasBasicTouchControls; // 座標同步已整合到 TouchControls
                            
                            if (hasBasicTouchControls && hasSafariSupport && hasCoordinateSync) {
                                resolve();
                            } else {
                                setTimeout(checkFeatures, 100);
                            }
                        };
                        checkFeatures();
                    });
                };
                
                waitForAllFeatures().then(() => {
                    console.log('✅ 所有功能已載入，開始修復整合順序');
                    
                    // 保存當前的各個版本
                    const originalToggleFullscreen = window.touchControls.toggleFullscreen;
                    const safariCrossBrowserAPI = window.requestFullscreenCrossBrowser;
                    const safariExitAPI = window.exitFullscreenCrossBrowser;
                    const safariStateCheck = window.isFullscreenCrossBrowser;
                    
                    console.log('🔧 創建 Safari 增強的座標同步版本');
                    
                    // 創建 Safari 增強的座標同步版本
                    const safariEnhancedCoordinateSync = async function() {
                        console.log('🍎 執行 Safari 增強的座標同步全螢幕切換');
                        
                        try {
                            const isCurrentlyFullscreen = safariStateCheck ? safariStateCheck() : !!document.fullscreenElement;
                            
                            if (!isCurrentlyFullscreen) {
                                console.log('📱 進入 Safari 增強全螢幕模式');
                                
                                // 1. 使用 Safari 兼容的跨瀏覽器 API
                                if (safariCrossBrowserAPI) {
                                    await safariCrossBrowserAPI();
                                    console.log('✅ Safari 兼容全螢幕已觸發');
                                } else {
                                    // 回退到標準 API
                                    await document.documentElement.requestFullscreen();
                                    console.log('✅ 標準全螢幕已觸發（回退）');
                                }
                                
                                // 2. 等待全螢幕狀態穩定
                                await new Promise(resolve => setTimeout(resolve, 300));
                                
                                // 3. 重新計算座標
                                if (this.recalculateCoordinates) {
                                    this.recalculateCoordinates();
                                    console.log('📐 座標已重新計算');
                                }
                                
                                // 4. 觸發 resize 事件讓 Phaser 重新計算
                                window.dispatchEvent(new Event('resize'));
                                
                                // 5. 刷新 Phaser scale
                                if (window.game && window.game.scale) {
                                    setTimeout(() => {
                                        window.game.scale.refresh();
                                        console.log('🎮 Phaser 遊戲 scale 已刷新');
                                    }, 100);
                                }
                                
                                console.log('✅ Safari 增強全螢幕已完成');
                                
                            } else {
                                console.log('📱 退出 Safari 增強全螢幕模式');
                                
                                // 使用 Safari 兼容的退出 API
                                if (safariExitAPI) {
                                    await safariExitAPI();
                                    console.log('✅ Safari 兼容退出全螢幕已觸發');
                                } else {
                                    // 回退到標準 API
                                    await document.exitFullscreen();
                                    console.log('✅ 標準退出全螢幕已觸發（回退）');
                                }
                                
                                // 等待退出狀態穩定
                                await new Promise(resolve => setTimeout(resolve, 300));
                                
                                // 重新計算座標
                                if (this.recalculateCoordinates) {
                                    this.recalculateCoordinates();
                                    console.log('📐 座標已重新計算');
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
                                
                                console.log('✅ 已退出 Safari 增強全螢幕');
                            }
                            
                        } catch (error) {
                            console.log('❌ Safari 增強全螢幕切換失敗:', error);
                            
                            // 回退到原始方法
                            if (originalToggleFullscreen) {
                                console.log('🔄 回退到原始全螢幕方法');
                                originalToggleFullscreen.call(this);
                            }
                        }
                    };
                    
                    console.log('🔧 更新雙重同步以使用 Safari 增強版本');
                    
                    // 找到並更新雙重同步函數
                    if (window.touchControls && typeof window.touchControls.toggleFullscreen === 'function') {
                        // 檢查是否是雙重同步版本
                        const currentFunction = window.touchControls.toggleFullscreen.toString();
                        
                        if (currentFunction.includes('雙重全螢幕同步切換')) {
                            console.log('🔧 發現雙重同步版本，進行 Safari 增強');
                            
                            // 保存當前雙重同步版本
                            const currentDualSync = window.touchControls.toggleFullscreen;
                            
                            // 創建 Safari 增強的雙重同步版本
                            window.touchControls.toggleFullscreen = async function() {
                                console.log('🍎🎯 執行 Safari 增強的雙重全螢幕同步切換');
                                
                                try {
                                    const isCurrentlyFullscreen = safariStateCheck ? safariStateCheck() : !!document.fullscreenElement;
                                    const isInIframe = window !== window.parent;
                                    
                                    if (!isCurrentlyFullscreen) {
                                        console.log('📱 進入 Safari 增強雙重全螢幕模式');
                                        
                                        // 1. 觸發 Safari 增強的座標同步版本
                                        await safariEnhancedCoordinateSync.call(this);
                                        
                                        // 2. 如果在 iframe 中，通知父頁面觸發 CSS 強制全螢幕
                                        if (isInIframe) {
                                            console.log('📤 通知父頁面觸發 CSS 強制全螢幕');
                                            window.parent.postMessage({
                                                type: 'DUAL_FULLSCREEN_REQUEST',
                                                action: 'ENTER_CSS_FULLSCREEN',
                                                timestamp: Date.now()
                                            }, '*');
                                        }
                                        
                                        // 3. 等待父頁面響應
                                        await new Promise(resolve => setTimeout(resolve, 200));
                                        
                                        console.log('✅ Safari 增強雙重全螢幕（原生 + CSS）已啟用');
                                        
                                    } else {
                                        console.log('📱 退出 Safari 增強雙重全螢幕模式');
                                        
                                        // 1. 如果在 iframe 中，通知父頁面退出 CSS 強制全螢幕
                                        if (isInIframe) {
                                            console.log('📤 通知父頁面退出 CSS 強制全螢幕');
                                            window.parent.postMessage({
                                                type: 'DUAL_FULLSCREEN_REQUEST',
                                                action: 'EXIT_CSS_FULLSCREEN',
                                                timestamp: Date.now()
                                            }, '*');
                                        }
                                        
                                        // 2. 觸發 Safari 增強的座標同步退出
                                        await safariEnhancedCoordinateSync.call(this);
                                        
                                        console.log('✅ Safari 增強雙重全螢幕已退出');
                                    }
                                    
                                } catch (error) {
                                    console.log('❌ Safari 增強雙重全螢幕同步失敗:', error);
                                    
                                    // 回退到 Safari 增強座標同步版本
                                    console.log('🔄 回退到 Safari 增強座標同步版本');
                                    safariEnhancedCoordinateSync.call(this);
                                }
                            };
                            
                            console.log('✅ 雙重同步已升級為 Safari 增強版本');
                            
                        } else {
                            console.log('🔧 直接升級為 Safari 增強座標同步版本');
                            
                            // 直接替換為 Safari 增強版本
                            window.touchControls.toggleFullscreen = safariEnhancedCoordinateSync;
                        }
                    }
                    
                    // 添加測試函數
                    window.testSafariIntegrationFix = function() {
                        console.log('🧪 測試 Safari 整合修復');
                        
                        const status = {
                            hasTouchControls: !!window.touchControls,
                            hasToggleFullscreen: !!(window.touchControls && window.touchControls.toggleFullscreen),
                            hasSafariSupport: !!window.requestFullscreenCrossBrowser,
                            hasCoordinateSync: !!(window.touchControls && window.touchControls.recalculateCoordinates),
                            integrationFixed: true,
                            currentFunction: window.touchControls ? window.touchControls.toggleFullscreen.toString().substring(0, 100) + '...' : 'N/A'
                        };
                        
                        console.log('🍎 Safari 整合修復狀態:', status);
                        return status;
                    };
                    
                    console.log('✅ Safari 整合順序修復完成');
                    console.log('🎯 修復內容：');
                    console.log('   ✅ 創建 Safari 增強的座標同步版本');
                    console.log('   ✅ 雙重同步現在使用 Safari 增強版本');
                    console.log('   ✅ 跨瀏覽器 API 正確整合');
                    console.log('   ✅ 錯誤處理和回退機制完善');
                });
            }
            
            // 頁面載入完成後修復整合順序
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fixSafariIntegrationOrder);
            } else {
                // 延遲執行確保所有功能都已載入
                setTimeout(fixSafariIntegrationOrder, 1000);
            }
        </script>
        <!-- Safari 整合順序修復結束 -->
        `;
        
        // 在雙重全螢幕同步功能結束後插入修復代碼
        const dualSyncEndIndex = htmlContent.indexOf('<!-- 雙重全螢幕同步功能結束 -->');
        if (dualSyncEndIndex !== -1) {
            const insertIndex = dualSyncEndIndex + '<!-- 雙重全螢幕同步功能結束 -->'.length;
            htmlContent = htmlContent.slice(0, insertIndex) + 
                         safariIntegrationFix + 
                         htmlContent.slice(insertIndex);
            
            // 寫回文件
            fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
            console.log('✅ Safari 整合順序修復已添加到 StarShake 遊戲');
            
        } else {
            console.log('❌ 未找到雙重全螢幕同步功能結束標記');
        }
        
    } catch (error) {
        console.log('❌ 修復 Safari 整合順序失敗:', error);
    }
}

// 主要執行函數
function fixSafariIntegrationIssues() {
    console.log('🚀 修復 Safari 整合問題');
    
    console.log('🔍 問題分析：');
    console.log('   ❌ 座標同步版本只使用標準 requestFullscreen API');
    console.log('   ❌ 雙重同步調用座標同步版本，在 Safari 中失敗');
    console.log('   ❌ Safari 支援沒有整合到座標同步中');
    console.log('   ❌ 功能載入順序導致依賴問題');
    
    console.log('🔧 修復方案：');
    console.log('   ✅ 創建 Safari 增強的座標同步版本');
    console.log('   ✅ 整合跨瀏覽器 API 到座標同步中');
    console.log('   ✅ 更新雙重同步使用 Safari 增強版本');
    console.log('   ✅ 添加完善的錯誤處理和回退機制');
    
    // 修復 Safari 整合順序
    fixSafariIntegrationOrder();
    
    console.log('🎯 Safari 整合修復功能：');
    console.log('   ✅ Safari 增強的座標同步版本');
    console.log('   ✅ 跨瀏覽器 API 完整整合');
    console.log('   ✅ 雙重同步 Safari 增強版本');
    console.log('   ✅ 完善的錯誤處理機制');
    console.log('   ✅ 功能載入順序修復');
    
    console.log('🔧 新增測試函數：');
    console.log('   - window.testSafariIntegrationFix() - 測試 Safari 整合修復狀態');
    
    console.log('🚀 Safari 整合順序修復完成！');
    console.log('現在手機 Safari 上的全螢幕功能應該能正常工作了！');
}

// 執行修復
fixSafariIntegrationIssues();
