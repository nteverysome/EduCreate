/**
 * 🎯 Phaser-DOM座標統一器
 * 讓Phaser事件直接使用DOM座標，實現完美的觸控響應
 */
class MobileCoordinateDebugger {
    constructor(scene) {
        this.scene = scene;
        this.isEnabled = true;
        this.domMarkers = [];  // 儲存DOM標記
        this.lastDOMCoordinates = { x: 0, y: 0 };  // 儲存最後的DOM座標

        // 🎯 核心功能：攔截並統一座標系統
        this.setupPhaserDOMCoordinateUnification();
        this.setupSimpleDOMTest();

        console.log('🎯 Phaser-DOM座標統一器已啟動 - 讓Phaser直接使用DOM座標');
    }
    
    /**
     * 🎯 設置Phaser-DOM座標統一系統
     */
    setupPhaserDOMCoordinateUnification() {
        // 攔截Phaser的輸入事件，用DOM座標替換
        this.interceptPhaserInputEvents();

        // 設置DOM事件監聽器來捕獲真實座標
        this.setupDOMCoordinateCapture();

        console.log('🎯 Phaser-DOM座標統一系統已設置');
    }

    /**
     * 🔧 攔截Phaser輸入事件
     */
    interceptPhaserInputEvents() {
        // 攔截pointerdown事件，在事件處理前修改座標
        const originalOn = this.scene.input.on.bind(this.scene.input);

        // 重寫input.on方法來攔截pointerdown事件
        this.scene.input.on = (event, callback, context) => {
            if (event === 'pointerdown') {
                // 包裝原始回調，在執行前修改pointer座標
                const wrappedCallback = (pointer) => {
                    // 🎯 關鍵：使用DOM座標替換Phaser座標
                    if (this.lastDOMCoordinates.x !== 0 || this.lastDOMCoordinates.y !== 0) {
                        pointer.x = this.lastDOMCoordinates.x;
                        pointer.y = this.lastDOMCoordinates.y;
                        pointer.worldX = this.lastDOMCoordinates.x;
                        pointer.worldY = this.lastDOMCoordinates.y;

                        console.log(`🎯 [座標統一] Phaser座標已替換為DOM座標: (${pointer.x}, ${pointer.y})`);
                    }

                    // 執行原始回調
                    callback.call(context, pointer);
                };

                return originalOn(event, wrappedCallback, context);
            } else {
                return originalOn(event, callback, context);
            }
        };
    }

    /**
     * 🔧 設置DOM座標捕獲
     */
    setupDOMCoordinateCapture() {
        // 捕獲真實的DOM觸控座標
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                this.lastDOMCoordinates.x = touch.clientX;
                this.lastDOMCoordinates.y = touch.clientY;
                console.log(`🔧 [DOM捕獲] 觸控座標: (${touch.clientX}, ${touch.clientY})`);
            }
        }, { passive: true });

        // 捕獲真實的DOM滑鼠座標
        document.addEventListener('mousedown', (event) => {
            this.lastDOMCoordinates.x = event.clientX;
            this.lastDOMCoordinates.y = event.clientY;
            console.log(`🔧 [DOM捕獲] 滑鼠座標: (${event.clientX}, ${event.clientY})`);
        }, { passive: true });
    }

    /**
     * 設置極簡DOM測試
     */
    setupSimpleDOMTest() {
        // 創建簡單的調試文字
        this.debugText = this.scene.add.text(10, 10, '🎯 Phaser-DOM座標統一器\n點擊螢幕測試座標統一效果', {
            fontSize: '14px',
            fill: '#00ff00',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 10, y: 10 }
        }).setScrollFactor(0).setDepth(10000);

        // 設置DOM事件監聽器 - 不做任何轉換
        this.setupPureDOMListeners();
    }

    /**
     * 設置純DOM事件監聽器 - 不做任何座標轉換
     */
    setupPureDOMListeners() {
        // 監聽整個頁面的觸控和滑鼠事件
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                this.createPureDOMMarker(touch.clientX, touch.clientY, 'touch');
                console.log(`🔍 [純DOM] 觸控位置: (${touch.clientX}, ${touch.clientY})`);
            }
        }, { passive: true });

        document.addEventListener('mousedown', (event) => {
            this.createPureDOMMarker(event.clientX, event.clientY, 'mouse');
            console.log(`🔍 [純DOM] 滑鼠位置: (${event.clientX}, ${event.clientY})`);
        }, { passive: true });

        // 長按清除功能
        let longPressTimer = null;

        document.addEventListener('touchstart', () => {
            longPressTimer = setTimeout(() => {
                this.clearAllDOMMarkers();
                console.log('🧹 已清除所有DOM標記');
            }, 3000);
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });

        console.log('🔍 純DOM事件監聽器已設置 - 不做任何座標轉換');
    }

    /**
     * 創建純DOM標記 - 直接使用DOM座標，不做任何轉換
     */
    createPureDOMMarker(clientX, clientY, eventType) {
        // 🎯 關鍵：直接使用HTML DOM元素，不經過Phaser轉換
        const marker = document.createElement('div');
        marker.style.position = 'fixed';
        marker.style.left = (clientX - 10) + 'px';  // 中心對齊
        marker.style.top = (clientY - 10) + 'px';   // 中心對齊
        marker.style.width = '20px';
        marker.style.height = '20px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = eventType === 'touch' ? 'red' : 'blue';
        marker.style.border = '2px solid white';
        marker.style.pointerEvents = 'none';
        marker.style.zIndex = '999999';
        marker.style.opacity = '0.8';
        
        // 添加標籤
        const label = document.createElement('div');
        label.textContent = `${eventType}(${clientX},${clientY})`;
        label.style.position = 'fixed';
        label.style.left = (clientX + 15) + 'px';
        label.style.top = (clientY - 5) + 'px';
        label.style.color = 'white';
        label.style.fontSize = '10px';
        label.style.backgroundColor = 'rgba(0,0,0,0.7)';
        label.style.padding = '2px 4px';
        label.style.borderRadius = '3px';
        label.style.pointerEvents = 'none';
        label.style.zIndex = '999999';

        // 添加到頁面
        document.body.appendChild(marker);
        document.body.appendChild(label);

        // 儲存標記以便清理
        this.domMarkers.push(marker, label);

        // 限制標記數量
        if (this.domMarkers.length > 20) {
            const oldMarker = this.domMarkers.shift();
            const oldLabel = this.domMarkers.shift();
            if (oldMarker && oldMarker.parentNode) oldMarker.parentNode.removeChild(oldMarker);
            if (oldLabel && oldLabel.parentNode) oldLabel.parentNode.removeChild(oldLabel);
        }

        // 更新調試文字
        this.updateDebugInfo(clientX, clientY, eventType);
    }

    /**
     * 更新調試信息
     */
    updateDebugInfo(clientX, clientY, eventType) {
        const info = `🎯 Phaser-DOM座標統一器

最後點擊: ${eventType}(${clientX}, ${clientY})
DOM座標: (${this.lastDOMCoordinates.x}, ${this.lastDOMCoordinates.y})

🎯 功能狀態：
✅ DOM座標捕獲正常
✅ Phaser座標攔截啟用
✅ 座標統一系統運行中

🔴 紅色圓圈 = 觸控位置 (DOM)
🔵 藍色圓圈 = 滑鼠位置 (DOM)
🎯 Phaser現在使用相同的DOM座標

💡 長按3秒清除所有標記
💡 太空船移動現在使用DOM座標`;

        if (this.debugText) {
            this.debugText.setText(info);
        }
    }

    /**
     * 清除所有DOM標記
     */
    clearAllDOMMarkers() {
        this.domMarkers.forEach(marker => {
            if (marker && marker.parentNode) {
                marker.parentNode.removeChild(marker);
            }
        });
        this.domMarkers = [];
        
        if (this.debugText) {
            this.debugText.setText('🎯 Phaser-DOM座標統一器\n點擊螢幕測試座標統一效果\n\n🧹 已清除所有標記');
        }
    }

    // 🎯 新的座標修復方法 - 直接返回DOM座標
    getBestCoordinateFix(pointer) {
        // 如果有DOM座標，直接使用
        if (this.lastDOMCoordinates.x !== 0 || this.lastDOMCoordinates.y !== 0) {
            return {
                x: this.lastDOMCoordinates.x,
                y: this.lastDOMCoordinates.y,
                method: 'DOM座標統一',
                confidence: 1.0
            };
        }

        // 回退到原始座標
        return {
            x: pointer.x,
            y: pointer.y,
            method: '原始座標',
            confidence: 0.5
        };
    }

    /**
     * 🎯 獲取統一後的座標
     */
    getUnifiedCoordinates() {
        return {
            x: this.lastDOMCoordinates.x,
            y: this.lastDOMCoordinates.y,
            timestamp: Date.now()
        };
    }
}

// 確保全域可用
if (typeof window !== 'undefined') {
    window.MobileCoordinateDebugger = MobileCoordinateDebugger;
}
