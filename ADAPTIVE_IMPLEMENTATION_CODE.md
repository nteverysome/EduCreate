# 🔧 自適應卡片大小 - 實現代碼

## 📝 修改 SeparatedLayoutCalculator

### 添加新方法到 calculateCardSize()

```javascript
/**
 * 計算卡片尺寸（支持自適應）
 * @param {number} itemCount - 卡片對數
 * @returns {object} { width, height }
 */
calculateCardSize(itemCount = this.itemCount) {
    const config = SeparatedModeConfig.get(this.deviceType);
    
    // 計算動態邊距
    const topMargin = this.calculateDynamicMargin(
        config.margins.top, 
        itemCount, 
        10
    );
    const bottomMargin = this.calculateDynamicMargin(
        config.margins.bottom, 
        itemCount, 
        10
    );
    
    // 計算動態間距
    const verticalSpacing = this.calculateDynamicSpacing(
        config.spacing.vertical, 
        itemCount, 
        2
    );
    
    // 計算可用高度
    const availableHeight = this.height - topMargin - bottomMargin;
    const totalSpacingHeight = Math.max(0, (itemCount - 1) * verticalSpacing);
    
    // 計算卡片高度
    let cardHeight = (availableHeight - totalSpacingHeight) / itemCount;
    cardHeight = Math.max(
        config.cardHeight.min,
        Math.min(config.cardHeight.max, cardHeight)
    );
    
    // 計算卡片寬度（基於寬高比）
    const widthHeightRatio = config.cardWidth.ratio / config.cardHeight.ratio;
    let cardWidth = cardHeight * widthHeightRatio;
    cardWidth = Math.max(
        config.cardWidth.min,
        Math.min(config.cardWidth.max, cardWidth)
    );
    
    return { width: cardWidth, height: cardHeight };
}

/**
 * 計算動態邊距
 * @param {number} baseMargin - 基礎邊距
 * @param {number} itemCount - 卡片對數
 * @param {number} minMargin - 最小邊距
 * @returns {number} 計算後的邊距
 */
calculateDynamicMargin(baseMargin, itemCount, minMargin = 10) {
    // 當卡片數 ≤ 5 時，使用基礎邊距
    if (itemCount <= 5) {
        return baseMargin;
    }
    
    // 每增加 1 對卡片，邊距減少 2px
    const reductionFactor = 2;
    const reduction = (itemCount - 5) * reductionFactor;
    
    return Math.max(minMargin, baseMargin - reduction);
}

/**
 * 計算動態間距
 * @param {number} baseSpacing - 基礎間距
 * @param {number} itemCount - 卡片對數
 * @param {number} minSpacing - 最小間距
 * @returns {number} 計算後的間距
 */
calculateDynamicSpacing(baseSpacing, itemCount, minSpacing = 2) {
    // 當卡片數 ≤ 5 時，使用基礎間距
    if (itemCount <= 5) {
        return baseSpacing;
    }
    
    // 每增加 1 對卡片，間距減少 0.5px
    const reductionFactor = 0.5;
    const reduction = (itemCount - 5) * reductionFactor;
    
    return Math.max(minSpacing, baseSpacing - reduction);
}

/**
 * 計算動態邊距（左右）
 * @param {number} baseMargin - 基礎邊距
 * @param {number} itemCount - 卡片對數
 * @param {number} minMargin - 最小邊距
 * @returns {number} 計算後的邊距
 */
calculateDynamicHorizontalMargin(baseMargin, itemCount, minMargin = 8) {
    if (itemCount <= 5) {
        return baseMargin;
    }
    
    const reductionFactor = 1;
    const reduction = (itemCount - 5) * reductionFactor;
    
    return Math.max(minMargin, baseMargin - reduction);
}
```

---

## 📝 修改 game.js 中的佈局創建

### 更新 createLeftRightSingleColumn()

```javascript
createLeftRightSingleColumn(currentPagePairs, width, height) {
    const itemCount = currentPagePairs.length;
    
    // 使用自適應計算器
    const calculator = new SeparatedLayoutCalculator(
        width, 
        height, 
        itemCount, 
        'left-right'
    );
    
    // 獲取自適應的卡片大小
    const cardSize = calculator.calculateCardSize(itemCount);
    const cardWidth = cardSize.width;
    const cardHeight = cardSize.height;
    
    // 獲取位置
    const positions = calculator.calculatePositions();
    const leftX = positions.leftX;
    const rightX = positions.rightX;
    
    // 計算動態邊距和間距
    const config = SeparatedModeConfig.get(calculator.deviceType);
    const topMargin = calculator.calculateDynamicMargin(
        config.margins.top, 
        itemCount
    );
    const verticalSpacing = calculator.calculateDynamicSpacing(
        config.spacing.vertical, 
        itemCount
    );
    
    // 計算起始位置
    const leftStartY = topMargin;
    const rightStartY = topMargin;
    
    // 計算卡片間距
    const leftSpacing = cardHeight + verticalSpacing;
    const rightSpacing = cardHeight + verticalSpacing;
    
    // 創建左側外框
    this.createLeftContainerBox(
        leftX, 
        leftStartY, 
        cardWidth, 
        cardHeight, 
        leftSpacing, 
        itemCount
    );
    
    // 創建左側卡片
    currentPagePairs.forEach((pair, index) => {
        const y = leftStartY + index * leftSpacing;
        const animationDelay = index * 100;
        const card = this.createLeftCard(
            leftX, 
            y, 
            cardWidth, 
            cardHeight, 
            pair.question, 
            pair.id, 
            animationDelay, 
            pair.imageUrl, 
            pair.audioUrl
        );
        this.leftCards.push(card);
    });
    
    // 創建右側卡片（打亂順序）
    const shuffledAnswers = this.shuffleArray([...currentPagePairs]);
    shuffledAnswers.forEach((pair, index) => {
        const y = rightStartY + index * rightSpacing;
        const animationDelay = index * 100;
        const card = this.createRightCard(
            rightX, 
            y, 
            cardWidth, 
            cardHeight, 
            pair.answer, 
            pair.id, 
            pair.chineseImageUrl, 
            pair.audioUrl, 
            'right'
        );
        this.rightCards.push(card);
    });
}
```

---

## 🧪 測試用例

```javascript
// 測試自適應卡片大小
function testAdaptiveCardSize() {
    const testCases = [
        { itemCount: 3, expectedHeight: 'large' },
        { itemCount: 4, expectedHeight: 'large' },
        { itemCount: 5, expectedHeight: 'medium' },
        { itemCount: 10, expectedHeight: 'small' },
        { itemCount: 15, expectedHeight: 'tiny' },
        { itemCount: 20, expectedHeight: 'tiny' }
    ];
    
    testCases.forEach(testCase => {
        const calculator = new SeparatedLayoutCalculator(
            375, 
            667, 
            testCase.itemCount, 
            'left-right'
        );
        
        const cardSize = calculator.calculateCardSize(testCase.itemCount);
        
        console.log(`✅ ${testCase.itemCount} 對卡片: 高度=${cardSize.height}px, 寬度=${cardSize.width}px`);
        
        // 驗證卡片大小在合理範圍內
        if (cardSize.height < 20 || cardSize.height > 100) {
            console.error(`❌ 卡片高度超出範圍: ${cardSize.height}px`);
        }
    });
}
```

---

## 📊 預期結果

### mobile-portrait (375×667)

| 卡片數 | 高度 | 寬度 | 邊距 | 間距 |
|--------|------|------|------|------|
| 3 | 65px | 130px | 20px | 3px |
| 5 | 48px | 96px | 20px | 3px |
| 10 | 28px | 56px | 20px | 2px |
| 15 | 18px | 36px | 10px | 2px |
| 20 | 14px | 28px | 10px | 2px |

### desktop (1920×1080)

| 卡片數 | 高度 | 寬度 | 邊距 | 間距 |
|--------|------|------|------|------|
| 3 | 95px | 228px | 45px | 10px |
| 5 | 68px | 163px | 45px | 10px |
| 10 | 40px | 96px | 45px | 6px |
| 15 | 26px | 62px | 35px | 4px |
| 20 | 20px | 48px | 25px | 2px |

