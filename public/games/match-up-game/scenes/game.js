// Game 場景 - 主遊戲邏輯（卡片拖動配對）
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // 配對數據（將從 API 載入）
        this.pairs = [];
        this.isLoadingVocabulary = false;
        this.vocabularyLoadError = null;

        // 遊戲狀態
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;
    }

    // 從 API 載入詞彙數據
    async loadVocabularyFromAPI() {
        try {
            // 從 URL 參數獲取 activityId
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId');
            const customVocabulary = urlParams.get('customVocabulary');

            console.log('🔍 Match-up 遊戲 - URL 參數:', { activityId, customVocabulary });

            // 如果沒有 activityId 或不使用自定義詞彙，使用默認數據
            if (!activityId || customVocabulary !== 'true') {
                console.log('ℹ️ 使用默認詞彙數據');
                this.pairs = [
                    { id: 1, question: 'book', answer: '書' },
                    { id: 2, question: 'cat', answer: '貓' },
                    { id: 3, question: 'dog', answer: '狗' }
                ];
                return true;
            }

            // 從 API 載入詞彙數據
            console.log(`🔄 從 API 載入詞彙: /api/activities/${activityId}`);
            const response = await fetch(`/api/activities/${activityId}`);

            if (!response.ok) {
                throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
            }

            const activity = await response.json();
            console.log('✅ 活動數據載入成功:', activity);

            // 提取詞彙數據（支持多種數據源）
            let vocabularyData = [];

            if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems) && activity.vocabularyItems.length > 0) {
                // 新架構：從關聯表中獲取詞彙數據
                vocabularyData = activity.vocabularyItems;
                console.log('📝 從 vocabularyItems 載入詞彙:', vocabularyData.length, '個');
            } else if (activity.elements && Array.isArray(activity.elements) && activity.elements.length > 0) {
                // 中間架構：從 elements 字段載入詞彙數據
                vocabularyData = activity.elements;
                console.log('📝 從 elements 載入詞彙:', vocabularyData.length, '個');
            } else if (activity.content && activity.content.vocabularyItems && Array.isArray(activity.content.vocabularyItems)) {
                // 舊架構：從 content 中獲取詞彙數據
                vocabularyData = activity.content.vocabularyItems;
                console.log('📝 從 content.vocabularyItems 載入詞彙:', vocabularyData.length, '個');
            }

            // 轉換為遊戲所需的格式
            if (vocabularyData.length > 0) {
                this.pairs = vocabularyData.map((item, index) => ({
                    id: index + 1,
                    question: item.english || item.word || '',
                    answer: item.chinese || item.translation || ''
                }));

                console.log('✅ 詞彙數據轉換完成:', this.pairs);
                return true;
            } else {
                console.warn('⚠️ 未找到詞彙數據，使用默認數據');
                this.pairs = [
                    { id: 1, question: 'book', answer: '書' },
                    { id: 2, question: 'cat', answer: '貓' },
                    { id: 3, question: 'dog', answer: '狗' }
                ];
                return true;
            }
        } catch (error) {
            console.error('❌ 載入詞彙數據失敗:', error);
            this.vocabularyLoadError = error.message;
            // 使用默認數據作為後備
            this.pairs = [
                { id: 1, question: 'book', answer: '書' },
                { id: 2, question: 'cat', answer: '貓' },
                { id: 3, question: 'dog', answer: '狗' }
            ];
            return false;
        }
    }

    async create() {
        // 清空數組（防止重新開始時重複）
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;

        // 顯示載入提示
        const width = this.scale.width;
        const height = this.scale.height;
        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff).setDepth(-1);
        const loadingText = this.add.text(width / 2, height / 2, '載入詞彙中...', {
            fontSize: '24px',
            color: '#333333',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // 載入詞彙數據
        this.isLoadingVocabulary = true;
        const success = await this.loadVocabularyFromAPI();
        this.isLoadingVocabulary = false;

        // 移除載入提示
        loadingText.destroy();

        // 如果載入失敗，顯示錯誤信息
        if (!success && this.vocabularyLoadError) {
            this.add.text(width / 2, height / 2 - 50, '載入詞彙失敗', {
                fontSize: '24px',
                color: '#ff0000',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.add.text(width / 2, height / 2, this.vocabularyLoadError, {
                fontSize: '16px',
                color: '#666666',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            this.add.text(width / 2, height / 2 + 50, '使用默認詞彙', {
                fontSize: '16px',
                color: '#999999',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }

        // 獲取當前螢幕尺寸
        this.updateLayout();

        // 監聽螢幕尺寸變化
        this.scale.on('resize', this.handleResize, this);
    }

    updateLayout() {
        // 清除所有現有元素
        this.children.removeAll(true);

        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;

        // 添加白色背景
        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff).setDepth(-1);

        // 添加標題（響應式字體大小）
        const titleFontSize = Math.max(20, Math.min(32, width * 0.025));
        this.add.text(width / 2, height * 0.08, 'Match up', {
            fontSize: `${titleFontSize}px`,
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 創建卡片
        this.createCards();

        // 添加重新開始按鈕
        this.createRestartButton();
    }

    handleResize(gameSize) {
        // 螢幕尺寸改變時重新佈局
        this.updateLayout();
    }

    createCards() {
        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;

        // 響應式卡片尺寸（根據螢幕寬度調整）
        const cardWidth = Math.max(150, Math.min(250, width * 0.2));
        const cardHeight = Math.max(50, Math.min(80, height * 0.1));

        // 響應式位置（使用百分比）
        const leftX = width * 0.25;        // 左側卡片在 25% 位置
        const rightX = width * 0.65;       // 右側卡片在 65% 位置
        const leftStartY = height * 0.25;  // 左側起始位置在 25% 高度
        const rightStartY = height * 0.22; // 右側起始位置在 22% 高度

        // 響應式間距
        const leftSpacing = cardHeight + Math.max(5, height * 0.01);   // 卡片高度 + 5px 或 1% 高度
        const rightSpacing = cardHeight + Math.max(15, height * 0.03); // 卡片高度 + 15px 或 3% 高度

        // 隨機排列答案
        const shuffledAnswers = Phaser.Utils.Array.Shuffle([...this.pairs]);

        // 創建左側外框（包圍所有左側卡片）
        this.createLeftContainerBox(leftX, leftStartY, cardWidth, cardHeight, leftSpacing, this.pairs.length);

        // 創建左側題目卡片（白色，5px 間距）
        this.pairs.forEach((pair, index) => {
            const y = leftStartY + index * leftSpacing;
            const card = this.createLeftCard(leftX, y, cardWidth, cardHeight, pair.question, pair.id);
            this.leftCards.push(card);
        });

        // 創建右側答案卡片（白色，20px 間距）
        shuffledAnswers.forEach((pair, index) => {
            const y = rightStartY + index * rightSpacing;
            const card = this.createRightCard(rightX, y, cardWidth, cardHeight, pair.answer, pair.id);
            this.rightCards.push(card);
        });
    }

    createLeftContainerBox(x, y, cardWidth, cardHeight, spacing, count) {
        // 計算外框的尺寸
        const padding = 10;  // 外框與卡片之間的間距
        const boxWidth = cardWidth + padding * 2;
        const boxHeight = (cardHeight * count) + (spacing - cardHeight) * (count - 1) + padding * 2;

        // 計算外框的中心位置
        const boxCenterY = y + (spacing * (count - 1)) / 2;

        // 創建外框
        const containerBox = this.add.rectangle(x, boxCenterY, boxWidth, boxHeight);
        containerBox.setStrokeStyle(2, 0x333333);  // 黑色邊框
        containerBox.setFillStyle(0xffffff, 0);    // 透明填充
        containerBox.setDepth(0);  // 在卡片下層
    }

    createLeftCard(x, y, width, height, text, pairId) {
        // 創建卡片容器
        const container = this.add.container(x, y);
        container.setSize(width, height);
        container.setDepth(5);

        // 創建卡片背景（白色）
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x333333);

        // 創建卡片文字（響應式字體大小）
        const fontSize = Math.max(24, Math.min(48, height * 0.6));
        const cardText = this.add.text(0, 0, text, {
            fontSize: `${fontSize}px`,
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'normal'
        });
        cardText.setOrigin(0.5);

        // 添加到容器
        container.add([background, cardText]);

        // 設置互動（整個容器可拖曳）
        container.setInteractive({ useHandCursor: true, draggable: true });

        // 儲存原始位置
        container.setData({
            pairId: pairId,
            side: 'left',
            background: background,
            text: cardText,
            isMatched: false,
            originalX: x,
            originalY: y
        });

        // 拖曳開始
        container.on('dragstart', (pointer) => {
            // 允許已配對的卡片也可以拖動
            this.isDragging = true;
            this.dragStartCard = container;

            // 卡片"飄浮"起來
            container.setDepth(100);  // 提升到最上層
            container.setScale(1.1);  // 稍微放大
            background.setAlpha(0.9);  // 半透明
        });

        // 拖曳中 - 卡片跟隨鼠標
        container.on('drag', (pointer, dragX, dragY) => {
            if (!this.isDragging) return;

            // 移動整個卡片
            container.x = pointer.x;
            container.y = pointer.y;
        });

        // 拖曳結束
        container.on('dragend', (pointer) => {
            this.isDragging = false;

            // 檢查是否拖回左側區域（取消配對）- 使用螢幕寬度的 45% 作為分界線
            const isInLeftArea = pointer.x < this.scale.width * 0.45;

            if (isInLeftArea && container.getData('isMatched')) {
                // 取消配對
                this.unmatchCard(container);

                // 返回原位
                this.tweens.add({
                    targets: container,
                    x: container.getData('originalX'),
                    y: container.getData('originalY'),
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        container.setDepth(5);
                        background.setAlpha(1);
                    }
                });
            } else {
                // 先檢查是否拖曳到其他左側卡片（交換位置）
                const swapped = this.checkSwap(pointer, container);

                if (!swapped) {
                    // 如果沒有交換，檢查是否拖曳到右側卡片
                    const dropped = this.checkDrop(pointer, container);

                    if (!dropped) {
                        // 沒有放到正確位置，返回原位
                        this.tweens.add({
                            targets: container,
                            x: container.getData('originalX'),
                            y: container.getData('originalY'),
                            scaleX: 1,
                            scaleY: 1,
                            duration: 300,
                            ease: 'Back.easeOut',
                            onComplete: () => {
                                container.setDepth(5);
                                background.setAlpha(1);
                            }
                        });
                    }
                }
            }

            this.dragStartCard = null;
        });

        // 啟用拖曳
        this.input.setDraggable(container);

        return container;
    }

    createRightCard(x, y, width, height, text, pairId) {
        // 創建卡片容器
        const container = this.add.container(x, y);
        container.setDepth(5);

        // 創建空白框（白色背景，黑色邊框）
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x333333);

        // 創建文字標籤（在框外，右側，響應式字體大小）
        const fontSize = Math.max(24, Math.min(48, height * 0.6));
        const cardText = this.add.text(width / 2 + 15, 0, text, {
            fontSize: `${fontSize}px`,
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'normal'
        });
        cardText.setOrigin(0, 0.5);  // 左對齊，垂直居中

        // 添加到容器
        container.add([background, cardText]);

        // 設置互動（接收拖曳）
        background.setInteractive({ useHandCursor: true });

        // 懸停效果
        background.on('pointerover', () => {
            if (!container.getData('isMatched') && this.isDragging) {
                background.setStrokeStyle(3, 0xfe7606); // 橙色邊框
            }
        });
        background.on('pointerout', () => {
            if (!container.getData('isMatched')) {
                background.setStrokeStyle(2, 0x333333);
            }
        });

        // 儲存卡片數據
        container.setData({
            pairId: pairId,
            side: 'right',
            background: background,
            text: cardText,
            isMatched: false
        });

        return container;
    }

    checkSwap(pointer, draggedCard) {
        if (!draggedCard) return false;

        // 檢查指針是否在其他左側卡片上
        let targetCard = null;

        for (const card of this.leftCards) {
            // 跳過自己和已配對的卡片
            if (card === draggedCard || card.getData('isMatched')) continue;

            const bounds = card.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                break;
            }
        }

        if (targetCard) {
            // 交換兩張卡片的位置
            this.swapCards(draggedCard, targetCard);
            return true;
        }

        return false;
    }

    swapCards(card1, card2) {
        // 獲取兩張卡片的原始位置
        const card1OriginalX = card1.getData('originalX');
        const card1OriginalY = card1.getData('originalY');
        const card2OriginalX = card2.getData('originalX');
        const card2OriginalY = card2.getData('originalY');

        // 交換原始位置數據
        card1.setData('originalX', card2OriginalX);
        card1.setData('originalY', card2OriginalY);
        card2.setData('originalX', card1OriginalX);
        card2.setData('originalY', card1OriginalY);

        // 動畫移動到新位置
        this.tweens.add({
            targets: card1,
            x: card2OriginalX,
            y: card2OriginalY,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                card1.setDepth(5);
                const bg1 = card1.getAt(0);
                if (bg1) bg1.setAlpha(1);
            }
        });

        this.tweens.add({
            targets: card2,
            x: card1OriginalX,
            y: card1OriginalY,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    checkDrop(pointer, draggedCard) {
        if (!draggedCard) return false;

        // 檢查指針是否在任何右側卡片上
        let targetCard = null;

        for (const card of this.rightCards) {
            if (card.getData('isMatched')) continue;  // 跳過已配對的卡片

            const bounds = card.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                break;
            }
        }

        if (targetCard) {
            this.checkMatch(draggedCard, targetCard);
            return true;
        }

        return false;
    }

    checkMatch(leftCard, rightCard) {
        const leftPairId = leftCard.getData('pairId');
        const rightPairId = rightCard.getData('pairId');

        if (leftPairId === rightPairId) {
            // 配對成功
            this.onMatchSuccess(leftCard, rightCard);
        } else {
            // 配對失敗
            this.onMatchFail(leftCard, rightCard);
        }
    }

    onMatchSuccess(leftCard, rightCard) {
        // 標記為已配對
        leftCard.setData('isMatched', true);
        leftCard.setData('matchedWith', rightCard);  // 記錄配對的右側卡片
        rightCard.setData('isMatched', true);
        rightCard.setData('matchedWith', leftCard);  // 記錄配對的左側卡片
        this.matchedPairs.add(leftCard.getData('pairId'));

        // 左側卡片移動到右側空白框的位置（完全覆蓋）
        const targetX = rightCard.x;
        const targetY = rightCard.y;

        this.tweens.add({
            targets: leftCard,
            x: targetX,
            y: targetY,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                leftCard.setDepth(10);  // 提升到空白框上方
                leftCard.getData('background').setAlpha(1);

                // 不隱藏右側空白框，保持可見（但在左側卡片下方）
                // rightCard.getData('background').setVisible(false);  // 註釋掉這行

                // 成功動畫
                this.tweens.add({
                    targets: leftCard,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200,
                    yoyo: true,
                    ease: 'Power2'
                });
            }
        });

        // 檢查是否全部配對完成
        if (this.matchedPairs.size === this.pairs.length) {
            this.time.delayedCall(800, () => {
                this.onGameComplete();
            });
        }
    }

    unmatchCard(leftCard) {
        // 取消配對狀態
        const rightCard = leftCard.getData('matchedWith');

        if (rightCard) {
            // 移除配對標記
            leftCard.setData('isMatched', false);
            leftCard.setData('matchedWith', null);
            rightCard.setData('isMatched', false);
            rightCard.setData('matchedWith', null);

            // 從已配對集合中移除
            this.matchedPairs.delete(leftCard.getData('pairId'));

            // 顯示右側空白框（如果之前被隱藏）
            rightCard.getData('background').setVisible(true);
        }
    }

    onMatchFail(leftCard, rightCard) {
        // 右側卡片變成紅色邊框並搖晃
        rightCard.getData('background').setStrokeStyle(3, 0xf44336);

        // 搖晃動畫
        this.tweens.add({
            targets: rightCard,
            x: '+=10',
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Power2',
            onComplete: () => {
                // 恢復原狀
                rightCard.getData('background').setStrokeStyle(2, 0x333333);
            }
        });

        // 左側卡片返回原位
        this.tweens.add({
            targets: leftCard,
            x: leftCard.getData('originalX'),
            y: leftCard.getData('originalY'),
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                leftCard.setDepth(5);
                leftCard.getData('background').setAlpha(1);
            }
        });
    }

    onGameComplete() {
        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;

        // 顯示完成訊息（響應式）
        const fontSize = Math.max(28, Math.min(48, width * 0.035));
        const completeText = this.add.text(width / 2, height / 2, '🎉 完成！', {
            fontSize: `${fontSize}px`,
            color: '#4caf50',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#e8f5e9',
            padding: { x: 25, y: 12 }
        });
        completeText.setOrigin(0.5);

        // 縮放動畫
        this.tweens.add({
            targets: completeText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createRestartButton() {
        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;

        // 創建重新開始按鈕（響應式）
        const fontSize = Math.max(16, Math.min(22, width * 0.018));
        const button = this.add.text(width / 2, height * 0.85, '🔄 重新開始', {
            fontSize: `${fontSize}px`,
            color: '#fe7606',
            fontFamily: 'Arial',
            backgroundColor: '#fff3e0',
            padding: { x: 20, y: 10 }
        });
        button.setOrigin(0.5);
        button.setInteractive({ useHandCursor: true });

        // 懸停效果
        button.on('pointerover', () => {
            button.setScale(1.05);
            button.setStyle({ backgroundColor: '#ffe0b2' });
        });
        button.on('pointerout', () => {
            button.setScale(1);
            button.setStyle({ backgroundColor: '#fff3e0' });
        });

        // 點擊重新開始
        button.on('pointerdown', () => {
            this.scene.restart();
        });
    }
}

