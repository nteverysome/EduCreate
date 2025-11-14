# v196.0 修復：分頁按鈕無限往返支持

## 🔍 **問題描述**

**遊戲**：Match-up Game（配對遊戲）- 分離模式

**症狀**：
- 第1頁 → 第2頁 ✅
- 第2頁 → 第1頁 ✅
- 第1頁 → 第2頁 ❌（按鈕沒反應）
- 無法無限往返

**用戶流程**：
1. 第1頁：拖動卡片，提交答案
2. 進入第2頁（+ 按鈕正常工作）
3. 返回第1頁（- 按鈕正常工作）
4. 再進入第2頁（+ 按鈕沒反應）❌

---

## 🎯 **根本原因**

### 問題 1：createPageSelector() 中的雙重 setInteractive()
```javascript
// ❌ 錯誤做法
decreaseBtn.setInteractive(
    new Phaser.Geom.Rectangle(0, 0, 24, 24),
    Phaser.Geom.Rectangle.Contains
);
decreaseBtn.setInteractive({ useHandCursor: true });  // ⚠️ 移除第一次的事件監聽器！
```

### 問題 2：事件監聽器使用閉包變數
```javascript
// ❌ 錯誤做法
const canGoNext = this.currentPage < this.totalPages - 1;  // 在函數開始時計算

increaseBtn.on('pointerdown', () => {
    if (canGoNext) {  // ⚠️ 這是舊值，不會更新！
        this.goToNextPage();
    }
});
```

---

## ✅ **v196.0 完整修復**

### 修復 1：合併 setInteractive() 調用
```javascript
// ✅ 正確做法
if (canGoPrevious) {
    decreaseBtn.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 24, 24),
        Phaser.Geom.Rectangle.Contains,
        { useHandCursor: true }  // 在同一個調用中設置
    );
}
```

### 修復 2：使用動態檢查而不是閉包變數
```javascript
// ✅ 正確做法
increaseBtn.on('pointerdown', () => {
    // 動態檢查當前頁面狀態
    if (this.currentPage < this.totalPages - 1) {
        this.goToNextPage();
        this.updatePageSelectorText();
    }
});
```

### 修復 3：updatePageSelectorText() 中不調用 setInteractive()
```javascript
// ✅ 正確做法
updatePageSelectorText() {
    // 只更新顏色和禁用狀態，不調用 setInteractive()
    decreaseBtn.setFillStyle(canGoPrevious ? 0x2196F3 : 0xcccccc);
    if (!canGoPrevious) {
        decreaseBtn.disableInteractive();
    } else {
        if (!decreaseBtn.input) {
            decreaseBtn.setInteractive(...);
        }
    }
}
```

---

## 📝 **修改位置**

**文件**：`public/games/match-up-game/scenes/game.js`

**修改點**：
1. 第 7236-7252 行：修復減少按鈕的 setInteractive() 調用
2. 第 7264-7280 行：修復增加按鈕的 setInteractive() 調用
3. 第 7292-7330 行：修復事件監聽器使用動態檢查
4. 第 7439-7495 行：修復 updatePageSelectorText() 不調用 setInteractive()

---

## 🧪 **測試流程**

1. ✅ 打開遊戲
2. ✅ 第1頁：拖動卡片，提交答案
3. ✅ 進入第2頁（+ 按鈕正常工作）
4. ✅ 返回第1頁（- 按鈕正常工作）
5. ✅ **再進入第2頁（+ 按鈕應該正常工作）**
6. ✅ **再返回第1頁（- 按鈕應該正常工作）**
7. ✅ **重複多次往返，驗證按鈕始終正常工作**

---

## 💡 **最佳實踐**

### Phaser 事件監聽器設計原則

1. **避免閉包變數陷阱**
   ```javascript
   // ❌ 不要這樣做
   const canClick = this.currentPage > 0;
   button.on('click', () => {
       if (canClick) { ... }  // 舊值！
   });
   
   // ✅ 應該這樣做
   button.on('click', () => {
       if (this.currentPage > 0) { ... }  // 動態檢查
   });
   ```

2. **避免重複調用 setInteractive()**
   ```javascript
   // ❌ 不要這樣做
   button.setInteractive(hitArea, callback);
   button.setInteractive({ useHandCursor: true });  // 移除上面的設置
   
   // ✅ 應該這樣做
   button.setInteractive(hitArea, callback, { useHandCursor: true });
   ```

3. **在更新時保留事件監聽器**
   ```javascript
   // ❌ 不要這樣做
   button.setInteractive(...);  // 移除舊的事件監聽器
   
   // ✅ 應該這樣做
   button.setFillStyle(...);  // 只更新視覺效果
   button.disableInteractive();  // 只禁用，不移除監聽器
   ```

---

## 📚 **相關版本**

- **v192.0**：修復卡片位置和視覺指示器恢復
- **v193.0**：修復卡片本地座標設置
- **v194.0**：修復分頁按鈕事件監聽器丟失（第一次嘗試）
- **v195.0**：修復 updatePageSelectorText() 中的 setInteractive()
- **v196.0**：完整修復 - 支持無限往返（當前版本）

---

## 更新日誌

- **2025-11-12**：v196.0 修復完成 - 支持無限往返

