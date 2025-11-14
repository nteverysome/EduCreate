# 多頁面遊戲代碼模板

基於 v116.0 修復的最佳實踐代碼模板，供其他遊戲開發者參考。

---

## 📋 完整的多頁面遊戲框架

### 1. 初始化（create 方法）

```javascript
create() {
    // ✅ 初始化分頁相關變數
    this.currentPage = 0;
    this.totalPages = 1;
    this.itemsPerPage = 6;
    
    // ✅ 初始化卡片數組
    this.leftCards = [];
    this.rightCards = [];
    this.allCards = [];
    
    // ✅ 初始化狀態
    this.matchedPairs = new Set();
    this.currentPageAnswers = [];
    this.allPagesAnswers = [];
    
    // ✅ 初始化其他狀態
    this.shuffledPairsCache = null;
    this.submitButton = null;
    
    // ✅ 加載詞彙數據
    this.loadVocabularyData();
    
    // ✅ 計算總頁數
    this.calculateTotalPages();
    
    // ✅ 創建佈局
    this.updateLayout();
}

calculateTotalPages() {
    this.totalPages = Math.ceil(this.pairs.length / this.itemsPerPage);
    console.log(`📄 分頁設置: 總詞彙=${this.pairs.length}, 每頁=${this.itemsPerPage}, 總頁數=${this.totalPages}`);
}
```

### 2. 頁面轉換（goToNextPage 方法）

```javascript
goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
        // 🔥 [v116.0] 詳細調適訊息：追蹤頁面轉換
        console.log('🔥 [v116.0] ========== 進入下一頁開始 ==========');
        console.log('🔥 [v116.0] 頁面轉換前:', {
            currentPage: this.currentPage,
            pageDisplayName: `第 ${this.currentPage + 1} 頁`,
            matchedPairsSize: this.matchedPairs.size,
            matchedPairsContent: Array.from(this.matchedPairs)
        });

        // ✅ 增加頁碼
        this.currentPage++;
        console.log('📄 進入下一頁:', this.currentPage + 1);

        // 🔥 [v115.0] 詳細調適訊息：頁面轉換後
        console.log('🔥 [v115.0] 頁面轉換後:', {
            currentPage: this.currentPage,
            pageDisplayName: `第 ${this.currentPage + 1} 頁`,
            totalPages: this.totalPages
        });

        // ✅ 清除洗牌順序緩存
        this.shuffledPairsCache = null;
        console.log('🔥 [v54.0] 已清除洗牌順序緩存（頁面改變）');

        // ✅ 清空 matchedPairs
        console.log('🔥 [v115.0] 清空 matchedPairs 前:', {
            size: this.matchedPairs.size,
            content: Array.from(this.matchedPairs)
        });
        this.matchedPairs.clear();
        console.log('🔥 [v113.0] 已清空 matchedPairs（進入新頁面）');
        console.log('🔥 [v115.0] 清空 matchedPairs 後:', {
            size: this.matchedPairs.size,
            content: Array.from(this.matchedPairs)
        });

        // ✅ 重新佈局
        this.updateLayout();
    }
}
```

### 3. 佈局更新（updateLayout 方法）

```javascript
updateLayout() {
    console.log('🎮 GameScene: updateLayout 開始');
    
    try {
        // ✅ 清除所有現有元素
        console.log('🎮 GameScene: 清除所有現有元素');
        this.children.removeAll(true);

        // ✅ 清除提交按鈕引用
        this.submitButton = null;
        console.log('🎮 GameScene: 已清除提交按鈕引用');

        // ✅ 添加背景
        const width = this.scale.width;
        const height = this.scale.height;
        console.log('🎮 GameScene: 添加白色背景', { width, height });
        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff).setDepth(-1);

        // ✅ 創建卡片（會清空數組）
        console.log('🎮 GameScene: 創建卡片');
        this.createCards();
        console.log('🎮 GameScene: 卡片創建完成');

        // ✅ 創建其他 UI
        this.createPageIndicator();
        this.showSubmitButton();

        console.log('🎮 GameScene: updateLayout 完成');
    } catch (error) {
        console.error('❌ GameScene: updateLayout 失敗', error);
        throw error;
    }
}
```

### 4. 卡片創建（createCards 方法）

```javascript
createCards() {
    console.log('🎮 GameScene: createCards 開始');

    // 🔥 [v116.0] 清空 leftCards 和 rightCards 數組，防止卡片累積
    console.log('🔥 [v116.0] 清空卡片數組前:', {
        leftCardsCount: this.leftCards ? this.leftCards.length : 0,
        rightCardsCount: this.rightCards ? this.rightCards.length : 0
    });
    this.leftCards = [];
    this.rightCards = [];
    console.log('🔥 [v116.0] 已清空卡片數組');

    // 🔥 [v115.0] 詳細調適訊息：追蹤頁面狀態
    console.log('🔥 [v115.0] ========== 創建卡片開始 ==========');
    console.log('🔥 [v115.0] 當前頁面狀態:', {
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        pageDisplayName: `第 ${this.currentPage + 1} 頁 / 共 ${this.totalPages} 頁`,
        matchedPairsSize: this.matchedPairs ? this.matchedPairs.size : 0,
        matchedPairsContent: this.matchedPairs ? Array.from(this.matchedPairs) : [],
        layout: this.layout
    });

    // ✅ 獲取當前頁的詞彙數據
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
    const currentPagePairs = this.pairs.slice(startIndex, endIndex);

    console.log('📄 當前頁數據:', {
        currentPage: this.currentPage + 1,
        totalPages: this.totalPages,
        startIndex,
        endIndex,
        currentPagePairs: currentPagePairs.length
    });

    // 🔥 [v115.0] 詳細調適訊息：列出當前頁的所有詞彙
    console.log('🔥 [v115.0] 當前頁詞彙列表:');
    currentPagePairs.forEach((pair, index) => {
        console.log(`  [${index + 1}] ID: ${pair.id}, 英文: ${pair.question || pair.english}, 中文: ${pair.answer || pair.chinese}`);
    });

    // ✅ 根據佈局模式創建卡片
    if (this.layout === 'mixed') {
        this.createMixedLayout(currentPagePairs);
    } else {
        this.createSeparatedLayout(currentPagePairs);
    }

    // ✅ 創建分頁指示器
    if (this.enablePagination) {
        this.createPageIndicator();
    }

    console.log('🎮 GameScene: createCards 完成', {
        leftCardsCount: this.leftCards.length,
        rightCardsCount: this.rightCards.length
    });
}
```

### 5. 答案檢查（checkAllMatches 方法）

```javascript
checkAllMatches() {
    let correctCount = 0;
    let incorrectCount = 0;

    // ✅ 獲取當前頁的詞彙數據
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
    const currentPagePairs = this.pairs.slice(startIndex, endIndex);

    // ✅ 清空當前頁面的答案記錄
    this.currentPageAnswers = [];

    // 🔥 [v115.0] 詳細調適訊息：追蹤提交答案時的狀態
    console.log('🔥 [v115.0] ========== 提交答案開始 ==========');
    console.log('🔥 [v115.0] 提交答案時的頁面狀態:', {
        currentPage: this.currentPage,
        pageDisplayName: `第 ${this.currentPage + 1} 頁`,
        totalPages: this.totalPages,
        layout: this.layout
    });

    console.log('🔍 [v60.0] 開始檢查所有配對:', {
        currentPage: this.currentPage,
        startIndex,
        endIndex,
        currentPagePairsCount: currentPagePairs.length,
        matchedPairsSize: this.matchedPairs.size,
        matchedPairsArray: Array.from(this.matchedPairs),
        totalPairs: this.pairs.length
    });

    // ✅ 檢查每個詞彙對
    currentPagePairs.forEach((pair, index) => {
        const isCorrect = this.matchedPairs.has(pair.id);
        
        if (isCorrect) {
            correctCount++;
            console.log(`✅ 配對正確: ${pair.answer} - ${pair.question}`);
        } else {
            incorrectCount++;
            console.log(`❌ 配對錯誤: ${pair.answer} - ${pair.question}`);
        }

        // ✅ 記錄答案
        this.currentPageAnswers.push({
            pairId: pair.id,
            isCorrect: isCorrect,
            question: pair.question,
            answer: pair.answer
        });
    });

    // ✅ 保存到所有頁面答案
    this.allPagesAnswers.push(...this.currentPageAnswers);

    // ✅ 計算分數
    console.log('📊 [v56.0] 當前頁面分數:', {
        correctCount,
        incorrectCount,
        totalCount: currentPagePairs.length
    });

    // ✅ 顯示結果
    this.showPageCompletionModal(correctCount, incorrectCount);
}
```

---

## 🔍 調試工具

### 快速驗證函數

```javascript
// 添加到 window 對象，方便在控制台調用
window.debugMultiPageGame = {
    checkPageState() {
        const scene = window.matchUpGame.scene.keys?.GameScene;
        console.log('=== 頁面狀態 ===');
        console.log('當前頁:', scene.currentPage + 1);
        console.log('總頁數:', scene.totalPages);
        console.log('左側卡片:', scene.leftCards.length);
        console.log('右側卡片:', scene.rightCards.length);
        console.log('matchedPairs:', Array.from(scene.matchedPairs));
    },
    
    checkCardIds() {
        const scene = window.matchUpGame.scene.keys?.GameScene;
        console.log('=== 卡片 ID ===');
        scene.leftCards.forEach((card, i) => {
            console.log(`左側 ${i}:`, card.getData('pairId'));
        });
        scene.rightCards.forEach((card, i) => {
            console.log(`右側 ${i}:`, card.getData('pairId'));
        });
    },
    
    autoPlayPage() {
        const scene = window.matchUpGame.scene.keys?.GameScene;
        const leftCards = scene.leftCards;
        const rightCards = scene.rightCards;
        
        for (let i = 0; i < leftCards.length; i++) {
            const leftCard = leftCards[i];
            const leftPairId = leftCard.getData('pairId');
            const rightCard = rightCards.find(card => 
                card.getData('pairId') === leftPairId
            );
            if (rightCard) {
                scene.checkMatch(leftCard, rightCard);
            }
        }
        
        scene.checkAllMatches();
    }
};

// 使用方式：
// debugMultiPageGame.checkPageState();
// debugMultiPageGame.checkCardIds();
// debugMultiPageGame.autoPlayPage();
```

---

## ✅ 測試用例

### 單元測試示例

```javascript
describe('多頁面遊戲', () => {
    it('第一頁應該有正確的卡片數量', () => {
        const scene = game.scene.keys.GameScene;
        expect(scene.leftCards.length).toBe(2);
        expect(scene.rightCards.length).toBe(2);
    });
    
    it('進入第二頁時卡片數量應該保持不變', () => {
        const scene = game.scene.keys.GameScene;
        const firstPageCount = scene.leftCards.length;
        
        scene.goToNextPage();
        
        expect(scene.leftCards.length).toBe(firstPageCount);
        expect(scene.rightCards.length).toBe(firstPageCount);
    });
    
    it('第二頁的卡片 ID 應該與第一頁不同', () => {
        const scene = game.scene.keys.GameScene;
        const firstPageIds = scene.leftCards.map(c => c.getData('pairId'));
        
        scene.goToNextPage();
        
        const secondPageIds = scene.leftCards.map(c => c.getData('pairId'));
        expect(secondPageIds).not.toEqual(firstPageIds);
    });
});
```

---

## 📚 相關資源

- 完整修復文檔：`v116-multi-page-card-array-fix.md`
- 檢查清單：`multi-page-game-checklist.md`
- Match-up Game 實現：`public/games/match-up-game/scenes/game.js`

---

**版本**：1.0  
**基於**：v116.0 修復  
**最後更新**：2025-11-09

