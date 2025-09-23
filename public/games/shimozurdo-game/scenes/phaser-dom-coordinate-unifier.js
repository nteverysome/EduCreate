/**
 * 🎯 Phaser-DOM座標統一器 (進階版)
 * 在Phaser輸入系統底層攔截並統一座標系統
 * 確保Phaser事件使用的座標與DOM事件完全一致
 */
class PhaserDOMCoordinateUnifier {
    constructor(scene) {
        this.scene = scene;
        this.isActive = true;
        this.domCoordinates = { x: 0, y: 0 };
        this.interceptedEvents = 0;
        
        // 🎯 核心功能：深度攔截Phaser輸入系統
        this.interceptPhaserInputSystem();
        this.setupDOMCoordinateTracking();
        
        console.log('🎯 Phaser-DOM座標統一器 (進階版) 已啟動');
    }

    /**
     * 🔧 深度攔截Phaser輸入系統
     */
    interceptPhaserInputSystem() {
        const inputManager = this.scene.input;
        
        // 方法1: 攔截InputManager的事件分發
        this.interceptInputManagerEvents(inputManager);
        
        // 方法2: 攔截Pointer對象的座標屬性
        this.interceptPointerCoordinates();
        
        // 方法3: 攔截Canvas事件監聽器
        this.interceptCanvasEventListeners();
    }

    /**
     * 🔧 攔截InputManager事件分發
     */
    interceptInputManagerEvents(inputManager) {
        // 保存原始的emit方法
        const originalEmit = inputManager.emit.bind(inputManager);
        
        // 重寫emit方法
        inputManager.emit = (event, ...args) => {
            if (event === 'pointerdown' || event === 'pointermove' || event === 'pointerup') {
                const pointer = args[0];
                if (pointer && this.domCoordinates.x !== 0) {
                    // 🎯 關鍵：在事件分發前替換座標
                    this.unifyPointerCoordinates(pointer);
                    this.interceptedEvents++;
                    console.log(`🎯 [深度攔截] ${event} 座標已統一: (${pointer.x}, ${pointer.y})`);
                }
            }
            
            return originalEmit(event, ...args);
        };
    }

    /**
     * 🔧 攔截Pointer對象座標屬性
     */
    interceptPointerCoordinates() {
        // 在每次更新時檢查並修正pointer座標
        this.scene.events.on('preupdate', () => {
            if (this.scene.input.activePointer && this.domCoordinates.x !== 0) {
                this.unifyPointerCoordinates(this.scene.input.activePointer);
            }
        });
    }

    /**
     * 🔧 攔截Canvas事件監聽器
     */
    interceptCanvasEventListeners() {
        const canvas = this.scene.sys.game.canvas;
        
        // 攔截原生事件，在Phaser處理前先統一座標
        const eventTypes = ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'];
        
        eventTypes.forEach(eventType => {
            canvas.addEventListener(eventType, (event) => {
                // 更新DOM座標
                this.updateDOMCoordinatesFromEvent(event);
            }, { capture: true, passive: true });
        });
    }

    /**
     * 🔧 統一Pointer座標
     */
    unifyPointerCoordinates(pointer) {
        if (!pointer || this.domCoordinates.x === 0) return;
        
        // 直接設置pointer的所有座標屬性
        pointer.x = this.domCoordinates.x;
        pointer.y = this.domCoordinates.y;
        pointer.worldX = this.domCoordinates.x;
        pointer.worldY = this.domCoordinates.y;
        
        // 如果有downX/downY屬性也要更新
        if (pointer.downX !== undefined) {
            pointer.downX = this.domCoordinates.x;
            pointer.downY = this.domCoordinates.y;
        }
        
        // 如果有upX/upY屬性也要更新
        if (pointer.upX !== undefined) {
            pointer.upX = this.domCoordinates.x;
            pointer.upY = this.domCoordinates.y;
        }
    }

    /**
     * 🔧 設置DOM座標追蹤
     */
    setupDOMCoordinateTracking() {
        // 追蹤觸控事件
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                this.domCoordinates.x = touch.clientX;
                this.domCoordinates.y = touch.clientY;
                console.log(`🔧 [DOM追蹤] 觸控: (${touch.clientX}, ${touch.clientY})`);
            }
        }, { passive: true });

        document.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                this.domCoordinates.x = touch.clientX;
                this.domCoordinates.y = touch.clientY;
            }
        }, { passive: true });

        // 追蹤滑鼠事件
        document.addEventListener('mousedown', (event) => {
            this.domCoordinates.x = event.clientX;
            this.domCoordinates.y = event.clientY;
            console.log(`🔧 [DOM追蹤] 滑鼠: (${event.clientX}, ${event.clientY})`);
        }, { passive: true });

        document.addEventListener('mousemove', (event) => {
            this.domCoordinates.x = event.clientX;
            this.domCoordinates.y = event.clientY;
        }, { passive: true });
    }

    /**
     * 🔧 從事件更新DOM座標
     */
    updateDOMCoordinatesFromEvent(event) {
        if (event.type.startsWith('touch')) {
            if (event.touches && event.touches.length > 0) {
                this.domCoordinates.x = event.touches[0].clientX;
                this.domCoordinates.y = event.touches[0].clientY;
            }
        } else if (event.type.startsWith('mouse')) {
            this.domCoordinates.x = event.clientX;
            this.domCoordinates.y = event.clientY;
        }
    }

    /**
     * 🎯 獲取當前統一座標
     */
    getUnifiedCoordinates() {
        return {
            x: this.domCoordinates.x,
            y: this.domCoordinates.y,
            interceptedEvents: this.interceptedEvents,
            isActive: this.isActive
        };
    }

    /**
     * 🔧 啟用/停用座標統一
     */
    setActive(active) {
        this.isActive = active;
        console.log(`🎯 座標統一器 ${active ? '已啟用' : '已停用'}`);
    }

    /**
     * 🔧 重置統計
     */
    resetStats() {
        this.interceptedEvents = 0;
        console.log('🔧 統計已重置');
    }

    /**
     * 🔧 獲取調試信息
     */
    getDebugInfo() {
        return {
            domCoordinates: this.domCoordinates,
            interceptedEvents: this.interceptedEvents,
            isActive: this.isActive,
            phaserPointer: this.scene.input.activePointer ? {
                x: this.scene.input.activePointer.x,
                y: this.scene.input.activePointer.y,
                worldX: this.scene.input.activePointer.worldX,
                worldY: this.scene.input.activePointer.worldY
            } : null
        };
    }
}

// 確保全域可用
if (typeof window !== 'undefined') {
    window.PhaserDOMCoordinateUnifier = PhaserDOMCoordinateUnifier;
}
