# 高成功率修復 - 實施路線圖

## 🚀 快速開始

### 第 1 階段：驗證 v139.0（1-2 天）

#### 1.1 測試清單
```javascript
// 測試場景
const testScenarios = [
    { name: '只有圖片', hasText: false, hasAudio: false, hasImage: true },
    { name: '只有語音', hasText: false, hasAudio: true, hasImage: false },
    { name: '圖片+語音', hasText: false, hasAudio: true, hasImage: true },
    { name: '圖片+文字', hasText: true, hasAudio: false, hasImage: true },
    { name: '語音+文字', hasText: true, hasAudio: true, hasImage: false },
    { name: '全部', hasText: true, hasAudio: true, hasImage: true },
];

// 測試佈局
const testLayouts = ['mixed', 'separated'];

// 測試頁面
const testPages = [1, 2, 3, 5, 10];
```

#### 1.2 驗證腳本
```javascript
function validateMarkDisplay() {
    const results = {
        cardsWithMarks: 0,
        cardsWithoutMarks: 0,
        overlappingMarks: 0,
        correctPositions: 0,
        errors: []
    };
    
    // 檢查所有卡片
    this.leftCards.forEach(card => {
        const hasBackground = card.getData('background');
        const hasCheckMark = card.checkMark;
        const hasXMark = card.xMark;
        
        if (hasBackground && (hasCheckMark || hasXMark)) {
            results.cardsWithMarks++;
        } else if (hasBackground && !hasCheckMark && !hasXMark) {
            results.cardsWithoutMarks++;
        }
    });
    
    return results;
}
```

---

## 🏗️ 第 2 階段：實施 MarkManager（3-5 天）

### 2.1 MarkManager 類設計
```javascript
class MarkManager {
    constructor(scene) {
        this.scene = scene;
        this.marks = new Map(); // 存儲所有標記
    }
    
    createCheckMark(card) {
        this.clearMarks(card);
        
        const background = card.getData('background');
        if (!background) return;
        
        const checkMark = this.scene.add.text(0, 0, '✓', {
            fontSize: '64px',
            color: '#4caf50',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        
        checkMark.setOrigin(0.5);
        checkMark.setDepth(100);
        
        const markX = background.width / 2 - 32;
        const markY = -background.height / 2 + 32;
        checkMark.setPosition(markX, markY);
        
        card.add(checkMark);
        card.checkMark = checkMark;
        
        this.marks.set(card, checkMark);
    }
    
    createXMark(card) {
        this.clearMarks(card);
        
        const background = card.getData('background');
        if (!background) return;
        
        const xMark = this.scene.add.text(0, 0, '✗', {
            fontSize: '64px',
            color: '#f44336',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        
        xMark.setOrigin(0.5);
        xMark.setDepth(100);
        
        const markX = background.width / 2 - 32;
        const markY = -background.height / 2 + 32;
        xMark.setPosition(markX, markY);
        
        card.add(xMark);
        card.xMark = xMark;
        
        this.marks.set(card, xMark);
    }
    
    clearMarks(card) {
        if (card.checkMark) {
            card.checkMark.destroy();
            card.checkMark = null;
        }
        if (card.xMark) {
            card.xMark.destroy();
            card.xMark = null;
        }
        this.marks.delete(card);
    }
    
    clearAllMarks() {
        this.marks.forEach((mark, card) => {
            this.clearMarks(card);
        });
    }
}
```

### 2.2 集成到遊戲場景
```javascript
// 在 create() 中初始化
this.markManager = new MarkManager(this);

// 在 showCorrectAnswerOnCard() 中使用
showCorrectAnswerOnCard(card) {
    this.markManager.createCheckMark(card);
}

// 在 showIncorrectAnswerOnCard() 中使用
showIncorrectAnswerOnCard(card) {
    this.markManager.createXMark(card);
}

// 在頁面切換時清除
updateLayout() {
    this.markManager.clearAllMarks();
    // ... 其他邏輯
}
```

---

## 🧪 第 3 階段：全面測試（2-3 天）

### 3.1 單元測試
```javascript
describe('MarkManager', () => {
    it('should create checkmark on card', () => { });
    it('should clear old marks before creating new ones', () => { });
    it('should handle cards without background', () => { });
    it('should work on all layout types', () => { });
});
```

### 3.2 集成測試
```javascript
describe('Mark Display Integration', () => {
    it('should display marks on all pages', () => { });
    it('should handle multiple submissions', () => { });
    it('should clear marks on page transition', () => { });
});
```

### 3.3 端到端測試
```javascript
describe('E2E: Mark Display', () => {
    it('should display marks for correct answers', () => { });
    it('should display marks for incorrect answers', () => { });
    it('should work across all card types', () => { });
});
```

---

## 📋 檢查清單

### 開發檢查
- [ ] MarkManager 實現完成
- [ ] 集成到遊戲場景
- [ ] 所有方法都有文檔
- [ ] 代碼審查通過

### 測試檢查
- [ ] 單元測試通過
- [ ] 集成測試通過
- [ ] 端到端測試通過
- [ ] 所有場景都驗證

### 部署檢查
- [ ] 代碼推送到 GitHub
- [ ] CI/CD 通過
- [ ] 部署到測試環境
- [ ] 最終驗證通過

---

## 🎯 成功標誌

✅ **修復成功的標誌**：
- 所有頁面都能正確顯示勾勾和叉叉
- 多次提交時沒有重複的標記
- 頁面切換時標記被正確清理
- 所有卡片類型都支持
- 沒有內存洩漏
- 沒有視覺重疊

