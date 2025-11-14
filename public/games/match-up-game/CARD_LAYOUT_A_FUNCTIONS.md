# 英文卡片佈局 A 相關函數

## 📋 函數調用流程

```
createCardLayoutA()
    ├─ createAudioButton()
    ├─ loadAndDisplayImage()
    └─ createTextElement()
```

---

## 1️⃣ 主函數：createCardLayoutA()

**位置**：第 5360-5425 行

**功能**：創建英文卡片佈局 A（聲音按鈕 + 圖片 + 文字）

```javascript
createCardLayoutA(container, background, width, height, text, imageUrl, audioUrl, pairId) {
    // 🔥 首先添加背景（最底層）
    container.add([background]);

    // 1️⃣ 語音按鈕區域（上方 20%）
    const buttonAreaHeight = height * 0.2;
    const buttonAreaY = -height / 2 + buttonAreaHeight / 2;
    
    // 按鈕大小計算（來自 contentSizes）
    const buttonSize = this.currentPageItemCount === 20
        ? Math.min(6, buttonAreaHeight * 0.0875)   // 20 個卡片
        : Math.min(7, buttonAreaHeight * 0.1125);  // 其他情況
    
    // 確保按鈕不超出卡片邊界
    const maxButtonRadius = buttonAreaHeight / 2;
    const constrainedButtonSize = Math.min(buttonSize, maxButtonRadius * 2 * 0.9);
    
    this.createAudioButton(container, audioUrl, 0, buttonAreaY, constrainedButtonSize, pairId);

    // 2️⃣ 圖片區域（中間 50%）
    const imageAreaHeight = height * 0.5;
    const imageAreaY = -height / 2 + buttonAreaHeight + imageAreaHeight / 2;
    const squareSize = Math.min(width - 4, imageAreaHeight - 4);
    
    this.loadAndDisplayImage(container, imageUrl, 0, imageAreaY, squareSize, `english-${pairId}`);

    // 3️⃣ 文字區域（下方 30%）
    const textAreaHeight = height * 0.3;
    const bottomPadding = Math.max(6, height * 0.06);
    const textHeight = textAreaHeight - bottomPadding;
    const textAreaY = height / 2 - bottomPadding - textHeight / 2;
    
    if (text && text.trim() !== '' && text.trim() !== '<br>') {
        this.createTextElement(container, text, 0, textAreaY, width, textHeight);
    }
}
```

### 📐 尺寸計算

| 部分 | 高度 | Y 位置 | 說明 |
|------|------|--------|------|
| 按鈕 | 20% | -height × 0.4 | 卡片頂部 |
| 圖片 | 50% | -height × 0.05 | 卡片中間 |
| 文字 | 30% | height × 0.45 | 卡片底部 |

---

## 2️⃣ 聲音按鈕函數：createAudioButton()

**位置**：第 5786-5856 行

**功能**：創建可點擊的聲音按鈕

```javascript
createAudioButton(container, audioUrl, x, y, size, pairId) {
    // 使用 contentSizes 中的按鈕大小
    const contentSizes = this.currentContentSizes;
    const buttonSize = contentSizes
        ? contentSizes.audioButton.size
        : Math.max(50, Math.min(80, size * 0.6));

    // 創建按鈕背景（綠色正方形）
    const buttonBg = this.add.rectangle(0, 0, buttonSize, buttonSize, 0x4CAF50);
    buttonBg.setStrokeStyle(2, 0x2E7D32);
    buttonBg.setOrigin(0.5);

    // 創建喇叭圖標
    const speakerIcon = this.add.text(0, 0, '🔊', {
        fontSize: `${buttonSize * 0.6}px`,
        fontFamily: 'Arial'
    });
    speakerIcon.setOrigin(0.5);

    // 創建按鈕容器
    const buttonContainer = this.add.container(0, 0, [buttonBg, speakerIcon]);
    buttonContainer.setSize(size, size);
    buttonContainer.setInteractive({ useHandCursor: true });
    buttonContainer.setPosition(x, y);

    // 儲存數據
    buttonContainer.setData('audioUrl', audioUrl);
    buttonContainer.setData('isPlaying', false);
    buttonContainer.setData('pairId', pairId);

    // 點擊事件
    buttonContainer.on('pointerdown', (pointer, localX, localY, event) => {
        event.stopPropagation();
        this.playAudio(audioUrl, buttonContainer, buttonBg);
    });

    // Hover 效果
    buttonContainer.on('pointerover', () => {
        buttonBg.setFillStyle(0x45a049);  // 深綠色
    });

    buttonContainer.on('pointerout', () => {
        if (!buttonContainer.getData('isPlaying')) {
            buttonBg.setFillStyle(0x4CAF50);  // 原綠色
        }
    });

    container.add(buttonContainer);
    return buttonContainer;
}
```

### 🎨 按鈕樣式

- **背景色**：0x4CAF50（綠色）
- **邊框色**：0x2E7D32（深綠色）
- **Hover 色**：0x45a049（深綠色）
- **圖標**：🔊 喇叭符號

---

## 3️⃣ 圖片加載函數：loadAndDisplayImage()

**位置**：第 5590-5650 行

**功能**：異步加載並顯示圖片

```javascript
loadAndDisplayImage(container, imageUrl, x, y, size, pairId) {
    const imageKey = `card-image-${pairId}`;

    if (!this.textures.exists(imageKey)) {
        return new Promise((resolve, reject) => {
            fetch(imageUrl)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.blob();
                })
                .then(blob => {
                    const objectUrl = URL.createObjectURL(blob);
                    const image = new Image();
                    
                    image.onload = () => {
                        this.textures.addImage(imageKey, image);
                        const cardImage = this.add.image(0, 0, imageKey);
                        cardImage.setDisplaySize(size, size);
                        cardImage.setOrigin(0.5);
                        cardImage.setPosition(x, y);
                        container.add(cardImage);
                        resolve();
                    };
                    
                    image.onerror = () => {
                        reject(new Error(`Failed to load image: ${imageKey}`));
                    };
                    
                    image.src = objectUrl;
                })
                .catch(error => reject(error));
        });
    } else {
        // 已經載入過，直接使用
        const cardImage = this.add.image(x, y, imageKey);
        cardImage.setDisplaySize(size, size);
        cardImage.setOrigin(0.5);
        container.add(cardImage);
        return Promise.resolve();
    }
}
```

### 特點

- ✅ 使用 Fetch API 加載圖片
- ✅ 支持圖片快取
- ✅ 異步加載，不阻塞遊戲
- ✅ 1:1 正方形顯示

---

## 4️⃣ 文字創建函數：createTextElement()

**位置**：第 5653-5722 行

**功能**：創建自動調整大小的文字

```javascript
createTextElement(container, text, x, y, width, height) {
    // 使用 contentSizes 中的字體大小
    const contentSizes = this.currentContentSizes;
    let fontSize = contentSizes
        ? contentSizes.text.fontSize
        : Math.max(14, Math.min(48, height * 0.6));

    // 創建臨時文字測量尺寸
    const tempText = this.add.text(0, 0, text, {
        fontSize: `${fontSize}px`,
        fontFamily: 'Arial'
    });

    // 計算最大寬度和高度
    const maxTextWidth = width * 0.85;   // 留 15% 邊距
    const maxTextHeight = height * 0.9;  // 留 10% 邊距

    // 如果超過邊界，逐步縮小字體
    while ((tempText.width > maxTextWidth || tempText.height > maxTextHeight) && fontSize > 12) {
        fontSize -= 2;
        tempText.setFontSize(fontSize);
    }

    tempText.destroy();

    // 創建最終文字
    const cardText = this.add.text(x, y, text, {
        fontSize: `${fontSize}px`,
        color: '#333333',
        fontFamily: 'Arial',
        fontStyle: 'normal'
    });
    cardText.setOrigin(0.5);
    container.add(cardText);

    return cardText;
}
```

### 特點

- ✅ 自動調整字體大小
- ✅ 確保文字不超出邊界
- ✅ 支持多行文字
- ✅ 最小字體 12px

---

## 📊 完整流程圖

```
┌─────────────────────────────────────┐
│  createCardLayoutA()                │
│  (width, height, text, image, audio)│
└────────────┬────────────────────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
┌────────┐ ┌──────────────┐ ┌──────────────┐
│按鈕    │ │圖片          │ │文字          │
│20%高度 │ │50%高度       │ │30%高度       │
│Y=-0.4h │ │Y=-0.05h      │ │Y=0.45h       │
└────────┘ └──────────────┘ └──────────────┘
```

---

**版本**：v220.0
**最後更新**：2025-11-14

