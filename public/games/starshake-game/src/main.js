import Phaser from "phaser";
import Bootloader from "./scenes/bootloader";
import Outro from "./scenes/outro";
import Splash from "./scenes/splash";
import Transition from "./scenes/transition";
import Game from "./scenes/game";

const config = {
  width: 1000,
  height: 800,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  autoRound: false,
  parent: "game-container", // 修改為正確的容器 ID
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [Bootloader, Splash, Transition, Game, Outro],
};

// 確保 DOM 載入完成後再初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    const game = new Phaser.Game(config);
    console.log('🎮 Starshake 遊戲已載入');
  } else {
    console.error('❌ 找不到遊戲容器 #game-container');
  }
});
