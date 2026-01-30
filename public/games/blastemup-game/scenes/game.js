class Game extends Phaser.Scene {
  constructor() {
    super({ key: "game" });
  }

  create() {
    this.loadAudios();
    this.addPlayer();
    this.setCamera();
  }

  addPlayer() {
    this.thrust = this.add.layer();
    const x = 600 + Phaser.Math.Between(-100, 100);
    const y = 500 + Phaser.Math.Between(-100, 100);
    this.player = new Player(this, x, y, "Player:" + crypto.randomUUID());
    console.log("Creating player! ", this.player.key);
  }

  setCamera() {
    this.cameras.main.setBackgroundColor(0xcccccc);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05, 0, 100);
  }

  loadAudios() {
    this.audios = {
      pick: this.sound.add("pick"),
      shot: this.sound.add("shot"),
      foeshot: this.sound.add("foeshot"),
      explosion: this.sound.add("explosion"),
      asteroid: this.sound.add("asteroid"),
    };
  }

  playAudio(key) {
    this.audios[key].play({ volume: 0.2 });
  }

  update() {
    // 遊戲更新邏輯
    if (this.player && this.player.death) {
      this.scene.restart();
    }
  }
}

