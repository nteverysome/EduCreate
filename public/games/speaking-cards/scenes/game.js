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
        const isPortrait = height > width;
        
        // 根據螢幕尺寸調整卡片大小
        if (isMobile) {
            this.cardWidth = Math.min(width * 0.35, 240);
            this.cardHeight = this.cardWidth * 1.4;
        } else if (isPortrait) {
            this.cardWidth = Math.min(width * 0.3, 280);
            this.cardHeight = this.cardWidth * 1.4;
        } else {
            this.cardWidth = Math.min(width * 0.2, 300);
            this.cardHeight = this.cardWidth * 1.4;
        }
        
        console.log('📐 卡片尺寸:', this.cardWidth, 'x', this.cardHeight);
    }

    createBackground() {
        // 漸層背景
        const { width, height } = this.scale;
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xdbeafe, 0xdbeafe, 0xf0f9ff, 0xf0f9ff, 1);
        bg.fillRect(0, 0, width, height);
        bg.setDepth(0);
    }

    createUI() {
        const { width, height } = this.scale;
        const fontSize = Math.max(16, Math.min(32, width * 0.03));
        
        // 標題
        this.titleText = this.add.text(width / 2, 30, this.activityTitle, {
            fontFamily: 'Arial',
            fontSize: `${fontSize * 1.2}px`,
            fontStyle: 'bold',
            color: '#1f2937'
        }).setOrigin(0.5).setDepth(100);
        
        // 進度文字
        this.progressText = this.add.text(width / 2, 60, '卡片 0 / 0', {
            fontFamily: 'Arial',
            fontSize: `${fontSize * 0.8}px`,
            color: '#6b7280'
        }).setOrigin(0.5).setDepth(100);
        
        // 創建控制按鈕
        this.createControlButtons();
    }

    createControlButtons() {
        const { width, height } = this.scale;
        const buttonY = height - 60;
        const buttonSize = Math.max(40, Math.min(50, width * 0.05));
        
        // Shuffle 按鈕
        this.shuffleBtn = this.createButton(width / 2 - 80, buttonY, '🔀 Shuffle', () => {
            this.handleShuffle();
        });
        
        // Undo 按鈕
        this.undoBtn = this.createButton(width / 2 + 80, buttonY, '↶ Undo', () => {
            this.handleUndo();
        });
    }

    createButton(x, y, label, callback) {
        const btn = this.add.container(x, y);

        // 按鈕背景
        const bg = this.add.graphics();
        bg.fillStyle(0x4b5563, 1);
        bg.fillRoundedRect(-60, -20, 120, 40, 8);

        // 按鈕文字
        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.add([bg, text]);
        btn.setSize(120, 40);
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', callback);
        btn.setDepth(100);

        return btn;
    }

    // ===== 卡片堆疊創建 =====
    createCardDeck() {
        const { width, height } = this.scale;
        const isMobile = width < 768;
        const deckX = isMobile ? width / 2 : width / 2 - this.cardWidth - 40;
        const deckY = height / 2;

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

        // 卡片背景
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 1);
        bg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2,
            this.cardWidth, this.cardHeight, 12);
        bg.lineStyle(4, 0x3b82f6, 1);
        bg.strokeRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2,
            this.cardWidth, this.cardHeight, 12);

        // 卡片圖案
        const pattern = this.add.graphics();
        pattern.fillStyle(0x3b82f6, 0.1);
        pattern.fillRoundedRect(-this.cardWidth / 2 + 10, -this.cardHeight / 2 + 10,
            this.cardWidth - 20, this.cardHeight - 20, 8);

        // 中心圖標
        const icon = this.add.text(0, 0, '🎴', {
            fontSize: `${this.cardWidth * 0.3}px`
        }).setOrigin(0.5);

        container.add([bg, pattern, icon]);
        return container;
    }

    // ===== 發牌區域創建 =====
    createDealArea() {
        const { width, height } = this.scale;
        const isMobile = width < 768;
        const dealX = isMobile ? width / 2 : width / 2 + this.cardWidth + 40;
        const dealY = height / 2;

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

        const hint = this.add.text(0, 0, '點擊翻牌', {
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

        // 卡片背景
        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 1);
        bg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2,
            this.cardWidth, this.cardHeight, 12);
        bg.lineStyle(4, 0x60a5fa, 1);
        bg.strokeRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2,
            this.cardWidth, this.cardHeight, 12);
        container.add(bg);

        let currentY = -this.cardHeight / 2 + 20;
        const contentWidth = this.cardWidth - 40;

        // 圖片 (如果有)
        if (cardData.imageUrl) {
            const imgSize = this.cardHeight * 0.45;
            // 載入並顯示圖片
            this.loadCardImage(container, cardData.imageUrl, 0, currentY + imgSize / 2, contentWidth, imgSize);
            currentY += imgSize + 15;
        }

        // 英文文字
        if (cardData.text || cardData.english) {
            const text = this.add.text(0, currentY + 20, cardData.text || cardData.english, {
                fontFamily: 'Arial',
                fontSize: `${this.cardWidth * 0.08}px`,
                fontStyle: 'bold',
                color: '#1f2937',
                wordWrap: { width: contentWidth },
                align: 'center'
            }).setOrigin(0.5, 0);
            container.add(text);
            currentY += text.height + 10;
        }

        // 中文翻譯
        if (cardData.chinese) {
            const chinese = this.add.text(0, currentY + 10, cardData.chinese, {
                fontFamily: 'Arial',
                fontSize: `${this.cardWidth * 0.06}px`,
                color: '#6b7280',
                wordWrap: { width: contentWidth },
                align: 'center'
            }).setOrigin(0.5, 0);
            container.add(chinese);
        }

        // 語音按鈕
        if (cardData.audioUrl || cardData.text || cardData.english) {
            const soundBtn = this.createSoundButton(cardData);
            soundBtn.setPosition(0, this.cardHeight / 2 - 50);
            container.add(soundBtn);
        }

        return container;
    }

    loadCardImage(container, url, x, y, maxW, maxH) {
        const key = 'card_img_' + this.currentCardIndex;

        // 動態載入圖片
        this.load.image(key, url);
        this.load.once('complete', () => {
            if (this.textures.exists(key)) {
                const img = this.add.image(x, y, key);
                const scale = Math.min(maxW / img.width, maxH / img.height);
                img.setScale(scale);
                container.add(img);
                container.sendToBack(img);
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

        // 播放音效
        this.playCardAudio(cardData);

        console.log('🎴 翻開卡片:', cardData);
    }

    handleNext() {
        if (this.currentCardIndex < this.shuffledCards.length - 1) {
            this.currentCardIndex++;
            this.isFlipped = false;

            // 清除發牌區，顯示空位
            this.dealContainer.removeAll(true);
            this.createEmptySlot();

            // 翻開下一張
            this.flipCard();

            this.updateProgress();
        }
    }

    handlePrevious() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.isFlipped = true;

            // 清除發牌區
            this.dealContainer.removeAll(true);

            // 顯示上一張卡片
            const cardData = this.shuffledCards[this.currentCardIndex];
            const cardFront = this.createCardFront(cardData);
            this.dealContainer.add(cardFront);

            this.playCardAudio(cardData);
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

