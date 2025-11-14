# v195.0 修復：分頁按鈕事件監聽器丟失（完整解決方案）

## 🔍 **問題描述**

**遊戲**：Match-up Game（配對遊戲）- 分離模式

**症狀**：
- 提交答案完成後進入第2頁 ✅
- 返回第1頁，卡片和指標都正確恢復 ✅
- 再進入第2頁時，+ 按鈕沒反應 ❌

**用戶流程**：
1. 第1頁：拖動卡片，提交答案
2. 進入第2頁（+ 按鈕正常工作）
3. 返回第1頁（- 按鈕正常工作）
4. 再進入第2頁（+ 按鈕沒反應）❌

---

## 🎯 **根本原因分析**

### 問題 1：閉包變數陷阱（v194.0 發現）
在 `createPageSelector()` 中，事件監聽器使用的是**閉包中的 `canGoNext` 變數**：

```javascript
const canGoNext = this.currentPage < this.totalPages - 1;  // 第 7206 行

increaseBtn.on('pointerdown', () => {
    if (canGoNext) {  // ⚠️ 這是閉包中的變數，不會動態更新！
        this.goToNextPage();
        this.updatePageSelectorText();
    }
});
```

### 問題 2：setInteractive() 移除事件監聽器（v195.0 發現）
在 `updatePageSelectorText()` 中，調用 `setInteractive()` 會**移除舊的事件監聽器**：

```javascript
// ❌ 錯誤做法
if (canGoNext) {
    increaseBtn.setInteractive(...);  // 第一次設置
    increaseBtn.setInteractive({ useHandCursor: true });  // ⚠️ 移除第一次的事件監聽器！
}
```

---

## ✅ **v195.0 完整修復方案**

**核心思想**：在 `updatePageSelectorText()` 中，**不要調用 `setInteractive()`**，只更新顏色和禁用狀態。

```javascript
// ✅ 正確做法（v195.0）
updatePageSelectorText() {
    const { text, decreaseBtn, increaseBtn } = this.pageSelectorComponents;

    // 更新頁碼文字
    text.setText(`${this.currentPage + 1}/${this.totalPages}`);

    const canGoPrevious = this.currentPage > 0;
    const canGoNext = this.currentPage < this.totalPages - 1;

    // 🔥 [v195.0] 只更新顏色和禁用狀態，不調用 setInteractive()
    decreaseBtn.setFillStyle(canGoPrevious ? 0x2196F3 : 0xcccccc);
    if (!canGoPrevious) {
        decreaseBtn.disableInteractive();
    } else {
        // 如果按鈕被禁用，重新啟用它
        if (!decreaseBtn.input) {
            decreaseBtn.setInteractive(
                new Phaser.Geom.Rectangle(0, 0, 24, 24),
                Phaser.Geom.Rectangle.Contains,
                { useHandCursor: true }
            );
        }
    }

    // 同樣處理增加按鈕...
}
```

### 修改位置

**文件**：`public/games/match-up-game/scenes/game.js`

**函數**：`updatePageSelectorText()`

**行號**：第 7439-7495 行

---

## 📊 **修復前後對比**

### 修復前（v193.0）
```javascript
// 減少按鈕
if (canGoPrevious) {
    decreaseBtn.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 24, 24),
        Phaser.Geom.Rectangle.Contains
    );
    decreaseBtn.setInteractive({ useHandCursor: true });  // ❌ 移除事件監聽器
}

// 增加按鈕
if (canGoNext) {
    increaseBtn.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 24, 24),
        Phaser.Geom.Rectangle.Contains
    );
    increaseBtn.setInteractive({ useHandCursor: true });  // ❌ 移除事件監聽器
}
```

### 修復後（v194.0）
```javascript
// 減少按鈕
if (canGoPrevious) {
    decreaseBtn.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 24, 24),
        Phaser.Geom.Rectangle.Contains,
        { useHandCursor: true }  // ✅ 在同一個調用中設置
    );
}

// 增加按鈕
if (canGoNext) {
    increaseBtn.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 24, 24),
        Phaser.Geom.Rectangle.Contains,
        { useHandCursor: true }  // ✅ 在同一個調用中設置
    );
}
```

---

## 🧪 **測試步驟**

1. ✅ 打開遊戲
2. ✅ 第1頁：拖動所有卡片到空白框
3. ✅ 點擊「提交答案」按鈕
4. ✅ 進入第2頁（+ 按鈕應該正常工作）
5. ✅ 點擊 - 按鈕返回第1頁
6. ✅ 驗證卡片和指標都正確恢復
7. ✅ 點擊 + 按鈕進入第2頁（**這次應該正常工作**）
8. ✅ 驗證按鈕響應正常

---

## 💡 **最佳實踐**

### Phaser setInteractive() 用法

**正確做法**：在一個調用中設置所有選項
```javascript
object.setInteractive(
    hitArea,
    callback,
    { useHandCursor: true, ...otherOptions }
);
```

**錯誤做法**：多次調用 setInteractive()
```javascript
// ❌ 不要這樣做
object.setInteractive(hitArea, callback);
object.setInteractive({ useHandCursor: true });  // 會覆蓋上面的設置
```

---

## 📝 **相關版本**

- **v192.0**：修復卡片位置和視覺指示器恢復
- **v193.0**：修復卡片本地座標設置
- **v194.0**：修復分頁按鈕事件監聽器丟失（當前版本）

---

## 🔗 **相關文檔**

- `GAME_ISSUES_AND_SOLUTIONS_REFERENCE.md` - 遊戲問題集
- `PHASER_CONTAINER_COORDINATE_SYSTEM_GUIDE.md` - Phaser 技術指南

---

## 更新日誌

- **2025-11-12**：v194.0 修復完成

