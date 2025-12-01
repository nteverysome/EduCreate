# Camera Zoom 修復 - v74.0

## 📅 修復日期
2025-11-16

## 🎯 修復目的
解決手機上卡片太小、佈局混亂的問題，恢復 `Math.max(scaleX, scaleY)` 的 Camera zoom 策略。

---

## 🔍 問題分析

### 問題描述
- **桌面端**：卡片顯示正常，2行 × 10列佈局 ✅
- **手機端**：卡片太小，佈局混亂，顯示為 5列 × 4行 ❌

### 根本原因
**v73.0 修復的副作用**：
- v73.0 將 Camera zoom 從 `Math.max(scaleX, scaleY)` 改為固定值 `1`
- 目的是解決桌面端視窗大小改變時的裁切問題
- 但這導致手機上內容太小！

**為什麼會這樣？**
- 桌面端：容器尺寸大（如 1841×963），zoom=1 正常顯示
- 手機端：容器尺寸小（如 390×844），zoom=1 導致內容太小

---

## 💡 解決方案

### 參考 shimozurdo-game 的成功經驗
Shimozurdo-game 在手機上顯示正常，它使用的是 `Math.max(scaleX, scaleY)` 策略。

### 修復策略
**恢復 `Math.max(scaleX, scaleY)` 的 Camera zoom 計算**

---

## 🔧 修復內容

### 修改文件 1：`public/games/match-up-game/scenes/handler.js`

#### 修改 `updateCamera()` 方法

**修改前 (v73.0)**：
```javascript
updateCamera(scene) {
    const camera = scene.cameras.main
    if (!camera) return;
    
    // ❌ 固定為 1
    camera.setZoom(1);
}
```

**修改後 (v74.0)**：
```javascript
updateCamera(scene) {
    const camera = scene.cameras.main
    if (!camera) {
        console.warn('⚠️ updateCamera: camera 不存在，跳過縮放設置');
        return;
    }
    
    // ✅ 恢復 Math.max 策略
    const scaleX = scene.sizer.width / this.game.screenBaseSize.width
    const scaleY = scene.sizer.height / this.game.screenBaseSize.height
    
    const zoom = Math.max(scaleX, scaleY)
    camera.setZoom(zoom)
    camera.centerOn(this.game.screenBaseSize.width / 2, this.game.screenBaseSize.height / 2)
    
    console.log('🔥 [v74.0] updateCamera - Camera zoom 設置:', {
        scaleX: scaleX.toFixed(3),
        scaleY: scaleY.toFixed(3),
        zoom: zoom.toFixed(3),
        sizerSize: `${scene.sizer.width}×${scene.sizer.height}`,
        baseSize: `${this.game.screenBaseSize.width}×${this.game.screenBaseSize.height}`
    });
}
```

#### 修改 `resize()` 方法

**修改前 (v73.0)**：
```javascript
resize(gameSize) {
    if (!this.sceneStopped) {
        const width = gameSize.width
        const height = gameSize.height
        
        this.parent.setSize(width, height)
        this.sizer.setSize(width, height)
        
        // ❌ 固定為 1
        const camera = this.cameras.main
        if (camera) {
            camera.setZoom(1);
        }
    }
}
```

**修改後 (v74.0)**：
```javascript
resize(gameSize) {
    if (!this.sceneStopped) {
        const width = gameSize.width
        const height = gameSize.height
        
        this.parent.setSize(width, height)
        this.sizer.setSize(width, height)
        
        // ✅ 恢復 Math.max 策略
        const camera = this.cameras.main
        if (camera) {
            const scaleX = this.sizer.width / this.game.screenBaseSize.width
            const scaleY = this.sizer.height / this.game.screenBaseSize.height
            
            const zoom = Math.max(scaleX, scaleY)
            camera.setZoom(zoom)
            camera.centerOn(this.game.screenBaseSize.width / 2, this.game.screenBaseSize.height / 2)
            
            console.log('🔥 [v74.0] resize - Camera zoom 設置:', {
                width,
                height,
                scaleX: scaleX.toFixed(3),
                scaleY: scaleY.toFixed(3),
                zoom: zoom.toFixed(3)
            });
        }
    }
}
```

### 修改文件 2：`public/games/_template/scenes/handler.js`

**相同的修改應用到模板系統**，確保未來創建的新遊戲都使用正確的策略。

---

## ✅ 預期效果

### 手機端
- ✅ 卡片尺寸正常
- ✅ 佈局正確（2行 × 10列）
- ✅ 內容完全填滿螢幕

### 桌面端
- ⚠️ 需要驗證：確認不會破壞 v73.0 修復的效果
- ⚠️ 可能會有輕微裁切（這是 `Math.max` 的設計取捨）

---

## 🧪 測試計畫

### 測試場景 1：手機端
1. 在真實手機上打開遊戲
2. 檢查卡片尺寸是否正常
3. 檢查佈局是否為 2行 × 10列
4. 旋轉螢幕測試橫向/直向模式

### 測試場景 2：桌面端
1. 在桌面瀏覽器打開遊戲
2. 檢查初始載入是否正常
3. 調整視窗大小（變大/變小）
4. 確認沒有裁切或顯示異常

### 測試場景 3：不同螢幕尺寸
- iPhone SE (375×667)
- iPhone 14 (390×844)
- iPad (768×1024)
- 桌面 (1920×1080)

---

## 📊 版本歷史

| 版本 | 問題 | 修復內容 | 結果 |
|------|------|---------|------|
| **v71.0** | 卡片尺寸太小 | 改回 `Math.max(scaleX, scaleY)` | ✅ 卡片尺寸正常 |
| **v73.0** | 視窗大小改變時裁切 | 改為 `zoom = 1` | ✅ 桌面端正常<br>❌ 手機端太小 |
| **v74.0** | 手機端卡片太小 | 恢復 `Math.max(scaleX, scaleY)` | ⏳ 待驗證 |

---

## 🎯 下一步

1. **立即測試**：在手機和桌面上測試修復效果
2. **收集數據**：記錄不同螢幕尺寸下的 Camera zoom 值
3. **驗證完整性**：確認所有功能正常（配對、提交、分頁等）
4. **部署決策**：根據測試結果決定是否部署

---

**修復版本**：v74.0  
**狀態**：✅ **代碼修改完成，待測試驗證**  
**修復文件**：
- `public/games/match-up-game/scenes/handler.js`
- `public/games/_template/scenes/handler.js`

