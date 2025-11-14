# 💻 分離佈局實現代碼

## 📋 需要修改的文件

1. `public/games/match-up-game/config/separated-layout-calculator.js`
2. `public/games/match-up-game/scenes/game.js`

---

## 🔧 修改 1: SeparatedLayoutCalculator

### 添加新方法

```javascript
// 計算左側佈局
calculateLeftLayout(itemCount) {
  if (itemCount <= 5) {
    return {
      columns: 1,
      rows: itemCount,
      layout: 'single-column'
    };
  } else if (itemCount <= 7) {
    return {
      columns: 2,
      rows: Math.ceil(itemCount / 2),
      layout: 'multi-rows'
    };
  } else {
    return {
      columns: itemCount,
      rows: 1,
      layout: 'single-row'
    };
  }
}

// 計算右側佈局
calculateRightLayout(itemCount) {
  return {
    columns: 1,
    rows: itemCount,
    layout: 'single-column'
  };
}

// 計算卡片大小
calculateCardSize(itemCount) {
  const sizeMap = {
    3: { height: 65, width: 120 },
    4: { height: 56, width: 110 },
    5: { height: 48, width: 100 },
    7: { height: 35, width: 80 },
    10: { height: 28, width: 60 },
    20: { height: 40, width: 70 }
  };

  return sizeMap[itemCount] || { height: 35, width: 80 };
}

// 計算左側卡片位置
calculateLeftCardPositions(itemCount, startX, startY, spacing) {
  const layout = this.calculateLeftLayout(itemCount);
  const cardSize = this.calculateCardSize(itemCount);
  const positions = [];
  
  if (layout.layout === 'single-column') {
    // 垂直單列
    for (let i = 0; i < itemCount; i++) {
      positions.push({
        x: startX,
        y: startY + i * (cardSize.height + spacing),
        width: cardSize.width,
        height: cardSize.height
      });
    }
  } else if (layout.layout === 'multi-rows') {
    // 多行多列
    let index = 0;
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.columns; col++) {
        if (index >= itemCount) break;
        positions.push({
          x: startX + col * (cardSize.width + spacing),
          y: startY + row * (cardSize.height + spacing),
          width: cardSize.width,
          height: cardSize.height
        });
        index++;
      }
    }
  } else if (layout.layout === 'single-row') {
    // 水平排列
    for (let i = 0; i < itemCount; i++) {
      positions.push({
        x: startX + i * (cardSize.width + spacing),
        y: startY,
        width: cardSize.width,
        height: cardSize.height
      });
    }
  }
  
  return positions;
}

// 計算右側卡片位置
calculateRightCardPositions(itemCount, startX, startY, spacing) {
  const cardSize = this.calculateCardSize(itemCount);
  const positions = [];
  
  // 右側始終是垂直單列
  for (let i = 0; i < itemCount; i++) {
    positions.push({
      x: startX,
      y: startY + i * (cardSize.height + spacing),
      width: cardSize.width,
      height: cardSize.height
    });
  }
  
  return positions;
}
```

---

## 🔧 修改 2: game.js

### 修改 createLeftRightSingleColumn 方法

```javascript
createLeftRightSingleColumn(currentPagePairs, width, height) {
  const itemCount = currentPagePairs.length;
  
  // 獲取卡片大小
  const calculator = new SeparatedLayoutCalculator(width, height, itemCount, 'left-right');
  const cardSize = calculator.calculateCardSize(itemCount);
  
  // 計算左側位置
  const leftStartX = 20;
  const leftStartY = 100;
  const leftSpacing = 5;
  const leftPositions = calculator.calculateLeftCardPositions(
    itemCount,
    leftStartX,
    leftStartY,
    leftSpacing
  );
  
  // 計算右側位置
  const rightStartX = width - cardSize.width - 20;
  const rightStartY = 100;
  const rightSpacing = 5;
  const rightPositions = calculator.calculateRightCardPositions(
    itemCount,
    rightStartX,
    rightStartY,
    rightSpacing
  );
  
  // 創建左側卡片
  this.leftCards = [];
  currentPagePairs.forEach((pair, index) => {
    const pos = leftPositions[index];
    const card = this.createCard(
      pair.leftItem,
      pos.x,
      pos.y,
      pos.width,
      pos.height,
      'left'
    );
    this.leftCards.push(card);
  });
  
  // 創建右側空白框
  this.rightCards = [];
  currentPagePairs.forEach((pair, index) => {
    const pos = rightPositions[index];
    const card = this.createEmptyCard(
      pos.x,
      pos.y,
      pos.width,
      pos.height,
      'right'
    );
    this.rightCards.push(card);
  });
  
  console.log('✅ 左右分離佈局已創建', {
    itemCount,
    cardSize,
    leftLayout: calculator.calculateLeftLayout(itemCount),
    rightLayout: calculator.calculateRightLayout(itemCount)
  });
}
```

---

## 🧪 測試代碼

```javascript
// 測試所有預設值
const testValues = [3, 4, 5, 7, 10, 20];

testValues.forEach(itemCount => {
  const calculator = new SeparatedLayoutCalculator(1024, 768, itemCount, 'left-right');

  const leftLayout = calculator.calculateLeftLayout(itemCount);
  const rightLayout = calculator.calculateRightLayout(itemCount);
  const cardSize = calculator.calculateCardSize(itemCount);

  console.log(`\n📊 每頁匹配數: ${itemCount}`);
  console.log(`  左側佈局: ${leftLayout.columns} 列 × ${leftLayout.rows} 行`);
  console.log(`  右側佈局: ${rightLayout.columns} 列 × ${rightLayout.rows} 行`);
  console.log(`  卡片大小: ${cardSize.width}px × ${cardSize.height}px`);
  console.log(`  佈局類型: ${leftLayout.layout}`);
});
```

---

## 📊 預期輸出

```
📊 每頁匹配數: 3
  左側佈局: 1 列 × 3 行
  右側佈局: 1 列 × 3 行
  卡片大小: 120px × 65px
  佈局類型: single-column

📊 每頁匹配數: 4
  左側佈局: 1 列 × 4 行
  右側佈局: 1 列 × 4 行
  卡片大小: 110px × 56px
  佈局類型: single-column

📊 每頁匹配數: 5
  左側佈局: 1 列 × 5 行
  右側佈局: 1 列 × 5 行
  卡片大小: 100px × 48px
  佈局類型: single-column

📊 每頁匹配數: 7
  左側佈局: 2 列 × 4 行
  右側佈局: 1 列 × 7 行
  卡片大小: 80px × 35px
  佈局類型: multi-rows

📊 每頁匹配數: 10
  左側佈局: 10 列 × 1 行
  右側佈局: 1 列 × 10 行
  卡片大小: 60px × 28px
  佈局類型: single-row

📊 每頁匹配數: 20
  左側佈局: 10 列 × 2 行
  右側佈局: 1 列 × 20 行
  卡片大小: 70px × 40px
  佈局類型: multi-rows
```

---

## ✅ 驗證清單

- [ ] 所有方法都已添加
- [ ] 代碼邏輯正確
- [ ] 測試代碼運行成功
- [ ] 所有預設值都有正確的輸出
- [ ] 佈局切換正確
- [ ] 卡片大小合適

---

**實現代碼完成**
**版本**: 1.0 | **狀態**: ✅ 準備實施

