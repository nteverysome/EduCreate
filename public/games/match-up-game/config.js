// Phaser 3 遊戲配置
const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    backgroundColor: '#FFFFFF', // 白色背景（Classic 主題）
    scene: [PreloadScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// 啟動遊戲
const game = new Phaser.Game(config);

