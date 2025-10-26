// Game 場景 - 主遊戲邏輯（卡片拖動配對）
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // 配對數據
        this.pairs = [
            { id: 1, question: 'book', answer: '書' },
            { id: 2, question: 'cat', answer: '貓' },
            { id: 3, question: 'dog', answer: '狗' }
        ];

        // 遊戲狀態
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;
    }

    create() {
        // 清空數組（防止重新開始時重複）
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;

        // 添加白色背景（Wordwall Classic 主題）
        this.add.rectangle(330, 191.5, 660, 383, 0xffffff).setDepth(-1);

        // 添加標題
        this.add.text(330, 30, 'Match up', {
            fontSize: '24px',
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 創建卡片
        this.createCards();

        // 添加重新開始按鈕
        this.createRestartButton();
    }

    createCards() {
        const cardWidth = 200;
        const cardHeight = 60;
        const leftX = 150;
        const rightX = 470;       // 從 510 改為 470（往左 40px）
        const leftStartY = 120;   // 左側起始位置（往下 20px）
        const rightStartY = 100;  // 右側起始位置（保持原位）
        const leftSpacing = 65;   // 左側間距：60 + 5 = 65（5px 距離）
        const rightSpacing = 80;  // 右側間距：60 + 20 = 80（20px 距離）

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

        // 創建卡片文字（黑色）
        const cardText = this.add.text(0, 0, text, {
            fontSize: '20px',
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
            if (container.getData('isMatched')) return;

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

            // 檢查是否拖曳到右側卡片
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

        // 創建文字標籤（在框外，右側）
        const cardText = this.add.text(width / 2 + 15, 0, text, {
            fontSize: '20px',
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
        rightCard.setData('isMatched', true);
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

                // 隱藏右側空白框（因為被覆蓋了）
                rightCard.getData('background').setVisible(false);

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
        // 顯示完成訊息（Wordwall Classic 主題）
        const completeText = this.add.text(330, 191.5, '🎉 完成！', {
            fontSize: '36px',
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
        // 創建重新開始按鈕（Wordwall Classic 主題）
        const button = this.add.text(330, 320, '🔄 重新開始', {
            fontSize: '18px',
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

