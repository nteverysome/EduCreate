/**
 * 🔧 Shimozurdo 遊戲座標偏移修復工具
 * 
 * 這個模組提供座標偏移的診斷和修復功能
 */

class CoordinateFix {
    constructor(scene) {
        this.scene = scene;
        this.debugMode = true;
        this.offsetData = {
            samples: [],
            averageOffset: { x: 0, y: 0 },
            isCalibrated: false
        };
    }

    /**
     * 🔍 診斷座標偏移問題
     */
    diagnoseCoordinateOffset(pointer) {
        const canvas = this.scene.sys.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const gameContainer = canvas.parentElement;
        const containerRect = gameContainer ? gameContainer.getBoundingClientRect() : null;

        const diagnosticData = {
            // 原始指針數據
            pointer: {
                x: pointer.x,
                y: pointer.y,
                worldX: pointer.worldX,
                worldY: pointer.worldY
            },
            
            // 畫布信息
            canvas: {
                width: canvas.width,
                height: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight,
                rect: {
                    x: canvasRect.x,
                    y: canvasRect.y,
                    width: canvasRect.width,
                    height: canvasRect.height,
                    top: canvasRect.top,
                    left: canvasRect.left
                }
            },
            
            // 容器信息
            container: containerRect ? {
                rect: {
                    x: containerRect.x,
                    y: containerRect.y,
                    width: containerRect.width,
                    height: containerRect.height,
                    top: containerRect.top,
                    left: containerRect.left
                }
            } : null,
            
            // 視窗信息
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                scrollX: window.scrollX,
                scrollY: window.scrollY
            },
            
            // 相機信息
            camera: {
                scrollX: this.scene.cameras.main.scrollX,
                scrollY: this.scene.cameras.main.scrollY,
                zoom: this.scene.cameras.main.zoom,
                width: this.scene.cameras.main.width,
                height: this.scene.cameras.main.height
            }
        };

        if (this.debugMode) {
            console.log('🔍 [座標診斷] 詳細數據:', JSON.stringify(diagnosticData, null, 2));
        }

        return diagnosticData;
    }

    /**
     * 🔧 修復座標偏移（FIT 模式優化版）
     */
    fixCoordinateOffset(pointer) {
        const canvas = this.scene.sys.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const gameConfig = this.scene.sys.game.config;

        // 獲取遊戲的邏輯尺寸（不是 canvas 的實際像素尺寸）
        const gameWidth = gameConfig.width;
        const gameHeight = gameConfig.height;

        // 方法1: 使用世界座標（FIT 模式下最準確）
        if (pointer.worldX !== undefined && pointer.worldY !== undefined) {
            const worldX = pointer.worldX;
            const worldY = pointer.worldY;

            // 🎯 使用遊戲邏輯尺寸檢查，而不是 canvas 像素尺寸
            if (worldX >= 0 && worldX <= gameWidth && worldY >= 0 && worldY <= gameHeight) {
                if (this.debugMode) {
                    console.log(`🔧 [座標修復] 使用世界座標: (${worldX.toFixed(2)}, ${worldY.toFixed(2)})`);
                    console.log(`  遊戲邏輯尺寸: ${gameWidth}x${gameHeight}`);
                }
                return { x: worldX, y: worldY, method: 'world' };
            }
        }

        // 方法2: 計算相對於畫布的座標（備用方法）
        const relativeX = pointer.x - canvasRect.left;
        const relativeY = pointer.y - canvasRect.top;

        // 🎯 計算從顯示尺寸到遊戲邏輯尺寸的縮放比例
        const scaleX = gameWidth / canvasRect.width;
        const scaleY = gameHeight / canvasRect.height;

        const scaledX = relativeX * scaleX;
        const scaledY = relativeY * scaleY;

        if (this.debugMode) {
            console.log(`🔧 [座標修復] 計算結果:`);
            console.log(`  原始座標: (${pointer.x}, ${pointer.y})`);
            console.log(`  畫布顯示尺寸: ${canvasRect.width.toFixed(0)}x${canvasRect.height.toFixed(0)}`);
            console.log(`  遊戲邏輯尺寸: ${gameWidth}x${gameHeight}`);
            console.log(`  畫布偏移: (${canvasRect.left}, ${canvasRect.top})`);
            console.log(`  相對座標: (${relativeX.toFixed(2)}, ${relativeY.toFixed(2)})`);
            console.log(`  縮放比例: (${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`);
            console.log(`  最終座標: (${scaledX.toFixed(2)}, ${scaledY.toFixed(2)})`);
        }

        return {
            x: scaledX,
            y: scaledY,
            method: 'calculated',
            debug: {
                original: { x: pointer.x, y: pointer.y },
                canvasRect: {
                    left: canvasRect.left,
                    top: canvasRect.top,
                    width: canvasRect.width,
                    height: canvasRect.height
                },
                gameSize: { width: gameWidth, height: gameHeight },
                relative: { x: relativeX, y: relativeY },
                scale: { x: scaleX, y: scaleY }
            }
        };
    }

    /**
     * 🎯 智能座標選擇
     */
    getOptimalCoordinates(pointer) {
        // 診斷當前狀況
        const diagnostic = this.diagnoseCoordinateOffset(pointer);
        
        // 嘗試修復座標
        const fixed = this.fixCoordinateOffset(pointer);
        
        // 返回最佳座標
        return {
            x: fixed.x,
            y: fixed.y,
            diagnostic: diagnostic,
            fixMethod: fixed.method,
            debug: fixed.debug
        };
    }

    /**
     * 🧪 測試座標準確性
     */
    testCoordinateAccuracy(expectedX, expectedY, actualX, actualY) {
        const offsetX = actualX - expectedX;
        const offsetY = actualY - expectedY;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        
        const accuracy = {
            offset: { x: offsetX, y: offsetY },
            distance: distance,
            isAccurate: distance < 10, // 10像素內認為準確
            accuracy: Math.max(0, 100 - distance) // 準確度百分比
        };
        
        if (this.debugMode) {
            console.log(`🧪 [座標測試] 預期: (${expectedX}, ${expectedY}), 實際: (${actualX}, ${actualY})`);
            console.log(`🧪 [座標測試] 偏移: (${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}), 距離: ${distance.toFixed(2)}`);
            console.log(`🧪 [座標測試] 準確度: ${accuracy.accuracy.toFixed(1)}%`);
        }
        
        return accuracy;
    }

    /**
     * 📊 收集偏移數據用於校準
     */
    collectOffsetData(expectedX, expectedY, actualX, actualY) {
        const sample = {
            expected: { x: expectedX, y: expectedY },
            actual: { x: actualX, y: actualY },
            offset: { x: actualX - expectedX, y: actualY - expectedY },
            timestamp: Date.now()
        };
        
        this.offsetData.samples.push(sample);
        
        // 保持最近20個樣本
        if (this.offsetData.samples.length > 20) {
            this.offsetData.samples.shift();
        }
        
        // 計算平均偏移
        if (this.offsetData.samples.length >= 5) {
            const avgOffsetX = this.offsetData.samples.reduce((sum, s) => sum + s.offset.x, 0) / this.offsetData.samples.length;
            const avgOffsetY = this.offsetData.samples.reduce((sum, s) => sum + s.offset.y, 0) / this.offsetData.samples.length;
            
            this.offsetData.averageOffset = { x: avgOffsetX, y: avgOffsetY };
            this.offsetData.isCalibrated = true;
            
            if (this.debugMode) {
                console.log(`📊 [偏移校準] 平均偏移: (${avgOffsetX.toFixed(2)}, ${avgOffsetY.toFixed(2)})`);
            }
        }
        
        return sample;
    }

    /**
     * 🎯 應用校準偏移
     */
    applyCalibratedOffset(x, y) {
        if (!this.offsetData.isCalibrated) {
            return { x, y };
        }
        
        const correctedX = x - this.offsetData.averageOffset.x;
        const correctedY = y - this.offsetData.averageOffset.y;
        
        if (this.debugMode) {
            console.log(`🎯 [偏移校正] 原始: (${x}, ${y}) → 校正: (${correctedX.toFixed(2)}, ${correctedY.toFixed(2)})`);
        }
        
        return { x: correctedX, y: correctedY };
    }
}

// 導出類別
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoordinateFix;
} else {
    window.CoordinateFix = CoordinateFix;
}
