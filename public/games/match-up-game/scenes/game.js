// Game 場景 - 主遊戲邏輯（連線配對）
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // 配對數據
        this.pairs = [
            { id: 1, question: 'book', answer: '書' },
            { id: 2, question: 'cat', answer: '貓' },
            { id: 3, question: 'dog', answer: '狗' }
        ];

        // 卡片顏色（左側彩色卡片）
        this.cardColors = [
            0xd72537,  // 紅色
            0xfb7303,  // 橙色
            0x4caf50,  // 綠色
        ];

        // 遊戲狀態
        this.leftCards = [];
        this.rightCards = [];
        this.lines = [];  // 儲存連線
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragLine = null;
        this.dragStartCard = null;
    }

    create() {
        // 清空數組（防止重新開始時重複）
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;

        // 添加淺藍色背景
        this.add.rectangle(480, 270, 960, 540, 0xdbf6ff).setDepth(-1);

        // 添加標題
        this.add.text(480, 40, 'Match-up Game', {
            fontSize: '36px',
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 添加說明
        this.add.text(480, 90, '拖曳左側卡片到右側卡片進行配對', {
            fontSize: '20px',
            color: '#666666',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // 創建連線圖層（在卡片下方）
        this.linesGraphics = this.add.graphics();
        this.linesGraphics.setDepth(0);

        // 創建拖曳線圖層（在卡片上方）
        this.dragGraphics = this.add.graphics();
        this.dragGraphics.setDepth(10);

        // 創建卡片
        this.createCards();

        // 添加重新開始按鈕
        this.createRestartButton();
    }

    createCards() {
        const cardWidth = 200;
        const cardHeight = 80;
        const leftX = 200;
        const rightX = 760;
        const startY = 180;
        const spacing = 100;

        // 隨機排列答案
        const shuffledAnswers = Phaser.Utils.Array.Shuffle([...this.pairs]);

        // 創建左側題目卡片（彩色）
        this.pairs.forEach((pair, index) => {
            const y = startY + index * spacing;
            const color = this.cardColors[index % this.cardColors.length];
            const card = this.createLeftCard(leftX, y, cardWidth, cardHeight, pair.question, pair.id, color);
            this.leftCards.push(card);
        });

        // 創建右側答案卡片（白色）
        shuffledAnswers.forEach((pair, index) => {
            const y = startY + index * spacing;
            const card = this.createRightCard(rightX, y, cardWidth, cardHeight, pair.answer, pair.id);
            this.rightCards.push(card);
        });
    }

    createLeftCard(x, y, width, height, text, pairId, color) {
        // 創建卡片容器
        const container = this.add.container(x, y);
        container.setDepth(5);

        // 創建卡片背景（彩色）
        const background = this.add.rectangle(0, 0, width, height, color);
        background.setStrokeStyle(0);

        // 創建卡片文字（白色）
        const cardText = this.add.text(0, 0, text, {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        cardText.setOrigin(0.5);

        // 添加到容器
        container.add([background, cardText]);

        // 設置互動（可拖曳）
        background.setInteractive({ useHandCursor: true, draggable: true });

        // 拖曳開始
        background.on('dragstart', (pointer) => {
            if (container.getData('isMatched')) return;

            this.isDragging = true;
            this.dragStartCard = container;

            // 高亮卡片
            background.setAlpha(0.8);
        });

        // 拖曳中
        background.on('drag', (pointer, dragX, dragY) => {
            if (!this.isDragging) return;

            // 繪製拖曳線
            this.dragGraphics.clear();
            this.dragGraphics.lineStyle(3, color, 1);
            this.dragGraphics.beginPath();
            this.dragGraphics.moveTo(container.x, container.y);
            this.dragGraphics.lineTo(pointer.x, pointer.y);
            this.dragGraphics.strokePath();
        });

        // 拖曳結束
        background.on('dragend', (pointer) => {
            this.isDragging = false;
            this.dragGraphics.clear();
            background.setAlpha(1);

            // 檢查是否拖曳到右側卡片
            this.checkDrop(pointer);

            this.dragStartCard = null;
        });

        // 儲存卡片數據
        container.setData({
            pairId: pairId,
            side: 'left',
            background: background,
            text: cardText,
            color: color,
            isMatched: false
        });

        // 啟用拖曳
        this.input.setDraggable(background);

        return container;
    }

    createRightCard(x, y, width, height, text, pairId) {
        // 創建卡片容器
        const container = this.add.container(x, y);
        container.setDepth(5);

        // 創建卡片背景（白色）
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x333333);

        // 創建卡片文字（黑色）
        const cardText = this.add.text(0, 0, text, {
            fontSize: '24px',
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        cardText.setOrigin(0.5);

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

    checkDrop(pointer) {
        if (!this.dragStartCard) return;

        // 檢查指針是否在任何右側卡片上
        let targetCard = null;

        for (const card of this.rightCards) {
            const bounds = card.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                break;
            }
        }

        if (targetCard) {
            this.checkMatch(this.dragStartCard, targetCard);
        }
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

        // 繪製永久連線
        const leftColor = leftCard.getData('color');
        this.linesGraphics.lineStyle(4, leftColor, 1);
        this.linesGraphics.beginPath();
        this.linesGraphics.moveTo(leftCard.x, leftCard.y);
        this.linesGraphics.lineTo(rightCard.x, rightCard.y);
        this.linesGraphics.strokePath();

        // 右側卡片變成綠色邊框
        rightCard.getData('background').setStrokeStyle(3, 0x4caf50);

        // 縮放動畫
        this.tweens.add({
            targets: [leftCard, rightCard],
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });

        // 檢查是否全部配對完成
        if (this.matchedPairs.size === this.pairs.length) {
            this.time.delayedCall(500, () => {
                this.onGameComplete();
            });
        }
    }

    onMatchFail(leftCard, rightCard) {
        // 右側卡片變成紅色邊框
        rightCard.getData('background').setStrokeStyle(3, 0xf44336);

        // 搖晃動畫
        this.tweens.add({
            targets: [leftCard, rightCard],
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
    }

    onGameComplete() {
        // 顯示完成訊息（Classic 主題）
        const completeText = this.add.text(480, 270, '🎉 完成！', {
            fontSize: '48px',
            color: '#4caf50',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#e8f5e9',
            padding: { x: 30, y: 15 }
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
        // 創建重新開始按鈕（Classic 主題）
        const button = this.add.text(480, 500, '🔄 重新開始', {
            fontSize: '24px',
            color: '#fe7606',
            fontFamily: 'Arial',
            backgroundColor: '#fff3e0',
            padding: { x: 25, y: 12 }
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

