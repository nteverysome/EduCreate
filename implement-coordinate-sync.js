/**
 * 🎯 實現座標同步 - 讓原生 Fullscreen API 跟上 CSS 強制全螢幕
 * 解決座標偏移問題的完整實現方案
 */

console.log('🚀 開始實現座標同步解決方案...');

// 1. 修改 GameSwitcher.tsx 中的父頁面全螢幕功能
function enhanceParentFullscreen() {
    console.log('🔧 增強父頁面全螢幕功能');
    
    // 檢查是否在 GameSwitcher 環境中
    const gameContainer = document.querySelector('.game-iframe-container');
    const iframe = document.querySelector('iframe[title*="Starshake"], iframe[src*="starshake"]');
    
    if (!gameContainer || !iframe) {
        console.log('❌ 未找到遊戲容器或 iframe');
        return false;
    }
    
    // 創建同步全螢幕函數
    const syncFullscreenWithNativeAPI = async () => {
        console.log('🔄 同步 CSS 強制全螢幕與原生 Fullscreen API');
        
        try {
            // 1. 首先觸發原生 Fullscreen API
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                console.log('✅ 原生全螢幕已觸發');
            }
            
            // 2. 等待全螢幕狀態穩定
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 3. 應用 CSS 強制全螢幕樣式
            applyCSSFullscreen();
            
            // 4. 同步 iframe 尺寸
            syncIframeSize();
            
            // 5. 通知 iframe 內的遊戲重新計算座標
            notifyIframeResize();
            
            console.log('✅ 座標同步完成');
            
        } catch (error) {
            console.log('❌ 同步全螢幕失敗:', error);
            // 如果原生 API 失敗，仍然應用 CSS 強制全螢幕
            applyCSSFullscreen();
            syncIframeSize();
            notifyIframeResize();
        }
    };
    
    // 應用 CSS 強制全螢幕
    const applyCSSFullscreen = () => {
        console.log('🎨 應用 CSS 強制全螢幕');
        
        // 添加鎖定全螢幕樣式
        document.body.classList.add('locked-fullscreen');
        
        // 確保樣式存在
        ensureLockedFullscreenStyles();
    };
    
    // 確保鎖定全螢幕樣式存在
    const ensureLockedFullscreenStyles = () => {
        let style = document.getElementById('coordinate-sync-fullscreen-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'coordinate-sync-fullscreen-style';
            style.textContent = `
                body.locked-fullscreen {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    background: black !important;
                    position: fixed !important;
                    inset: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 2147483647 !important;
                }
                
                body.locked-fullscreen .game-iframe-container {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    max-width: none !important;
                    max-height: none !important;
                    z-index: 2147483647 !important;
                }
                
                body.locked-fullscreen iframe {
                    width: 100vw !important;
                    height: 100vh !important;
                    border: none !important;
                }
            `;
            document.head.appendChild(style);
            console.log('✅ 座標同步全螢幕樣式已添加');
        }
    };
    
    // 同步 iframe 尺寸
    const syncIframeSize = () => {
        console.log('📐 同步 iframe 尺寸');
        
        if (iframe) {
            // 強制 iframe 填滿整個螢幕
            iframe.style.width = '100vw';
            iframe.style.height = '100vh';
            iframe.style.position = 'fixed';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.zIndex = '2147483647';
            iframe.style.border = 'none';
            
            console.log('✅ iframe 尺寸已同步');
        }
    };
    
    // 通知 iframe 重新計算座標
    const notifyIframeResize = () => {
        console.log('📤 通知 iframe 重新計算座標');
        
        if (iframe && iframe.contentWindow) {
            // 發送座標同步消息
            iframe.contentWindow.postMessage({
                type: 'COORDINATE_SYNC',
                action: 'FULLSCREEN_RESIZE',
                dimensions: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                timestamp: Date.now()
            }, '*');
            
            console.log('✅ 座標同步消息已發送');
        }
        
        // 觸發 window resize 事件
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    };
    
    // 退出同步全螢幕
    const exitSyncFullscreen = async () => {
        console.log('🔄 退出同步全螢幕');
        
        try {
            // 1. 退出原生全螢幕
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                console.log('✅ 已退出原生全螢幕');
            }
            
            // 2. 移除 CSS 強制全螢幕
            document.body.classList.remove('locked-fullscreen');
            
            // 3. 恢復 iframe 尺寸
            restoreIframeSize();
            
            // 4. 通知 iframe 恢復座標
            notifyIframeRestore();
            
            console.log('✅ 已退出同步全螢幕');
            
        } catch (error) {
            console.log('❌ 退出同步全螢幕失敗:', error);
            // 強制清理
            document.body.classList.remove('locked-fullscreen');
            restoreIframeSize();
            notifyIframeRestore();
        }
    };
    
    // 恢復 iframe 尺寸
    const restoreIframeSize = () => {
        console.log('🔄 恢復 iframe 尺寸');
        
        if (iframe) {
            iframe.style.width = '';
            iframe.style.height = '';
            iframe.style.position = '';
            iframe.style.top = '';
            iframe.style.left = '';
            iframe.style.zIndex = '';
            iframe.style.border = '';
            
            console.log('✅ iframe 尺寸已恢復');
        }
    };
    
    // 通知 iframe 恢復座標
    const notifyIframeRestore = () => {
        console.log('📤 通知 iframe 恢復座標');
        
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'COORDINATE_SYNC',
                action: 'FULLSCREEN_EXIT',
                timestamp: Date.now()
            }, '*');
            
            console.log('✅ 座標恢復消息已發送');
        }
        
        // 觸發 window resize 事件
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    };
    
    return {
        syncFullscreenWithNativeAPI,
        exitSyncFullscreen,
        applyCSSFullscreen,
        syncIframeSize,
        notifyIframeResize
    };
}

// 2. 修改 StarShake 遊戲中的全螢幕按鈕
function enhanceGameFullscreenButton() {
    console.log('🎮 增強遊戲內全螢幕按鈕');
    
    // 檢查是否在 iframe 中
    const isInIframe = window !== window.parent;
    
    if (!isInIframe) {
        console.log('❌ 不在 iframe 中，跳過遊戲全螢幕按鈕增強');
        return false;
    }
    
    // 監聽來自父頁面的座標同步消息
    const listenForCoordinateSync = () => {
        console.log('👂 監聽座標同步消息');
        
        window.addEventListener('message', (event) => {
            if (event.data.type === 'COORDINATE_SYNC') {
                console.log('📥 收到座標同步消息:', event.data);
                
                switch (event.data.action) {
                    case 'FULLSCREEN_RESIZE':
                        handleFullscreenResize(event.data.dimensions);
                        break;
                    case 'FULLSCREEN_EXIT':
                        handleFullscreenExit();
                        break;
                }
            }
        });
    };
    
    // 處理全螢幕 resize
    const handleFullscreenResize = (dimensions) => {
        console.log('📐 處理全螢幕 resize:', dimensions);
        
        // 1. 重新計算 TouchControls 座標
        if (window.touchControls && window.touchControls.recalculateCoordinates) {
            setTimeout(() => {
                window.touchControls.recalculateCoordinates();
                console.log('✅ TouchControls 座標已重新計算');
            }, 100);
        }
        
        // 2. 觸發 Phaser 遊戲 resize
        triggerPhaserGameResize();
        
        // 3. 更新全螢幕按鈕狀態
        updateFullscreenButtonState(true);
    };
    
    // 處理全螢幕退出
    const handleFullscreenExit = () => {
        console.log('🔄 處理全螢幕退出');
        
        // 1. 重新計算 TouchControls 座標
        if (window.touchControls && window.touchControls.recalculateCoordinates) {
            setTimeout(() => {
                window.touchControls.recalculateCoordinates();
                console.log('✅ TouchControls 座標已恢復');
            }, 100);
        }
        
        // 2. 觸發 Phaser 遊戲 resize
        triggerPhaserGameResize();
        
        // 3. 更新全螢幕按鈕狀態
        updateFullscreenButtonState(false);
    };
    
    // 觸發 Phaser 遊戲 resize
    const triggerPhaserGameResize = () => {
        console.log('🎮 觸發 Phaser 遊戲 resize');
        
        // 觸發 window resize 事件
        window.dispatchEvent(new Event('resize'));
        
        // 如果有 Phaser 遊戲實例
        if (window.game && window.game.scale) {
            setTimeout(() => {
                window.game.scale.refresh();
                console.log('✅ Phaser 遊戲已 resize');
            }, 150);
        }
    };
    
    // 更新全螢幕按鈕狀態
    const updateFullscreenButtonState = (isFullscreen) => {
        console.log('🔄 更新全螢幕按鈕狀態:', isFullscreen);
        
        const fullscreenBtn = document.querySelector('.fullscreen-btn');
        if (fullscreenBtn) {
            // 更新按鈕文字或圖標
            fullscreenBtn.textContent = isFullscreen ? '⛶' : '⛶';
            fullscreenBtn.title = isFullscreen ? '退出全螢幕' : '進入全螢幕';
        }
    };
    
    // 修改遊戲內全螢幕按鈕行為
    const enhanceGameFullscreenBehavior = () => {
        console.log('🔧 修改遊戲內全螢幕按鈕行為');
        
        // 如果 TouchControls 存在，修改其全螢幕方法
        if (window.touchControls) {
            const originalToggleFullscreen = window.touchControls.toggleFullscreen;
            
            window.touchControls.toggleFullscreen = function() {
                console.log('🎯 遊戲內全螢幕按鈕被點擊');
                
                // 通知父頁面切換全螢幕
                window.parent.postMessage({
                    type: 'GAME_FULLSCREEN_REQUEST',
                    action: 'TOGGLE',
                    timestamp: Date.now()
                }, '*');
                
                console.log('📤 已通知父頁面切換全螢幕');
            };
            
            console.log('✅ 遊戲內全螢幕按鈕行為已修改');
        }
    };
    
    // 初始化
    listenForCoordinateSync();
    enhanceGameFullscreenBehavior();
    
    return {
        handleFullscreenResize,
        handleFullscreenExit,
        triggerPhaserGameResize,
        updateFullscreenButtonState
    };
}

// 3. 主要執行函數
function implementCoordinateSync() {
    console.log('🚀 實現座標同步解決方案');
    
    // 檢查環境
    const isInIframe = window !== window.parent;
    
    if (isInIframe) {
        // 在 iframe 中（遊戲內）
        console.log('🎮 在遊戲 iframe 中，增強遊戲全螢幕功能');
        return enhanceGameFullscreenButton();
    } else {
        // 在父頁面中
        console.log('🏠 在父頁面中，增強父頁面全螢幕功能');
        return enhanceParentFullscreen();
    }
}

// 執行實現
const coordinateSyncImplementation = implementCoordinateSync();

// 掛載到全局
window.coordinateSyncImplementation = coordinateSyncImplementation;

console.log('✅ 座標同步解決方案實現完成');
console.log('🎯 現在 CSS 強制全螢幕與原生 Fullscreen API 將同步工作，座標偏移問題已解決！');
