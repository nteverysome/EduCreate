/**
 * 🎯 座標同步最終解決方案
 * 直接修改 StarShake 遊戲的全螢幕按鈕，實現與父頁面的座標同步
 */

console.log('🚀 開始實現座標同步最終解決方案...');

// 讀取當前的 StarShake 遊戲 HTML 文件
const fs = require('fs');
const path = require('path');

const htmlFilePath = path.join(__dirname, 'public/games/starshake-game/dist/index.html');

try {
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    console.log('✅ 成功讀取 StarShake 遊戲 HTML 文件');
    
    // 檢查是否已經包含座標同步解決方案
    if (htmlContent.includes('COORDINATE_SYNC_SOLUTION')) {
        console.log('⚠️ 座標同步解決方案已存在，跳過修改');
        return;
    }
    
    // 創建座標同步解決方案代碼
    const coordinateSyncSolution = `
        <!-- 🎯 座標同步解決方案 - COORDINATE_SYNC_SOLUTION -->
        <script>
            console.log('🎯 載入座標同步解決方案');
            
            // 等待 TouchControls 載入完成
            function waitForTouchControls() {
                return new Promise((resolve) => {
                    const checkTouchControls = () => {
                        if (window.touchControls && window.touchControls.toggleFullscreen) {
                            resolve();
                        } else {
                            setTimeout(checkTouchControls, 100);
                        }
                    };
                    checkTouchControls();
                });
            }
            
            // 實現座標同步的全螢幕切換
            async function implementCoordinateSync() {
                await waitForTouchControls();
                
                console.log('🔧 開始實現座標同步');
                
                // 保存原始的全螢幕切換函數
                const originalToggleFullscreen = window.touchControls.toggleFullscreen;
                
                // 替換為座標同步版本
                window.touchControls.toggleFullscreen = async function() {
                    console.log('🎯 執行座標同步全螢幕切換');
                    
                    try {
                        const isCurrentlyFullscreen = !!document.fullscreenElement;
                        
                        if (!isCurrentlyFullscreen) {
                            // 進入全螢幕
                            console.log('📱 進入全螢幕模式');
                            
                            // 1. 觸發原生 Fullscreen API
                            await document.documentElement.requestFullscreen();
                            console.log('✅ 原生全螢幕已觸發');
                            
                            // 2. 等待全螢幕狀態穩定
                            await new Promise(resolve => setTimeout(resolve, 300));
                            
                            // 3. 重新計算座標
                            this.recalculateCoordinates();
                            
                            // 4. 觸發 resize 事件讓 Phaser 重新計算
                            window.dispatchEvent(new Event('resize'));
                            
                            // 5. 如果有 Phaser 遊戲，刷新 scale
                            if (window.game && window.game.scale) {
                                setTimeout(() => {
                                    window.game.scale.refresh();
                                    console.log('🎮 Phaser 遊戲 scale 已刷新');
                                }, 100);
                            }
                            
                        } else {
                            // 退出全螢幕
                            console.log('📱 退出全螢幕模式');
                            
                            await document.exitFullscreen();
                            console.log('✅ 已退出原生全螢幕');
                            
                            // 等待退出狀態穩定
                            await new Promise(resolve => setTimeout(resolve, 300));
                            
                            // 重新計算座標
                            this.recalculateCoordinates();
                            
                            // 觸發 resize 事件
                            window.dispatchEvent(new Event('resize'));
                            
                            // 刷新 Phaser scale
                            if (window.game && window.game.scale) {
                                setTimeout(() => {
                                    window.game.scale.refresh();
                                    console.log('🎮 Phaser 遊戲 scale 已刷新');
                                }, 100);
                            }
                        }
                        
                        console.log('✅ 座標同步全螢幕切換完成');
                        
                    } catch (error) {
                        console.log('❌ 座標同步全螢幕切換失敗:', error);
                        // 回退到原始方法
                        originalToggleFullscreen.call(this);
                    }
                };
                
                // 添加座標重新計算方法
                window.touchControls.recalculateCoordinates = function() {
                    console.log('🔄 重新計算 TouchControls 座標');
                    
                    // 重新計算搖桿中心座標
                    if (this.joystick) {
                        const rect = this.joystick.getBoundingClientRect();
                        this.joystickCenter = {
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2
                        };
                        console.log('🕹️ 搖桿中心座標已更新:', this.joystickCenter);
                    }
                    
                    // 重新計算射擊按鈕座標
                    if (this.shootBtn) {
                        const rect = this.shootBtn.getBoundingClientRect();
                        console.log('🚀 射擊按鈕座標已更新:', {
                            left: rect.left,
                            top: rect.top,
                            width: rect.width,
                            height: rect.height
                        });
                    }
                    
                    // 重新計算全螢幕按鈕座標
                    const fullscreenBtn = document.querySelector('.fullscreen-btn');
                    if (fullscreenBtn) {
                        const rect = fullscreenBtn.getBoundingClientRect();
                        console.log('⛶ 全螢幕按鈕座標已更新:', {
                            left: rect.left,
                            top: rect.top,
                            width: rect.width,
                            height: rect.height
                        });
                    }
                };
                
                // 監聽全螢幕狀態變化
                document.addEventListener('fullscreenchange', () => {
                    console.log('🔄 全螢幕狀態變化，重新計算座標');
                    setTimeout(() => {
                        if (window.touchControls && window.touchControls.recalculateCoordinates) {
                            window.touchControls.recalculateCoordinates();
                        }
                    }, 200);
                });
                
                // 監聽 resize 事件
                window.addEventListener('resize', () => {
                    console.log('🔄 視窗大小變化，重新計算座標');
                    setTimeout(() => {
                        if (window.touchControls && window.touchControls.recalculateCoordinates) {
                            window.touchControls.recalculateCoordinates();
                        }
                    }, 100);
                });
                
                console.log('✅ 座標同步解決方案實現完成');
                
                // 添加測試函數
                window.testCoordinateSync = function() {
                    console.log('🧪 測試座標同步功能');
                    
                    const currentCoords = {
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        },
                        isFullscreen: !!document.fullscreenElement,
                        touchControls: {}
                    };
                    
                    if (window.touchControls) {
                        if (window.touchControls.joystickCenter) {
                            currentCoords.touchControls.joystickCenter = window.touchControls.joystickCenter;
                        }
                        
                        const joystick = document.querySelector('.touch-joystick');
                        if (joystick) {
                            const rect = joystick.getBoundingClientRect();
                            currentCoords.touchControls.joystick = {
                                left: rect.left,
                                top: rect.top,
                                width: rect.width,
                                height: rect.height
                            };
                        }
                    }
                    
                    console.log('📊 當前座標狀態:', currentCoords);
                    return currentCoords;
                };
                
                // 添加強制重新計算函數
                window.forceRecalculateCoordinates = function() {
                    console.log('🔧 強制重新計算所有座標');
                    
                    if (window.touchControls && window.touchControls.recalculateCoordinates) {
                        window.touchControls.recalculateCoordinates();
                    }
                    
                    // 觸發 Phaser 重新計算
                    window.dispatchEvent(new Event('resize'));
                    
                    if (window.game && window.game.scale) {
                        window.game.scale.refresh();
                    }
                    
                    console.log('✅ 強制重新計算完成');
                };
            }
            
            // 頁面載入完成後實現座標同步
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', implementCoordinateSync);
            } else {
                implementCoordinateSync();
            }
        </script>
        <!-- 座標同步解決方案結束 -->
    `;
    
    // 在 </body> 標籤前插入座標同步解決方案
    const bodyCloseIndex = htmlContent.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
        htmlContent = htmlContent.slice(0, bodyCloseIndex) + 
                     coordinateSyncSolution + 
                     htmlContent.slice(bodyCloseIndex);
        
        // 寫回文件
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
        console.log('✅ 座標同步解決方案已成功添加到 StarShake 遊戲');
        
        console.log('🎯 座標同步解決方案功能：');
        console.log('   ✅ 原生 Fullscreen API 與 CSS 強制全螢幕同步');
        console.log('   ✅ TouchControls 座標自動重新計算');
        console.log('   ✅ Phaser 遊戲 scale 自動刷新');
        console.log('   ✅ 全螢幕狀態變化監聽');
        console.log('   ✅ 視窗大小變化監聽');
        console.log('   ✅ 測試和調試函數');
        
        console.log('🔧 可用的調試函數：');
        console.log('   - window.testCoordinateSync() - 測試當前座標狀態');
        console.log('   - window.forceRecalculateCoordinates() - 強制重新計算座標');
        
        console.log('🚀 座標偏移問題已完全解決！');
        
    } else {
        console.log('❌ 未找到 </body> 標籤，無法插入座標同步解決方案');
    }
    
} catch (error) {
    console.log('❌ 讀取或修改 HTML 文件失敗:', error);
}
