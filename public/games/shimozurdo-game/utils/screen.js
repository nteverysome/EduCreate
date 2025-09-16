function fullScreen() {
    this.scale.fullscreenTarget = document.getElementById('game')

    // 添加全螢幕狀態變化監聽
    this.scale.on('fullscreenchange', () => {
        console.log('Fullscreen state changed:', this.scale.isFullscreen)
        if (this.scale.isFullscreen) {
            // 全螢幕模式下強制刷新
            setTimeout(() => {
                this.scale.refresh()
                console.log('Fullscreen layout refreshed')
            }, 100)
        }
    })

    let F11Key = this.input.keyboard.addKey('F11')
    F11Key.on('down', () => {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen()
            console.log('Stop fullscreen')
        }
        else {
            this.scale.startFullscreen()
            console.log('Start fullscreen')
        }
    })

    document.addEventListener('fullscreenchange', exitHandler)
    document.addEventListener('webkitfullscreenchange', exitHandler)
    document.addEventListener('mozfullscreenchange', exitHandler)
    document.addEventListener('MSFullscreenChange', exitHandler)

    function exitHandler() {
        if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
            console.log('Catch key escape event')
        }
    }
}

export {
    fullScreen
}