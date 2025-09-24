/**
 * 🎯 實現雙重全螢幕同步
 * 讓 .fullscreen-btn 同時觸發原生 API 和 CSS 強制全螢幕
 */

console.log('🚀 開始實現雙重全螢幕同步功能...');

const fs = require('fs');
const path = require('path');

// 1. 修改 StarShake 遊戲的全螢幕按鈕
function enhanceGameFullscreenButton() {
    console.log('🎮 增強遊戲內全螢幕按鈕');
    
    const htmlFilePath = path.join(__dirname, 'public/games/starshake-game/dist/index.html');
    
    try {
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        
        // 檢查是否已經包含雙重同步功能
        if (htmlContent.includes('DUAL_FULLSCREEN_SYNC')) {
            console.log('⚠️ 雙重全螢幕同步功能已存在，跳過修改');
            return;
        }
        
        // 創建雙重全螢幕同步代碼
        const dualFullscreenSync = `
        <!-- 🎯 雙重全螢幕同步功能 - DUAL_FULLSCREEN_SYNC -->
        <script>
            console.log('🎯 載入雙重全螢幕同步功能');
            
            // 等待 TouchControls 和座標同步載入完成
            function waitForEnhancedTouchControls() {
                return new Promise((resolve) => {
                    const checkEnhanced = () => {
                        if (window.touchControls && 
                            window.touchControls.toggleFullscreen && 
                            window.touchControls.recalculateCoordinates) {
                            resolve();
                        } else {
                            setTimeout(checkEnhanced, 100);
                        }
                    };
                    checkEnhanced();
                });
            }
            
            // 實現雙重全螢幕同步
            async function implementDualFullscreenSync() {
                await waitForEnhancedTouchControls();
                
                console.log('🔧 開始實現雙重全螢幕同步');
                
                // 保存當前的座標同步版本
                const coordinateSyncToggleFullscreen = window.touchControls.toggleFullscreen;
                
                // 替換為雙重同步版本
                window.touchControls.toggleFullscreen = async function() {
                    console.log('🎯 執行雙重全螢幕同步切換');
                    
                    try {
                        const isCurrentlyFullscreen = !!document.fullscreenElement;
                        const isInIframe = window !== window.parent;
                        
                        if (!isCurrentlyFullscreen) {
                            // 進入全螢幕
                            console.log('📱 進入雙重全螢幕模式');
                            
                            // 1. 觸發原生 Fullscreen API（座標同步版本）
                            await coordinateSyncToggleFullscreen.call(this);
                            
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
                            
                            console.log('✅ 雙重全螢幕（原生 + CSS）已啟用');
                            
                        } else {
                            // 退出全螢幕
                            console.log('📱 退出雙重全螢幕模式');
                            
                            // 1. 如果在 iframe 中，通知父頁面退出 CSS 強制全螢幕
                            if (isInIframe) {
                                console.log('📤 通知父頁面退出 CSS 強制全螢幕');
                                window.parent.postMessage({
                                    type: 'DUAL_FULLSCREEN_REQUEST',
                                    action: 'EXIT_CSS_FULLSCREEN',
                                    timestamp: Date.now()
                                }, '*');
                            }
                            
                            // 2. 觸發原生 Fullscreen API 退出（座標同步版本）
                            await coordinateSyncToggleFullscreen.call(this);
                            
                            console.log('✅ 雙重全螢幕已退出');
                        }
                        
                    } catch (error) {
                        console.log('❌ 雙重全螢幕同步失敗:', error);
                        // 回退到座標同步版本
                        coordinateSyncToggleFullscreen.call(this);
                    }
                };
                
                // 監聽來自父頁面的響應
                window.addEventListener('message', (event) => {
                    if (event.data.type === 'DUAL_FULLSCREEN_RESPONSE') {
                        console.log('📥 收到父頁面響應:', event.data);
                        
                        switch (event.data.action) {
                            case 'CSS_FULLSCREEN_ENABLED':
                                console.log('✅ 父頁面 CSS 強制全螢幕已啟用');
                                break;
                            case 'CSS_FULLSCREEN_DISABLED':
                                console.log('✅ 父頁面 CSS 強制全螢幕已停用');
                                break;
                            case 'CSS_FULLSCREEN_ERROR':
                                console.log('❌ 父頁面 CSS 強制全螢幕錯誤:', event.data.error);
                                break;
                        }
                    }
                });
                
                console.log('✅ 雙重全螢幕同步功能實現完成');
                
                // 添加測試函數
                window.testDualFullscreen = function() {
                    console.log('🧪 測試雙重全螢幕功能');
                    
                    const status = {
                        isInIframe: window !== window.parent,
                        nativeFullscreen: !!document.fullscreenElement,
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        },
                        touchControls: !!window.touchControls,
                        dualSyncEnabled: true
                    };
                    
                    console.log('📊 雙重全螢幕狀態:', status);
                    return status;
                };
                
                // 添加強制同步函數
                window.forceDualFullscreenSync = async function() {
                    console.log('🔧 強制執行雙重全螢幕同步');
                    
                    if (window.touchControls && window.touchControls.toggleFullscreen) {
                        await window.touchControls.toggleFullscreen();
                    }
                    
                    console.log('✅ 強制同步完成');
                };
            }
            
            // 頁面載入完成後實現雙重同步
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', implementDualFullscreenSync);
            } else {
                implementDualFullscreenSync();
            }
        </script>
        <!-- 雙重全螢幕同步功能結束 -->
        `;
        
        // 在座標同步解決方案後插入雙重同步功能
        const coordinateSyncEndIndex = htmlContent.indexOf('<!-- 座標同步解決方案結束 -->');
        if (coordinateSyncEndIndex !== -1) {
            htmlContent = htmlContent.slice(0, coordinateSyncEndIndex) + 
                         dualFullscreenSync + 
                         htmlContent.slice(coordinateSyncEndIndex);
            
            // 寫回文件
            fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
            console.log('✅ 雙重全螢幕同步功能已添加到 StarShake 遊戲');
            
        } else {
            console.log('❌ 未找到座標同步解決方案結束標記');
        }
        
    } catch (error) {
        console.log('❌ 修改遊戲 HTML 文件失敗:', error);
    }
}

// 2. 修改 GameSwitcher.tsx 以支援來自 iframe 的請求
function enhanceGameSwitcherForDualSync() {
    console.log('🏠 增強 GameSwitcher 以支援雙重同步');
    
    const gameSwitcherPath = path.join(__dirname, 'components/games/GameSwitcher.tsx');
    
    try {
        let content = fs.readFileSync(gameSwitcherPath, 'utf8');
        
        // 檢查是否已經包含雙重同步監聽器
        if (content.includes('DUAL_FULLSCREEN_LISTENER')) {
            console.log('⚠️ GameSwitcher 雙重同步監聽器已存在，跳過修改');
            return;
        }
        
        // 創建雙重同步監聽器代碼
        const dualSyncListener = `
  // 🎯 雙重全螢幕同步監聽器 - DUAL_FULLSCREEN_LISTENER
  useEffect(() => {
    const handleDualFullscreenMessage = async (event: MessageEvent) => {
      if (event.data.type === 'DUAL_FULLSCREEN_REQUEST') {
        console.log('📥 收到遊戲內雙重全螢幕請求:', event.data);
        
        try {
          switch (event.data.action) {
            case 'ENTER_CSS_FULLSCREEN':
              console.log('🔒 啟用父頁面 CSS 強制全螢幕');
              
              // 確保樣式存在
              ensureLockedFullscreenStyles();
              
              // 添加鎖定樣式
              document.body.classList.add('locked-fullscreen');
              
              // 啟用事件鎖定
              enableFullscreenLock();
              
              // 響應遊戲
              event.source?.postMessage({
                type: 'DUAL_FULLSCREEN_RESPONSE',
                action: 'CSS_FULLSCREEN_ENABLED',
                timestamp: Date.now()
              }, '*');
              
              console.log('✅ 父頁面 CSS 強制全螢幕已啟用');
              break;
              
            case 'EXIT_CSS_FULLSCREEN':
              console.log('🔓 停用父頁面 CSS 強制全螢幕');
              
              // 移除鎖定樣式
              document.body.classList.remove('locked-fullscreen');
              
              // 停用事件鎖定
              disableFullscreenLock();
              
              // 響應遊戲
              event.source?.postMessage({
                type: 'DUAL_FULLSCREEN_RESPONSE',
                action: 'CSS_FULLSCREEN_DISABLED',
                timestamp: Date.now()
              }, '*');
              
              console.log('✅ 父頁面 CSS 強制全螢幕已停用');
              break;
          }
          
        } catch (error) {
          console.log('❌ 處理雙重全螢幕請求失敗:', error);
          
          // 響應錯誤
          event.source?.postMessage({
            type: 'DUAL_FULLSCREEN_RESPONSE',
            action: 'CSS_FULLSCREEN_ERROR',
            error: error.message,
            timestamp: Date.now()
          }, '*');
        }
      }
    };
    
    // 添加消息監聽器
    window.addEventListener('message', handleDualFullscreenMessage);
    
    // 清理函數
    return () => {
      window.removeEventListener('message', handleDualFullscreenMessage);
    };
  }, []);
  // 雙重全螢幕同步監聽器結束
`;
        
        // 在 useEffect 區域插入監聽器
        const useEffectIndex = content.indexOf('useEffect(() => {');
        if (useEffectIndex !== -1) {
            // 找到第一個 useEffect 的結束位置
            const useEffectEndIndex = content.indexOf('}, []);', useEffectIndex) + 7;
            
            content = content.slice(0, useEffectEndIndex) + 
                     dualSyncListener + 
                     content.slice(useEffectEndIndex);
            
            // 寫回文件
            fs.writeFileSync(gameSwitcherPath, content, 'utf8');
            console.log('✅ GameSwitcher 雙重同步監聽器已添加');
            
        } else {
            console.log('❌ 未找到 useEffect 插入點');
        }
        
    } catch (error) {
        console.log('❌ 修改 GameSwitcher 文件失敗:', error);
    }
}

// 3. 主要執行函數
function implementDualFullscreenSync() {
    console.log('🚀 實現雙重全螢幕同步');
    
    // 增強遊戲內全螢幕按鈕
    enhanceGameFullscreenButton();
    
    // 增強 GameSwitcher 支援
    enhanceGameSwitcherForDualSync();
    
    console.log('🎯 雙重全螢幕同步功能：');
    console.log('   ✅ 遊戲內按鈕觸發原生 Fullscreen API');
    console.log('   ✅ 同時通知父頁面觸發 CSS 強制全螢幕');
    console.log('   ✅ PostMessage 通信機制');
    console.log('   ✅ 事件鎖定機制整合');
    console.log('   ✅ 座標同步功能保持');
    
    console.log('🔧 可用的調試函數：');
    console.log('   - window.testDualFullscreen() - 測試雙重全螢幕狀態');
    console.log('   - window.forceDualFullscreenSync() - 強制執行雙重同步');
    
    console.log('🚀 雙重全螢幕同步實現完成！');
    console.log('現在 .fullscreen-btn 可以同時觸發原生 API 和 CSS 強制全螢幕！');
}

// 執行實現
implementDualFullscreenSync();
