/**
 * Speaking Cards - Main Game Scene
 * 語音卡片遊戲主場景
 *
 * 選項功能（參考 Wordwall）：
 * - Timer: None / Count up / Count down
 * - Number of deal places: 1-4
 * - Shuffle: 開/關
 */
class SpeakingCardsGame extends Phaser.Scene {
    constructor() {
        super({ key: 'SpeakingCardsGame' });

        // 遊戲狀態
        this.cards = [];
        this.shuffledCards = [];
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.isAnimating = false;  // 防止快速連點
        this.activityTitle = 'Speaking Cards';

        // 🎮 遊戲選項（從外部 React 選項面板傳入）
        this.options = {
            timer: 'none',           // 'none' | 'countUp' | 'countDown'
            timerMinutes: 5,         // 倒計時分鐘
            timerSeconds: 0,         // 倒計時秒數
            dealPlaces: 1,           // 同時顯示卡片數量 1-4
            shuffle: true,           // 是否洗牌
            autoPlayAudio: true,     // 自動播放語音
            showTranslation: true    // 顯示翻譯
        };

        // 計時器狀態
        this.timerValue = 0;         // 當前計時值（秒）
        this.timerRunning = false;
        this.timerEvent = null;
        this.timerText = null;

        // 聲音狀態
        this.isSoundEnabled = true;  // 聲音是否啟用

        // 卡片尺寸 (基於螢幕響應式計算)
        this.cardWidth = 300;
        this.cardHeight = 420;

        // UI 元素
        this.deckContainer = null;
        this.dealContainer = null;
        this.dealContainers = [];    // 多卡片模式
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

        // 🎮 從 URL 讀取遊戲選項（從外部 React 選項面板傳入）
        const timerType = urlParams.get('timerType');
        if (timerType) {
            this.options.timer = timerType;
            console.log('⏱️ 計時器類型:', timerType);
        }

        const timerMinutes = urlParams.get('timerMinutes');
        if (timerMinutes) {
            this.options.timerMinutes = parseInt(timerMinutes, 10);
        }

        const timerSeconds = urlParams.get('timerSeconds');
        if (timerSeconds) {
            this.options.timerSeconds = parseInt(timerSeconds, 10);
        }

        const shuffle = urlParams.get('shuffle');
        if (shuffle !== null) {
            this.options.shuffle = shuffle === 'true';
            console.log('🔀 洗牌:', this.options.shuffle);
        }

        const autoPlayAudio = urlParams.get('autoPlayAudio');
        if (autoPlayAudio !== null) {
            this.options.autoPlayAudio = autoPlayAudio === 'true';
            console.log('🔊 自動播放語音:', this.options.autoPlayAudio);
        }

        const showTranslation = urlParams.get('showTranslation');
        if (showTranslation !== null) {
            this.options.showTranslation = showTranslation === 'true';
            console.log('📝 顯示翻譯:', this.options.showTranslation);
        }

        // 🎨 讀取視覺風格
        const visualStyle = urlParams.get('visualStyle');
        if (visualStyle && visualStyle !== 'default') {
            this.options.visualStyle = visualStyle;
            console.log('� 視覺風格:', visualStyle);
        } else {
            this.options.visualStyle = 'default';
        }

        console.log('�🎮 遊戲選項:', this.options);
    }

    async create() {
        console.log('🎮 Speaking Cards: 創建遊戲場景');

        // 🎨 如果有自定義視覺風格，先載入資源
        if (this.options.visualStyle && this.options.visualStyle !== 'default') {
            await this.loadVisualStyleResources(this.options.visualStyle);
        }

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

    /**
     * 🎨 載入視覺風格資源
     */
    async loadVisualStyleResources(styleId) {
        console.log('🎨 載入視覺風格資源:', styleId);

        try {
            const response = await fetch(`/api/visual-styles/upload?styleId=${styleId}&game=speaking-cards`);
            if (!response.ok) {
                console.warn('⚠️ 獲取視覺風格資源失敗');
                return;
            }

            const data = await response.json();
            const resources = data.resources;
            console.log('🎨 獲取到的資源:', resources);

            // 動態載入並替換紋理
            const loadPromises = [];

            if (resources?.background?.exists && resources.background.url) {
                console.log('🖼️ 載入自定義背景:', resources.background.url);
                loadPromises.push(this.loadTextureFromUrl('game_background_3', resources.background.url));
            }

            if (resources?.card_back?.exists && resources.card_back.url) {
                console.log('🎴 載入自定義卡片背面:', resources.card_back.url);
                loadPromises.push(this.loadTextureFromUrl('card-back', resources.card_back.url));
            }

            if (resources?.card_front?.exists && resources.card_front.url) {
                console.log('📄 載入自定義卡片正面:', resources.card_front.url);
                loadPromises.push(this.loadTextureFromUrl('card_front', resources.card_front.url));
            }

            await Promise.all(loadPromises);
            console.log('✅ 視覺風格資源載入完成');

        } catch (error) {
            console.error('❌ 載入視覺風格資源失敗:', error);
        }
    }

    /**
     * 🖼️ 從 URL 載入並替換紋理
     */
    loadTextureFromUrl(key, url) {
        return new Promise((resolve, reject) => {
            // 先移除舊的紋理
            if (this.textures.exists(key)) {
                this.textures.remove(key);
            }

            // 載入新紋理
            this.load.image(key, url);

            this.load.once('filecomplete-image-' + key, () => {
                console.log('✅ 紋理載入完成:', key);
                resolve();
            });

            this.load.once('loaderror', (file) => {
                if (file.key === key) {
                    console.warn('⚠️ 紋理載入失敗:', key);
                    reject(new Error(`Failed to load texture: ${key}`));
                }
            });

            this.load.start();
        });
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

        // ⏱️ 計時器顯示 - 在右上角
        const timerX = width - 80;
        const timerY = isLandscape ? this.topPadding : 30;
        this.timerText = this.add.text(timerX, timerY, '', {
            fontFamily: 'Arial',
            fontSize: `${fontSize}px`,
            fontStyle: 'bold',
            color: '#ef4444',
            backgroundColor: '#fef2f2',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(100);
        this.timerText.setVisible(false);

        // 創建控制按鈕
        this.createControlButtons();
    }

    createControlButtons() {
        const { width, height } = this.scale;
        const isLandscape = width > height;

        // 🔧 按鈕位置 - 橫向模式在 85% 高度，更大的按鈕
        const buttonY = isLandscape ? height * 0.85 : height * 0.90;
        const buttonWidth = isLandscape ? 70 : 100;
        const buttonHeight = isLandscape ? 36 : 44;

        // 五個按鈕的間距計算（添加完成按鈕）
        const totalWidth = buttonWidth * 5 + 60;  // 5個按鈕 + 4個間距
        const startX = (width - totalWidth) / 2 + buttonWidth / 2;
        const gap = buttonWidth + 15;

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

        // 🔊 語音按鈕（播放當前卡片的語音）- 只有當自動播放語音關閉時才顯示
        if (!this.options.autoPlayAudio) {
            this.audioBtn = this.createButton(startX + gap * 3, buttonY, '🔊', () => {
                this.playCurrentCardAudio();
            }, buttonWidth, buttonHeight, 0x8b5cf6);
        }

        // 🏁 完成按鈕 - 新增
        this.finishBtn = this.createButton(startX + gap * 4, buttonY, '🏁', () => {
            this.finishGame();
        }, buttonWidth, buttonHeight, 0xf59e0b);
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

        // 判斷是否有圖片
        const hasImage = cardData.imageUrl;

        // 圖片 (如果有)
        if (hasImage) {
            const imgSize = this.cardHeight * 0.35;
            // 載入並顯示圖片
            this.loadCardImage(container, cardData.imageUrl, 0, currentY + imgSize / 2, contentWidth, imgSize);
            currentY += imgSize + 10;
        }

        // 英文文字 - 白色，更大
        // 如果沒有圖片，字體更大；如果有圖片，字體正常
        if (cardData.text || cardData.english) {
            const fontSizeMultiplier = hasImage ? 0.09 : 0.15;  // 沒有圖片時字體增大到 0.15
            const text = this.add.text(0, currentY + 15, cardData.text || cardData.english, {
                fontFamily: 'Arial',
                fontSize: `${this.cardWidth * fontSizeMultiplier}px`,
                fontStyle: 'bold',
                color: '#ffffff',
                wordWrap: { width: contentWidth },
                align: 'center'
            }).setOrigin(0.5, 0);
            container.add(text);
            currentY += text.height + 8;
        }

        // 中文翻譯 - 淡黃色（根據選項決定是否顯示）
        if (cardData.chinese && this.options.showTranslation) {
            const fontSizeMultiplier = hasImage ? 0.07 : 0.12;  // 沒有圖片時字體增大到 0.12
            const chinese = this.add.text(0, currentY + 5, cardData.chinese, {
                fontFamily: 'Arial',
                fontSize: `${this.cardWidth * fontSizeMultiplier}px`,
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
            // 切換聲音狀態
            this.isSoundEnabled = !this.isSoundEnabled;
            console.log('🔊 聲音狀態:', this.isSoundEnabled ? '啟用' : '禁用');

            // 發送消息給父窗口（React 選項面板）
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'SPEAKING_CARDS_SOUND_TOGGLE',
                    soundEnabled: this.isSoundEnabled
                }, '*');
            }

            // 如果聲音啟用，播放當前卡片語音
            if (this.isSoundEnabled) {
                this.playCardAudio(cardData);
            }
        });

        return btn;
    }

    // ===== 遊戲邏輯 =====
    handleCardClick() {
        if (this.shuffledCards.length === 0 || this.isAnimating) return;

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

        this.isAnimating = true;
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
            ease: 'Back.easeOut',
            onComplete: () => {
                this.isAnimating = false;
            }
        });

        // 🔊 根據選項決定是否自動播放語音
        // 只有當有 audioUrl 時才播放
        if (this.options.autoPlayAudio && cardData.audioUrl) {
            this.playCardAudio(cardData);
        }

        console.log('🎴 翻開卡片:', cardData);
    }

    handleNext() {
        if (this.currentCardIndex < this.shuffledCards.length - 1) {
            this.isAnimating = true;
            this.currentCardIndex++;
            this.isFlipped = true;

            // 清除發牌區
            this.dealContainer.removeAll(true);

            // 直接顯示下一張卡片內容
            const cardData = this.shuffledCards[this.currentCardIndex];
            const cardFront = this.createCardFront(cardData);
            this.dealContainer.add(cardFront);

            // 🔊 根據選項決定是否自動播放語音
            // 只有勾選自動播放且有 audioUrl 時才播放
            if (this.options.autoPlayAudio && cardData.audioUrl) {
                this.playCardAudio(cardData);
            }

            this.updateProgress();

            // 動畫完成後允許下一次操作
            this.time.delayedCall(300, () => {
                this.isAnimating = false;
            });
        }
    }

    handlePrevious() {
        if (this.currentCardIndex > 0) {
            this.isAnimating = true;
            this.currentCardIndex--;
            this.isFlipped = true;

            // 清除發牌區
            this.dealContainer.removeAll(true);

            // 直接顯示上一張卡片內容
            const cardData = this.shuffledCards[this.currentCardIndex];
            const cardFront = this.createCardFront(cardData);
            this.dealContainer.add(cardFront);

            // 🔊 根據選項決定是否自動播放語音
            // 只有當有 audioUrl 時才播放
            if (this.options.autoPlayAudio && cardData.audioUrl) {
                this.playCardAudio(cardData);
            }

            this.updateProgress();

            // 動畫完成後允許下一次操作
            this.time.delayedCall(300, () => {
                this.isAnimating = false;
            });
        } else if (this.currentCardIndex === 0 && this.isFlipped) {
            // 如果已經在第0張且卡片已翻開，點左邊卡片堆會回到未翻開狀態
            this.isAnimating = true;
            this.isFlipped = false;

            // 清除發牌區，顯示空位
            this.dealContainer.removeAll(true);
            this.createEmptySlot();

            this.updateProgress();

            // 動畫完成後允許下一次操作
            this.time.delayedCall(300, () => {
                this.isAnimating = false;
            });
        }
    }

    handleShuffle() {
        if (!this.options.shuffle) {
            // 如果洗牌關閉，恢復原始順序
            this.shuffledCards = [...this.cards];
        } else {
            this.shuffledCards = this.shuffleArray([...this.cards]);
        }
        this.currentCardIndex = 0;
        this.isFlipped = false;

        // 重置發牌區
        this.dealContainer.removeAll(true);
        this.createEmptySlot();

        // 重置計時器
        this.resetTimer();

        this.updateProgress();
        console.log('🔀 重新洗牌');
    }

    handleUndo() {
        this.handlePrevious();
    }

    // ===== 計時器功能 =====
    startTimer() {
        if (this.options.timer === 'none') return;

        this.timerRunning = true;
        this.timerText.setVisible(true);

        if (this.options.timer === 'countDown') {
            this.timerValue = this.options.timerMinutes * 60 + this.options.timerSeconds;
        } else {
            this.timerValue = 0;
        }

        this.updateTimerDisplay();

        // 每秒更新計時器
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        if (!this.timerRunning) return;

        if (this.options.timer === 'countUp') {
            this.timerValue++;
        } else if (this.options.timer === 'countDown') {
            this.timerValue--;
            if (this.timerValue <= 0) {
                this.timerValue = 0;
                this.stopTimer();
                this.onTimerEnd();
            }
        }

        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerValue / 60);
        const seconds = this.timerValue % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerText.setText(`⏱️ ${display}`);

        // 倒計時最後 30 秒變紅色
        if (this.options.timer === 'countDown' && this.timerValue <= 30) {
            this.timerText.setColor('#dc2626');
        } else {
            this.timerText.setColor('#1f2937');
        }
    }

    stopTimer() {
        this.timerRunning = false;
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        if (this.options.timer !== 'none') {
            this.startTimer();
        } else {
            this.timerText.setVisible(false);
        }
    }

    onTimerEnd() {
        // 計時結束提示
        console.log('⏱️ 時間到！');
        // 🔥 時間到時完成遊戲
        this.finishGame();
    }

    // ===== 遊戲完成邏輯 =====
    finishGame() {
        console.log('🎮 遊戲完成');

        // 停止計時器
        this.stopTimer();

        // 計算統計信息
        const totalCards = this.shuffledCards.length;
        const cardsViewed = Math.min(this.currentCardIndex + 1, totalCards);
        const timeSpent = this.timerValue;

        // 顯示遊戲完成模態框
        this.showGameCompleteModal({
            totalCards: totalCards,
            cardsViewed: cardsViewed,
            timeSpent: timeSpent
        });
    }

    // ===== 顯示遊戲完成模態框 =====
    showGameCompleteModal(stats) {
        // 創建半透明背景
        const overlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);

        // 創建模態框容器
        const modal = this.add.container(
            this.cameras.main.centerX,
            this.cameras.main.centerY
        );
        modal.setScrollFactor(0);
        modal.setDepth(1001);

        // 模態框背景
        const modalBg = this.add.rectangle(0, 0, 500, 400, 0xffffff);
        modalBg.setStrokeStyle(3, 0x333333);
        modal.add(modalBg);

        // 標題
        const title = this.add.text(0, -150, '🎉 遊戲完成！', {
            fontSize: '32px',
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        modal.add(title);

        // 統計信息
        const statsText = this.add.text(0, -80,
            `卡片數量: ${stats.totalCards}\n` +
            `已查看: ${stats.cardsViewed}\n` +
            `用時: ${this.formatTime(stats.timeSpent)}`,
            {
                fontSize: '18px',
                color: '#666666',
                fontFamily: 'Arial',
                align: 'center'
            }
        ).setOrigin(0.5);
        modal.add(statsText);

        // 排行榜按鈕
        const leaderboardBtn = this.add.rectangle(0, 80, 200, 50, 0x3c3c3c);
        leaderboardBtn.setStrokeStyle(2, 0x000000);
        leaderboardBtn.setInteractive({ useHandCursor: true });
        modal.add(leaderboardBtn);

        const leaderboardText = this.add.text(0, 80, '🏆 排行榜', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        modal.add(leaderboardText);

        leaderboardBtn.on('pointerdown', async () => {
            console.log('🎮 點擊排行榜按鈕');
            // 先保存分數到排行榜
            await this.saveScoreToLeaderboard(stats);
            // 然後通知父頁面顯示排行榜
            this.notifyParentShowLeaderboard();
        });

        leaderboardBtn.on('pointerover', () => {
            leaderboardBtn.setFillStyle(0x4c4c4c);
        });

        leaderboardBtn.on('pointerout', () => {
            leaderboardBtn.setFillStyle(0x3c3c3c);
        });

        // 重新開始按鈕
        const restartBtn = this.add.rectangle(0, 150, 200, 50, 0x3c3c3c);
        restartBtn.setStrokeStyle(2, 0x000000);
        restartBtn.setInteractive({ useHandCursor: true });
        modal.add(restartBtn);

        const restartText = this.add.text(0, 150, '🔄 重新開始', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        modal.add(restartText);

        restartBtn.on('pointerdown', () => {
            console.log('🎮 點擊重新開始按鈕');
            overlay.destroy();
            modal.destroy();
            this.scene.restart();
        });

        restartBtn.on('pointerover', () => {
            restartBtn.setFillStyle(0x4c4c4c);
        });

        restartBtn.on('pointerout', () => {
            restartBtn.setFillStyle(0x3c3c3c);
        });

        // 保存分數到排行榜
        this.saveScoreToLeaderboard(stats);
    }

    // ===== 保存分數到排行榜 =====
    async saveScoreToLeaderboard(stats) {
        const urlParams = new URLSearchParams(window.location.search);
        const activityId = urlParams.get('activityId');

        if (!activityId) {
            console.warn('⚠️ 缺少 activityId，無法保存排行榜');
            return;
        }

        // 生成隨機玩家名稱（如果沒有輸入）
        const playerName = this.playerName || `Player_${Math.random().toString(36).substring(2, 11)}`;

        // 準備排行榜數據
        const leaderboardData = {
            activityId: activityId,
            playerName: playerName,
            score: stats.cardsViewed,  // 以查看的卡片數作為分數
            correctCount: stats.cardsViewed,
            totalCount: stats.totalCards,
            accuracy: stats.totalCards > 0 ? (stats.cardsViewed / stats.totalCards) * 100 : 0,
            timeSpent: stats.timeSpent,
            gameData: {
                totalCards: stats.totalCards,
                cardsViewed: stats.cardsViewed,
                timestamp: new Date().toISOString()
            }
        };

        console.log('🎮 排行榜數據:', leaderboardData);

        try {
            const response = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leaderboardData),
            });

            if (!response.ok) {
                throw new Error('Failed to save score');
            }

            const result = await response.json();
            console.log('💾 分數已保存到數據庫:', result.data);
        } catch (error) {
            console.error('❌ 保存排行榜失敗:', error);
        }
    }

    // ===== 通知父頁面顯示排行榜 =====
    notifyParentShowLeaderboard() {
        const urlParams = new URLSearchParams(window.location.search);
        const activityId = urlParams.get('activityId');

        console.log('🎮 通知父頁面顯示排行榜:', activityId);

        // 直接發送 PostMessage
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'SHOW_LEADERBOARD',
                activityId: activityId,
                timestamp: Date.now(),
                source: 'speaking-cards'
            }, '*');
            console.log('📤 已發送 SHOW_LEADERBOARD 到父頁面');
        }
    }

    // ===== 格式化時間 =====
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}分${secs}秒`;
    }

    // ===== 播放當前卡片語音 =====
    playCurrentCardAudio() {
        if (this.currentCardIndex >= 0 && this.currentCardIndex < this.shuffledCards.length) {
            const card = this.shuffledCards[this.currentCardIndex];
            if (card) {
                this.playCardAudio(card);
                console.log('🔊 手動播放語音:', card.english || card.term);
            }
        }
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
        // 檢查聲音是否啟用
        if (!this.isSoundEnabled) {
            console.log('🔇 聲音已禁用，不播放');
            return;
        }

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

                // 🔥 檢查多種數據來源
                let vocabularyData = [];

                if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems) && activity.vocabularyItems.length > 0) {
                    // 標準格式：vocabularyItems
                    vocabularyData = activity.vocabularyItems;
                    console.log('📝 從 vocabularyItems 載入:', vocabularyData.length, '個');
                } else if (activity.content && activity.content.questions && Array.isArray(activity.content.questions) && activity.content.questions.length > 0) {
                    // 🔥 Flying Fruit 格式支持：從 content.questions 轉換
                    console.log('📝 從 content.questions 載入 (Flying Fruit 格式)');
                    const questions = activity.content.questions;

                    // 將所有答案選項都轉換為卡片（包括錯誤答案）
                    questions.forEach((q, qIndex) => {
                        if (q.answers && Array.isArray(q.answers)) {
                            q.answers.forEach((answer, aIndex) => {
                                if (answer.isCorrect) {
                                    // 正確答案：使用問題作為英文
                                    vocabularyData.push({
                                        id: answer.id || `q${qIndex}_a${aIndex}`,
                                        english: q.question || '',
                                        chinese: answer.text || '',
                                        imageUrl: q.questionImageUrl || null,
                                        audioUrl: q.questionAudioUrl || null
                                    });
                                } else {
                                    // 錯誤答案：使用中文作為英文（干擾項）
                                    vocabularyData.push({
                                        id: answer.id || `q${qIndex}_a${aIndex}`,
                                        english: answer.text || '',
                                        chinese: answer.text || '',
                                        imageUrl: answer.imageUrl || null,
                                        audioUrl: null
                                    });
                                }
                            });
                        }
                    });
                    console.log('📝 Flying Fruit 轉換完成:', vocabularyData.length, '個詞彙');
                } else if (activity.content && activity.content.vocabularyItems && Array.isArray(activity.content.vocabularyItems)) {
                    // 舊格式：content.vocabularyItems
                    vocabularyData = activity.content.vocabularyItems;
                    console.log('📝 從 content.vocabularyItems 載入:', vocabularyData.length, '個');
                }

                if (vocabularyData.length > 0) {
                    this.cards = vocabularyData.map(item => ({
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
                    this.resetTimer();  // 啟動計時器
                    this.updateProgress();

                    console.log('📚 載入活動成功:', this.cards.length, '張卡片');
                } else {
                    console.warn('⚠️ 沒有找到詞彙數據，載入示範數據');
                    this.loadDemoData();
                }
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
        this.resetTimer();  // 啟動計時器
        this.updateProgress();

        console.log('📚 載入示範數據');
    }
}

// 確保全域可用
if (typeof window !== 'undefined') {
    window.SpeakingCardsGame = SpeakingCardsGame;
}

