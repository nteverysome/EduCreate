import Phaser from 'phaser';
import { INPUT_KEYS, GAME_EVENTS } from '../config/gameConfig';

export interface InputState {
  movement: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  actions: {
    fire: boolean;
    restart: boolean;
  };
  planeSelection: {
    [key: string]: boolean;
  };
}

export class InputManager {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};
  private inputState: InputState;
  private eventEmitter: Phaser.Events.EventEmitter;
  
  // 輸入緩衝和防抖
  private inputBuffer: Map<string, number> = new Map();
  private debounceDelay: number = 100; // 100ms 防抖延遲
  
  // 組合鍵支援
  private keyComboBuffer: string[] = [];
  private comboTimeout: number = 1000; // 1秒組合鍵超時

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.eventEmitter = new Phaser.Events.EventEmitter();
    
    this.inputState = {
      movement: { up: false, down: false, left: false, right: false },
      actions: { fire: false, restart: false },
      planeSelection: {}
    };
    
    this.setupKeyboard();
    this.setupMouse();
    this.setupGamepad();
  }

  private setupKeyboard() {
    if (!this.scene.input.keyboard) return;
    
    // 設置方向鍵
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    
    // 設置動作鍵
    this.keys.fire = this.scene.input.keyboard.addKey(INPUT_KEYS.FIRE);
    this.keys.restart = this.scene.input.keyboard.addKey(INPUT_KEYS.RESTART);
    
    // 設置飛機選擇鍵 (1-7)
    for (let i = 1; i <= 7; i++) {
      const keyName = `PLANE_${i}`;
      this.keys[keyName] = this.scene.input.keyboard.addKey(`DIGIT${i}`);
    }
    
    // 設置 WASD 作為替代移動鍵
    this.keys.w = this.scene.input.keyboard.addKey('W');
    this.keys.a = this.scene.input.keyboard.addKey('A');
    this.keys.s = this.scene.input.keyboard.addKey('S');
    this.keys.d = this.scene.input.keyboard.addKey('D');
    
    // 設置事件監聽
    this.setupKeyboardEvents();
  }

  private setupKeyboardEvents() {
    // 飛機選擇事件
    for (let i = 1; i <= 7; i++) {
      const keyName = `PLANE_${i}`;
      if (this.keys[keyName]) {
        this.keys[keyName].on('down', () => {
          if (this.canProcessInput(keyName)) {
            this.eventEmitter.emit(GAME_EVENTS.PLANE_SELECTED, i - 1);
            this.recordInput(keyName);
          }
        });
      }
    }
    
    // 重新開始事件
    this.keys.restart?.on('down', () => {
      if (this.canProcessInput('restart')) {
        this.eventEmitter.emit('restart-game');
        this.recordInput('restart');
      }
    });
    
    // 組合鍵檢測
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyCombo(event.code);
    });
  }

  private setupMouse() {
    // 滑鼠點擊射擊
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.inputState.actions.fire = true;
        this.eventEmitter.emit('fire-weapon');
      }
    });
    
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) {
        this.inputState.actions.fire = false;
      }
    });
    
    // 滑鼠移動控制 (可選)
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.eventEmitter.emit('mouse-move', {
          x: pointer.x,
          y: pointer.y,
          worldX: pointer.worldX,
          worldY: pointer.worldY
        });
      }
    });
  }

  private setupGamepad() {
    // 遊戲手把支援
    this.scene.input.gamepad?.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      console.log(`🎮 遊戲手把已連接: ${pad.id}`);
      this.setupGamepadControls(pad);
    });
  }

  private setupGamepadControls(pad: Phaser.Input.Gamepad.Gamepad) {
    // 左搖桿移動
    pad.on('down', (index: number, _value: number, _button: Phaser.Input.Gamepad.Button) => {
      switch (index) {
        case 0: // A 按鈕 - 射擊
          this.inputState.actions.fire = true;
          this.eventEmitter.emit('fire-weapon');
          break;
        case 1: // B 按鈕 - 特殊能力
          this.eventEmitter.emit('special-ability');
          break;
        case 9: // Start 按鈕 - 重新開始
          this.eventEmitter.emit('restart-game');
          break;
      }
    });
    
    pad.on('up', (index: number, _value: number, _button: Phaser.Input.Gamepad.Button) => {
      switch (index) {
        case 0: // A 按鈕釋放
          this.inputState.actions.fire = false;
          break;
      }
    });
  }

  public update() {
    this.updateMovementState();
    this.updateActionState();
    this.cleanupInputBuffer();
  }

  private updateMovementState() {
    // 更新移動狀態 (方向鍵 + WASD)
    this.inputState.movement.up = this.cursors.up.isDown || this.keys.w?.isDown || false;
    this.inputState.movement.down = this.cursors.down.isDown || this.keys.s?.isDown || false;
    this.inputState.movement.left = this.cursors.left.isDown || this.keys.a?.isDown || false;
    this.inputState.movement.right = this.cursors.right.isDown || this.keys.d?.isDown || false;
    
    // 遊戲手把搖桿支援
    const gamepad = this.scene.input.gamepad?.getPad(0);
    if (gamepad) {
      const leftStick = gamepad.leftStick;
      if (leftStick.x < -0.5) this.inputState.movement.left = true;
      if (leftStick.x > 0.5) this.inputState.movement.right = true;
      if (leftStick.y < -0.5) this.inputState.movement.up = true;
      if (leftStick.y > 0.5) this.inputState.movement.down = true;
    }
  }

  private updateActionState() {
    this.inputState.actions.fire = this.keys.fire?.isDown || false;
    this.inputState.actions.restart = this.keys.restart?.isDown || false;
  }

  private canProcessInput(inputKey: string): boolean {
    const now = Date.now();
    const lastInput = this.inputBuffer.get(inputKey) || 0;
    return (now - lastInput) > this.debounceDelay;
  }

  private recordInput(inputKey: string) {
    this.inputBuffer.set(inputKey, Date.now());
  }

  private cleanupInputBuffer() {
    const now = Date.now();
    for (const [key, timestamp] of this.inputBuffer.entries()) {
      if (now - timestamp > this.debounceDelay * 10) {
        this.inputBuffer.delete(key);
      }
    }
  }

  private handleKeyCombo(keyCode: string) {
    this.keyComboBuffer.push(keyCode);
    
    // 檢查特殊組合鍵
    this.checkSpecialCombos();
    
    // 清理過期的組合鍵緩衝
    this.scene.time.delayedCall(this.comboTimeout, () => {
      this.keyComboBuffer = [];
    });
  }

  private checkSpecialCombos() {
    const combo = this.keyComboBuffer.join('-');
    
    // 定義特殊組合鍵
    const combos = {
      'KeyG-KeyO-KeyD': 'god-mode',           // G-O-D: 無敵模式
      'KeyF-KeyA-KeyS-KeyT': 'fast-mode',     // F-A-S-T: 快速模式
      'KeyS-KeyL-KeyO-KeyW': 'slow-mode',     // S-L-O-W: 慢動作模式
    };
    
    for (const [comboKey, eventName] of Object.entries(combos)) {
      if (combo.includes(comboKey)) {
        this.eventEmitter.emit(`cheat-${eventName}`);
        this.keyComboBuffer = [];
        break;
      }
    }
  }

  // 公共方法
  public getInputState(): InputState {
    return { ...this.inputState };
  }

  public getMovementVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    
    if (this.inputState.movement.left) x -= 1;
    if (this.inputState.movement.right) x += 1;
    if (this.inputState.movement.up) y -= 1;
    if (this.inputState.movement.down) y += 1;
    
    // 正規化對角線移動
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }
    
    return { x, y };
  }

  public isActionPressed(action: 'fire' | 'restart'): boolean {
    return this.inputState.actions[action];
  }

  public on(event: string, callback: Function, context?: any): void {
    this.eventEmitter.on(event, callback, context);
  }

  public off(event: string, callback?: Function, context?: any): void {
    this.eventEmitter.off(event, callback, context);
  }

  public destroy(): void {
    this.eventEmitter.removeAllListeners();
    this.inputBuffer.clear();
    this.keyComboBuffer = [];
  }
}
