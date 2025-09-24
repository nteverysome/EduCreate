/**
 * 🎯 座標同步解決方案
 * 解決 CSS 強制全螢幕與原生 Fullscreen API 座標偏移問題
 */

console.log('🔧 座標同步解決方案載入中...');

// 1. 分析座標偏移問題
function analyzeCoordinateOffset() {
    console.log('📊 座標偏移問題分析：');
    
    // CSS 強制全螢幕的問題
    console.log('❌ CSS 強制全螢幕問題：');
    console.log('   - 使用 position: fixed; inset: 0 強制佔滿視窗');
    console.log('   - iframe 座標系統仍基於原始父頁面佈局');
    console.log('   - 遊戲內座標計算基於 iframe 原始尺寸');
    console.log('   - 沒有觸發 resize 事件，座標系統未重新計算');
    
    // 原生 Fullscreen API 的優勢
    console.log('✅ 原生 Fullscreen API 優勢：');
    console.log('   - 真正改變瀏覽器視窗狀態');
    console.log('   - 觸發 resize 事件，遊戲重新計算座標');
    console.log('   - iframe 內座標系統相應調整');
    console.log('   - 符合標準，兼容性好');
}

// 2. 檢查當前 Phaser 遊戲配置
function checkPhaserGameConfig() {
    console.log('🎮 檢查 Phaser 遊戲配置：');
    
    // 從壓縮代碼中提取的配置
    const gameConfig = {
        width: 1000,
        height: 800,
        scale: {
            mode: 'FIT', // Phaser.Scale.FIT
            autoCenter: 'CENTER_BOTH', // Phaser.Scale.CENTER_BOTH
        },
        autoRound: false,
        parent: 'game-container'
    };
    
    console.log('📐 遊戲配置：', gameConfig);
    console.log('   - 固定尺寸：1000x800');
    console.log('   - 縮放模式：FIT (保持比例縮放)');
    console.log('   - 自動居中：CENTER_BOTH');
    console.log('   - 父容器：game-container');
    
    return gameConfig;
}

// 3. 檢查 TouchControls 座標計算
function checkTouchControlsCoordinates() {
    console.log('📱 檢查 TouchControls 座標計算：');
    
    if (window.touchControls) {
        const joystick = document.querySelector('.touch-joystick');
        const shootBtn = document.querySelector('.touch-shoot-btn');
        
        if (joystick) {
            const rect = joystick.getBoundingClientRect();
            console.log('🕹️ 搖桿座標：', {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                center: {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                }
            });
        }
        
        if (shootBtn) {
            const rect = shootBtn.getBoundingClientRect();
            console.log('🚀 射擊按鈕座標：', {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            });
        }
    } else {
        console.log('❌ TouchControls 未找到');
    }
}

// 4. 座標同步解決方案
function createCoordinateSyncSolution() {
    console.log('🎯 創建座標同步解決方案：');
    
    // 方案 1：同步觸發原生 Fullscreen API
    const syncFullscreenAPI = () => {
        console.log('📋 方案 1：同步觸發原生 Fullscreen API');
        
        // 當父頁面 CSS 強制全螢幕時，同時觸發原生 API
        const triggerNativeFullscreen = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    console.log('✅ 原生全螢幕已同步觸發');
                    // 通知 iframe 內的遊戲重新計算座標
                    notifyGameResize();
                }).catch(err => {
                    console.log('❌ 原生全螢幕觸發失敗:', err);
                });
            }
        };
        
        return triggerNativeFullscreen;
    };
    
    // 方案 2：PostMessage 通信機制
    const createPostMessageSync = () => {
        console.log('📋 方案 2：PostMessage 通信機制');
        
        // 父頁面向 iframe 發送尺寸變化消息
        const notifyIframeResize = (width, height) => {
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'FULLSCREEN_RESIZE',
                    width: width,
                    height: height,
                    timestamp: Date.now()
                }, '*');
                console.log('📤 已發送尺寸變化消息到 iframe');
            }
        };
        
        // iframe 內監聽尺寸變化消息
        const listenForResizeMessages = () => {
            window.addEventListener('message', (event) => {
                if (event.data.type === 'FULLSCREEN_RESIZE') {
                    console.log('📥 收到尺寸變化消息:', event.data);
                    // 重新計算 TouchControls 座標
                    if (window.touchControls) {
                        window.touchControls.recalculateCoordinates();
                    }
                    // 觸發 Phaser 遊戲 resize
                    triggerPhaserResize();
                }
            });
        };
        
        return { notifyIframeResize, listenForResizeMessages };
    };
    
    // 方案 3：動態調整 iframe 尺寸
    const createIframeSizeSync = () => {
        console.log('📋 方案 3：動態調整 iframe 尺寸');
        
        const syncIframeSize = () => {
            const iframe = document.querySelector('iframe');
            if (iframe) {
                // 確保 iframe 尺寸與全螢幕狀態一致
                iframe.style.width = '100vw';
                iframe.style.height = '100vh';
                iframe.style.position = 'fixed';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.zIndex = '9999';
                
                console.log('✅ iframe 尺寸已同步到全螢幕');
            }
        };
        
        return syncIframeSize;
    };
    
    return {
        syncFullscreenAPI: syncFullscreenAPI(),
        postMessageSync: createPostMessageSync(),
        iframeSizeSync: createIframeSizeSync()
    };
}

// 5. 通知遊戲重新計算座標
function notifyGameResize() {
    console.log('🎮 通知遊戲重新計算座標');
    
    // 觸發 window resize 事件
    window.dispatchEvent(new Event('resize'));
    
    // 如果有 Phaser 遊戲實例，觸發 scale refresh
    if (window.game && window.game.scale) {
        setTimeout(() => {
            window.game.scale.refresh();
            console.log('✅ Phaser 遊戲座標已重新計算');
        }, 100);
    }
    
    // 重新計算 TouchControls 座標
    if (window.touchControls) {
        setTimeout(() => {
            window.touchControls.recalculateCoordinates();
            console.log('✅ TouchControls 座標已重新計算');
        }, 150);
    }
}

// 6. 觸發 Phaser 遊戲 resize
function triggerPhaserResize() {
    console.log('🎮 觸發 Phaser 遊戲 resize');
    
    // 方法 1：直接調用 scale.refresh()
    if (window.game && window.game.scale) {
        window.game.scale.refresh();
    }
    
    // 方法 2：觸發 resize 事件
    window.dispatchEvent(new Event('resize'));
    
    // 方法 3：如果有場景，觸發場景的 resize
    if (window.game && window.game.scene && window.game.scene.scenes.length > 0) {
        window.game.scene.scenes.forEach(scene => {
            if (scene.sys && scene.sys.events) {
                scene.sys.events.emit('resize');
            }
        });
    }
}

// 7. 為 TouchControls 添加座標重新計算方法
function enhanceTouchControlsWithRecalculation() {
    console.log('📱 為 TouchControls 添加座標重新計算方法');
    
    if (window.touchControls) {
        // 添加重新計算座標的方法
        window.touchControls.recalculateCoordinates = function() {
            console.log('🔄 重新計算 TouchControls 座標');
            
            // 重新獲取搖桿中心座標
            if (this.joystick) {
                const rect = this.joystick.getBoundingClientRect();
                this.joystickCenter = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
                console.log('🕹️ 搖桿中心已更新:', this.joystickCenter);
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
        };
        
        console.log('✅ TouchControls 座標重新計算方法已添加');
    }
}

// 8. 主要執行函數
function executeCoordinateSyncSolution() {
    console.log('🚀 執行座標同步解決方案');
    
    // 分析問題
    analyzeCoordinateOffset();
    
    // 檢查配置
    checkPhaserGameConfig();
    checkTouchControlsCoordinates();
    
    // 創建解決方案
    const solutions = createCoordinateSyncSolution();
    
    // 增強 TouchControls
    enhanceTouchControlsWithRecalculation();
    
    // 返回解決方案工具
    return {
        ...solutions,
        notifyGameResize,
        triggerPhaserResize,
        enhanceTouchControlsWithRecalculation
    };
}

// 執行解決方案
const coordinateSync = executeCoordinateSyncSolution();

// 將解決方案掛載到全局
window.coordinateSync = coordinateSync;

console.log('✅ 座標同步解決方案已準備完成');
console.log('🔧 使用方法：');
console.log('   - window.coordinateSync.syncFullscreenAPI() - 同步觸發原生全螢幕');
console.log('   - window.coordinateSync.notifyGameResize() - 通知遊戲重新計算座標');
console.log('   - window.coordinateSync.triggerPhaserResize() - 觸發 Phaser 遊戲 resize');
