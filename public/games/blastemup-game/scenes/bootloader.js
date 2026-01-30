class Bootloader extends Phaser.Scene {
  constructor() {
    super({ key: "bootloader" });
  }

  preload() {
    this.createBars();
    this.load.on(
      "progress",
      function (value) {
        this.progressBar.clear();
        this.progressBar.fillStyle(0x88d24c, 1);
        this.progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        );
      },
      this
    );
    this.load.on(
      "complete",
      () => {
        this.scene.start("game");
      },
      this
    );

    // 加載背景音樂
    Array(6)
      .fill(0)
      .forEach((_, i) => {
        this.load.audio(`muzik${i}`, `/games/blastemup-game/assets/sounds/muzik${i}.mp3`);
      });

    // 加載遊戲圖片
    this.load.image("ship1_1", "/games/blastemup-game/assets/images/starship.png");
    this.load.image("foeship", "/games/blastemup-game/assets/images/foeship.png");
    this.load.image("pello", "/games/blastemup-game/assets/images/pello.png");
    this.load.image("hex", "/games/blastemup-game/assets/images/hex64.png");
    this.load.image("asteroid", "/games/blastemup-game/assets/images/asteroid.png");

    // 加載音效
    this.load.audio("splash", "/games/blastemup-game/assets/sounds/splash.mp3");
    this.load.audio("game-over", "/games/blastemup-game/assets/sounds/game-over.mp3");
    this.load.audio("explosion", "/games/blastemup-game/assets/sounds/explosion.mp3");
    this.load.audio("shot", "/games/blastemup-game/assets/sounds/shot.mp3");
    this.load.audio("foeshot", "/games/blastemup-game/assets/sounds/foeshot.mp3");
    this.load.audio("pick", "/games/blastemup-game/assets/sounds/pick.mp3");
    this.load.audio("asteroid", "/games/blastemup-game/assets/sounds/asteroid.mp3");

    // 加載字體
    this.load.bitmapFont(
      "arcade",
      "/games/blastemup-game/assets/fonts/arcade.png",
      "/games/blastemup-game/assets/fonts/arcade.xml"
    );
    this.load.bitmapFont(
      "wendy",
      "/games/blastemup-game/assets/fonts/arcade.png",
      "/games/blastemup-game/assets/fonts/wendy.xml"
    );
    this.load.bitmapFont(
      "starshipped",
      "/games/blastemup-game/assets/fonts/starshipped.png",
      "/games/blastemup-game/assets/fonts/starshipped.xml"
    );

    // 加載精靈表
    this.load.spritesheet("shot", "/games/blastemup-game/assets/images/shot.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("shotfoe", "/games/blastemup-game/assets/images/shotfoe.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("energy", "/games/blastemup-game/assets/images/energy.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {}

  createBars() {
    this.loadBar = this.add.graphics();
    this.loadBar.fillStyle(0x008483, 1);
    this.loadBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      20
    );
    this.progressBar = this.add.graphics();
  }
}

