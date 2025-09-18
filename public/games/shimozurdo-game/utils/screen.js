// 全螢幕功能管理模組 - 處理遊戲的全螢幕模式切換和相關事件

/**
 * 全螢幕功能初始化函數 - 設定全螢幕相關的事件監聽和鍵盤控制
 * 此函數需要在 Phaser 場景的上下文中調用 (使用 .call(this))
 */
function fullScreen() {
    // 設定全螢幕的目標 DOM 元素為 id='game' 的容器
    this.scale.fullscreenTarget = document.getElementById('game')

    // 添加 Phaser 內建的全螢幕狀態變化監聽器
    this.scale.on('fullscreenchange', () => {
        // 在控制台記錄全螢幕狀態變化，用於調試
        console.log('Fullscreen state changed:', this.scale.isFullscreen)
        // 檢查是否進入全螢幕模式
        if (this.scale.isFullscreen) {
            // 全螢幕模式下延遲 100ms 後強制刷新佈局，解決某些瀏覽器的顯示問題
            setTimeout(() => {
                // 刷新 Phaser 的縮放系統，確保遊戲正確適應全螢幕尺寸
                this.scale.refresh()
                // 記錄佈局刷新完成
                console.log('Fullscreen layout refreshed')
            }, 100)
        }
    })

    // 註冊 F11 鍵作為全螢幕切換的快捷鍵
    let F11Key = this.input.keyboard.addKey('F11')
    // 監聽 F11 鍵按下事件
    F11Key.on('down', () => {
        // 檢查當前是否已在全螢幕模式
        if (this.scale.isFullscreen) {
            // 如果已在全螢幕，則退出全螢幕
            this.scale.stopFullscreen()
            // 記錄退出全螢幕操作
            console.log('Stop fullscreen')
        }
        else {
            // 如果不在全螢幕，則進入全螢幕
            this.scale.startFullscreen()
            // 記錄進入全螢幕操作
            console.log('Start fullscreen')
        }
    })

    // 添加標準的全螢幕 API 事件監聽器（支援不同瀏覽器）
    document.addEventListener('fullscreenchange', exitHandler)        // 標準 API
    document.addEventListener('webkitfullscreenchange', exitHandler)  // WebKit 瀏覽器 (Safari, 舊版 Chrome)
    document.addEventListener('mozfullscreenchange', exitHandler)     // Firefox 瀏覽器
    document.addEventListener('MSFullscreenChange', exitHandler)      // Internet Explorer/Edge

    /**
     * 全螢幕退出處理函數 - 檢測用戶按 ESC 鍵退出全螢幕的情況
     * 這個函數會在各種全螢幕狀態變化時被調用
     */
    function exitHandler() {
        // 檢查所有可能的全螢幕狀態屬性，確保跨瀏覽器兼容性
        if (!document.fullscreenElement &&           // 標準 API
            !document.webkitIsFullScreen &&          // WebKit
            !document.mozFullScreen &&               // Firefox
            !document.msFullscreenElement) {         // IE/Edge
            // 如果所有全螢幕狀態都為 false，表示用戶按了 ESC 鍵退出
            console.log('Catch key escape event')
        }
    }
}

// 導出全螢幕功能函數，供其他模組使用
export {
    fullScreen  // 全螢幕功能初始化函數
}