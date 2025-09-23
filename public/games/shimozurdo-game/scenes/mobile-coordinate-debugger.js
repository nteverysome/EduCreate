/**
 * 極簡DOM觸控位置驗證器
 * 只驗證DOM事件記錄的位置是否就是真正的觸碰位置
 */
class MobileCoordinateDebugger {
    constructor(scene) {
        this.scene = scene;
        this.isEnabled = true;
        this.domMarkers = [];  // 儲存DOM標記

        this.setupSimpleDOMTest();

        console.log('🔍 極簡DOM觸控驗證器已啟動 - 只驗證DOM位置準確性');
    }
    
    /**
     * 設置極簡DOM測試
     */
    setupSimpleDOMTest() {
        // 創建簡單的調試文字
        this.debugText = this.scene.add.text(10, 10, '🔍 極簡DOM觸控驗證器\n點擊螢幕任何位置測試DOM位置準確性', {
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
        
        document.addEventListener('touchstart', (event) => {
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
        const info = `🔍 極簡DOM觸控驗證器
        
最後點擊: ${eventType}(${clientX}, ${clientY})

🎯 測試目標：
DOM記錄的位置是否就是您觸碰的位置？

🔴 紅色圓圈 = 觸控位置
🔵 藍色圓圈 = 滑鼠位置

💡 標記直接使用DOM座標，無任何轉換
💡 長按3秒清除所有標記
💡 觀察標記是否出現在您觸碰的位置`;

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
            this.debugText.setText('🔍 極簡DOM觸控驗證器\n點擊螢幕任何位置測試DOM位置準確性\n\n🧹 已清除所有標記');
        }
    }

    // 保留這些方法以維持兼容性，但簡化實現
    getBestCoordinateFix(pointer) {
        return {
            x: pointer.x,
            y: pointer.y,
            method: '無修正',
            confidence: 1.0
        };
    }
}

// 確保全域可用
if (typeof window !== 'undefined') {
    window.MobileCoordinateDebugger = MobileCoordinateDebugger;
}
