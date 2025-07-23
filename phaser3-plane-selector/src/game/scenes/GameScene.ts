import Phaser from 'phaser';
import { SCENE_KEYS, GAME_CONFIG } from '../config/gameConfig';
import { PlaneConfig } from '../../types/planes';
import { InputManager } from '../systems/InputManager';
import { PlaneManager } from '../../planes/PlaneManager';
import { GameHUD } from '../../ui/GameHUD';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private enemies!: Phaser.GameObjects.Group;
  private bullets!: Phaser.GameObjects.Group;
  private inputManager!: InputManager;
  private planeManager!: PlaneManager;
  private gameHUD!: GameHUD;

  // 月球視差背景層
  private backgroundLayers!: {
    sky: Phaser.GameObjects.TileSprite;
    earth: Phaser.GameObjects.TileSprite;
    back: Phaser.GameObjects.TileSprite;
    mid: Phaser.GameObjects.TileSprite;
    front: Phaser.GameObjects.TileSprite;
    floor: Phaser.GameObjects.TileSprite;
  };

  private score: number = 0;
  private gameOver: boolean = false;
  private bulletTime: number = 0;
  private enemyTimer!: Phaser.Time.TimerEvent;
  private playerHealth: number = 100;

  private selectedPlane!: PlaneConfig;

  constructor() {
    super({ key: SCENE_KEYS.GAME });
  }

  init() {
    console.log('🎮 GameScene: 初始化遊戲場景');
    // 直接使用射手配置，不再需要飛機選擇
    this.selectedPlane = {
      id: 'shooter',
      name: 'Shooter',
      displayName: '射手',
      description: '高科技射手，火力強大',
      type: 'shooter',
      speed: 350,
      fireRate: 180,
      health: 120,
      damage: 35,
      scale: 1.0,
      color: '#ffffff'
    };

    console.log(`🎯 使用射手: ${this.selectedPlane.displayName}`);
  }

  create() {
    const { width, height } = this.cameras.main;

    // 初始化管理器
    this.planeManager = PlaneManager.getInstance(this);
    this.inputManager = new InputManager(this);

    // 創建視差背景
    this.createParallaxBackground();

    // 創建玩家飛機
    this.createPlayer();

    // 創建遊戲物件群組
    this.createGroups();

    // 創建現代化 HUD
    this.createGameHUD();

    // 設置輸入控制
    this.setupInput();

    // 設置物理碰撞
    this.setupPhysics();

    // 開始敵機生成
    this.startEnemySpawning();

    console.log('🎯 遊戲場景創建完成');
  }

  update(time: number, _delta: number) {
    if (this.gameOver) return;

    // 更新視差背景
    this.updateParallaxBackground();

    // 更新輸入管理器
    this.inputManager.update();

    // 玩家移動
    this.handlePlayerMovement();

    // 處理射擊
    this.handleShooting(time);

    // 清理超出邊界的物件
    this.cleanupObjects();
  }

  private createPlayer() {
    const { height } = this.cameras.main;

    // 使用PlaneManager創建單精靈射手
    this.player = this.planeManager.createPlaneSprite(this, this.selectedPlane);
    this.player.setPosition(GAME_CONFIG.PLAYER.START_X, height / 2);

    // 播放射手動畫
    const animKey = `shooter-${this.selectedPlane.id}`;
    if (this.anims.exists(animKey)) {
      this.player.play(animKey);
    }

    console.log(`🎯 創建射手: ${this.selectedPlane.displayName}`);

    // 啟用物理
    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);
    playerBody.setDrag(GAME_CONFIG.PLAYER.DRAG);
    playerBody.setMaxVelocity(this.selectedPlane.speed);
  }

  private createGroups() {
    // 創建子彈群組
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet-placeholder',
      maxSize: GAME_CONFIG.BULLET.MAX_BULLETS
    });
    
    // 創建雲朵敵人群組
    this.enemies = this.physics.add.group({
      defaultKey: 'cloud-enemy'
    });
  }

  private createGameHUD() {
    this.gameHUD = new GameHUD({
      scene: this,
      selectedPlane: this.selectedPlane
    });

    this.playerHealth = this.selectedPlane.health;
  }

  private setupInput() {
    // 設置輸入管理器事件監聽
    this.inputManager.on('restart-game', () => {
      if (this.gameOver) {
        this.restartGame();
      }
    });

    this.inputManager.on('fire-weapon', () => {
      // 射擊邏輯將在 update 中處理
    });
  }

  private setupPhysics() {
    // 子彈與敵機碰撞
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      this.hitEnemy(bullet as Phaser.GameObjects.Image, enemy as Phaser.GameObjects.Image);
    });
    
    // 玩家與敵機碰撞
    this.physics.add.overlap(this.player, this.enemies, (_player, enemy) => {
      this.hitPlayer(enemy as Phaser.GameObjects.Image);
    });
  }

  private startEnemySpawning() {
    this.enemyTimer = this.time.addEvent({
      delay: GAME_CONFIG.ENEMY.SPAWN_RATE,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  private handlePlayerMovement() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const movement = this.inputManager.getMovementVector();

    // 設置加速度
    playerBody.setAcceleration(
      movement.x * GAME_CONFIG.PLAYER.ACCELERATION,
      movement.y * GAME_CONFIG.PLAYER.ACCELERATION
    );
  }

  private handleShooting(time: number) {
    if (this.inputManager.isActionPressed('fire') && time > this.bulletTime) {
      this.fireBullet();
      this.bulletTime = time + this.selectedPlane.fireRate;
    }
  }

  private fireBullet() {
    const bullet = this.bullets.get(this.player.x + 30, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
      bulletBody.setVelocityX(GAME_CONFIG.BULLET.SPEED);
    }
  }

  private spawnEnemy() {
    const y = Phaser.Math.Between(GAME_CONFIG.ENEMY.MIN_Y, GAME_CONFIG.ENEMY.MAX_Y);

    const enemy = this.enemies.create(GAME_CONFIG.ENEMY.SPAWN_X, y, 'cloud-enemy');
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;

    // 設置雲朵敵人的大小和外觀
    enemy.setScale(0.8); // 適中的雲朵大小
    enemy.setTint(0xffffff); // 保持白色

    const speed = Phaser.Math.Between(GAME_CONFIG.ENEMY.MIN_SPEED, GAME_CONFIG.ENEMY.MAX_SPEED);
    enemyBody.setVelocityX(-speed);

    console.log('☁️ 生成雲朵敵人');
  }

  private hitEnemy(bullet: Phaser.GameObjects.Image, enemy: Phaser.GameObjects.Image) {
    // 移除子彈和雲朵敵人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    // 增加分數
    this.score += 10;
    this.gameHUD.updateScore(this.score);

    console.log(`💥 擊散雲朵！分數: ${this.score}`);
  }

  private hitPlayer(enemy: Phaser.GameObjects.Image) {
    console.log('💥 玩家被擊中！');

    enemy.destroy();

    // 減少生命值
    this.playerHealth -= 20;
    this.gameHUD.updateHealth(this.playerHealth);

    // 檢查是否遊戲結束
    if (this.playerHealth <= 0) {
      this.gameOver = true;
      this.enemyTimer.destroy();
      this.showGameOver();
    } else {
      // 顯示受傷訊息
      this.gameHUD.showMessage('受到傷害！', 1000);
    }
  }

  private showGameOver() {
    const { width, height } = this.cameras.main;
    
    // 半透明背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    
    // 遊戲結束文字
    this.add.text(width / 2, height / 2 - 50, '遊戲結束', {
      fontSize: '48px',
      color: '#e74c3c',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 最終分數
    this.add.text(width / 2, height / 2, `最終分數: ${this.score}`, {
      fontSize: '24px',
      color: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 重新開始提示
    this.add.text(width / 2, height / 2 + 50, '按 R 鍵重新開始', {
      fontSize: '18px',
      color: '#3498db',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  private cleanupObjects() {
    const { width } = this.cameras.main;

    // 清理超出邊界的子彈
    this.bullets.children.entries.forEach((bullet) => {
      const bulletSprite = bullet as Phaser.GameObjects.Image;
      if (bulletSprite.x > width + 50) {
        bulletSprite.setActive(false);
        bulletSprite.setVisible(false);
      }
    });

    // 清理超出邊界的敵機
    this.enemies.children.entries.forEach((enemy) => {
      const enemySprite = enemy as Phaser.GameObjects.Image;
      if (enemySprite.x < -50) {
        enemySprite.destroy();
      }
    });
  }

  private restartGame() {
    console.log('🔄 重新開始遊戲');
    this.scene.restart();
  }

  private createParallaxBackground() {
    const { width, height } = this.cameras.main;

    console.log('🌙 創建月球視差背景');

    // 創建月球視差背景層（從後到前）
    this.backgroundLayers = {
      sky: this.add.tileSprite(0, 0, width, height, 'moon-sky').setOrigin(0, 0),
      earth: this.add.tileSprite(0, 0, width, height, 'moon-earth').setOrigin(0, 0),
      back: this.add.tileSprite(0, 0, width, height, 'moon-back').setOrigin(0, 0),
      mid: this.add.tileSprite(0, 0, width, height, 'moon-mid').setOrigin(0, 0),
      front: this.add.tileSprite(0, 0, width, height, 'moon-front').setOrigin(0, 0),
      floor: this.add.tileSprite(0, 0, width, height, 'moon-floor').setOrigin(0, 0)
    };

    // 設置深度層級（確保背景在最後面）
    this.backgroundLayers.sky.setDepth(-100);
    this.backgroundLayers.earth.setDepth(-95);
    this.backgroundLayers.back.setDepth(-90);
    this.backgroundLayers.mid.setDepth(-85);
    this.backgroundLayers.front.setDepth(-80);
    this.backgroundLayers.floor.setDepth(-75);

    // 確保地球層可見 - 使用更強的設置
    this.backgroundLayers.earth.setAlpha(1.0);
    this.backgroundLayers.earth.setVisible(true);
    this.backgroundLayers.earth.setTint(0xffffff); // 確保沒有色調影響
    this.backgroundLayers.earth.setScrollFactor(0.1); // 設置視差滾動因子

    console.log('🌍 地球層設置: 可見度=', this.backgroundLayers.earth.visible, ', 透明度=', this.backgroundLayers.earth.alpha);

    // 額外的地球層調試信息
    console.log('🔍 地球層詳細信息:', {
      textureKey: this.backgroundLayers.earth.texture.key,
      width: this.backgroundLayers.earth.width,
      height: this.backgroundLayers.earth.height,
      x: this.backgroundLayers.earth.x,
      y: this.backgroundLayers.earth.y,
      depth: this.backgroundLayers.earth.depth,
      tileScaleX: this.backgroundLayers.earth.tileScaleX,
      tileScaleY: this.backgroundLayers.earth.tileScaleY
    });

    console.log('✅ 月球視差背景創建完成');
  }

  private updateParallaxBackground() {
    if (!this.backgroundLayers) return;

    // 月球視差效果：不同層以不同速度移動
    this.backgroundLayers.sky.tilePositionX += 0.05;     // 太空天空最慢
    this.backgroundLayers.earth.tilePositionX += 0.2;    // 地球 - 調整為較慢速度
    this.backgroundLayers.back.tilePositionX += 0.3;     // 遠景月球地形
    this.backgroundLayers.mid.tilePositionX += 0.5;      // 中景月球地形
    this.backgroundLayers.front.tilePositionX += 0.7;    // 前景月球地形
    this.backgroundLayers.floor.tilePositionX += 1.0;    // 月球地面最快
  }
}
