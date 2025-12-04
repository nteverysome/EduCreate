/**
 * Speaking Cards - Main Game Scene
 * 語音卡片遊戲主場景
 */
class SpeakingCardsGame extends Phaser.Scene {
    constructor() {
        super({ key: 'SpeakingCardsGame' });
        
        // 遊戲狀態
        this.cards = [];
        this.shuffledCards = [];
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.activityTitle = 'Speaking Cards';
        
        // 卡片尺寸 (基於螢幕響應式計算)
        this.cardWidth = 300;
        this.cardHeight = 420;
        
        // UI 元素
        this.deckContainer = null;
        this.dealContainer = null;
        this.currentCard = null;
        this.cardBack = null;
        this.titleText = null;
        this.progressText = null;
    }

    init(data) {
        console.log('🎮 Speaking Cards: 初始化遊戲', data);
        
        // 從 URL 參數獲取數據
        this.parseUrlParams();
    }

    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.activityId = urlParams.get('activityId');
        
        // 嘗試從 URL 獲取詞彙數據
        const vocabParam = urlParams.get('vocabulary');
        if (vocabParam) {
            try {
                this.cards = JSON.parse(decodeURIComponent(vocabParam));
                console.log('📚 從 URL 載入詞彙:', this.cards.length, '個');
            } catch (e) {
                console.warn('⚠️ 解析詞彙參數失敗:', e);
            }
        }
    }

    create() {
        console.log('🎮 Speaking Cards: 創建遊戲場景');
        
        // 計算響應式尺寸
        this.calculateResponsiveSize();
        
        // 創建背景
        this.createBackground();
        
        // 創建 UI
        this.createUI();
        
        // 載入活動數據
        if (this.activityId && this.cards.length === 0) {
            this.loadActivity();
        } else if (this.cards.length > 0) {
            this.shuffledCards = this.shuffleArray([...this.cards]);
            this.createCardDeck();
            this.createDealArea();
        } else {
            // 使用示範數據
            this.loadDemoData();
        }

        // 監聽視窗大小變化
        this.scale.on('resize', this.handleResize, this);
    }

    calculateResponsiveSize() {
        const { width, height } = this.scale;
        const isMobile = width < 768;
        const isLandscape = width > height;
        const isPortrait = height > width;

        // 🔧 手機橫向模式需要更小的卡片
        if (isMobile && isLandscape) {
            // 手機橫向：高度受限，卡片要更小
            this.cardWidth = Math.min(height * 0.4, 150);
            this.cardHeight = this.cardWidth * 1.2;
        } else if (isMobile) {
            // 手機直向
            this.cardWidth = Math.min(width * 0.35, 240);
            this.cardHeight = this.cardWidth * 1.4;
        } else if (isPortrait) {
            // 平板直向
            this.cardWidth = Math.min(width * 0.3, 280);
            this.cardHeight = this.cardWidth * 1.4;
        } else {
            // 桌面/平板橫向
            this.cardWidth = Math.min(width * 0.2, 300);
            this.cardHeight = this.cardWidth * 1.4;
        }

        // 🔧 計算安全區域邊距 - 使用比例而非固定值
        this.isLandscape = isLandscape;
        // 橫向模式：頂部 8%，底部 15%
        // 直向模式：頂部 5%，底部 12%
        this.topPadding = isLandscape ? height * 0.08 : height * 0.05;
        this.bottomPadding = isLandscape ? height * 0.15 : height * 0.12;

        console.log('📐 卡片尺寸:', this.cardWidth, 'x', this.cardHeight,
            '橫向:', isLandscape, '頂部邊距:', this.topPadding);
    }

    createBackground() {
        // 🎨 精靈王國遊戲戰鬥背景
        const { width, height } = this.scale;

        if (this.textures.exists('game_background_3')) {
            const bg = this.add.image(width / 2, height / 2, 'game_background_3');
            bg.setDepth(0);
            // 調整背景圖片大小以覆蓋整個遊戲區域
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            const scale = Math.max(scaleX, scaleY);
            bg.setScale(scale);
            console.log('✅ 背景圖片已加載');
        } else {
            // 備用：漸層背景
            const bg = this.add.graphics();
            bg.fillGradientStyle(0xdbeafe, 0xdbeafe, 0xf0f9ff, 0xf0f9ff, 1);
            bg.fillRect(0, 0, width, height);
            bg.setDepth(0);
            console.log('⚠️ 使用備用漸層背景');
        }
    }

    createUI() {
        const { width, height } = this.scale;
        const isLandscape = width > height;

        // 🔧 橫向模式使用更小的字體
        const fontSize = isLandscape
            ? Math.max(12, Math.min(18, height * 0.04))
            : Math.max(16, Math.min(32, width * 0.03));

        // 標題 - 橫向模式放在更上面
        this.titleText = this.add.text(width / 2, this.topPadding, this.activityTitle, {
            fontFamily: 'Arial',
            fontSize: `${fontSize * 1.1}px`,
            fontStyle: 'bold',
            color: '#1f2937'
        }).setOrigin(0.5).setDepth(100);

        // 進度文字 - 緊跟標題
        const progressY = isLandscape ? this.topPadding + 18 : 60;
        this.progressText = this.add.text(width / 2, progressY, '卡片 0 / 0', {
            fontFamily: 'Arial',
            fontSize: `${fontSize * 0.7}px`,
            color: '#6b7280'
        }).setOrigin(0.5).setDepth(100);

        // 創建控制按鈕
        this.createControlButtons();
    }

    createControlButtons() {
        const { width, height } = this.scale;
        const isLandscape = width > height;

        // 🔧 按鈕位置 - 橫向模式在 85% 高度，更大的按鈕
        const buttonY = isLandscape ? height * 0.85 : height * 0.90;
        const buttonWidth = isLandscape ? 80 : 110;
        const buttonHeight = isLandscape ? 40 : 48;

        // 三個按鈕的間距計算
        const totalWidth = buttonWidth * 3 + 40;  // 3個按鈕 + 2個間距
        const startX = (width - totalWidth) / 2 + buttonWidth / 2;
        const gap = buttonWidth + 20;

        // ◀ 上一張按鈕
        this.prevBtn = this.createButton(startX, buttonY, '◀', () => {
            this.handlePrevious();
        }, buttonWidth, buttonHeight, 0x6366f1);

        // 🔀 洗牌按鈕
        this.shuffleBtn = this.createButton(startX + gap, buttonY, '🔀', () => {
            this.handleShuffle();
        }, buttonWidth, buttonHeight, 0x4b5563);

        // ▶ 下一張按鈕
        this.nextBtn = this.createButton(startX + gap * 2, buttonY, '▶', () => {
            this.handleNext();
        }, buttonWidth, buttonHeight, 0x10b981);
    }

    createButton(x, y, label, callback, btnWidth = 120, btnHeight = 40, bgColor = 0x4b5563) {
        const btn = this.add.container(x, y);
        const halfW = btnWidth / 2;
        const halfH = btnHeight / 2;

        // 按鈕背景 - 使用傳入的顏色
        const bg = this.add.graphics();
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-halfW, -halfH, btnWidth, btnHeight, 8);

        // 按鈕文字 - 更大的字體
        const fontSize = Math.max(16, Math.min(22, btnHeight * 0.5));
        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial',
            fontSize: `${fontSize}px`,
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.add([bg, text]);
        btn.setSize(btnWidth, btnHeight);
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', callback);
        btn.setDepth(100);

        return btn;
    }

    // ===== 卡片堆疊創建 =====
    createCardDeck() {
        const { width, height } = this.scale;
        const isMobile = width < 768;
        const isLandscape = width > height;

        // 🔧 橫向模式兩張卡片並排
        let deckX, deckY;
        if (isLandscape) {
            // 橫向：卡片堆在左側 1/3
            deckX = width * 0.3;
            deckY = height / 2;
        } else if (isMobile) {
            // 手機直向：卡片堆在上方
            deckX = width / 2;
            deckY = height * 0.35;
        } else {
            // 桌面：卡片堆在左側
            deckX = width / 2 - this.cardWidth - 40;
            deckY = height / 2;
        }

        // 清除舊的卡片堆
        if (this.deckContainer) this.deckContainer.destroy();

        this.deckContainer = this.add.container(deckX, deckY);

        // 創建堆疊效果 (3 層)
        for (let i = 2; i >= 0; i--) {
            const cardBack = this.createCardBack(i * 8, i * 8);
            this.deckContainer.add(cardBack);
        }

        // 設置交互
        this.deckContainer.setSize(this.cardWidth, this.cardHeight);
        this.deckContainer.setInteractive({ useHandCursor: true });
        this.deckContainer.on('pointerdown', () => this.handlePrevious());
        this.deckContainer.setDepth(10);

        // 更新進度
        this.updateProgress();
    }

    createCardBack(offsetX = 0, offsetY = 0) {
        const container = this.add.container(offsetX, offsetY);

        // 🎴 卡片背面圖片
        const bgImg = this.add.image(0, 0, 'card-back');
        const scale = Math.min(this.cardWidth / bgImg.width, this.cardHeight / bgImg.height);
        bgImg.setScale(scale);
        container.add(bgImg);

        return container;
    }

    // ===== 發牌區域創建 =====
    createDealArea() {
        const { width, height } = this.scale;
        const isMobile = width < 768;
        const isLandscape = width > height;

        // 🔧 橫向模式發牌區在右側
        let dealX, dealY;
        if (isLandscape) {
            // 橫向：發牌區在右側 2/3
            dealX = width * 0.7;
            dealY = height / 2;
        } else if (isMobile) {
            // 手機直向：發牌區在下方
            dealX = width / 2;
            dealY = height * 0.65;
        } else {
            // 桌面：發牌區在右側
            dealX = width / 2 + this.cardWidth + 40;
            dealY = height / 2;
        }

        // 清除舊的發牌區
        if (this.dealContainer) this.dealContainer.destroy();

        this.dealContainer = this.add.container(dealX, dealY);

        // 創建空白佔位
        this.createEmptySlot();

        this.dealContainer.setDepth(20);
    }

    createEmptySlot() {
        const bg = this.add.graphics();
        bg.fillStyle(0xe5e7eb, 0.5);
        bg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2,
            this.cardWidth, this.cardHeight, 12);
        bg.lineStyle(3, 0x9ca3af, 1);
        bg.strokeRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2,
            this.cardWidth, this.cardHeight, 12);

        const hint = this.add.text(0, 0, '點擊進行下一張', {
            fontFamily: 'Arial',
            fontSize: `${this.cardWidth * 0.08}px`,
            color: '#9ca3af'
        }).setOrigin(0.5);

        this.dealContainer.add([bg, hint]);

        // 設置交互
        this.dealContainer.setSize(this.cardWidth, this.cardHeight);
        this.dealContainer.setInteractive({ useHandCursor: true });
        this.dealContainer.on('pointerdown', () => this.handleCardClick());
    }

    // ===== 卡片正面創建 =====
    createCardFront(cardData) {
        const container = this.add.container(0, 0);

        // 🎴 卡片背景圖片
        const bgImg = this.add.image(0, 0, 'card_front');
        const scale = Math.min(this.cardWidth / bgImg.width, this.cardHeight / bgImg.height);
        bgImg.setScale(scale);
        container.add(bgImg);

        let currentY = -this.cardHeight / 2 + 30;
        const contentWidth = this.cardWidth - 60;

        // 圖片 (如果有)
        if (cardData.imageUrl) {
            const imgSize = this.cardHeight * 0.35;
            // 載入並顯示圖片
            this.loadCardImage(container, cardData.imageUrl, 0, currentY + imgSize / 2, contentWidth, imgSize);
            currentY += imgSize + 10;
        }

        // 英文文字 - 白色，更大
        if (cardData.text || cardData.english) {
            const text = this.add.text(0, currentY + 15, cardData.text || cardData.english, {
                fontFamily: 'Arial',
                fontSize: `${this.cardWidth * 0.09}px`,
                fontStyle: 'bold',
                color: '#ffffff',
                wordWrap: { width: contentWidth },
                align: 'center'
            }).setOrigin(0.5, 0);
            container.add(text);
            currentY += text.height + 8;
        }

        // 中文翻譯 - 淡黃色
        if (cardData.chinese) {
            const chinese = this.add.text(0, currentY + 5, cardData.chinese, {
                fontFamily: 'Arial',
                fontSize: `${this.cardWidth * 0.07}px`,
                color: '#fef3c7',
                wordWrap: { width: contentWidth },
                align: 'center'
            }).setOrigin(0.5, 0);
            container.add(chinese);
        }

        // 🔊 語音按鈕 - 只有有 audioUrl 時才顯示
        if (cardData.audioUrl) {
            const soundBtn = this.createSoundButton(cardData);
            soundBtn.setPosition(0, this.cardHeight / 2 - 40);
            container.add(soundBtn);
        }

        return container;
    }

    loadCardImage(container, url, x, y, maxW, maxH) {
        const key = 'card_img_' + Date.now() + '_' + Math.random();

        // 檢查圖片是否已經載入
        if (this.textures.exists(key)) {
            const img = this.add.image(x, y, key);
            const scale = Math.min(maxW / img.width, maxH / img.height);
            img.setScale(scale);
            container.add(img);
            return;
        }

        // 動態載入圖片
        this.load.image(key, url);

        this.load.once('complete', () => {
            if (this.textures.exists(key)) {
                const img = this.add.image(x, y, key);
                const scale = Math.min(maxW / img.width, maxH / img.height);
                img.setScale(scale);
                container.add(img);
                console.log('✅ 卡片圖片已加載:', url);
            } else {
                console.warn('⚠️ 圖片載入失敗:', url);
            }
        });

        this.load.start();
    }

    createSoundButton(cardData) {
        const btn = this.add.container(0, 0);

        const bg = this.add.graphics();
        bg.fillStyle(0xdbeafe, 1);
        bg.fillCircle(0, 0, 25);

        const icon = this.add.text(0, 0, '🔊', { fontSize: '20px' }).setOrigin(0.5);

        btn.add([bg, icon]);
        btn.setSize(50, 50);
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.playCardAudio(cardData);
        });

        return btn;
    }

    // ===== 遊戲邏輯 =====
    handleCardClick() {
        if (this.shuffledCards.length === 0) return;

        if (this.isFlipped) {
            // 已翻開，進入下一張
            this.handleNext();
        } else {
            // 未翻開，翻開卡片
            this.flipCard();
        }
    }

    flipCard() {
        if (this.currentCardIndex >= this.shuffledCards.length) return;

        this.isFlipped = true;
        const cardData = this.shuffledCards[this.currentCardIndex];

        // 清除發牌區
        this.dealContainer.removeAll(true);

        // 創建卡片正面
        const cardFront = this.createCardFront(cardData);
        this.dealContainer.add(cardFront);

        // 翻牌動畫
        this.tweens.add({
            targets: this.dealContainer,
            scaleX: [0, 1],
            duration: 300,
            ease: 'Back.easeOut'
        });

        // 🔊 只有沒有 audioUrl 時才自動播放（使用 Web Speech API）
        // 如果有 audioUrl，用戶需要點擊聲音按鈕才能播放
        if (!cardData.audioUrl && (cardData.text || cardData.english)) {
            this.playCardAudio(cardData);
        }

        console.log('🎴 翻開卡片:', cardData);
    }

    handleNext() {
        if (this.currentCardIndex < this.shuffledCards.length - 1) {
            this.currentCardIndex++;
            this.isFlipped = true;

            // 清除發牌區
            this.dealContainer.removeAll(true);

            // 直接顯示下一張卡片內容
            const cardData = this.shuffledCards[this.currentCardIndex];
            const cardFront = this.createCardFront(cardData);
            this.dealContainer.add(cardFront);

            // 🔊 只有沒有 audioUrl 時才自動播放
            if (!cardData.audioUrl && (cardData.text || cardData.english)) {
                this.playCardAudio(cardData);
            }

            this.updateProgress();
        }
    }

    handlePrevious() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.isFlipped = true;

            // 清除發牌區
            this.dealContainer.removeAll(true);

            // 直接顯示上一張卡片內容
            const cardData = this.shuffledCards[this.currentCardIndex];
            const cardFront = this.createCardFront(cardData);
            this.dealContainer.add(cardFront);

            // 🔊 只有沒有 audioUrl 時才自動播放
            if (!cardData.audioUrl && (cardData.text || cardData.english)) {
                this.playCardAudio(cardData);
            }

            this.updateProgress();
        }
    }

    handleShuffle() {
        this.shuffledCards = this.shuffleArray([...this.cards]);
        this.currentCardIndex = 0;
        this.isFlipped = false;

        // 重置發牌區
        this.dealContainer.removeAll(true);
        this.createEmptySlot();

        this.updateProgress();
        console.log('🔀 重新洗牌');
    }

    handleUndo() {
        this.handlePrevious();
    }

    // ===== 輔助方法 =====
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    updateProgress() {
        const total = this.shuffledCards.length;
        const current = Math.min(this.currentCardIndex + 1, total);
        this.progressText.setText(`卡片 ${current} / ${total}`);

        // 🎴 到達最後一張卡片時，左邊卡片堆改為空白佔位（跟右邊第一張一樣）
        if (this.deckContainer) {
            if (this.currentCardIndex === total - 1) {
                // 最後一張：清除卡片堆，顯示空白佔位
                this.deckContainer.removeAll(true);

                // 創建空白佔位（跟右邊一樣的樣式）
                const bg = this.add.graphics();
                bg.fillStyle(0xe5e7eb, 0.5);
                bg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2,
                    this.cardWidth, this.cardHeight, 12);
                bg.lineStyle(3, 0x9ca3af, 1);
                bg.strokeRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2,
                    this.cardWidth, this.cardHeight, 12);

                const hint = this.add.text(0, 0, '上一張', {
                    fontFamily: 'Arial',
                    fontSize: `${this.cardWidth * 0.08}px`,
                    color: '#9ca3af'
                }).setOrigin(0.5);

                this.deckContainer.add([bg, hint]);

                // 保留上一張的功能
                this.deckContainer.setInteractive({ useHandCursor: true });
            } else {
                // 不是最後一張：恢復卡片堆
                this.deckContainer.removeAll(true);

                // 重新創建堆疊效果 (3 層)
                for (let i = 2; i >= 0; i--) {
                    const cardBack = this.createCardBack(i * 8, i * 8);
                    this.deckContainer.add(cardBack);
                }

                this.deckContainer.setInteractive({ useHandCursor: true });
            }
        }
    }

    playCardAudio(cardData) {
        // 優先使用 audioUrl
        if (cardData.audioUrl) {
            const audio = new Audio(cardData.audioUrl);
            audio.play().catch(e => console.warn('播放失敗:', e));
            return;
        }

        // 使用 Web Speech API
        const text = cardData.text || cardData.english;
        if (text && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    handleResize(gameSize) {
        this.calculateResponsiveSize();
        // 重新創建 UI
        this.createBackground();
        this.createUI();
        if (this.shuffledCards.length > 0) {
            this.createCardDeck();
            this.createDealArea();
            if (this.isFlipped) {
                this.flipCard();
            }
        }
    }

    // ===== 數據載入 =====
    async loadActivity() {
        try {
            const response = await fetch(`/api/activities/${this.activityId}`);
            if (response.ok) {
                const activity = await response.json();
                this.activityTitle = activity.title;
                this.titleText.setText(activity.title);

                this.cards = activity.vocabularyItems.map(item => ({
                    id: item.id,
                    text: item.english || '',
                    english: item.english || '',
                    chinese: item.chinese || '',
                    imageUrl: item.imageUrl,
                    audioUrl: item.audioUrl
                }));

                this.shuffledCards = this.shuffleArray([...this.cards]);
                this.createCardDeck();
                this.createDealArea();
                this.updateProgress();

                console.log('📚 載入活動成功:', this.cards.length, '張卡片');
            }
        } catch (error) {
            console.error('❌ 載入活動失敗:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.cards = [
            { id: '1', text: 'Apple', english: 'Apple', chinese: '蘋果' },
            { id: '2', text: 'Banana', english: 'Banana', chinese: '香蕉' },
            { id: '3', text: 'Orange', english: 'Orange', chinese: '橘子' },
            { id: '4', text: 'Grape', english: 'Grape', chinese: '葡萄' },
            { id: '5', text: 'Watermelon', english: 'Watermelon', chinese: '西瓜' }
        ];

        this.shuffledCards = this.shuffleArray([...this.cards]);
        this.createCardDeck();
        this.createDealArea();
        this.updateProgress();

        console.log('📚 載入示範數據');
    }
}

// 確保全域可用
if (typeof window !== 'undefined') {
    window.SpeakingCardsGame = SpeakingCardsGame;
}

