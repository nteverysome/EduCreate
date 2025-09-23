/**
 * 📱 手機座標修復器 - 專門解決手機設備的座標偏移問題
 * 針對手機設備的特殊情況進行座標修復和統一
 */
class MobileCoordinateDebugger {
    constructor(scene) {
        this.scene = scene;
        this.isEnabled = true;
        this.domMarkers = [];  // 儲存DOM標記
        this.lastDOMCoordinates = { x: 0, y: 0 };  // 儲存最後的DOM座標

        // 📱 手機設備檢測
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.deviceInfo = this.getDeviceInfo();

        console.log('📱 手機設備檢測:', this.deviceInfo);

        // 🎯 核心功能：手機專用座標修復系統
        this.setupMobileCoordinateFix();
        this.setupSimpleDOMTest();

        console.log('📱 手機座標修復器已啟動 - 專門處理手機設備座標問題');
    }

    /**
     * 📱 獲取設備信息
     */
    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            devicePixelRatio: window.devicePixelRatio || 1,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            userAgent: navigator.userAgent,
            isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
            isAndroid: /Android/i.test(navigator.userAgent)
        };
    }
    
    /**
     * 📱 設置手機專用座標修復系統
     */
    setupMobileCoordinateFix() {
        if (!this.isMobile) {
            console.log('💻 非手機設備，跳過手機座標修復');
            return;
        }

        // 攔截Phaser的輸入事件，用修復後的座標替換
        this.interceptPhaserInputEvents();

        // 設置DOM事件監聽器來捕獲真實座標
        this.setupDOMCoordinateCapture();

        // 設置手機專用座標修復算法
        this.setupMobileCoordinateAlgorithms();

        console.log('📱 手機專用座標修復系統已設置');
    }

    /**
     * 📱 設置手機專用座標修復算法
     */
    setupMobileCoordinateAlgorithms() {
        // 計算各種修復參數
        this.calculateMobileFixParameters();

        // 設置動態修復監聽器
        this.setupDynamicFixListeners();

        console.log('📱 手機座標修復算法已設置');
    }

    /**
     * 📱 計算手機修復參數
     */
    calculateMobileFixParameters() {
        const canvas = this.scene.sys.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();

        this.mobileFixParams = {
            // Canvas相關參數
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            canvasClientWidth: canvasRect.width,
            canvasClientHeight: canvasRect.height,
            canvasLeft: canvasRect.left,
            canvasTop: canvasRect.top,

            // 設備相關參數
            devicePixelRatio: this.deviceInfo.devicePixelRatio,
            scaleX: canvasRect.width / canvas.width,
            scaleY: canvasRect.height / canvas.height,

            // 視窗相關參數
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            scrollX: window.scrollX || window.pageXOffset || 0,
            scrollY: window.scrollY || window.pageYOffset || 0
        };

        console.log('📱 手機修復參數:', this.mobileFixParams);
    }

    /**
     * 📱 設置動態修復監聽器
     */
    setupDynamicFixListeners() {
        // 監聽視窗大小變化
        window.addEventListener('resize', () => {
            this.calculateMobileFixParameters();
            console.log('📱 視窗大小變化，重新計算修復參數');
        });

        // 監聽方向變化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.calculateMobileFixParameters();
                console.log('📱 設備方向變化，重新計算修復參數');
            }, 100);
        });

        // 監聽滾動變化
        window.addEventListener('scroll', () => {
            this.mobileFixParams.scrollX = window.scrollX || window.pageXOffset || 0;
            this.mobileFixParams.scrollY = window.scrollY || window.pageYOffset || 0;
        });
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
     * � 設置DOM座標捕獲（手機專用）
     */
    setupDOMCoordinateCapture() {
        // 📱 捕獲真實的DOM觸控座標（手機專用處理）
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];

                // 🎯 手機專用座標修復
                const fixedCoords = this.applyMobileCoordinateFix(touch.clientX, touch.clientY);

                this.lastDOMCoordinates.x = fixedCoords.x;
                this.lastDOMCoordinates.y = fixedCoords.y;

                console.log(`� [觸控捕獲] 原始: (${touch.clientX}, ${touch.clientY}) → 修復: (${fixedCoords.x}, ${fixedCoords.y})`);

                // 創建視覺標記
                this.createDOMMarker(fixedCoords.x, fixedCoords.y, 'touch');
            }
        }, { passive: true });

        // 📱 捕獲真實的DOM滑鼠座標（用於桌面測試）
        document.addEventListener('mousedown', (event) => {
            const fixedCoords = this.applyMobileCoordinateFix(event.clientX, event.clientY);

            this.lastDOMCoordinates.x = fixedCoords.x;
            this.lastDOMCoordinates.y = fixedCoords.y;

            console.log(`� [滑鼠捕獲] 原始: (${event.clientX}, ${event.clientY}) → 修復: (${fixedCoords.x}, ${fixedCoords.y})`);

            // 創建視覺標記
            this.createDOMMarker(fixedCoords.x, fixedCoords.y, 'mouse');
        }, { passive: true });
    }

    /**
     * 📱 應用手機專用座標修復算法
     */
    applyMobileCoordinateFix(clientX, clientY) {
        if (!this.mobileFixParams) {
            this.calculateMobileFixParameters();
        }

        const params = this.mobileFixParams;

        // 🎯 多重修復算法
        let fixedX = clientX;
        let fixedY = clientY;

        // 修復1: 減去Canvas偏移
        fixedX -= params.canvasLeft;
        fixedY -= params.canvasTop;

        // 修復2: 考慮滾動偏移
        fixedX += params.scrollX;
        fixedY += params.scrollY;

        // 修復3: 設備像素比修復（手機設備常見問題）
        if (this.isMobile && params.devicePixelRatio !== 1) {
            // 對於手機設備，通常需要除以devicePixelRatio而不是乘以
            fixedX = fixedX / params.devicePixelRatio;
            fixedY = fixedY / params.devicePixelRatio;
        }

        // 修復4: Canvas縮放修復
        if (params.scaleX !== 1 || params.scaleY !== 1) {
            fixedX = fixedX * (params.canvasWidth / params.canvasClientWidth);
            fixedY = fixedY * (params.canvasHeight / params.canvasClientHeight);
        }

        // 修復5: 手機專用邊界檢查
        fixedX = Math.max(0, Math.min(params.canvasWidth, fixedX));
        fixedY = Math.max(0, Math.min(params.canvasHeight, fixedY));

        return { x: Math.round(fixedX), y: Math.round(fixedY) };
    }

    /**
     * 📱 創建DOM視覺標記
     */
    createDOMMarker(x, y, type) {
        // 清除舊標記
        this.clearDOMMarkers();

        const marker = document.createElement('div');
        marker.style.cssText = `
            position: fixed;
            left: ${x - 10}px;
            top: ${y - 10}px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${type === 'touch' ? '#ff4444' : '#4444ff'};
            border: 2px solid white;
            z-index: 999999;
            pointer-events: none;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        `;

        // 添加標籤
        const label = document.createElement('div');
        label.textContent = `${type}(${x},${y})`;
        label.style.cssText = `
            position: absolute;
            top: 25px;
            left: -20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
        `;

        marker.appendChild(label);
        document.body.appendChild(marker);
        this.domMarkers.push(marker);

        // 3秒後自動清除
        setTimeout(() => {
            this.clearDOMMarkers();
        }, 3000);
    }

    /**
     * 📱 清除DOM標記
     */
    clearDOMMarkers() {
        this.domMarkers.forEach(marker => {
            if (marker.parentNode) {
                marker.parentNode.removeChild(marker);
            }
        });
        this.domMarkers = [];
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

    // 📱 手機專用座標修復方法 - 使用修復後的DOM座標
    getBestCoordinateFix(pointer) {
        // 📱 如果有修復後的DOM座標，直接使用
        if (this.lastDOMCoordinates.x !== 0 || this.lastDOMCoordinates.y !== 0) {
            return {
                x: this.lastDOMCoordinates.x,
                y: this.lastDOMCoordinates.y,
                method: '手機座標修復',
                confidence: 1.0
            };
        }

        // 📱 如果沒有DOM座標，嘗試對Phaser座標進行手機修復
        if (this.isMobile) {
            const fixedCoords = this.applyMobileCoordinateFix(pointer.x, pointer.y);
            return {
                x: fixedCoords.x,
                y: fixedCoords.y,
                method: '手機Phaser座標修復',
                confidence: 0.8
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
