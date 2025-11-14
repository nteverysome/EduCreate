# 遊戲視覺反饋實現快速參考

## 🎯 快速實現模板

### 1. 正確答案標記（綠色勾勾）

```javascript
showCorrectMark(containerX, containerY, offsetX, offsetY) {
    // 計算世界座標
    const worldX = containerX + offsetX;
    const worldY = containerY + offsetY;
    
    // 創建標記
    const mark = this.add.text(worldX, worldY, '✓', {
        fontSize: '80px',
        color: '#4caf50',  // 綠色
        fontFamily: 'Arial',
        fontStyle: 'bold'
    });
    
    // 設置屬性
    mark.setOrigin(0.5);
    mark.setDepth(2000);
    
    return mark;
}
```

### 2. 錯誤答案標記（紅色叉叉）

```javascript
showIncorrectMark(containerX, containerY, offsetX, offsetY) {
    // 計算世界座標
    const worldX = containerX + offsetX;
    const worldY = containerY + offsetY;
    
    // 創建標記
    const mark = this.add.text(worldX, worldY, '✗', {
        fontSize: '80px',
        color: '#f44336',  // 紅色
        fontFamily: 'Arial',
        fontStyle: 'bold'
    });
    
    // 設置屬性
    mark.setOrigin(0.5);
    mark.setDepth(2000);
    
    return mark;
}
```

### 3. 通用標記函數

```javascript
showMark(containerX, containerY, offsetX, offsetY, text, color, fontSize = '80px') {
    const worldX = containerX + offsetX;
    const worldY = containerY + offsetY;
    
    const mark = this.add.text(worldX, worldY, text, {
        fontSize: fontSize,
        color: color,
        fontFamily: 'Arial',
        fontStyle: 'bold'
    });
    
    mark.setOrigin(0.5);
    mark.setDepth(2000);
    
    return mark;
}

// 使用示例
this.showMark(500, 300, 100, -50, '✓', '#4caf50');  // 綠色勾勾
this.showMark(500, 300, 100, -50, '✗', '#f44336');  // 紅色叉叉
```

---

## 📐 座標計算公式

### 在容器右上角放置標記

```javascript
// 假設：
// - 容器位置：(containerX, containerY)
// - 背景寬度：width
// - 背景高度：height
// - 邊距：margin

// 相對座標
const relativeX = width / 2 - margin;
const relativeY = -height / 2 + margin;

// 世界座標
const worldX = containerX + relativeX;
const worldY = containerY + relativeY;

// 實際例子
const containerX = 1008.8;
const containerY = 508.3675;
const width = 330;
const height = 106.1225;
const margin = 32;

const worldX = containerX + (width / 2 - margin);      // 1141.8
const worldY = containerY + (-height / 2 + margin);    // 487.3675
```

### 在容器中心放置標記

```javascript
const worldX = containerX;
const worldY = containerY;
```

### 在容器左下角放置標記

```javascript
const relativeX = -width / 2 + margin;
const relativeY = height / 2 - margin;

const worldX = containerX + relativeX;
const worldY = containerY + relativeY;
```

---

## 🎨 推薦的顏色方案

| 用途 | 顏色代碼 | RGB | 說明 |
|------|--------|-----|------|
| 正確 | #4caf50 | (76, 175, 80) | 綠色 |
| 錯誤 | #f44336 | (244, 67, 54) | 紅色 |
| 警告 | #ff9800 | (255, 152, 0) | 橙色 |
| 信息 | #2196f3 | (33, 150, 243) | 藍色 |
| 中立 | #9e9e9e | (158, 158, 158) | 灰色 |

---

## 📏 推薦的字體大小

| 用途 | 字體大小 | 說明 |
|------|--------|------|
| 標記（勾勾/叉叉） | 80px | 清晰可見 |
| 標題 | 48px | 突出 |
| 正文 | 24px | 易讀 |
| 小提示 | 16px | 輔助信息 |

---

## ⚡ 性能優化

### 1. 重用標記對象

```javascript
// ❌ 不推薦：每次都創建新對象
function showMark() {
    const mark = this.add.text(...);
    return mark;
}

// ✅ 推薦：重用對象
class MarkManager {
    constructor(scene) {
        this.scene = scene;
        this.marks = [];
    }
    
    showMark(x, y, text, color) {
        let mark = this.marks.find(m => !m.visible);
        
        if (!mark) {
            mark = this.scene.add.text(x, y, text, {
                fontSize: '80px',
                color: color,
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });
            mark.setOrigin(0.5);
            mark.setDepth(2000);
            this.marks.push(mark);
        } else {
            mark.setPosition(x, y);
            mark.setText(text);
            mark.setColor(color);
            mark.setVisible(true);
        }
        
        return mark;
    }
    
    hideMark(mark) {
        mark.setVisible(false);
    }
}
```

### 2. 批量操作

```javascript
// 一次性添加多個標記
function showMultipleMarks(marks) {
    marks.forEach(({ x, y, text, color }) => {
        this.showMark(x, y, text, color);
    });
}
```

---

## 🐛 常見問題排查

### 問題 1：標記看不到

```javascript
// 檢查清單
console.log('標記位置:', { x: mark.x, y: mark.y });
console.log('標記深度:', mark.depth);
console.log('標記可見:', mark.visible);
console.log('標記透明度:', mark.alpha);
console.log('標記顏色:', mark.color);

// 解決方案
mark.setDepth(2000);      // 提升深度
mark.setVisible(true);    // 確保可見
mark.setAlpha(1);         // 確保不透明
```

### 問題 2：標記位置不對

```javascript
// 檢查座標計算
const expectedX = containerX + offsetX;
const expectedY = containerY + offsetY;
console.log('預期位置:', { x: expectedX, y: expectedY });
console.log('實際位置:', { x: mark.x, y: mark.y });

// 解決方案
mark.setPosition(expectedX, expectedY);
```

### 問題 3：標記被遮擋

```javascript
// 檢查深度
console.log('標記深度:', mark.depth);
console.log('其他元素深度:', otherElement.depth);

// 解決方案
mark.setDepth(Math.max(mark.depth, otherElement.depth + 1));
```

---

## 📋 實現檢查清單

在實現視覺反饋時，確保：

- [ ] 標記在正確的位置
- [ ] 標記的深度足夠高
- [ ] 標記的顏色清晰可見
- [ ] 標記的字體大小足夠大
- [ ] 標記的字體樣式清晰
- [ ] 標記不會被其他元素遮擋
- [ ] 標記的動畫流暢（如果有）
- [ ] 標記的性能良好
- [ ] 標記在所有設備上都能正確顯示
- [ ] 標記的無障礙設計考慮（顏色對比度）

---

## 🔗 相關代碼位置

- **Match-Up Game 實現**：`public/games/match-up-game/scenes/game.js`
  - showCorrectAnswerOnCard：第 7501-7567 行
  - showIncorrectAnswerOnCard：第 7568-7637 行

- **完整文檔**：`MATCH_UP_GAME_X_MARK_FIX_DOCUMENTATION.md`
- **技術指南**：`PHASER_CONTAINER_COORDINATE_SYSTEM_GUIDE.md`

---

## 💡 最佳實踐總結

1. **使用世界座標**：直接在場景中渲染視覺反饋
2. **設置足夠的深度**：確保標記在最上方
3. **使用清晰的顏色**：確保高對比度
4. **使用足夠大的字體**：確保易讀性
5. **添加詳細的日誌**：便於調試
6. **測試所有情況**：正確、錯誤、邊界情況
7. **考慮性能**：重用對象，避免頻繁創建
8. **考慮無障礙**：顏色對比度、字體大小

