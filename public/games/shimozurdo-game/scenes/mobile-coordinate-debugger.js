/**
 * 手機座標調試器 - 實時視覺化座標診斷工具
 * 專門用於解決真實手機環境中的座標偏移問題
 */
class MobileCoordinateDebugger {
    constructor(scene) {
        this.scene = scene;
        this.debugOverlay = null;
        this.debugText = null;
        this.crosshair = null;
        this.fixedMarker = null;
        this.playerMarker = null;
        this.phaserMarker = null;  // 新增：顯示Phaser座標
        this.isEnabled = true;
        this.lastDOMCoordinates = null;  // 儲存DOM原始座標

        this.setupDebugOverlay();
        this.setupEventListeners();
        this.setupDOMEventListeners();  // 新增：DOM事件監聽

        console.log('📱 手機座標調試器已啟動 - 包含DOM原始座標追蹤');
    }
    
    /**
     * 設置調試覆蓋層
     */
    setupDebugOverlay() {
        // 創建調試文字顯示
        this.debugText = this.scene.add.text(10, 10, '', {
            fontSize: '12px',
            fill: '#00ff00',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 5, y: 5 }
        }).setScrollFactor(0).setDepth(10000);
        
        // 創建十字線標記（原始點擊位置）
        this.crosshair = this.scene.add.graphics().setDepth(9999);
        
        // 創建修復後位置標記
        this.fixedMarker = this.scene.add.graphics().setDepth(9999);
        
        // 創建太空船目標標記
        this.playerMarker = this.scene.add.graphics().setDepth(9999);

        // 創建Phaser座標標記（橙色）
        this.phaserMarker = this.scene.add.graphics().setDepth(9999);

        // 🎯 創建全域輸入接收器 - 確保整個遊戲區域都能觸發Phaser事件
        this.createGlobalInputReceiver();

        // 顯示設備信息
        this.updateDeviceInfo();
    }

    /**
     * 創建全域輸入接收器 - 確保整個遊戲區域都能觸發Phaser事件
     */
    createGlobalInputReceiver() {
        // 獲取遊戲區域尺寸
        const gameWidth = this.scene.game.config.width;
        const gameHeight = this.scene.game.config.height;

        // 創建一個不可見的矩形覆蓋整個遊戲區域
        this.globalInputReceiver = this.scene.add.rectangle(
            gameWidth / 2,  // x: 中心點
            gameHeight / 2, // y: 中心點
            gameWidth,      // width: 全寬
            gameHeight,     // height: 全高
            0x000000,       // color: 黑色
            0               // alpha: 完全透明
        );

        // 設定為可互動，但不阻擋其他物件
        this.globalInputReceiver
            .setInteractive()
            .setDepth(-1000); // 設定最低深度，確保不會遮擋其他物件

        console.log(`🎯 全域輸入接收器已創建: ${gameWidth}x${gameHeight}，確保整個遊戲區域都能觸發Phaser事件`);
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        let longPressTimer = null;

        // 監聽觸控開始
        this.scene.input.on('pointerdown', (pointer) => {
            if (this.isEnabled) {
                // 🎯 使用DOM座標覆蓋Phaser座標
                const correctedPointer = this.createDOMCorrectedPointer(pointer);
                this.diagnoseCoordinates(correctedPointer);

                // 開始長按計時器
                longPressTimer = setTimeout(() => {
                    this.clearAllMarkers();
                    console.log('🧹 已清除所有標記');
                }, 3000);
            }
        });

        // 監聽觸控結束
        this.scene.input.on('pointerup', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });

        // 監聽視窗大小變化
        window.addEventListener('resize', () => {
            setTimeout(() => this.updateDeviceInfo(), 100);
        });

        // 監聽方向變化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.updateDeviceInfo(), 500);
        });
    }

    /**
     * 設置DOM事件監聽器 - 獲取真正的原始觸控座標
     */
    setupDOMEventListeners() {
        // 獲取canvas元素和其邊界信息
        const canvas = this.scene.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();

        console.log('🔴 Canvas邊界信息:', {
            left: canvasRect.left,
            top: canvasRect.top,
            right: canvasRect.right,
            bottom: canvasRect.bottom,
            width: canvasRect.width,
            height: canvasRect.height
        });

        // 監聽整個頁面的觸控事件（手機）- 不限制在Canvas內
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const isInCanvas = (
                    touch.clientX >= canvasRect.left &&
                    touch.clientX <= canvasRect.right &&
                    touch.clientY >= canvasRect.top &&
                    touch.clientY <= canvasRect.bottom
                );

                this.lastDOMCoordinates = {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    pageX: touch.pageX,
                    pageY: touch.pageY,
                    screenX: touch.screenX,
                    screenY: touch.screenY,
                    type: 'touch',
                    isInCanvas: isInCanvas,
                    canvasRect: canvasRect
                };

                // 🔴 立即繪製紅色標記 - 不等待Phaser事件
                this.drawImmediateDOMMarker(touch.clientX, touch.clientY, isInCanvas);

                console.log('🔴 [DOM觸控-全頁面] 真正的原始座標:', this.lastDOMCoordinates);
            }
        }, { passive: true });

        // 監聽整個頁面的滑鼠事件（桌面測試）- 不限制在Canvas內
        document.addEventListener('mousedown', (event) => {
            const isInCanvas = (
                event.clientX >= canvasRect.left &&
                event.clientX <= canvasRect.right &&
                event.clientY >= canvasRect.top &&
                event.clientY <= canvasRect.bottom
            );

            this.lastDOMCoordinates = {
                clientX: event.clientX,
                clientY: event.clientY,
                pageX: event.pageX,
                pageY: event.pageY,
                screenX: event.screenX,
                screenY: event.screenY,
                type: 'mouse',
                isInCanvas: isInCanvas,
                canvasRect: canvasRect
            };

            // 🔴 立即繪製紅色標記 - 不等待Phaser事件
            this.drawImmediateDOMMarker(event.clientX, event.clientY, isInCanvas);

            console.log('🔴 [DOM滑鼠-全頁面] 真正的原始座標:', this.lastDOMCoordinates);
        });

        console.log('🔴 DOM事件監聽器已設置到整個頁面，將追蹤全螢幕觸控座標');

        // 🔍 創建DOM事件準確性測試
        this.createDOMAccuracyTest();
    }

    /**
     * 創建DOM事件準確性測試 - 驗證DOM事件是否真的是觸碰位置
     */
    createDOMAccuracyTest() {
        // 創建測試標記容器
        this.domTestMarkers = [];

        // 添加多層DOM事件監聽器來比較
        const testLayers = [
            { element: document, name: 'document' },
            { element: document.body, name: 'body' },
            { element: this.scene.game.canvas, name: 'canvas' },
            { element: this.scene.game.canvas.parentElement, name: 'canvas-parent' }
        ];

        testLayers.forEach(layer => {
            if (layer.element) {
                // 觸控事件
                layer.element.addEventListener('touchstart', (event) => {
                    if (event.touches.length > 0) {
                        const touch = event.touches[0];
                        this.recordDOMAccuracyTest(touch, layer.name, 'touch');
                    }
                }, { passive: true });

                // 滑鼠事件
                layer.element.addEventListener('mousedown', (event) => {
                    this.recordDOMAccuracyTest(event, layer.name, 'mouse');
                }, { passive: true });
            }
        });

        console.log('🔍 DOM事件準確性測試已啟動 - 將比較多層DOM事件座標');
    }

    /**
     * 記錄DOM準確性測試數據
     */
    recordDOMAccuracyTest(event, layerName, eventType) {
        const testData = {
            layer: layerName,
            type: eventType,
            clientX: event.clientX,
            clientY: event.clientY,
            pageX: event.pageX,
            pageY: event.pageY,
            screenX: event.screenX,
            screenY: event.screenY,
            timestamp: Date.now()
        };

        // 儲存測試數據
        if (!this.domAccuracyTests) {
            this.domAccuracyTests = [];
        }
        this.domAccuracyTests.push(testData);

        // 只保留最近10次測試
        if (this.domAccuracyTests.length > 10) {
            this.domAccuracyTests.shift();
        }

        console.log(`🔍 [DOM準確性] ${layerName}-${eventType}: client(${event.clientX}, ${event.clientY}) page(${event.pageX}, ${event.pageY}) screen(${event.screenX}, ${event.screenY})`);

        // 創建即時視覺標記
        this.createDOMTestMarker(event.clientX, event.clientY, layerName, eventType);
    }

    /**
     * 創建DOM測試視覺標記
     */
    createDOMTestMarker(clientX, clientY, layerName, eventType) {
        // 轉換為Phaser座標
        const canvas = this.scene.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const canvasX = clientX - canvasRect.left;
        const canvasY = clientY - canvasRect.top;
        const scaleX = this.scene.game.config.width / canvasRect.width;
        const scaleY = this.scene.game.config.height / canvasRect.height;
        const worldX = canvasX * scaleX;
        const worldY = canvasY * scaleY;

        // 不同層使用不同顏色
        const colors = {
            'document': 0xff0000,    // 紅色
            'body': 0x00ff00,        // 綠色
            'canvas': 0x0000ff,      // 藍色
            'canvas-parent': 0xffff00 // 黃色
        };

        const color = colors[layerName] || 0xffffff;

        // 創建小圓點標記
        const marker = this.scene.add.circle(worldX, worldY, 3, color, 0.8);
        marker.setDepth(10001);

        // 添加文字標籤
        const label = this.scene.add.text(worldX + 5, worldY - 5, `${layerName}-${eventType}`, {
            fontSize: '8px',
            fill: `#${color.toString(16).padStart(6, '0')}`,
            backgroundColor: 'rgba(0,0,0,0.5)'
        }).setDepth(10002);

        // 儲存標記以便清理
        this.domTestMarkers.push(marker, label);

        // 限制標記數量
        if (this.domTestMarkers.length > 40) {
            const oldMarker = this.domTestMarkers.shift();
            const oldLabel = this.domTestMarkers.shift();
            if (oldMarker && oldMarker.destroy) oldMarker.destroy();
            if (oldLabel && oldLabel.destroy) oldLabel.destroy();
        }
    }

    /**
     * 創建DOM座標修正的Pointer物件 - 讓Phaser使用真正的DOM座標
     */
    createDOMCorrectedPointer(originalPointer) {
        if (!this.lastDOMCoordinates) {
            console.log('⚠️ 沒有DOM座標數據，使用原始Phaser座標');
            return originalPointer;
        }

        // 將DOM座標轉換為Phaser世界座標
        const canvas = this.scene.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();

        // 計算相對於Canvas的座標
        const canvasX = this.lastDOMCoordinates.clientX - canvasRect.left;
        const canvasY = this.lastDOMCoordinates.clientY - canvasRect.top;

        // 轉換為Phaser世界座標（考慮縮放）
        const scaleX = this.scene.game.config.width / canvasRect.width;
        const scaleY = this.scene.game.config.height / canvasRect.height;

        const worldX = canvasX * scaleX;
        const worldY = canvasY * scaleY;

        // 創建修正後的pointer物件
        const correctedPointer = {
            ...originalPointer,
            x: worldX,
            y: worldY,
            worldX: worldX,
            worldY: worldY,
            _isDOMCorrected: true
        };

        console.log(`🎯 [DOM座標修正] 原始Phaser(${originalPointer.x.toFixed(1)}, ${originalPointer.y.toFixed(1)}) → DOM修正(${worldX.toFixed(1)}, ${worldY.toFixed(1)})`);

        return correctedPointer;
    }

    /**
     * 立即繪製DOM標記 - 不等待Phaser事件觸發
     */
    drawImmediateDOMMarker(clientX, clientY, isInCanvas) {
        try {
            // 將DOM座標轉換為Phaser世界座標
            const canvas = this.scene.game.canvas;
            const canvasRect = canvas.getBoundingClientRect();

            // 計算相對於Canvas的座標
            const canvasX = clientX - canvasRect.left;
            const canvasY = clientY - canvasRect.top;

            // 轉換為Phaser世界座標（考慮縮放）
            const scaleX = this.scene.game.config.width / canvasRect.width;
            const scaleY = this.scene.game.config.height / canvasRect.height;

            const worldX = canvasX * scaleX;
            const worldY = canvasY * scaleY;

            // 創建紅色標記
            const marker = this.scene.add.circle(worldX, worldY, 8, 0xff0000, 0.8);
            marker.setDepth(1000);

            // 添加到標記列表
            this.visualMarkers.push(marker);

            // 添加文字標籤
            const label = this.scene.add.text(worldX + 15, worldY - 10,
                `DOM(${clientX.toFixed(0)},${clientY.toFixed(0)})${isInCanvas ? '✅' : '❌'}`, {
                fontSize: '12px',
                fill: '#ff0000',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            });
            label.setDepth(1001);
            this.visualMarkers.push(label);

            console.log(`🔴 [立即標記] DOM座標(${clientX}, ${clientY}) → 世界座標(${worldX.toFixed(1)}, ${worldY.toFixed(1)}) Canvas內:${isInCanvas}`);

        } catch (error) {
            console.error('🔴 [立即標記錯誤]', error);
        }
    }
    
    /**
     * 診斷座標並顯示視覺化信息
     */
    diagnoseCoordinates(pointer) {
        const diagnosis = this.performComprehensiveDiagnosis(pointer);
        
        // 更新視覺標記
        this.updateVisualMarkers(diagnosis);
        
        // 更新調試文字
        this.updateDebugText(diagnosis);
        
        // 輸出詳細日誌
        console.log('🔍 [手機座標診斷]', diagnosis);
        
        return diagnosis;
    }
    
    /**
     * 執行全面的座標診斷
     */
    performComprehensiveDiagnosis(pointer) {
        const canvas = this.scene.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        
        // 收集基本信息
        const basicInfo = {
            // 原始指針信息
            rawPointer: { x: pointer.x, y: pointer.y },
            worldPointer: { x: pointer.worldX, y: pointer.worldY },
            
            // 設備信息
            devicePixelRatio: window.devicePixelRatio,
            screenSize: { width: screen.width, height: screen.height },
            windowSize: { width: window.innerWidth, height: window.innerHeight },
            
            // Canvas 信息
            canvasSize: { width: canvas.width, height: canvas.height },
            canvasClientSize: { width: canvas.clientWidth, height: canvas.clientHeight },
            canvasRect: {
                left: canvasRect.left,
                top: canvasRect.top,
                width: canvasRect.width,
                height: canvasRect.height
            },
            
            // 攝影機信息
            camera: {
                scrollX: this.scene.cameras.main.scrollX,
                scrollY: this.scene.cameras.main.scrollY,
                zoom: this.scene.cameras.main.zoom,
                width: this.scene.cameras.main.width,
                height: this.scene.cameras.main.height
            },
            
            // 太空船位置
            playerPosition: this.scene.player ? {
                x: this.scene.player.x,
                y: this.scene.player.y
            } : null
        };
        
        // 嘗試多種座標修復方法
        const fixMethods = this.tryMultipleFixMethods(pointer, basicInfo);
        
        // 計算偏移量
        const offsets = this.calculateOffsets(basicInfo, fixMethods);
        
        return {
            basicInfo,
            fixMethods,
            offsets,
            timestamp: Date.now()
        };
    }
    
    /**
     * 嘗試多種座標修復方法
     */
    tryMultipleFixMethods(pointer, basicInfo) {
        const methods = {};
        
        // 方法1：直接使用原始座標
        methods.raw = {
            x: pointer.x,
            y: pointer.y,
            name: '原始座標'
        };
        
        // 方法2：使用世界座標
        if (pointer.worldX !== undefined && pointer.worldY !== undefined) {
            methods.world = {
                x: pointer.worldX,
                y: pointer.worldY,
                name: '世界座標'
            };
        }
        
        // 方法3：Canvas 相對座標
        const canvasRect = basicInfo.canvasRect;
        methods.canvasRelative = {
            x: pointer.x - canvasRect.left,
            y: pointer.y - canvasRect.top,
            name: 'Canvas相對座標'
        };
        
        // 方法4：設備像素比補償
        methods.devicePixelCompensated = {
            x: (pointer.x - canvasRect.left) * basicInfo.devicePixelRatio,
            y: (pointer.y - canvasRect.top) * basicInfo.devicePixelRatio,
            name: '設備像素比補償'
        };
        
        // 方法5：縮放比例補償
        const scaleX = basicInfo.canvasSize.width / canvasRect.width;
        const scaleY = basicInfo.canvasSize.height / canvasRect.height;
        methods.scaleCompensated = {
            x: (pointer.x - canvasRect.left) * scaleX,
            y: (pointer.y - canvasRect.top) * scaleY,
            name: '縮放比例補償'
        };
        
        // 方法6：攝影機補償
        if (basicInfo.camera) {
            methods.cameraCompensated = {
                x: (pointer.x - canvasRect.left) * scaleX + basicInfo.camera.scrollX,
                y: (pointer.y - canvasRect.top) * scaleY + basicInfo.camera.scrollY,
                name: '攝影機補償'
            };
        }
        
        // 方法7：全面補償（組合多種方法）
        methods.comprehensive = {
            x: pointer.worldX || ((pointer.x - canvasRect.left) * scaleX),
            y: pointer.worldY || ((pointer.y - canvasRect.top) * scaleY),
            name: '全面補償'
        };
        
        return methods;
    }
    
    /**
     * 計算各種偏移量
     */
    calculateOffsets(basicInfo, fixMethods) {
        const offsets = {};
        
        if (basicInfo.playerPosition) {
            Object.keys(fixMethods).forEach(methodName => {
                const method = fixMethods[methodName];
                offsets[methodName] = {
                    x: method.x - basicInfo.playerPosition.x,
                    y: method.y - basicInfo.playerPosition.y,
                    distance: Math.sqrt(
                        Math.pow(method.x - basicInfo.playerPosition.x, 2) +
                        Math.pow(method.y - basicInfo.playerPosition.y, 2)
                    )
                };
            });
        }
        
        return offsets;
    }
    
    /**
     * 更新視覺標記 - 紅色圓圈長時間顯示
     */
    updateVisualMarkers(diagnosis) {
        const { basicInfo, fixMethods, offsets } = diagnosis;

        // 🔴 不清除舊標記，讓所有點擊都保持顯示
        // this.crosshair.clear();
        // this.fixedMarker.clear();
        // this.playerMarker.clear();
        // this.phaserMarker.clear();

        // 🔴 繪製DOM原始座標紅色圓圈 - 真正的觸控位置
        if (this.lastDOMCoordinates) {
            const domX = this.lastDOMCoordinates.clientX;
            const domY = this.lastDOMCoordinates.clientY;

            this.crosshair.lineStyle(4, 0xff0000, 1);
            this.crosshair.strokeCircle(domX, domY, 18);

            // 添加一個實心的小紅點在中心
            this.crosshair.fillStyle(0xff0000, 0.8);
            this.crosshair.fillCircle(domX, domY, 4);

            console.log(`🔴 [DOM原始] 真正觸控位置: (${domX}, ${domY})`);
        }

        // 🟠 繪製Phaser座標橙色圓圈 - Phaser認為的位置
        const phaserX = basicInfo.rawPointer.x;
        const phaserY = basicInfo.rawPointer.y;

        this.phaserMarker.lineStyle(4, 0xff8800, 1);
        this.phaserMarker.strokeCircle(phaserX, phaserY, 15);

        // 添加一個實心的小橙點在中心
        this.phaserMarker.fillStyle(0xff8800, 0.8);
        this.phaserMarker.fillCircle(phaserX, phaserY, 3);

        console.log(`🟠 [Phaser] Phaser認為位置: (${phaserX}, ${phaserY})`);

        // 🟢 繪製修復位置綠色圓圈
        const bestMethod = this.findBestMethod(offsets);
        if (bestMethod && fixMethods[bestMethod]) {
            const fixedX = fixMethods[bestMethod].x;
            const fixedY = fixMethods[bestMethod].y;

            this.fixedMarker.lineStyle(4, 0x00ff00, 1);
            this.fixedMarker.strokeCircle(fixedX, fixedY, 12);

            // 添加一個實心的小綠點在中心
            this.fixedMarker.fillStyle(0x00ff00, 0.8);
            this.fixedMarker.fillCircle(fixedX, fixedY, 3);
        }

        // 🔵 繪製太空船位置藍色方框
        if (basicInfo.playerPosition) {
            const playerX = basicInfo.playerPosition.x;
            const playerY = basicInfo.playerPosition.y;

            this.playerMarker.lineStyle(4, 0x0000ff, 1);
            this.playerMarker.strokeRect(playerX - 12, playerY - 12, 24, 24);

            // 添加一個實心的小藍點在中心
            this.playerMarker.fillStyle(0x0000ff, 0.8);
            this.playerMarker.fillCircle(playerX, playerY, 3);
        }

        // 在調試文字中顯示座標對比
        console.log(`🔴 [原始點擊] 螢幕座標: (${rawX}, ${rawY})`);
        if (bestMethod && fixMethods[bestMethod]) {
            console.log(`🟢 [修復結果] 遊戲座標: (${fixMethods[bestMethod].x.toFixed(0)}, ${fixMethods[bestMethod].y.toFixed(0)})`);
            console.log(`📏 [距離差異] ${Math.sqrt(Math.pow(fixMethods[bestMethod].x - rawX, 2) + Math.pow(fixMethods[bestMethod].y - rawY, 2)).toFixed(0)}px`);
        }
    }
    
    /**
     * 找出最佳的座標修復方法
     */
    findBestMethod(offsets) {
        let bestMethod = null;
        let minDistance = Infinity;
        
        Object.keys(offsets).forEach(methodName => {
            const distance = offsets[methodName].distance;
            if (distance < minDistance) {
                minDistance = distance;
                bestMethod = methodName;
            }
        });
        
        return bestMethod;
    }
    
    /**
     * 更新調試文字
     */
    updateDebugText(diagnosis) {
        const { basicInfo, fixMethods, offsets } = diagnosis;
        const bestMethod = this.findBestMethod(offsets);
        
        let debugInfo = `📱 手機座標調試器\n`;
        debugInfo += `螢幕: ${basicInfo.screenSize.width}x${basicInfo.screenSize.height}\n`;
        debugInfo += `視窗: ${basicInfo.windowSize.width}x${basicInfo.windowSize.height}\n`;
        debugInfo += `像素比: ${basicInfo.devicePixelRatio}\n`;
        debugInfo += `Canvas: ${basicInfo.canvasSize.width}x${basicInfo.canvasSize.height}\n`;
        debugInfo += `\n🎯 點擊座標:\n`;
        debugInfo += `Phaser: (${basicInfo.rawPointer.x.toFixed(0)}, ${basicInfo.rawPointer.y.toFixed(0)})`;
        if (basicInfo.rawPointer._isDOMCorrected) {
            debugInfo += ` [DOM修正] ✅\n`;
        } else {
            debugInfo += ` [原始] ⚠️\n`;
        }
        
        if (bestMethod && fixMethods[bestMethod]) {
            const method = fixMethods[bestMethod];
            const offset = offsets[bestMethod];
            debugInfo += `修復: (${method.x.toFixed(0)}, ${method.y.toFixed(0)})\n`;
            debugInfo += `方法: ${method.name}\n`;
            debugInfo += `偏移: ${offset.distance.toFixed(0)}px\n`;
        }
        
        if (basicInfo.playerPosition) {
            debugInfo += `太空船: (${basicInfo.playerPosition.x.toFixed(0)}, ${basicInfo.playerPosition.y.toFixed(0)})\n`;
        }

        // 顯示DOM座標 vs Phaser座標差異
        if (this.lastDOMCoordinates) {
            const domX = this.lastDOMCoordinates.clientX;
            const domY = this.lastDOMCoordinates.clientY;
            const phaserX = basicInfo.rawPointer.x;
            const phaserY = basicInfo.rawPointer.y;
            const diffX = Math.abs(domX - phaserX);
            const diffY = Math.abs(domY - phaserY);
            const isInCanvas = this.lastDOMCoordinates.isInCanvas;

            debugInfo += `\n🔴 DOM原始: (${domX.toFixed(0)}, ${domY.toFixed(0)})\n`;
            debugInfo += `🟠 Phaser: (${phaserX.toFixed(0)}, ${phaserY.toFixed(0)})\n`;
            debugInfo += `📏 差異: (${diffX.toFixed(0)}, ${diffY.toFixed(0)})\n`;
            debugInfo += `📍 在Canvas內: ${isInCanvas ? '✅' : '❌'}\n`;

            if (this.lastDOMCoordinates.canvasRect) {
                const rect = this.lastDOMCoordinates.canvasRect;
                debugInfo += `🖼️ Canvas: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}\n`;
            }
        }

        debugInfo += `\n🔴 紅色圓圈 = DOM真正觸控位置（即時顯示）\n`;
        debugInfo += `🟠 橙色圓圈 = Phaser座標（DOM修正後）\n`;
        debugInfo += `🟢 綠色圓圈 = 修復後位置\n`;
        debugInfo += `🔵 藍色方框 = 太空船位置\n`;
        debugInfo += `\n🔍 DOM準確性測試：\n`;
        debugInfo += `🔴 document層 🟢 body層 🔵 canvas層 🟡 parent層\n`;
        debugInfo += `\n🎯 目標：DOM座標 = Phaser座標\n`;
        debugInfo += `💡 Phaser現在使用DOM修正座標\n`;
        debugInfo += `💡 紅色和橙色圓圈應該重疊\n`;
        debugInfo += `💡 觀察不同DOM層的座標差異\n`;
        debugInfo += `💡 長按螢幕3秒可清除所有標記\n`;

        this.debugText.setText(debugInfo);
    }
    
    /**
     * 更新設備信息
     */
    updateDeviceInfo() {
        const info = {
            screen: `${screen.width}x${screen.height}`,
            window: `${window.innerWidth}x${window.innerHeight}`,
            devicePixelRatio: window.devicePixelRatio,
            orientation: screen.orientation ? screen.orientation.angle : 'unknown'
        };
        
        console.log('📱 [設備信息更新]', info);
    }
    
    /**
     * 獲取最佳座標修復結果
     */
    getBestCoordinateFix(pointer) {
        // 🎯 優先使用DOM修正座標（如果可用）
        if (pointer._isDOMCorrected) {
            console.log(`🎯 [太空船移動] 使用DOM修正座標: (${pointer.x.toFixed(1)}, ${pointer.y.toFixed(1)})`);
            return {
                x: pointer.x,
                y: pointer.y,
                method: 'DOM修正座標',
                confidence: 1.0
            };
        }

        // 🔄 如果沒有DOM修正，嘗試使用DOM座標創建修正版本
        if (this.lastDOMCoordinates) {
            const correctedPointer = this.createDOMCorrectedPointer(pointer);
            console.log(`🎯 [太空船移動] 創建DOM修正座標: (${correctedPointer.x.toFixed(1)}, ${correctedPointer.y.toFixed(1)})`);
            return {
                x: correctedPointer.x,
                y: correctedPointer.y,
                method: 'DOM即時修正',
                confidence: 0.9
            };
        }

        // 🔙 回退到原有的診斷方法
        const diagnosis = this.performComprehensiveDiagnosis(pointer);
        const bestMethod = this.findBestMethod(diagnosis.offsets);

        if (bestMethod && diagnosis.fixMethods[bestMethod]) {
            console.log(`🎯 [太空船移動] 使用診斷方法: ${bestMethod}`);
            return {
                x: diagnosis.fixMethods[bestMethod].x,
                y: diagnosis.fixMethods[bestMethod].y,
                method: bestMethod,
                confidence: this.calculateConfidence(diagnosis.offsets[bestMethod])
            };
        }

        console.log(`⚠️ [太空船移動] 使用原始座標（無修正）`);
        return {
            x: pointer.x,
            y: pointer.y,
            method: 'fallback',
            confidence: 0
        };
    }
    
    /**
     * 計算修復信心度
     */
    calculateConfidence(offset) {
        if (!offset) return 0;
        
        // 距離越小，信心度越高
        const distance = offset.distance;
        if (distance < 10) return 0.9;
        if (distance < 20) return 0.7;
        if (distance < 50) return 0.5;
        if (distance < 100) return 0.3;
        return 0.1;
    }
    
    /**
     * 切換調試器開關
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.debugText.setVisible(true);
            console.log('📱 手機座標調試器已啟用');
        } else {
            this.debugText.setVisible(false);
            this.crosshair.clear();
            this.fixedMarker.clear();
            this.playerMarker.clear();
            console.log('📱 手機座標調試器已停用');
        }
    }
    
    /**
     * 清除所有視覺標記
     */
    clearAllMarkers() {
        if (this.crosshair) this.crosshair.clear();
        if (this.fixedMarker) this.fixedMarker.clear();
        if (this.playerMarker) this.playerMarker.clear();
        if (this.phaserMarker) this.phaserMarker.clear();

        // 清除DOM測試標記
        if (this.domTestMarkers) {
            this.domTestMarkers.forEach(marker => {
                if (marker && marker.destroy) {
                    marker.destroy();
                }
            });
            this.domTestMarkers = [];
        }

        // 更新調試文字，顯示清除信息
        if (this.debugText) {
            const currentText = this.debugText.text;
            const lines = currentText.split('\n');
            lines.push('🧹 已清除所有標記（包含DOM測試標記）');
            this.debugText.setText(lines.slice(-15).join('\n')); // 保持最近15行
        }
    }

    /**
     * 銷毀調試器
     */
    destroy() {
        if (this.debugText) this.debugText.destroy();
        if (this.crosshair) this.crosshair.destroy();
        if (this.fixedMarker) this.fixedMarker.destroy();
        if (this.playerMarker) this.playerMarker.destroy();
        if (this.phaserMarker) this.phaserMarker.destroy();

        console.log('📱 手機座標調試器已銷毀');
    }
}

// 導出類別
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileCoordinateDebugger;
} else {
    window.MobileCoordinateDebugger = MobileCoordinateDebugger;
}
